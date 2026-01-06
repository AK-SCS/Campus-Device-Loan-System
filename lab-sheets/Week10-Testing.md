# Unit Testing Vitest CI/CD Integration Testing
# Week 10 Lab Worksheet
**Topic: Unit & Integration Testing**

Firstly, complete the consolidation quiz on Blackboard.

Now practice automated testing with the exercises below:

- write and run some unit tests manually,
- upgrade a backend service project to include unit tests,
- extend a CI build workflow to include automated unit testing.

After completing the exercises, apply what you have learnt to your assessment work. Guidance is provided at the end of this worksheet.

Most exercises can be attempted using the example code or using your own repos if they are ready. Details are given in each exercise.

## Exercise 1: Unit Testing Locally
**Fork and clone**
```
https://github.com/tpdavison/cis3039-example-testing-svc
```

Use this example project for now as it already has unit testing configured. Later you will apply it to your own repos.

Follow the **Local Setup** instructions in the README to ensure the code is ready.

**Run the existing unit tests:**
```bash
npm test
```

Four tests should pass and one should be skipped. The skipped one is found in `src/app/list-products.test.ts` listed as `it.todo` because it is incomplete.

**Run a coverage report:**
```bash
npm run test:coverage
```

This will display a table showing how much of each tested function is covered by its tests. The report should show `list-products.ts` has one line of code (#28) that is not covered by existing tests. Take a look at that line of code and determine why.

**Add another unit test to `list-products.test.ts` to improve the coverage:**

Do this manually or with the assistance of Copilot:

Complete the todo unit test, using a mock product repo, to verify list-products handles repository errors.

The result should be something like this:

```typescript
it('should handle repository errors gracefully', async () => {
  // Arrange: mock repo that throws
  const errorMessage = 'Database unavailable';
  const productRepo = {
    list: async () => { throw new Error(errorMessage); },
    // Provide no-op implementations for interface completeness
    getById: async () => null,
    save: async (p: any) => p,
    delete: async () => {},
  };
  
  // Act
  const result = await listProducts({ productRepo });
  
  // Assert
  expect(result.success).toBe(false);
  expect(result.error).toBe(errorMessage);
});
```

Rerun the tests and coverage report to confirm `list-products.ts` now have full coverage.

## Exercise 2: Upgrade a Project with Vitest
1. Select, clone and open one of your backend service code repos in VS Code. If you prefer to exercise using example code, fork and clone the CI/CD backend service example: `https://github.com/tpdavison/cis3039-example-cicd-svc`. You may already have a fork of this repo from previous lab sessions, in which case use a slightly different name during the fork operation.
2. Ensure the code is ready (buildable). For the example repo, you would follow the **Local Setup** instructions in the README.
3. Follow the instructions in the Backend Service Testing Example repo's README to upgrade the project from step #1 to include unit testing.
   - For additional reference, you can view the **Configure Vitest** commit changes in the Backend Service Testing Example

**Add a unit test:**

1. Select an existing domain entity in your project (which should be within `src/domain`) to test (e.g. `product`) and add a new file with the co-located test name (e.g. `product.test.ts`).

2. Add at least one unit test. If you want a token placeholder unit test:

```typescript
import { describe, it, expect } from 'vitest';
                
it('always passes', () => {
  expect(true).toBe(true);
});
```

3. Run the unit tests and coverage report to confirm the project has working unit testing.

## Exercise 3: (Optionally) Add Automated Unit Testing to CI Build Workflow
1. Re-open the project from Exercise 2 (which should have working unit testing).
2. If the project does not have a workflow featuring a build, create `.github/workflows/build.yml` as a copy of this [build.yml](https://github.com/tpdavison/cis3039-example-cicd-svc/blob/main/.github/workflows/build.yml).
3. Add another GitHub Actions Step after the build that will run the unit tests (using the same command we use in the VS Code console). If you wish, you could also have it run the coverage report.
4. Commit the above changes and push to the GitHub repo (using either the VS Code GUI or the CLI).
5. **View the workflow results.** Visit the repo page in your github.com account, select the **Actions** tab from the top navbar, click on the workflow run corresponding to your latest code change. Click on the workflow's jobs to see the detailed console logs and confirm the unit tests were run during the workflow.
6. **(Optionally)** Make another code change that results in successful build but a failed unit test. Commit that to GitHub and confirm that the CI build workflow fails overall despite it building successfully.

## Add Automated Testing to your assessment work
✅ **Goal:** Apply the same principles used in this lab to perform automated testing (at least locally or ideally during CI/CD workflows) to your assessment repos.

Suggested steps for adding automated testing to your assessment work:

1. **Follow the upgrade instructions** to add support for automated testing to your backend service repo(s). This aligns with Exercise 2.

2. **Add unit tests of the domain entities:**
   - Add a `src/domain/{X}.test.ts` file (e.g. `src/domain/device.test.ts`) to your repo and add a unit test for the main path through a key function (e.g. a test to ensure `createDevice` works correctly when given good input values). You can use `src/domain/product.test.ts` from the backend service example as a template.
   - Ensure the unit test runs with a `npm test`.
   - Extend the tests to cover some bad inputs. You can use AI to assist but ensure you check its output makes sense.

3. **Add unit tests of the use-cases:**
   - Add (if you don't already have) a fake repo for your domain entities (e.g `src/infra/fake-device-repo.ts`). You can use the `fake-product-repo.ts` from the backend service examples as a template.
   - Add a `src/app/{X}.test.ts` file (e.g. `src/app/list-devices.test.ts`) to your repo and add a unit test for the main path through the function (e.g. a test to ensure `listDevices` works correctly when given good input values and when the repo responds). You can use `src/app/list-products.test.ts` from the backend service example as a template.

4. **Combine automated unit tests with a CI build.** If you have a CI build workflow, upgrade it to also run unit tests. This aligns with Exercise 3.

5. **(High grades only)** Upgrade and add automated unit tests to your frontend app(s). Use the `cis3039-example-testing-app` repo as guidance, particularly the README section on how to upgrade and the **Configure Vitest** commit.

6. **(Higher grades only)** Add integration tests to your frontend app repo:
   - Create a `tests/integration` folder to your project.
   - Upgrade `package.json` to support separate integration tests (see lecture slides).
   - Add a test file corresponding to your backend service API (e.g. `tests/integration/products-api-test.ts`).
   - Using the vitest framework as for unit tests, add a test to call your backend service using the same HTTP method and DTO as your app does.
   - Manually invoke the tests within VS Code console and verify it passes with your deployed test environment.
   - Upgrade your CI/CD workflow to run the integration tests after the deploy-to-test. Ideally, the integration tests should get the API base URL from env, so that the workflow can set the env value to match what it has just deployed.

7. Consult the lecture slides and assessment criteria to see what further work would be needed for the highest possible grade.
