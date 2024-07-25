using budgetbud.Models;
using Microsoft.AspNetCore.Routing.Template;
using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace budgetbud.Services
{
    public class DbService
    {
        private CosmosClient _cosmosClient;
        private Database _database;
        private Container _container;
        private IIdentityService _identityService;

        public DbService(string endpointUri, string databaseName, string containerName, IIdentityService identityService)
        {
            _cosmosClient = new CosmosClient(endpointUri);
            _database = _cosmosClient.GetDatabase(databaseName);
            _container = _database.GetContainer(containerName);
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
                    BudgetId = new List<string>()
                };
                await _container.CreateItemAsync(userData, new PartitionKey(user_id));
                return userData;
            }
        }

        public async Task<Budget> GetBudgetAsync(string budget_id)
        {
            return await _container.ReadItemAsync<Budget>(budget_id, new PartitionKey(budget_id));
        }

        public async Task CreateNewBudgetAsync(string name)
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
                id = Guid.NewGuid().ToString(),
                authorized_users = new List<string>() { _identityService.GetUserIdentity() },
                categoryList = new List<Category>(),
                history_id = history.id,
                last_updated = DateTime.Now,
                period = period,
                recurringList = new List<Recurring>(),
                unplannedList = new List<Expense>(),
                userActions = new List<UserAction>()
            };

            await _container.CreateItemAsync(history, new PartitionKey(history.id));
            await _container.CreateItemAsync(budget, new PartitionKey(budget.id));

        }

        public async Task UpdateBudgetAsync(Budget budget)
        {
            await _container.UpsertItemAsync(budget, new PartitionKey(budget.id));
        }

        public async Task AddExpenseAsync(string budget_id, Expense expense)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            budget.categoryList?.Find(c => c.Id == expense.CategoryId)?.ExpenseList.Add(expense);
            await UpdateBudgetAsync(budget);
        }

        public async Task UpdateExpenseAsync(string budget_id, Expense expense)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            Category category = budget.categoryList?.Find(c => c.Id == expense.CategoryId) ?? throw new Exception("Category not found");
            category.ExpenseList[category.ExpenseList.FindIndex(e => e.Id == expense.Id)] = expense;
            await UpdateBudgetAsync(budget);
        }

        public async Task DeleteExpense(string budget_id, Expense expense)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            Category category = budget.categoryList?.Find(c => c.Id == expense.CategoryId) ?? throw new Exception("Category not found");
            category.ExpenseList.RemoveAll(e => e.Id == expense.Id);
            await UpdateBudgetAsync(budget);
        }

        public async Task AddCategoryAsync(string budget_id, Category category)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            category.Id = (budget.categoryList.LastOrDefault()?.Id ?? 0) + 1;
            budget.categoryList.Add(category);
            await UpdateBudgetAsync(budget);
        }

        public async Task UpdateCategoryAsync(string budget_id, Category category)
        {
            Budget budget = await GetBudgetAsync(budget_id);
            budget.categoryList[budget.categoryList.FindIndex(c => c.Id == category.Id)] = category;
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

    }
}