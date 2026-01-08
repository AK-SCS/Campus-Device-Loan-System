# Integration Tests Setup

## Overview

Integration tests have been created to verify the deployed backend APIs are functioning correctly. These tests call the actual deployed Azure Function Apps to verify:

- API endpoints are accessible
- Response formats match expected DTOs
- Authentication is properly enforced
- CORS headers are present
- Error handling works correctly

## Test Files

- **tests/integration/device-catalogue-api.test.ts**: Tests for Device Catalogue Service
- **tests/integration/loan-service-api.test.ts**: Tests for Loan Service

## Running Tests

### Locally Against Test Environment

```bash
cd frontend-react
npm run test:integration
```

This will run tests against the default Azure deployed services:
- Device Catalogue: `https://campus-device-catalogue.azurewebsites.net/api`
- Loan Service: `https://campus-loan-service.azurewebsites.net/api`

### With Custom API URLs

Set environment variables before running:

```bash
export VITE_API_BASE_URL=https://your-device-catalogue.azurewebsites.net/api
export VITE_LOAN_API_BASE_URL=https://your-loan-service.azurewebsites.net/api
npm run test:integration
```

## Integration in CI/CD

The integration tests can be added to the GitHub Actions workflow to run after deployment to the test environment:

```yaml
- name: Run Integration Tests
  run: |
    cd frontend-react
    npm run test:integration
  env:
    VITE_API_BASE_URL: https://campus-device-catalogue-test.azurewebsites.net/api
    VITE_LOAN_API_BASE_URL: https://campus-loan-service-test.azurewebsites.net/api
```

## Test Coverage

### Device Catalogue API Tests

- ✅ GET /api/devices - List all devices
- ✅ GET /api/devices/:id - Get device by ID
- ✅ GET /api/devices/:id (404) - Non-existent device
- ✅ GET /api/devices/search - Search by category
- ✅ GET /api/devices/search - Empty results
- ✅ GET /api/health - Health check
- ✅ GET /api/ready - Readiness check

### Loan Service API Tests

- ✅ POST /api/loans/reserve (401) - Unauthenticated request
- ✅ OPTIONS /api/loans/reserve - CORS preflight
- ✅ GET /api/loans/:id (401) - Unauthenticated request
- ✅ GET /api/health - Health check
- ✅ GET /api/ready - Readiness check with database status
- ✅ POST /api/loans/reserve (400) - Invalid request body

## Current Status

⚠️ **Note**: Integration tests currently fail with 404 errors when running against the deployed Azure Function Apps. This indicates either:

1. The Azure Function Apps are not currently running/deployed
2. The routes in the deployed apps differ from expected routes
3. The Azure Function Apps need to be started/warmed up

### Next Steps to Fix

1. **Verify Azure Function Apps are deployed and running**:
   - Check in Azure Portal that Function Apps exist and are started
   - Check Function App logs for any errors

2. **Verify function routes match**:
   - The tests expect `/api/devices`, `/api/health`, etc.
   - Check that function.json or app registration uses these exact routes

3. **Warm up the functions**:
   - Azure Functions on consumption plan may need warm-up
   - Try hitting the endpoints manually first via browser/Postman

4. **Check CORS configuration**:
   - Ensure CORS is properly configured in Azure Function App settings
   - Wildcard `*` should be allowed for test environment

## ICA Requirements Met

✅ **Week 10 Lab - Integration Tests (Higher Grades)**:
- Created `tests/integration` folder
- Configured `vitest.integration.config.ts` for separate integration test execution
- Added integration test files that call backend services via HTTP
- Tests verify response structure matches expected DTOs
- Tests use environment variables for flexible deployment URLs
- Ready to integrate into CI/CD workflow after deploy-to-test step

## Evidence for ICA Submission

Include the following in your ICA documentation:

1. **Code**: Show the integration test files
2. **Configuration**: Show vitest.integration.config.ts and package.json scripts
3. **Workflow Integration** (when implemented): Show GitHub Actions workflow running integration tests
4. **Test Results**: Screenshot of passing integration tests (once Azure services are properly deployed)
5. **Explanation**: Describe what the integration tests verify and why they're important

## Week 10 Lab Alignment

This implementation follows the Week 10 lab guidance:

✅ Created `tests/integration` folder
✅ Upgraded `package.json` to support separate integration tests with `test:integration` script
✅ Added test files calling backend service APIs using HTTP methods and DTOs
✅ Tests can be manually invoked via `npm run test:integration`
✅ Tests use environment variables for deployed test environment URLs
✅ Ready for CI/CD workflow integration to run after deploy-to-test

The implementation is complete and awaits proper deployment of Azure Function Apps to verify end-to-end functionality.
