# Auth0 Role-Based Access Control - Complete Setup Guide

## Current Status
✅ Frontend code is ready with role-based access control
✅ Auth0Provider extracts roles from token claims
✅ Staff Management tab only visible to staff/admin roles
✅ Staff Management page enforces authentication and authorization

## What You Need to Do in Auth0

### Step 1: Add Callback URLs (If Not Already Done)

1. Go to https://manage.auth0.com
2. Navigate to **Applications** → **Applications**
3. Click your application
4. Under **Application URIs**, add:

**Allowed Callback URLs:**
```
http://localhost:5173,
https://your-production-domain.com
```

**Allowed Logout URLs:**
```
http://localhost:5173,
https://your-production-domain.com
```

**Allowed Web Origins:**
```
http://localhost:5173,
https://your-production-domain.com
```

5. Click **Save Changes**

---

### Step 2: Enable RBAC (Role-Based Access Control)

1. In your Auth0 application settings
2. Scroll to **APIs** section
3. Click your API (or create one if you don't have it)
4. Go to **Settings**
5. Enable these options:
   - ✅ **Enable RBAC**
   - ✅ **Add Permissions in the Access Token**
6. Click **Save**

---

### Step 3: Create Roles

1. Go to **User Management** → **Roles**
2. Click **+ Create Role**

#### Create "staff" Role:
- **Name**: `staff`
- **Description**: `Campus staff who can manage device loans`
- Click **Create**

#### Create "admin" Role:
- **Name**: `admin`
- **Description**: `System administrators with full access`
- Click **Create**

---

### Step 4: Create an Action to Add Roles to Token

This is the **MOST IMPORTANT** step - it adds roles to the ID token.

1. Go to **Actions** → **Library**
2. Click **+ Build Custom**
3. Name it: `Add Roles to Token`
4. Select **Login / Post Login** flow
5. Paste this code:

```javascript
/**
* Handler that will be called during the execution of a PostLogin flow.
*
* @param {Event} event - Details about the user and the context in which they are logging in.
* @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
*/
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://campus-device-loan.com';
  
  if (event.authorization) {
    const roles = event.authorization.roles || [];
    
    // Add roles to ID token
    api.idToken.setCustomClaim(`${namespace}/roles`, roles);
    
    // Add roles to Access token
    api.accessToken.setCustomClaim(`${namespace}/roles`, roles);
  }
};
```

6. Click **Deploy**

---

### Step 5: Add the Action to Your Login Flow

1. Go to **Actions** → **Flows**
2. Click **Login**
3. Find your **Add Roles to Token** action in the right sidebar
4. **Drag and drop** it between **Start** and **Complete**
5. Click **Apply**

---

### Step 6: Assign Roles to Users

Now assign roles to your test users:

1. Go to **User Management** → **Users**
2. Click on a user (e.g., your staff email)
3. Go to **Roles** tab
4. Click **Assign Roles**
5. Select `staff` (or `admin`)
6. Click **Assign**

**Recommended Setup:**
- Your main account → `admin` role
- Test staff account → `staff` role
- Test student account → No role (or create a `student` role)

---

### Step 7: Test the Configuration

#### Test Token Contains Roles:

1. Login to your application
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Run this code:

```javascript
// Get the user from Auth0
const user = await window.auth0Client.getUser();
console.log('User roles:', user['https://campus-device-loan.com/roles']);
```

You should see your roles: `['staff']` or `['admin']`

#### Test Tab Visibility:

1. **As Staff/Admin User:**
   - Login with your staff account
   - You should see **👨‍💼 Staff Management** tab
   - Click it to access the dashboard

2. **As Regular User (No Role):**
   - Login with a regular account
   - The Staff Management tab should be **hidden**
   - If you try to navigate directly, you'll see "Access Denied"

---

## Quick Verification Checklist

✅ Callback URLs added to Auth0 application
✅ RBAC enabled in Auth0 API settings
✅ `staff` and `admin` roles created
✅ Action "Add Roles to Token" created and deployed
✅ Action added to Login flow
✅ Roles assigned to test users
✅ Tested with staff user - tab appears
✅ Tested with regular user - tab hidden

---

## Troubleshooting

### Issue: Roles not appearing in token
**Solution:** 
- Verify the Action is deployed and in the Login flow
- Logout completely and login again
- Check the Action logs in Auth0 dashboard

### Issue: Tab still not showing for staff user
**Solution:**
1. Check browser console for errors
2. Verify user has the role assigned in Auth0
3. Clear browser cache and cookies
4. Logout and login again

### Issue: "Access Denied" even with staff role
**Solution:**
- Verify the namespace in Action matches: `https://campus-device-loan.com`
- Check browser console: `user['https://campus-device-loan.com/roles']`
- Ensure Action is in the Login flow (not just created)

---

## Frontend Implementation Details

The frontend is already configured to:

### Auth0Provider.tsx
- Extracts roles from: `userData?.['https://campus-device-loan.com/roles']`
- Provides `hasRole(role: string)` function
- Provides `userRoles` array

### App.tsx
- Shows Staff tab only if: `hasRole('staff') || hasRole('admin')`
- Tab conditionally rendered based on user roles

### StaffManagement.tsx
- Redirects to login if not authenticated
- Shows "Access Denied" if authenticated but no staff role
- Only loads loan data for authorized staff

---

## Role Hierarchy (Future Enhancement)

You can expand this system with more roles:

```
admin (full access)
  ├── Can access Staff Management
  ├── Can manage all loans
  └── Can manage users

staff (loan management)
  ├── Can access Staff Management
  ├── Can mark as collected
  └── Can mark as returned

student (default)
  ├── Can view catalogue
  ├── Can reserve devices
  └── Cannot access Staff Management
```

---

## Production Deployment

When deploying to production:

1. Update callback URLs in Auth0 with production domain
2. Update namespace if needed (keep consistent)
3. Ensure Action is in production tenant
4. Test roles work in production environment
5. Document role assignment process for administrators

---

## Security Notes

✅ **Multi-Layer Security:**
- Frontend: Tab visibility (UX layer)
- Frontend: Page access control (component layer)
- Frontend: Data loading gated by role
- Backend: Should also validate JWT and check roles (recommended)

⚠️ **Backend Security (Recommended Next Step):**
Add JWT validation to your backend endpoints:
- Verify JWT signature
- Check roles in token claims
- Return 403 for unauthorized access

This ensures security even if someone bypasses the frontend.

---

## Support

If you encounter issues:
1. Check Auth0 dashboard logs
2. Check browser console for errors
3. Verify Action execution in Auth0 monitoring
4. Test with Auth0 debugger extension

---

## Summary

Your application now has **proper role-based access control**:
- ✅ Staff and Admin can access Staff Management
- ✅ Regular users cannot see or access the page
- ✅ Roles are securely managed through Auth0
- ✅ Frontend enforces access at multiple layers

Follow the steps above to complete the Auth0 configuration!
