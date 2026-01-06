# Fix Auth0 Callback URL Mismatch Error

## Error Message
```
Callback URL mismatch.
The provided redirect_uri is not in the list of allowed callback URLs.
```

## Solution Steps

### 1. Go to Auth0 Dashboard
1. Open https://manage.auth0.com/
2. Login with your Auth0 account
3. Select your tenant: **campusdeviceloansystem**

### 2. Configure Application Settings
1. Go to **Applications** → **Applications** (in left sidebar)
2. Click on your application (the one with Client ID: FSRthsPtMHoAcpONqYhBaEri5Gg0xi0M)
3. Scroll down to **Application URIs** section

### 3. Add Local Development URLs

Add these URLs to the respective fields:

**Allowed Callback URLs:**
```
http://localhost:5176, http://localhost:5173
```

**Allowed Logout URLs:**
```
http://localhost:5176, http://localhost:5173
```

**Allowed Web Origins:**
```
http://localhost:5176, http://localhost:5173
```

**Allowed Origins (CORS):**
```
http://localhost:5176, http://localhost:5173
```

### 4. Add Production URLs (When Deployed)

When you deploy to Azure, also add your Azure Static Web App URL:

**Example:**
```
https://your-app-name.azurestaticapps.net
```

Add this to ALL four fields above (Callback URLs, Logout URLs, Web Origins, CORS).

### 5. Save Changes
1. Scroll to the bottom
2. Click **Save Changes**
3. Wait for confirmation message

### 6. Test Again
1. Go back to http://localhost:5176/
2. Click "Log In"
3. Should now redirect to Auth0 successfully
4. Login with: **student@test.com**
5. Should redirect back to your app

## Why This Happens

Auth0 requires you to explicitly whitelist all URLs that can receive authentication callbacks. This is a security feature to prevent unauthorized domains from receiving tokens.

Your app uses `window.location.origin` as the redirect_uri, which resolves to `http://localhost:5176` since that's the port Vite chose (5173-5175 were in use).

## Verification

After saving, the login flow should work:
1. Click "Log In" → Redirects to Auth0
2. Enter credentials → Auth0 validates
3. Redirects back to `http://localhost:5176/` → Success!
4. User email appears in UI
5. Can now reserve devices

---

**Next:** After fixing this, your Auth0 integration will work completely!
