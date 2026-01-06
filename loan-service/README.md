# Loan Service

This service manages device reservations, collections, and returns.

## Features
- Reserve devices (with concurrency control)
- Mark devices as collected
- Mark devices as returned
- Publish events for email notifications
- Track loan duration (2-day standard period)

## Architecture
Following Ports & Adapters (Hexagonal) pattern:
- `src/domain/` - Pure domain logic (Loan entity, validation)
- `src/infra/` - Infrastructure implementations (Cosmos DB, Event Grid)
- `src/app/` - Application use cases (business orchestration)
- `src/functions/` - HTTP triggers (API endpoints)
- `src/config/` - Dependency injection

## Local Development

### Prerequisites
- Docker Desktop running
- VS Code with Dev Containers extension

### Setup
1. Open this folder in VS Code
2. Reopen in Container when prompted
3. Run `npm install`
4. Run `npm start` (runs on port 7072 to avoid conflict with device-catalogue)
5. Test at `http://localhost:7072/api/loans`

### Using Fake Repository (No Azure needed)
By default, the service uses `fake-loan-repo.ts` for local testing.
Events are logged to console instead of being sent to Event Grid.

### Using Real Cosmos DB
Set environment variables in `local.settings.json`:
- `COSMOS_ENDPOINT`
- `COSMOS_KEY`
- `COSMOS_DATABASE`
- `COSMOS_CONTAINER`
