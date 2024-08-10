# BudgetBud

Budget and expense tracking application.

## Development

### Client/ WebUI
Client can be independently developed by standard vite - react dev flow - 
To start the client dev server just do - 
```bash
npm run dev 
```

If it's the first time. Make sure to run - 
```
npm install
```

There are some controls available to modify/ tweak the dev flow in `.env.development` file - 
```
VITE_CREATE_DUMMY_DATA=true # Populate the app with some dummy data to test out UI features
VITE_PING_REMOTE=false # Send a heartbeat/ ping to remote API to test connection
VITE_USE_LOCAL_DATA_SERVICE=true # Decide between using a local data service backed by browser's localData or the remote API
VITE_CLEAR_USER_DATA_ON_LOAD=true # Clear the local data/ reset it on load.
```

### API server

If you want to test out E2E App. Build client before the server - 
```
npm run build
```
This will populate the `wwwroot` folder with the client.
Then use the following command to run the dev server - 
```
dotnet run
```

You will need to confiure the dev envirement by creating a `appsettings.Development.json` based on the `appsettings.json` file.
Populate the connection string to be able to test out the server.

Relevant settings - 
```
  "CosmosDb": {
    "ConnectionString": "",
    "Database": "",
    "Container": ""
  },
  "EnableSwagger": false
```

If enabled, swagger will be available at `http://<origin>/swagger` URL. You can use the Swagger UI to test out APIs to ensure 
your changes work as expected.

Everything available in `appsettings.json` can be overriden by creating envirement variables witht the same name or 
with `CosmosDb:ConnectionString` like pattern for nested keys.
