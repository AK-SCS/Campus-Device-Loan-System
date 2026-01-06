# Auth0 Staff Role Setup Guide

## Overview
The Staff Management page now requires staff authorization through Auth0. This guide explains how to configure roles and assign them to users.

---

## Step 1: Create Roles in Auth0

1. Go to https://manage.auth0.com
2. Navigate to **User Management** → **Roles**
3. Click **Create Role**

### Create Staff Role
- **Name**: `staff`
- **Description**: `Campus staff members who can manage device collections and returns`
- Click **Create**

### Create Admin Role (Optional)
- **Name**: `admin`
- **Description**: `System administrators with full access`
- Click **Create**

---

## Step 2: Add Permissions to Roles

### For Staff Role:
1. Click on the `staff` role
2. Go to **Permissions** tab
3. Add these permissions from your API:
   - `read:loans`
   - `write:loans`
   - `collect:devices`
   - `return:devices`

### For Admin Role:
1. Click on the `admin` role
2. Add all permissions including:
   - `read:loans`
   - `write:loans`
   - `collect:devices`
   - `return:devices`
   - `manage:all`

---

## Step 3: Assign Roles to Users

1. Go to **User Management** → **Users**
2. Click on a user (e.g., `staff@test.com`)
3. Go to **Roles** tab
4. Click **Assign Roles**
5. Select `staff` role
6. Click **Assign**

**Recommended User Setup:**
- `student@test.com` → No role (default student access)
- `staff@test.com` → `staff` role
- `admin@test.com` → `admin` role

---

## Step 4: Add Role Claims to Tokens

1. Go to **Auth Pipeline** → **Rules**
2. Click **Create Rule**
3. Select **Empty Rule**
4. Name: `Add Roles to Token`
5. Add this script:

```javascript
function addRolesToToken(user, context, callback) {
  const namespace = 'https://campus-device-loan.com';
  const assignedRoles = (context.authorization || {}).roles || [];

  const idTokenClaims = context.idToken || {};
  const accessTokenClaims = context.accessToken || {};

  idTokenClaims[`${namespace}/roles`] = assignedRoles;
  accessTokenClaims[`${namespace}/roles`] = assignedRoles;

  context.idToken = idTokenClaims;
  context.accessToken = accessTokenClaims;

  callback(null, user, context);
}
```

6. Click **Save Changes**

---

## Step 5: Test the Setup

### Test Staff Access:
1. Logout from the application
2. Login with `staff@test.com`
3. You should see the **👨‍💼 Staff Management** tab
4. Click it to access the staff dashboard

### Test Student Access:
1. Logout from the application
2. Login with `student@test.com`
3. The **Staff Management** tab should be hidden
4. If you try to access it directly, you'll see "Access Denied"

---

## Frontend Implementation

The frontend now includes:

### 1. **Role Checking in Auth0Provider**
```typescript
hasRole: (role: string) => boolean;
userRoles: string[];
```

### 2. **Protected Staff Page**
- Redirects to login if not authenticated
- Shows "Access Denied" if user doesn't have staff/admin role
- Only renders content for authorized users

### 3. **Conditional Navigation**
- Staff Management tab only visible to users with `staff` or `admin` role
- Tab is completely hidden for non-staff users

---

## Security Features

✅ **Client-Side Protection**:
- Tab hidden for non-staff users
- Access denied message for unauthorized access attempts
- Automatic redirect to login for unauthenticated users

⚠️ **Backend Protection (Required)**:
You should also add JWT validation on the backend:
- Verify JWT tokens in `/api/loans/{id}/collect` endpoint
- Verify JWT tokens in `/api/loans/{id}/return` endpoint
- Check for `staff` or `admin` role in token claims
- Return 403 for unauthorized requests

---

## Troubleshooting

### Staff tab not appearing:
1. Check Auth0 dashboard → User has `staff` role assigned
2. Check Auth0 Rules → "Add Roles to Token" rule is enabled
3. Clear browser cache and re-login
4. Check browser console for role claims in token

### "Access Denied" message:
1. Verify user has `staff` or `admin` role in Auth0
2. Check the namespace in the rule matches: `https://campus-device-loan.com/roles`
3. Logout and login again to refresh token

### Roles not in token:
1. Go to Auth0 → Auth Pipeline → Rules
2. Ensure "Add Roles to Token" rule exists and is enabled
3. Test with Auth0 debugger extension

---

## Next Steps

1. ✅ Assign roles to test users
2. ✅ Enable the "Add Roles to Token" rule
3. ✅ Test with different user roles
4. ⚠️ Add backend JWT verification (recommended)
5. ⚠️ Deploy updated frontend to Azure

---

## Token Claim Format

When properly configured, the ID token will contain:
```json
{
  "https://campus-device-loan.com/roles": ["staff"],
  "sub": "auth0|123456",
  "email": "staff@test.com",
  ...
}
```

The frontend extracts this using:
```typescript
const roles = userData?.['https://campus-device-loan.com/roles'] || [];
```
