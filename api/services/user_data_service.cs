/* 
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2024  Sidhin S Thomas <sidhin.thomas@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * The source is available at: https://github.com/ParadoxZero/budgetbud
 */

using budgetbud.Models.Request;
using budgetbud.Exceptions;
using budgetbud.Models;

namespace budgetbud.Services;

public class UserDataService
{
    private readonly DbService _dbService;
    private readonly IIdentityService _identityService;

    public UserDataService(DbService dbService, IIdentityService identityService)
    {
        _dbService = dbService;
        _identityService = identityService;
    }

    public async Task<List<Budget>> FetchAssociatedBudgets()
    {
        string user_id = _identityService.GetUserIdentity();

        List<string> budgets = (await _dbService.GetUserData(user_id)).BudgetIds;
        List<Budget> budgetList = new List<Budget>();
        foreach (string budgetId in budgets)
        {
            budgetList.Add(await _dbService.UpdateUserNickName(await _dbService.GetBudgetAsync(budgetId)));
        }
        return budgetList;
    }

    public async Task ReorderBudgets(List<string> newOrder) {
      string user_id = _identityService.GetUserIdentity();
      var userData = await _dbService.GetUserData(user_id);
      List<string> budgetList = userData.BudgetIds;
      if (budgetList.Count != newOrder.Count || !new HashSet<string>(budgetList).SetEquals(newOrder)) {
        throw new BadHttpRequestException("Invalid list of budget ids");
      }
      userData.BudgetIds = newOrder;
      await _dbService.UpdateUserData(userData);
    }

    public async Task<Budget> CreateBudget(string name)
    {
        var budget = await _dbService.CreateNewBudgetAsync(name);
        var user_data = await _dbService.GetUserData(_identityService.GetUserIdentity());
        user_data.BudgetIds.Add(budget.id);
        await _dbService.UpdateUserData(user_data);
        return budget;
    }

    public async Task<Budget> AddExpenseToBudget(string budget_id, Expense expense)
    {
        return await _dbService.AddExpenseAsync(budget_id, expense);
    }

    public async Task<Budget> UpdateExpenseToBudget(string budget_id, Expense expense)
    {
        return await _dbService.UpdateExpenseAsync(budget_id, expense);
    }

    public async Task<Budget> AddCategoryToBudget(string budget_id, List<Category> categoryList)
    {
        await _dbService.AddCategoryAsync(budget_id, categoryList);
        return await _dbService.GetBudgetAsync(budget_id);
    }

    public async Task<Budget> UpdateCategory(string budget_id, Category category)
    {
        await _dbService.UpdateCategoryAsync(budget_id, category);
        return await _dbService.GetBudgetAsync(budget_id);
    }

    public async Task DeleteBudget(string budget_id)
    {
        await _dbService.DeleteBudgetAsync(budget_id);
    }

    public async Task<Budget> DeleteCategory(string budget_id, int category_id)
    {
        return await _dbService.DeleteCategoryAsync(budget_id, category_id);
    }

    public async Task<Budget> GroupEditCategories(string budget_id, List<GroupCategoryEditRow> categories)
    {
      Budget budget = await _dbService.GetBudgetAsync(budget_id);
      int next_category_id = _dbService.GetNextCategoryId(budget);
      var categoriesById = budget.categoryList.ToDictionary(c => c.Id);
      var updatedCategoryList = new List<Category>();
      foreach(var category in categories) 
      {
        if (category.id.HasValue ) {
          if (!categoriesById.ContainsKey(category.id.Value))
          {
            throw new BadHttpRequestException("Invalid category id");
          }
          var existing_category = categoriesById[category.id.Value];
          existing_category.Allocation = category.amount;
          existing_category.Name = category.title;
          existing_category.IsSingleType = category.isSingleType;
          updatedCategoryList.Add(existing_category);
        }
        else {
          Category new_category = new Category {
            Id = next_category_id++,
            Name = category.title,
            Description = "",
            Allocation = category.amount,
            IsActive = true,
            IsSingleType = category.isSingleType,
            Currency = "INR",
            LastUpdated = DateTime.UtcNow.Ticks,
            ExpenseList = new List<Expense>()
          };
          updatedCategoryList.Add(new_category);
        }
      }
      budget.categoryList = updatedCategoryList;
      await _dbService.UpdateBudgetAsync(budget);
      return budget; 
    }

    public async Task ReorderChategoriesAsync(string budget_id, List<int> new_order) {
        Budget budget = await _dbService.GetBudgetAsync(budget_id);
        List<Category> category_list = budget.categoryList;
        var categoriesById = category_list.ToDictionary(c => c.Id);
        List<Category> reordered = new List<Category>(category_list.Count);
        foreach(var id in new_order) {
          if (!categoriesById.ContainsKey(id)) {
            throw new BadHttpRequestException("Invalid key in input list");
          }
          reordered.Add(categoriesById[id]);
        }
        if (reordered.Count() != category_list.Count()) {
          throw new BadHttpRequestException("Order doesn't contain all categories"); 
        }
        budget.categoryList = reordered;
        await _dbService.UpdateBudgetAsync(budget);
    }

    public async Task<Budget> DeleteExpense(string budget_id, int category_id, int expense_id)
    {
        return await _dbService.DeleteExpenseAsync(budget_id, category_id, expense_id);
    }

    public async Task<Budget> RolloverBudget(string budget_id)
    {
        Budget budget = await _dbService.GetBudgetAsync(budget_id);
        BudgetHistory history = await _dbService.GetHistoryAsync(budget.history_id);
        IList<Budget> history_list = new List<Budget>(history.history);
        history_list.Add(budget);
        history.history = history_list.ToArray();
        await _dbService.UpdateHistoryAsync(history);
        budget.categoryList.ForEach((Category c) => { c.ExpenseList.Clear(); });
        if (budget.period.Month == DateTime.Now.Month && budget.period.Year == DateTime.Now.Year)
        {
            throw new InvalidInputException("You cannot rollover right now, please use force api operation if required");
        }
        budget.period = budget.period.Increment();
        await _dbService.UpdateBudgetAsync(budget);
        return budget;
    }

    public async Task UpdateUserNickName(string name)
    {
        string user_id = _identityService.GetUserIdentity();
        UserData user_data = await _dbService.GetUserData(user_id);
        user_data.NickName = name;
        await _dbService.UpdateUserData(user_data);
    }

    public async Task<string> GetUserNickName()
    {
        string user_id = _identityService.GetUserIdentity();
        return (await _dbService.GetUserData(user_id)).NickName;
    }

}
