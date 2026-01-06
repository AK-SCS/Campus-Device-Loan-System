# Week 7 Lab Worksheet — Securing Calls in a Web-based System

## The plan
Firstly, complete the consolidation quiz on Blackboard.

Now practice deploying and configuring security with the exercises below:

- call a function secured with a host key
- call that function from another backend
- sign into a frontend app that consumes the secured backend

After completing the exercises, apply what you have learnt to your assessment work.

## Exercise 1 — Call a backend service secured with a host key
**Goal:** Deploy an Azure Functions app that requires a function (host) key and prove you can call it successfully.

### Steps
**Clone the repo and open in a VSCode dev container**

```
https://github.com/tpdavison/devnull-svc
```

**Deploy to Azure**
Follow the repo's README to setup locally and deploy to Azure.

**Tip:** Keep track of:
- Function App name
- Resource Group
- Base URL: `https://<your-func-app>.azurewebsites.net`

**Confirm the endpoint & key requirement**
The file `src/functions/product-updated-http.ts` has `authLevel: 'function'` so the HTTP function requires a key.

**Get a function key**
Follow the repo's README for how to fetch the function's secret key.

**Verify with curl**
Follow the repo's README for how to use curl to call the deployed web service.

**Expected result**
- HTTP 2xx response.
- If you omit the key, you should get 401/403 — that's good (it proves the key is required).

### Troubleshooting
- **401/403 with key included** → confirm you used the Function key for the correct function app.
- **404** → confirm the function name and route in the README; check your deployed functions list.
- **500** → check Application Insights or the Function Log stream in the Azure Portal.

## Exercise 2 — Secure call from one backend service to another
**Goal:** Run a second backend that calls Exercise 1 using the same host key. Prove the call works locally and once deployed.

### Steps
**Fork, clone and open in a VSCode dev container**

```
https://github.com/tpdavison/cis3039-example-security-svc
```

**Configure local environment**
Follow the repo's README Local Setup and Product Updated Notifications sections. Be sure you follow the instructions to set the environment variables that tell this service how to reach Exercise 1:

```bash
PRODUCT_UPDATED_BASE_URL=https://<your-ex1-func-app>.azurewebsites.net
PRODUCT_UPDATED_KEY=<FUNCTION_KEY_FROM_EX1>
```

**Run locally & test with curl**
Start the service per README instructions. Then, use the "Local testing with curl" examples from the README to hit this service's endpoint to upsert a product.
Watch the console output — you should see a successful call.

**Verify in Exercise 1 logs**
In the Azure Portal for your Exercise 1 Function App:
- Open Functions → product-updated-http → Monitor or Log stream,
- Repeat the test curl command from the previous step.
- Confirm that a request arrives at the Exercise 1 Azure logs.

**Deploy Exercise 2 to Azure**
Follow the repo's README to deploy this second backend and configure its app settings to include:
- `PRODUCT_UPDATED_BASE_URL` pointing to your Exercise 1 app,
- `PRODUCT_UPDATED_KEY` matching the function key for Exercise 1's `product-updated-http`.

**Re-test against the cloud instance**
Use the README's curl again, but target the deployed URL of Exercise 2. You will need to change two things in curl to achieve this: modify the URL from `localhost:7071` to be `<your-ex2-func>.azurewebsites.net` and include a `x-functions-key` header with the Exercise 2's host key. The READMEs from both of the projects can help with doing this. Confirm you still see successful calls through to Exercise 1 in its logs.

### Troubleshooting
- **401/403 from downstream** → recheck `PRODUCT_UPDATED_KEY` value and that you're calling the correct path for Exercise 1.
- **CORS** shouldn't apply backend-to-backend, but if you proxy via a browser, you may see it — test with curl or server-side code.
- **Timeouts** → verify both apps are in a healthy state and that your `PRODUCT_UPDATED_BASE_URL` is correct.

## Exercise 3 — Sign into a Frontend App
**Goal:** Run a frontend (SPA) that signs in via Auth0 and calls your Exercise 2 backend. When not signed in prices should be blank; when signed in they should be visible.

### Steps
**Fork, clone and open in a VSCode dev container**

```
https://github.com/tpdavison/cis3039-example-security-app
```

**Follow the README setup (local + Auth0)**
In Auth0, you will typically:
1. Create a Single Page Application.
2. Create or use an API (audience) that represents your Exercise 2 backend.
3. Configure Allowed Callback/Logout/Redirect URLs for local dev.
4. Create a test user.

**Point the app to your Exercise 2 backend**
Set the environment variable(s) the README specifies (examples shown below; use exactly what the README calls them):

```bash
VITE_API_BASE_URL=https://<your-ex2-app>.azurewebsites.net
VITE_AUTH0_DOMAIN=<your-tenant>.region.auth0.com
VITE_AUTH0_CLIENT_ID=<spa-client-id>
VITE_AUTH0_AUDIENCE=<your-api-identifier>
```

**Note:** the audience is not the URL of your Exercise 2 web service (that is `VITE_API_BASE_URL`). Audience is the name given to the API within Auth0 (which usually looks like a URL).

**Run the app & sign in**
1. Start the dev server as per README (e.g., `npm run dev`).
2. Load the app in the browser.
3. Verify you can sign in with your test user.

**Verify behaviour (prices hidden vs visible)**
- **Logged out:** product list shows no prices (blank or placeholder).
- **Logged in:** product list shows prices.

### Troubleshooting
- **Cannot sign in** → check Auth0 Application type (SPA), domain, client id, and callback URLs.
- **401 from backend** → confirm your SPA sends the access token to Exercise 2 and that the audience matches the API identifier configured in Auth0 and in Exercise 2.
- **Prices still blank when logged in** → check the network tab to ensure the SPA calls the correct `VITE_API_BASE_URL`, and that Exercise 2 can reach Exercise 1 with the correct KEY.

## Apply security to your assessment work
For your assessment project, you should now:

- Secure your backend services using an appropriate mechanism (e.g. function keys).
- Protect service-to-service interactions so that only trusted components can call internal APIs.
- Integrate authentication into your frontend using Auth0 to control what users can see and access.
- Protect front-facing services (those your app uses) with OAuth2 access tokens checking for the appropriate permissions (scopes).

✅ **Goal:** apply the same principles used in this lab to design, implement, and secure communication across your own system's components.

## And there are some more to come
