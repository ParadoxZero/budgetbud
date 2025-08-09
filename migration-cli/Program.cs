/* 
 * BudgetBug - Budgeting and Expense Tracker Migration CLI
 * Copyright (C) 2025  Sidhin S Thomas <sidhin.thomas@gmail.com>
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

using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

public class Program
{
    // Global database context
    private static CosmosClient? cosmosClient;
    private static Database? database;
    private static Container? container;

    // Migration delegate
    delegate Task<bool> MigrationDelegate();

    // Migration registry
    private static readonly Dictionary<string, (int order, string description, MigrationDelegate migration)> migrations = new()
    {
        ["to_hashed_id"] = (1, "Migrate user IDs from original format to SHA256 hashed format", ToHashedId)
    };

    // Main program
    public static async Task<int> Main(string[] args)
    {
        if (args.Length == 0 || args[0] == "help" || args[0] == "--help")
        {
            ShowHelp();
            return 0;
        }

        string migrationName = args[0];

        if (!migrations.ContainsKey(migrationName))
        {
            Console.WriteLine($"Migration '{migrationName}' not found.");
            ShowHelp();
            return 1;
        }

        var configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
            .AddEnvironmentVariables()
            .Build();

        string connectionString = configuration["CosmosDb:ConnectionString"] ?? throw new InvalidOperationException("CosmosDb:ConnectionString not found");
        string databaseName = configuration["CosmosDb:Database"] ?? throw new InvalidOperationException("CosmosDb:Database not found");
        string containerName = configuration["CosmosDb:Container"] ?? throw new InvalidOperationException("CosmosDb:Container not found");

        // Initialize database context
        cosmosClient = new CosmosClient(connectionString);
        database = cosmosClient.GetDatabase(databaseName);
        container = database.GetContainer(containerName);

        if (!migrations.ContainsKey(migrationName))
        {
            Console.WriteLine($"Migration '{migrationName}' not found.");
            ShowHelp();
            return 1;
        }

        Console.WriteLine($"Starting migration: {migrationName}");
        Console.WriteLine($"Description: {migrations[migrationName].description}");
        Console.Write("Are you sure you want to proceed? (y/N): ");

        string? confirmation = Console.ReadLine();
        if (confirmation?.ToLower() != "y")
        {
            Console.WriteLine("Migration cancelled.");
            return 0;
        }

        try
        {
            bool success = await migrations[migrationName].migration();
            if (success)
            {
                Console.WriteLine("Migration completed successfully!");
                return 0;
            }
            else
            {
                Console.WriteLine("Migration failed!");
                return 1;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Migration failed with error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return 1;
        }
        finally
        {
            cosmosClient?.Dispose();
        }
    }

    private static void ShowHelp()
    {
        Console.WriteLine("BudgetBud Migration CLI");
        Console.WriteLine("Usage: dotnet run -- <migration_name>");
        Console.WriteLine();
        Console.WriteLine("Available migrations:");

        foreach (var migration in migrations.OrderBy(m => m.Value.order))
        {
            Console.WriteLine($"  {migration.Value.order}. {migration.Key} - {migration.Value.description}");
        }

        Console.WriteLine();
        Console.WriteLine("Examples:");
        Console.WriteLine("  dotnet run -- to_hashed_id");
        Console.WriteLine("  dotnet run -- help");
    }

    private static string HashUserId(string originalUserId)
    {
        using SHA256 sha256Hash = SHA256.Create();
        byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(originalUserId));
        return Convert.ToHexString(bytes).ToLower();
    }

    private static async Task<bool> ToHashedId()
    {
        try
        {
            Console.WriteLine("Starting user ID migration to hashed format...");

            // Query for all UserData documents (those with github: or google: prefix)
            var queryDefinition = new QueryDefinition("SELECT * FROM c WHERE STARTSWITH(c.id, 'github:') OR STARTSWITH(c.id, 'google:')");
            var queryResultSetIterator = container!.GetItemQueryIterator<dynamic>(queryDefinition);

            var userMigrations = new List<(string originalId, string hashedId, dynamic userData)>();
            var budgetUpdates = new Dictionary<string, List<string>>(); // budgetId -> list of old user IDs to replace

            // First pass: collect all user data and prepare migrations
            while (queryResultSetIterator.HasMoreResults)
            {
                var currentResultSet = await queryResultSetIterator.ReadNextAsync();
                foreach (var item in currentResultSet)
                {
                    // Check if this is a UserData document (has github: or google: prefix)
                    string itemId = item.id.ToString();
                    if (itemId.StartsWith("github:") || itemId.StartsWith("google:"))
                    {
                        string originalId = item.id.ToString();
                        string hashedId = HashUserId(originalId);

                        Console.WriteLine($"Found user: {originalId} -> {hashedId}");
                        userMigrations.Add((originalId, hashedId, item));

                        // Track which budgets need user ID updates
                        var budgetIds = (Newtonsoft.Json.Linq.JArray)item.BudgetIds;
                        foreach (var budgetId in budgetIds)
                        {
                            string budgetIdStr = budgetId.ToString();
                            if (!budgetUpdates.ContainsKey(budgetIdStr))
                            {
                                budgetUpdates[budgetIdStr] = new List<string>();
                            }
                            budgetUpdates[budgetIdStr].Add(originalId);
                        }
                    }
                }
            }

            Console.WriteLine($"Found {userMigrations.Count} users to migrate");

            // Second pass: Update budgets with new hashed user IDs
            foreach (var (budgetId, oldUserIds) in budgetUpdates)
            {
                try
                {
                    var budgetResponse = await container.ReadItemAsync<dynamic>(budgetId, new PartitionKey(budgetId));
                    var budget = budgetResponse.Resource;

                    if (budget.authorized_users != null)
                    {
                        var authorizedUsers = (Newtonsoft.Json.Linq.JArray)budget.authorized_users;
                        for (int i = 0; i < authorizedUsers.Count; i++)
                        {
                            string currentUserId = authorizedUsers[i].ToString();
                            var migration = userMigrations.FirstOrDefault(m => m.originalId == currentUserId);
                            if (migration != default)
                            {
                                authorizedUsers[i] = migration.hashedId;
                                Console.WriteLine($"Updated budget {budgetId}: {currentUserId} -> {migration.hashedId}");
                            }
                        }

                        // Update the budget
                        await container.UpsertItemAsync(budget, new PartitionKey(budgetId));
                    }
                }
                catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    Console.WriteLine($"Warning: Budget {budgetId} not found, skipping...");
                }
            }

            // Third pass: Create new UserData documents with hashed IDs and delete old ones
            foreach (var (originalId, hashedId, userData) in userMigrations)
            {
                try
                {
                    // Create new UserData with hashed ID
                    var newUserData = userData;
                    newUserData.id = hashedId;

                    await container.UpsertItemAsync(newUserData, new PartitionKey(hashedId));
                    Console.WriteLine($"Created new user data: {hashedId}");

                    // Delete old UserData
                    await container.DeleteItemAsync<dynamic>(originalId, new PartitionKey(originalId));
                    Console.WriteLine($"Deleted old user data: {originalId}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error migrating user {originalId}: {ex.Message}");
                    throw;
                }
            }

            Console.WriteLine("Migration completed successfully!");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Migration failed: {ex.Message}");
            return false;
        }
    }
}