using budgetbud.Models;
using budgetbud.Services;
using budgetbud.Tests.Helpers;
using Moq;
using Xunit;

namespace budgetbud.Tests.Unit;

public class UserDataServiceTests
{
    private readonly Mock<IDbService> _db = new();
    private readonly FixedIdentityService _identity = new(BudgetTestFixtures.TestUserId);
    private UserDataService CreateService() => new(_db.Object, _identity);

    // ──────────────────────────────────────────────
    // CreateBudget
    // ──────────────────────────────────────────────

    [Fact]
    public async Task CreateBudget_AddsNewBudgetIdToUserData()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        var userData = BudgetTestFixtures.MakeUserData();

        _db.Setup(d => d.CreateNewBudgetAsync("Savings")).ReturnsAsync(budget);
        _db.Setup(d => d.GetUserData(BudgetTestFixtures.TestUserId)).ReturnsAsync(userData);
        _db.Setup(d => d.UpdateUserData(It.IsAny<UserData>())).Returns(Task.CompletedTask);

        var svc = CreateService();
        var result = await svc.CreateBudget("Savings");

        Assert.Equal(budget, result);
        _db.Verify(d => d.UpdateUserData(It.Is<UserData>(u => u.BudgetIds.Contains(budget.id))), Times.Once);
    }

    // ──────────────────────────────────────────────
    // ReorderBudgets
    // ──────────────────────────────────────────────

    [Fact]
    public async Task ReorderBudgets_UpdatesOrder_WhenIdsMatch()
    {
        var ids = new List<string> { "b1", "b2", "b3" };
        var userData = BudgetTestFixtures.MakeUserData(budgetIds: new List<string>(ids));

        _db.Setup(d => d.GetUserData(BudgetTestFixtures.TestUserId)).ReturnsAsync(userData);
        _db.Setup(d => d.UpdateUserData(It.IsAny<UserData>())).Returns(Task.CompletedTask);

        var svc = CreateService();
        var reversed = new List<string> { "b3", "b2", "b1" };
        await svc.ReorderBudgets(reversed);

        _db.Verify(d => d.UpdateUserData(It.Is<UserData>(u =>
            u.BudgetIds.SequenceEqual(reversed)
        )), Times.Once);
    }

    [Fact]
    public async Task ReorderBudgets_Throws_WhenIdSetDoesNotMatch()
    {
        var userData = BudgetTestFixtures.MakeUserData(budgetIds: new List<string> { "b1", "b2" });
        _db.Setup(d => d.GetUserData(BudgetTestFixtures.TestUserId)).ReturnsAsync(userData);

        var svc = CreateService();
        await Assert.ThrowsAsync<BadHttpRequestException>(
            () => svc.ReorderBudgets(new List<string> { "b1", "b3" }));
    }

    [Fact]
    public async Task ReorderBudgets_Throws_WhenCountDiffers()
    {
        var userData = BudgetTestFixtures.MakeUserData(budgetIds: new List<string> { "b1", "b2" });
        _db.Setup(d => d.GetUserData(BudgetTestFixtures.TestUserId)).ReturnsAsync(userData);

        var svc = CreateService();
        await Assert.ThrowsAsync<BadHttpRequestException>(
            () => svc.ReorderBudgets(new List<string> { "b1" }));
    }

    // ──────────────────────────────────────────────
    // GroupEditCategories
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GroupEditCategories_Throws_WhenCategoryIdInvalid()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        budget.categoryList.Add(BudgetTestFixtures.MakeCategory(id: 1));
        _db.Setup(d => d.GetBudgetAsync(budget.id)).ReturnsAsync(budget);

        var svc = CreateService();
        var rows = new List<UserDataService.GroupCategoryEditRow>
        {
            new(99, "Ghost", 100), // id 99 doesn't exist
        };

        await Assert.ThrowsAsync<BadHttpRequestException>(
            () => svc.GroupEditCategories(budget.id, rows));
    }

    [Fact]
    public async Task GroupEditCategories_CreatesNewCategory_WhenIdIsNull()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        budget.categoryList.Add(BudgetTestFixtures.MakeCategory(id: 1));
        _db.Setup(d => d.GetBudgetAsync(budget.id)).ReturnsAsync(budget);
        _db.Setup(d => d.UpdateBudgetAsync(It.IsAny<Budget>())).Returns(Task.CompletedTask);

        var svc = CreateService();
        var rows = new List<UserDataService.GroupCategoryEditRow>
        {
            new(null, "New Category", 2000),
        };

        var result = await svc.GroupEditCategories(budget.id, rows);

        Assert.Single(result.categoryList);
        Assert.Equal("New Category", result.categoryList[0].Name);
    }

    // ──────────────────────────────────────────────
    // RolloverBudget
    // ──────────────────────────────────────────────

    [Fact]
    public async Task RolloverBudget_Throws_WhenPeriodIsCurrentMonth()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        budget.period = new TimeUnit { Month = DateTime.Now.Month, Year = DateTime.Now.Year };
        var history = BudgetTestFixtures.MakeHistory(id: budget.history_id);

        _db.Setup(d => d.GetBudgetAsync(budget.id)).ReturnsAsync(budget);
        _db.Setup(d => d.GetHistoryAsync(budget.history_id)).ReturnsAsync(history);
        _db.Setup(d => d.UpdateHistoryAsync(It.IsAny<BudgetHistory>())).Returns(Task.CompletedTask);

        var svc = CreateService();
        await Assert.ThrowsAsync<budgetbud.Exceptions.InvalidInputException>(
            () => svc.RolloverBudget(budget.id));
    }

    [Fact]
    public async Task RolloverBudget_ClearsExpenses_AndIncrementsPeriod()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        budget.period = new TimeUnit { Month = 1, Year = 2025 }; // past month
        var cat = BudgetTestFixtures.MakeCategory();
        cat.ExpenseList.Add(BudgetTestFixtures.MakeExpense());
        budget.categoryList.Add(cat);
        var history = BudgetTestFixtures.MakeHistory(id: budget.history_id);

        _db.Setup(d => d.GetBudgetAsync(budget.id)).ReturnsAsync(budget);
        _db.Setup(d => d.GetHistoryAsync(budget.history_id)).ReturnsAsync(history);
        _db.Setup(d => d.UpdateHistoryAsync(It.IsAny<BudgetHistory>())).Returns(Task.CompletedTask);
        _db.Setup(d => d.UpdateBudgetAsync(It.IsAny<Budget>())).Returns(Task.CompletedTask);

        var svc = CreateService();
        var result = await svc.RolloverBudget(budget.id);

        Assert.Empty(result.categoryList[0].ExpenseList);
        Assert.Equal(2, result.period.Month);
        Assert.Equal(2025, result.period.Year);
    }
}
