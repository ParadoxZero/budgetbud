using Microsoft.AspNetCore.Routing.Template;
using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace budgetbud.Services
{
    public class DbService
    {
        private readonly string _endpointUri;
        private readonly string _primaryKey;
        private readonly string _databaseName;
        private readonly string _containerName;
        private CosmosClient? _cosmosClient;
        private Database? _database;
        private Container? _container;

        public DbService(string endpointUri, string primaryKey, string databaseName, string containerName)
        {
            _endpointUri = endpointUri;
            _primaryKey = primaryKey;
            _databaseName = databaseName;
            _containerName = containerName;
        }

        public async Task InitializeAsync()
        {
            _cosmosClient = new CosmosClient(_endpointUri, _primaryKey);
            _database = await _cosmosClient.CreateDatabaseIfNotExistsAsync(_databaseName);
            _container = await _database.CreateContainerIfNotExistsAsync(_containerName, "/partitionKey");
        }

    }
}