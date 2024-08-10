/* 
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
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

using budgetbud.Models;
using Microsoft.AspNetCore.Routing.Template;
using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace budgetbud.Services
{
    public class DbService
    {
        private readonly CosmosClient _cosmosClient;
        private readonly Database _database;
        private readonly Container _container;
        private readonly IIdentityService _identityService;

        public DbService(IConfiguration configuration, IIdentityService identityService)
        {
            _cosmosClient = new CosmosClient(configuration["CosmosDb:ConnectionString"]);
            _database = _cosmosClient.GetDatabase(configuration["CosmosDb:Database"]);
            _container = _database.GetContainer(configuration["CosmosDb:Container"]);
            _identityService = identityService;
        }

        public async Task<UserData> GetUserData(string user_id)
        {
            try
            {
                return await _container.ReadItemAsync<UserData>(user_id, new PartitionKey(user_id));
            }
            catch (CosmosException e) when (e.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                UserData userData = new UserData
                {
                    id = user_id,
                    BudgetIds = new List<string>()
                };
                await _container.CreateItemAsync(userData, new PartitionKey(user_id));
                return userData;
            }
        }

        public async Task UpdateUserData(UserData userData)
        {
            await _container.UpsertItemAsync(userData, new PartitionKey(userData.id));
        }

        public async Task<Budget> GetBudgetAsync(string budget_id)
        {
            return await _container.ReadItemAsync<Budget>(budget_id, new PartitionKey(budget_id));
        }

        public async Task<Budget> CreateNewBudgetAsync(string name)
        {
            BudgetHistory history = new BudgetHistory
            {
                id = Guid.NewGuid().ToString(),
                history = new Budget[0]
            };

            TimeUnit period = new TimeUnit
            {
                Month = DateTime.Now.Month,
                Year = DateTime.Now.Year
            };

            Budget budget = new Budget
            {
                name = name,
                id = Guid.NewGuid().ToString(),
                authorized_users = new List<string>() { _identityService.GetUserIdentity() },
                categoryList = new List<Category>(),
                history_id = history.id,
                last_updated = DateTime.UtcNow.Ticks,
                period = period,
                recurringList = new List<Recurring>(),
                unplannedList = new List<Expense>(),
                userActions = new List<UserAction>()
            };

            await _container.CreateItemAsync(history, new PartitionKey(history.id));
            await _container.CreateItemAsync(budget, new PartitionKey(budget.id));

            return budget;

        }

        public async Task UpdateBudgetAsync(Budget budget)
        {
            budget.last_updated = DateTime.UtcNow.Ticks;
            await _container.UpsertItemAsync(budget, new PartitionKey(budget.id));
        }

        public async Task<Budget> AddExpenseAsync(string budget_id, Expense expense)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            Category cat = budget.categoryList?.Find(c => c.Id == expense.CategoryId) ?? throw new Exception("Category not found");
            do
            {
                expense.Id = RandomNumberGenerator.GetInt32(0, int.MaxValue);
            } while (cat.ExpenseList.Exists(e => e.Id == expense.Id));

            expense.Timestamp = DateTime.UtcNow.Ticks;
            cat.ExpenseList.Add(expense);
            cat.LastUpdated = DateTime.UtcNow.Ticks;
            await UpdateBudgetAsync(budget);
            return budget;
        }

        public async Task UpdateExpenseAsync(string budget_id, Expense expense)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            expense.Timestamp = DateTime.UtcNow.Ticks;
            Category category = budget.categoryList?.Find(c => c.Id == expense.CategoryId) ?? throw new Exception("Category not found");
            category.ExpenseList[category.ExpenseList.FindIndex(e => e.Id == expense.Id)] = expense;
            category.LastUpdated = DateTime.UtcNow.Ticks;
            await UpdateBudgetAsync(budget);
        }

        public async Task DeleteExpense(string budget_id, Expense expense)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            Category category = budget.categoryList?.Find(c => c.Id == expense.CategoryId) ?? throw new Exception("Category not found");
            category.ExpenseList.RemoveAll(e => e.Id == expense.Id);
            category.LastUpdated = DateTime.UtcNow.Ticks;
            await UpdateBudgetAsync(budget);
        }

        public async Task AddCategoryAsync(string budget_id, List<Category> categoryList)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            int last_id = (budget.categoryList.LastOrDefault()?.Id ?? 0) + 1;
            categoryList.ForEach(c => { c.Id = last_id++; c.LastUpdated = DateTime.UtcNow.Ticks; });
            budget.categoryList.AddRange(categoryList);
            await UpdateBudgetAsync(budget);
        }

        public async Task UpdateCategoryAsync(string budget_id, Category category)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            foreach (Category cat in budget.categoryList)
            {
                if (cat.Id == category.Id)
                {
                    cat.Name = category.Name;
                    cat.Allocation = category.Allocation;
                    cat.LastUpdated = DateTime.UtcNow.Ticks;
                    break;
                }
            }
            await UpdateBudgetAsync(budget);
        }

        public async Task DeleteCategoryAsync(string budget_id, Category category)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            budget.categoryList.RemoveAll(c => c.Id == category.Id);
            await UpdateBudgetAsync(budget);
        }

        public async Task AddRecurringAsync(string budget_id, Recurring recurring)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            budget.recurringList.Add(recurring);
            await UpdateBudgetAsync(budget);
        }

        public async Task DeleteBudgetAsync(string budget_id)
        {
            var user_data = await GetUserData(_identityService.GetUserIdentity());
            var budget = await GetBudgetAsync(budget_id);
            user_data.BudgetIds.Remove(budget_id);
            await UpdateUserData(user_data);
            await _container.DeleteItemAsync<Budget>(budget_id, new PartitionKey(budget_id));
            await _container.DeleteItemAsync<BudgetHistory>(budget.history_id, new PartitionKey(budget.history_id));
        }

        public async Task<Budget> DeleteCategoryAsync(string budget_id, int category_id)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            budget.categoryList.RemoveAll(c => c.Id == category_id);
            await UpdateBudgetAsync(budget);
            return budget;
        }

        internal async Task<Budget> DeleteExpenseAsync(string budget_id, int category_id, int expense_id)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            Category category = budget.categoryList.Find(c => c.Id == category_id) ?? throw new Exception("Category not found");
            category.ExpenseList.RemoveAll(e => e.Id == expense_id);
            category.LastUpdated = DateTime.UtcNow.Ticks;
            await UpdateBudgetAsync(budget);
            return budget;
        }
    }
}