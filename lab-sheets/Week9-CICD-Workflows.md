# CI/CD GitHub Actions Azure Automation
# Week 9 Lab Worksheet
**Topic: CI/CD Workflows**

Firstly, complete the consolidation quiz on Blackboard.

Now practice automated build and deployment with the exercises below:
1) use the example build pipeline on a backend service,
2) use the example build pipeline on a frontend web app,
3) use the example deploy pipeline on a backend service,
4) use the example deploy pipeline on a frontend web app.

After completing the exercises, apply what you have learnt to your assessment work. Guidance is provided at the end of this worksheet.

You can attempt today's exercises using the example code or using your own deployed services if they are ready.

## Exercise 1: CI Build a Backend Service
**Fork and clone**
```
https://github.com/tpdavison/cis3039-example-cicd-svc
```

If you prefer to use your own work, select a working backend service repo and copy the example `build.yml` into a new `.github/workflows` folder.

Follow the **Local Setup** instructions in the README to ensure the code is ready.

Make a small code change (for example, modify the test data in `src/config/appServices.ts`). Commit this code change and push to the GitHub repo (using either the VS Code GUI or the CLI).

**View the workflow results.** Visit the repo page in your github.com account, select the **Actions** tab from the top navbar, click on the workflow run corresponding to your latest code change. Click on the **build** job to see the detailed console logs of the build process.

**(Optionally)** As an experiment, make another code commit that breaks it (for example, add a random word in the code that will prevent it building). Push to GitHub and then view the build error in the console logs.

## Exercise 2: CI Build a Frontend Web App
**Fork and clone**
```
https://github.com/tpdavison/cis3039-example-cicd-app
```

If you prefer to use your own work, select a working frontend app repo and copy the example `build.yml` into a new `.github/workflows` folder.

Follow the **Local Setup** instructions in the README to ensure the code is ready.

Make a small code change (for example, modify the H1 header wording in `src/views/Products.vue`). Commit this code change and push to the GitHub repo (using either the VS Code GUI or the CLI).

**View the workflow results.** Visit the repo page in your github.com account, select the **Actions** tab from the top navbar, click on the workflow run corresponding to your latest code change. Click on the **build** job to see the detailed console logs of the build process.

**(Optionally)** Experiment to see if bad HTML would cause a build error.

## Exercise 3: CI/CD Deploy a Backend Service
Reopen the repo from Exercise 1.

Replace the existing `build.yml` with the example `build-and-deploy.yml`
```
https://github.com/tpdavison/cis3039-example-cicd-svc/blob/feature/deploy-to-test/.github/workflows/build-and-deploy.yml
```

Follow the **Azure Setup** instructions in this extended README to provision the Azure resources and configure the automated deployment in GitHub.

Commit the above changes and push to the GitHub repo (using either the VS Code GUI or the CLI).

**View the workflow results.** Visit the repo page in your github.com account, select the **Actions** tab from the top navbar, click on the workflow run corresponding to your latest code change. Click on the workflow's jobs to see the detailed console logs of the build and deploy process.

Make another code change (similar to exercise 1), commit and push, wait for the workflow to complete (viewed using GitHub Actions tab), then verify the change has gone live by testing the Azure deployed service to see your change has taken affect.

## Exercise 4: CI/CD Deploy a Frontend Web App
Reopen the repo from Exercise 2.

Replace the existing `build.yml` with the example `build-and-deploy.yml`
```
https://github.com/tpdavison/cis3039-example-cicd-app/blob/feature/deploy-to-test/.github/workflows/build-and-deploy.yml
```

Follow the **Azure Setup** instructions in this extended README to provision the Azure resources and configure the automated deployment in GitHub.

Commit the above changes and push to the GitHub repo (using either the VS Code GUI or the CLI).

**View the workflow results.** Visit the repo page in your github.com account, select the **Actions** tab from the top navbar, click on the workflow run corresponding to your latest code change. Click on the workflow's jobs to see the detailed console logs of the build and deploy process.

Make another code change (similar to exercise 2), commit and push, wait for the workflow to complete (viewed using GitHub Actions tab), then verify the change has gone live by testing the Azure deployed app to see your change has taken affect.

## Add CI/CD to your assessment work
✅ **Goal:** Apply the same principles used in this lab to automate the build of your assessment repos.

Suggested steps for adding CI/CD to your assessment work:

1. Add the appropriate example `build.yml` to the code repos you are using for your assessment. Verify code commits now cause the CI build to run automatically.
2. Upgrade to the appropriate example `build-and-deploy.yml`, updating it with any required env vars and Azure resource names for your assessment code. You will need the Azure test environment resources already provisioned (created) before GitHub can update them. You will need to add the GitHub repo secrets to enable GitHub to deploy into your Azure account.
3. **(High grade only)** Modify/extend the workflow files to support a Production environment that is only deployed to when manually triggered on the main git branch.
4. Consult the lecture slides and assessment criteria to see what further work would be needed for the highest possible grade.
