# Device Catalogue Service

This service manages the catalog of devices available for loan.

**CI/CD Status:** Testing automated deployment

## Features
- Browse available devices
- View device details
- Check device availability

## Architecture
Following Ports & Adapters (Hexagonal) pattern:
- `src/domain/` - Pure domain logic (entities, interfaces)
- `src/infra/` - Infrastructure implementations (Cosmos DB, fakes)
- `src/app/` - Application use cases
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
4. Run `npm start`
5. Test at `http://localhost:7071/api/devices`

### Using Fake Repository (No Azure needed)
By default, the service uses `fake-device-repo.ts` for local testing.
No Cosmos DB credentials needed!

### Using Real Cosmos DB
Set environment variables in `local.settings.json`:
- `COSMOS_ENDPOINT`
- `COSMOS_KEY`
- `COSMOS_DATABASE`
- `COSMOS_CONTAINER`

<!-- CI/CD Test 15:43:48 -->
