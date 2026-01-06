# Week 8 Lab Worksheet
**Topic: Logging & Monitoring an Azure-based system**

Firstly, complete the consolidation quiz on Blackboard.

Now practice deploying and configuring monitoring with the exercises below:

- observe a backend service,
- observe a frontend app,
- add additional telemetry to a backend service.

After completing the exercises, apply what you have learnt to your assessment work.

You can attempt today's exercises using the example code or using your own deployed services if they are ready.

## Exercise 1: Observe a backend service
**Fork and clone**

```
https://github.com/tpdavison/cis3039-example-observability-svc
```

Follow the **Local Setup** and **Azure Setup** instructions in the README to deploy an instance to Azure and configure the monitoring using App Insights and Log Analytics.

**Use the Azure Portal to access your backend service Function App.**

Navigate to **Monitoring > Log Stream** to access the live logging stream.

**Perform a test POST to trigger telemetry.**

Use the README's curl example from **Upsert a Product** but substitute `http://localhost:7071` with your deployed endpoint: `https://<funcname>.azurewebsites.net`

**Use the Azure Portal to access your Log Analytics workspace.**

Open the **Logs** blade and experiment with some KQL, for example:

```kql
AppTraces
  | where TimeGenerated > ago(15m)
```

Remember it can take a few minutes for the telemetry to reach Log Analytics.

💡 If you use an AI companion to help generate KQL, be sure to tell it you are using **resource-specific tables** in Log Analytics.

## Exercise 2: Observe a frontend app
**Fork and clone**

```
https://github.com/tpdavison/cis3039-example-observability-app
```

Follow the **Local Setup** and **Azure Setup** instructions in the README to deploy an instance to Azure and configure the monitoring using App Insights and Log Analytics.

**Use the same Log Analytics workspace as in Exercise 1** — you want one workspace to tie everything in the environment together.

**Access your app in a browser** (locally via `npm run dev` or using the Azure URL of the deployed app).

**Open the JavaScript Console** (under Developer Tools, depending on your browser) and check for log outputs while the app is running.

**Use the Azure Portal to access your Log Analytics workspace.**

Open the **Logs** blade and experiment with some KQL to see telemetry from the SPA, for example:

```kql
AppEvents
  | where TimeGenerated > ago(15m)
```

💡 If you use an AI companion to help generate KQL, be sure to tell it you are using **resource-specific tables** in Log Analytics.

**Assuming your app is connected to your backend service** (`BASE_URL` env var set), try to trace a call from the app into the service.

**Find an operation id:**

```kql
AppRequests
  | where TimeGenerated > ago(10m)
  | project OperationId, Name, AppRoleName, TimeGenerated
```

**Query everything associated with it:**

```kql
let opId = "<paste an Operation_Id>";
union withsource=Table AppRequests, AppDependencies, AppTraces, AppExceptions
  | where OperationId == opId
  | project TimeGenerated, Type = Table, Name, AppRoleName, Message, ResultCode, DurationMs, Success
  | order by TimeGenerated asc
```

## Exercise 3: (optional) Add more telemetry to the backend service
Checkout the `feature/telemetry` branch in the backend service repo.

Following how the telemetry is done in the `upsert-product`, add some telemetry to `list-product`.

Rebuild and republish the app to test the observability.

## Exercise 4: Add observability to your assessment work
For your assessment project, you should now (in order):

1. Ensure you can access and observe the Log Stream for any backend services.
2. Add log statements to your code (info, warn, etc.) to help observe your system.
3. Add Application Insights telemetry to your frontend app.
4. Create a Log Analytics workspace for each environment you deploy and configure all resources to feed into it.
5. Develop KQL statements to generate useful traces to help you debug your system.

✅ **Goal:** Apply the same principles used in this lab to observe your own system's components.
