# Auth0 Setup Guide - Task 30

**⚠️ USER ACTION REQUIRED**

Auth0 setup requires manual account creation and configuration. Follow these steps:

## Step 1: Create Auth0 Account

1. Go to https://auth0.com/
2. Click "Sign Up"
3. Create a free account
4. Choose region (EU recommended for Sweden)

## Step 2: Create Application

1. In Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **Create Application**
3. Name: "Campus Device Loan System"
4. Type: **Single Page Application**
5. Click **Create**

### Configure Application Settings:

- **Allowed Callback URLs**: 
  - `http://localhost:5173/callback`
  - `https://campusfrontend01.z1.web.core.windows.net/callback`

- **Allowed Logout URLs**:
  - `http://localhost:5173`
  - `https://campusfrontend01.z1.web.core.windows.net`

- **Allowed Web Origins**:
  - `http://localhost:5173`
  - `https://campusfrontend01.z1.web.core.windows.net`

- Save these values from the Settings tab:
  - **Domain** (e.g., `dev-xxxxx.us.auth0.com`)
  - **Client ID**

## Step 3: Create API

1. Go to **Applications** → **APIs**
2. Click **Create API**
3. Name: "Campus Device Loan API"
4. Identifier (Audience): `https://campus-device-loan-api`
5. Signing Algorithm: **RS256**
6. Click **Create**

## Step 4: Create Roles

1. Go to **User Management** → **Roles**
2. Create role: **student**
   - Description: "Can browse and reserve devices"
3. Create role: **staff**
   - Description: "Can collect and return devices"

## Step 5: Create Test Users

1. Go to **User Management** → **Users**
2. Create user 1:
   - Email: `student@test.com`
   - Password: (create secure password)
   - Assign role: **student**
3. Create user 2:
   - Email: `staff@test.com`
   - Password: (create secure password)
   - Assign role: **staff**

## Step 6: Enable RBAC

1. Go to your API settings
2. Enable **RBAC**
3. Enable **Add Permissions in the Access Token**
4. Save

## Step 7: Update Frontend Configuration

Create file: `frontend-react/.env.local`

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://campus-device-loan-api
```

Create file: `frontend-react/.env.production`

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://campus-device-loan-api
```

## Next Steps After Auth0 Setup:

Once you have Auth0 configured, you can implement:

1. **Task 41**: Install `@auth0/auth0-spa-js` in frontend
2. **Task 42**: Add JWT validation middleware to services
3. **Task 43**: Already configured (Function Keys)
4. **Task 44**: Test security end-to-end

## Quick Test (After Setup):

```bash
# Frontend
cd frontend-react
npm install @auth0/auth0-spa-js
npm run dev
```

Visit http://localhost:5173 and test login functionality.

---

**Note**: Auth0 setup is optional but recommended for production. Your system works without it using the current configuration.
