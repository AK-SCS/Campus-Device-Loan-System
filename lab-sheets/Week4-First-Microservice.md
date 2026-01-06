# Ports & Adapters Azure Functions Cosmos DB Dev Containers TypeScript Git & GitHub Azure CLI
# Week 4 Lab Worksheet
**Topic: Build Your First Microservice (Azure Functions + Cosmos DB)**

## Learning Outcomes
By the end of this lab you should be able to:

- Identify a minimal viable demonstration from your C4 container diagram and sequence development.
- Create a TypeScript Azure Functions app inside a devcontainer and manage it with GitHub.
- Model a domain entity, define a repository port, and implement a Cosmos DB adapter (ports/adapters).
- Provision Cosmos DB for NoSQL using Azure CLI and seed test data safely.
- Implement a thin application use case and expose it via an HTTP trigger.

## Stage 1 Quick Quiz
**Why?** Warm up your mental model so the hands-on work lands faster.

Open this week's short consolidation quiz on Blackboard. It checks:

- Clean | Onion | Hexagonal Architecture
- Ports and Adapters
- Cosmos DB basics

💡 **Reflection:** Is there something you don't really understand? Ask the tutor or your preferred AI companion.

## Stage 2 Accounts Preparation
**Why?** Prevent stalls later by checking access and setting expectations.

✅ Ensure you can log into GitHub and Azure in the browser.
✅ Confirm allowed Azure regions for your subscription (from week 1). Pick one for this lab (e.g., uksouth).
ℹ︎ **Recommended:** Sign up for GitHub Education for extra features (including better Copilot).

❗ **Warning:** Never hard-code secrets. You'll use environment variables for the Cosmos key locally in this lab.

## Stage 3 Complete your development plan
**Why?** Having a clear plan for what to build for your assessment helps you stay focused and organized.

1. Duplicate your C4 Container Diagram.
2. Label the order you will build containers.
3. Circle your minimal viable demo — the smallest demo that meets the assessment criteria for your target grade.
4. Choose the first container to implement: a backend microservice.
5. Discuss and agree the plan with a tutor.

✅ **Definition of Done:** Updated diagram with sequence + MVD, tutor sign-off.

## Stage 4 Create a new Azure Functions project
**Why?** A clean devcontainer gives you consistent tooling on lab machines and at home.

### 4a) Create a new project folder
Create a folder under your Source directory. Open it in VS Code.

### 4b) Add a Dev Container
Create `.devcontainer/devcontainer.json` with:

```json
{
  "name": "DevOps Starter Kit",
  "image": "ghcr.io/tpdavison/devops-labs:latest",
  "features": {},
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-azuretools.vscode-azurefunctions",
        "ms-azuretools.vscode-azureresourcegroups",
        "ms-azuretools.vscode-azuretools",
        "ms-vscode-remote.remote-containers"
      ]
    }
  }
}
```

Reopen in container when VS Code prompts you.

### 4c) Initialise Git & push
Use the Source Control panel in VS Code to initialise a Git repository and make your first commit.

Then, push your changes to a new private remote repository.

### 4d) Scaffold the Functions app (TypeScript)
```bash
func init . --worker-runtime node --language typescript
```

Make a git commit and push.

### 4e) (Optional) Add Prettier
```bash
code --install-extension esbenp.prettier-vscode
```

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "prettier.singleQuote": true
}
```

Add the extension id to the devcontainer's extensions array too so it will automatically install on other machines you open this project on.

✅ **Checkpoint:** Project runs inside the devcontainer; `npm install` works; `npm start` launches the Functions host.

## Stage 5 Add a domain model
**Why?** The domain model holds your business rules — no I/O, no SDKs.

### 5a) Create the folder & file
Add `src/domain/` and create `product.ts` (or whatever your core entity is).

### 5b) Use Copilot to generate a first cut
Example prompt in Copilot Chat:

```
Create a TypeScript pure domain model named Product. 
Use a factory function that takes a single parameter object and validates required fields. 
Include type definitions. Prefer functional programming style.
```

Change it to object-oriented if you prefer. But be consistent throughout the project.

### 5c) Refine the model
- Ensure there's a unique key to support persistence (often `id`).
- Adjust validation to your real rules (lengths, ranges, enums).
- Keep it framework-free.

### 5d) Commit
Make a git commit and push.

✅ **Definition of Done:** A self-contained model with types and validation, no imports from app, infra, Azure etc.

## Stage 6 Add a repository port
**Why?** The port will let application do its work without any tech dependencies.

### 6a) Create the interface file
Add `src/domain/product-repo.ts` (rename for your entity).

### 6b) Generate with Copilot
Example prompt in Copilot Chat:

```
Create a repository interface ProductRepo for the Product model with async create and get methods. 
Keep it minimal and pure domain.
```

### 6c) Refine the interface
Compare with the lecture example. Make any necessary adjustments either by hand or using Copilot.

### 6d) Commit
Make a git commit and push.

✅ **Definition of Done:** An interface describing storage calls; no SDKs, no config decisions.

## Stage 7 Implement a Cosmos DB adapter
**Why?** You need a concrete implementation to persist your domain model to Cosmos DB.

### 7a) Create infra file
Add `src/infra/cosmos-product-repo.ts` (rename for your entity).

### 7b) Generate with Copilot
Example prompt in Copilot Chat:

```
Implement ProductRepo using Azure Cosmos DB (NoSQL). This is infrastructure code. 
Use an Options object in the constructor (do not hard-code config). 
Include an optional `key` option to support access-key auth. 
Define an internal DTO type for the container shape, separate from the domain model.
```

### 7c) Install Azure libraries
Run the following command to install the necessary Azure libraries (if the AI did not):

```bash
npm install @azure/cosmos @azure/identity
```

### 7d) tsconfig that plays nicely with Azure SDKs
Try an `npm run build`. If it fails you may need to tweak your `tsconfig.json`. Either ask Copilot or modify to match the following

```json
{
  "compilerOptions": {
    "module": "Node16",
    "moduleResolution": "node16",
    "target": "es2020",
    "outDir": "dist",
    "rootDir": ".",
    "sourceMap": true,
    "strict": false,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  }
}
```

### 7e) Expectations checklist
- No configuration decisions inside the class; everything comes via Options.
- Internal Cosmos Document type distinct from your domain type.
- All interface methods are async.
- `Options.key` exists for access-key auth (useful locally).
- Compare with the lecture example and make any necessary adjustments either manually or using Copilot.

### 7f) Commit
Make a git commit and push.

ℹ︎ **Note:** We'll use access-key locally; in later weeks we will prefer Managed Identity.

✅ **Definition of Done:** Adapter compiles and satisfies the port.

## Stage 8 Provision Cosmos DB for NoSQL via CLI
**Why?** CLI is repeatable, scriptable, and needed for automation in future weeks.

ℹ︎ **Preflight checks:**
- `az account show` to ensure you're on the correct subscription.
- `az extension add --name cosmosdb-preview` to ensure the extension is installed.
- Pick a project name, a region, an env tag (e.g. `lab` or `dev`) and a unique identifier to you (e.g. initials and favourite number).

Our general Azure naming convention is to use kebab-case for resource names, and to include the project name, environment, a unique identifier and the resource type: `project-env-uid-type`

### 8a) Login:
```bash
az login
```

### 8b) Create a Resource Group for this week's resources:
```bash
az group create \
  --name shopping-dev-ab47-rg \
  --location uksouth
```

❗ **Warning:** Substitute name and region with your chosen ones.

### 8c) Create a Cosmos account (Serverless):
```bash
az cosmosdb create \
  --resource-group shopping-dev-ab47-rg \
  --name shopping-dev-ab47-cosmos \
  --capacity-mode Serverless \
  --backup-policy-type Periodic \
  --backup-redundancy Local
```

### 8d) Create a Database:
```bash
az cosmosdb sql database create \
  --resource-group shopping-dev-ab47-rg \
  --account-name shopping-dev-ab47-cosmos \
  --name catalogue-db
```

### 8e) Create a Container
```bash
az cosmosdb sql container create \
  --resource-group shopping-dev-ab47-rg \
  --account-name shopping-dev-ab47-cosmos \
  --database catalogue-db \
  --name products \
  --partition-key-path "/id"
```

### 8f) Verify in the portal
Open the Azure portal, navigate to your resource group, open the Cosmos account, and use Data Explorer to verify the database and container exist.

❗ **Warning:** If you don't make it serverless it will cost money (use credits).

✅ **Definition of Done:** Account, database, and container exist. You can see them in the Azure portal's Data Explorer.

## Stage 9 Add simple dependency resolution
**Why?** We need something to instantiate our adapters.

### 9a) Create config module
Add `src/config/appServices.ts`.

### 9b) Generate with Copilot
Example prompt in Copilot Chat:

```
Create a lazy singleton accessor that returns a CosmosProductRepo. 
Hard-wire options except that the Cosmos key must come from process.env.COSMOS_KEY. 
Export getProductRepo().
```

Compare with the lecture example and refine as necessary.

### 9c) Commit
Make a git commit and push.

ℹ︎ **Tip:** Keep this simple now; we'll revisit more refined dependency resolution later in the module.

✅ **Definition of Done:** `getProductRepo()` returns a working repo; key is only read from the environment.

## Stage 10 Seed test data
**Why?** You need something to see and interact with when debugging.

### 10a) Create a seed folder with test data
Add `src/seed/` and either a JSON file or a small TS module with sample data. You can have copilot generate this for you.

### 10b) Seed script
Ask Copilot to write a script in `src/seed/seed.ts` that imports `getProductRepo()`, imports the test data, and writes them to the database (through the repo).

Ask copilot to wire up the seed script to run on `npm run seed`.

### 10c) Export your Cosmos key to the shell
```bash
export COSMOS_KEY=$(\
  az cosmosdb keys list \
  --resource-group shopping-dev-ab47-rg \
  --name shopping-dev-ab47-cosmos \
  --query primaryMasterKey \
  -o tsv \
)
```

### 10d) Run the seed
```bash
npm run seed
```

Verify in the Azure portal > Data Explorer or the VS Code Azure Cosmos DB extension.

❗ **Do not put the COSMOS_KEY value or any secrets in source files. Keep keys in your shell env only.**

✅ **Definition of Done:** Seed script reports success; data is visible in the container.

## Stage 11 Add an application use case
**Why?** The app layer coordinates ports and the domain and applies simple business policy.

### 11a) Create a suitably named file in `src/app/` (e.g. `list-products.ts`)

### 11b) Generate with Copilot
Example prompt in Copilot Chat:

```
Add a listProducts use case function.  This is application layer code.  Use the single-parameter deps pattern for dependencies. Keep the body thin and pure.
```

Compare with the lecture example and refine as necessary.

### 11c) Commit
Make a git commit and push.

✅ **Definition of Done:** Use case compiles and can call the repo.

## Stage 12 Expose via a HTTP trigger
**Why?** An API endpoint is your public contract and entry point.

### 12a) Generate with Copilot
Example prompt in Copilot Chat:

```
Create a v4 HTTP-triggered Azure Function in src/functions/list-products-http.ts 
for route GET /products. Resolve deps via appServices and call the application layer listProducts.  Return JSON.
Include good 400/500 handling with a clear error shape.
```

Compare with the lecture example and refine as necessary.

### 12b) Run & test
```bash
npm start
```

In a browser, navigate to `http://localhost:7071/api/products` (adjust for your route).

### 12c) Commit
Make a git commit and push.

✅ **Definition of Done:** Local host responds with your seeded data at `/products`.

## Completion Checklist
- [ ] Updated C4 container diagram with development order + MVD.
- [ ] New Azure Functions TS project in a devcontainer, in a private GitHub repo.
- [ ] Domain model + validation.
- [ ] Repository port (interface) defined.
- [ ] Cosmos adapter implemented with options + DTO separation.
- [ ] Cosmos resources provisioned (account, db, container).
- [ ] appServices lazy accessor wired to env for key.
- [ ] Seed script and data; database contains records.
- [ ] HTTP-triggered function returning data locally.
