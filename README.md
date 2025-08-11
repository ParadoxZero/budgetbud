# BudgetBud

A simple, free, no-nonsense and collaborative budgeting tool to manage expenses efficiently.

| Env | Link |
| --- | ---- |
| Prod | https://tinyurl.com/budgetbudapp |
| Test | https://tinyurl.com/budgetbudtest |

## Features ✨

- **Create & Manage Budgets** – Set up budgets with different categories like rent, groceries, entertainment, and more.

- **Track Expenses** – Add and remove expenses to see remaining funds and spending patterns.

- **Collaborate with Other**s – Share your budget with family members or roommates for seamless financial planning.

## Screenshots

<flex>
<img src ="https://github.com/user-attachments/assets/ef90b944-6ab7-4a3d-83bf-83ee62c61be6" width="600px" />

<img src="https://github.com/user-attachments/assets/6c7c178c-d44d-49f7-82e7-3da24d8b6a9d" height="500px"/>

<img src="https://github.com/user-attachments/assets/6b37505f-e3da-456d-8a01-f9ce177a527d" height="500px"/>

</flex>

## Developer Details

The core principles for this project are -

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
> local development builds, while .env.production will be used when building the production version of the app.

```plaintext
VITE_CREATE_DUMMY_DATA=true # Populate the app with some dummy data to test out UI features
VITE_PING_REMOTE=false # Send a heartbeat/ ping to remote API to test connection
VITE_USE_LOCAL_DATA_SERVICE=true # Decide between using a local data service backed by browser's localData or the remote API
VITE_CLEAR_USER_DATA_ON_LOAD=true # Clear the local data/ reset it on load.
```

### API server

If you want to test out E2E App. Build client before the server -

```shell
npm run build
```

This will populate the `wwwroot` folder with the client.
Then use the following command to run the dev server -

```shell
dotnet run
```

You will need to configure the dev environment by creating a `appsettings.Development.json` based on the `appsettings.json` file.
Populate the connection string to be able to test out the server.

> appsettings file: Just like th .env files, these are configurations available to the webb server during runtime.
> Comes in development and production flavours.

Relevant settings -

```json
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

## Deployment and infrastructure

This application is currently designed to be hosted on Microsoft Azure, leveraging:

- Cosmos DB (free tier) for scalable, cloud-native data storage.

- Azure App Service (most basic tier) and it's inbuilt authentication for social oauth.

## Tools and Scripts

### Migration CLI

The `migration-cli` is a .NET Core command-line tool for managing database migrations and maintenance tasks for BudgetBud's backend Cosmos DB. It allows you to:

- Apply schema/data migrations to Cosmos DB
- Register and run custom migration scripts
- Safely update or transform data in-place

#### Usage

1. Configure your Cosmos DB connection in `migration-cli/appsettings.json`.

2. Build the CLI:

   ```bash
   dotnet build migration-cli/migration-cli.csproj
   ```

3. Run the CLI:

   ```bash
   dotnet run --project migration-cli/migration-cli.csproj
   ```

The CLI will prompt for migration selection and execute registered migrations. See `Program.cs` for migration registration and implementation details.

---

## Cosmos Clone Script

The `clone_cosmos_container.py` script is a Python utility to clone all items from one Cosmos DB container to another. Useful for backups, migrations, or duplicating environments.

### Features

- Copies all items from a source container to a destination container
- Interactive confirmation to prevent accidental overwrites
- Uses the official Azure Cosmos Python SDK

#### Usage

1. Install dependencies:

   ```shell
   pip install azure-cosmos
   ```

2. Run the script:

   ```shell
   python clone_cosmos_container.py --key <COSMOS_KEY> --endpoint <COSMOS_ENDPOINT> --database <DB_NAME> --source <SOURCE_CONTAINER> --dest <DEST_CONTAINER>
   ```

You will be prompted to confirm before cloning begins.

## Contributing

The project is currently at it's minimum requirement complete stage. All contributions are most welcome as long as the basic principles are followed.
Only request is to file an issue first to have a discussion around the contribution :)
