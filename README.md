# BudgetBud

A simple, free, no-nonsense and collaborative budgeting tool to manage expenses efficiently.

## Features ✨
- **Create & Manage Budgets** – Set up budgets with different categories like rent, groceries, entertainment, and more.

- **Track Expenses** – Add and remove expenses to see remaining funds and spending patterns.

- **Collaborate with Other**s – Share your budget with family members or roommates for seamless financial planning.

## Development

The development principles for this project
- **Cost-Efficient Hosting** – Design to run seamlessly on free-tier cloud providers, ensuring minimal operational costs.
- **Focused & Minimalist** – No unnecessary visualizations or feature bloat—built solely to support disciplined financial planning.
- **Web first** - Leverage PWA and build a great web client to avoid app market fees
- **Privacy first** - Don't store any data which isn't required for the core function.

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

> .env.development: This is a file to store runtime configurations which will be available to the app. The development one will be used for the
>  local development builds, while .env.production will be used when building the production version of the app.

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

You will need to configure the dev environment by creating a `appsettings.Development.json` based on the `appsettings.json` file.
Populate the connection string to be able to test out the server.

> appsettings file: Just like th .env files, these are configurations available to the webb server during runtime.
>  Comes in develoment and production flavours.

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

### Deployment and infrastructure

This application is currently designed to be hosted on Microsoft Azure, leveraging:

- Cosmos DB (free tier) for scalable, cloud-native data storage.

- Azure App Service (most basic tier) and it's inbuilt authentication for social oauth.

# Screenshots

## Desktop View
![image](https://github.com/user-attachments/assets/ef90b944-6ab7-4a3d-83bf-83ee62c61be6)

## Mobile View
![image](https://github.com/user-attachments/assets/9cb1b2bf-8be1-4a0e-8455-f321a35de6ea)

## Expenses for a specific category view
![image](https://github.com/user-attachments/assets/4be4c8d9-6422-48d9-8e74-aefea76610c8)

