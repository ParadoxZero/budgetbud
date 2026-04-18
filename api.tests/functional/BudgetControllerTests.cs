using System.Net;
using System.Net.Http.Json;
using budgetbud.Models;
using budgetbud.Services;
using budgetbud.Tests.Helpers;
using Moq;
using Xunit;

namespace budgetbud.Tests.Functional;

public class BudgetControllerTests : IClassFixture<BudgetBudWebAppFactory>
{
    private readonly BudgetBudWebAppFactory _factory;
    private readonly HttpClient _client;
    private readonly Mock<IDbService> _db;

    public BudgetControllerTests(BudgetBudWebAppFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _db = factory.DbServiceMock;
        _db.Reset();
    }

    // ──────────────────────────────────────────────
    // GET /api/budget
    // ──────────────────────────────────────────────

    [Fact]
    public async Task GetBudgets_Returns200_WithBudgetList()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        var userData = BudgetTestFixtures.MakeUserData(budgetIds: new List<string> { budget.id });

        _db.Setup(d => d.GetUserData(BudgetTestFixtures.TestUserId)).ReturnsAsync(userData);
        _db.Setup(d => d.GetBudgetAsync(budget.id)).ReturnsAsync(budget);
        _db.Setup(d => d.UpdateUserNickName(budget)).ReturnsAsync(budget);

        var response = await _client.GetAsync("/api/budget");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var budgets = await response.Content.ReadFromJsonAsync<List<Budget>>();
        Assert.Single(budgets!);
        Assert.Equal(budget.id, budgets![0].id);
    }


    // ──────────────────────────────────────────────
    // POST /api/budget
    // ──────────────────────────────────────────────

    [Fact]
    public async Task CreateBudget_Returns200_WithNewBudget()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        var userData = BudgetTestFixtures.MakeUserData();

        _db.Setup(d => d.CreateNewBudgetAsync("Savings")).ReturnsAsync(budget);
        _db.Setup(d => d.GetUserData(BudgetTestFixtures.TestUserId)).ReturnsAsync(userData);
        _db.Setup(d => d.UpdateUserData(It.IsAny<UserData>())).Returns(Task.CompletedTask);

        var response = await _client.PostAsJsonAsync("/api/budget", new { name = "Savings" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<Budget>();
        Assert.Equal(budget.id, created!.id);
    }

    // ──────────────────────────────────────────────
    // PUT /api/budget/{id}/expense/{expenseId}
    // ──────────────────────────────────────────────

    [Fact]
    public async Task UpdateExpense_Returns400_WhenBodyIdDoesNotMatchRoute()
    {
        var expense = BudgetTestFixtures.MakeExpense(id: 1);
        var budgetId = Guid.NewGuid().ToString();

        // Route expense_id = 99, but body has Id = 1 — mismatch
        var response = await _client.PutAsJsonAsync($"/api/budget/{budgetId}/expense/99", expense);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateExpense_Returns200_WhenIdsMatch()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        var expense = BudgetTestFixtures.MakeExpense(id: 5, categoryId: 1);
        var cat = BudgetTestFixtures.MakeCategory(id: 1);
        cat.ExpenseList.Add(expense);
        budget.categoryList.Add(cat);

        _db.Setup(d => d.GetBudgetAsync(budget.id)).ReturnsAsync(budget);
        _db.Setup(d => d.UpdateExpenseAsync(budget.id, It.IsAny<Expense>())).ReturnsAsync(budget);
        _db.Setup(d => d.UpdateBudgetAsync(It.IsAny<Budget>())).Returns(Task.CompletedTask);
        _db.Setup(d => d.UpdateUserNickName(It.IsAny<Budget>())).ReturnsAsync(budget);

        var response = await _client.PutAsJsonAsync($"/api/budget/{budget.id}/expense/5", expense);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // ──────────────────────────────────────────────
    // POST /api/budget/{id}/rollover
    // ──────────────────────────────────────────────

    [Fact]
    public async Task Rollover_Returns400_WhenPeriodIsCurrent()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        budget.period = new TimeUnit { Month = DateTime.Now.Month, Year = DateTime.Now.Year };
        var history = BudgetTestFixtures.MakeHistory(id: budget.history_id);

        _db.Setup(d => d.GetBudgetAsync(budget.id)).ReturnsAsync(budget);
        _db.Setup(d => d.GetHistoryAsync(budget.history_id)).ReturnsAsync(history);
        _db.Setup(d => d.UpdateHistoryAsync(It.IsAny<BudgetHistory>())).Returns(Task.CompletedTask);

        var response = await _client.PostAsync($"/api/budget/{budget.id}/rollover", null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // ──────────────────────────────────────────────
    // DELETE /api/budget/{id}
    // ──────────────────────────────────────────────

    [Fact]
    public async Task DeleteBudget_Returns200_WhenBudgetExists()
    {
        var budget = BudgetTestFixtures.MakeBudget();
        var userData = BudgetTestFixtures.MakeUserData(budgetIds: new List<string> { budget.id });

        _db.Setup(d => d.GetBudgetAsync(budget.id)).ReturnsAsync(budget);
        _db.Setup(d => d.GetUserData(It.IsAny<string>())).ReturnsAsync(userData);
        _db.Setup(d => d.UpdateUserData(It.IsAny<UserData>())).Returns(Task.CompletedTask);
        _db.Setup(d => d.DeleteBudgetAsync(budget.id)).Returns(Task.CompletedTask);

        var response = await _client.DeleteAsync($"/api/budget/{budget.id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
