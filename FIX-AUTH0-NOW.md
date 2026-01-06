# 🚨 FIX AUTH0 CALLBACK URL ERROR NOW

## The Error You're Seeing:
```
Callback URL mismatch.
The provided redirect_uri is not in the list of allowed callback URLs.
```

## Why This Happens:
Your frontend is running on `http://localhost:5176` but Auth0 doesn't have this URL in its allowed list.

---

## 🔧 EXACT FIX STEPS (2 minutes):

### 1. I opened the Auth0 dashboard for you
Look for the browser window that just opened with Auth0.

### 2. Login to Auth0
- Use your Auth0 account credentials

### 3. Find Your Application
- You should see a list of applications
- Click on the one with Client ID: **FSRthsPtMHoAcpONqYhBaEri5Gg0xi0M**
- OR if you gave it a name, click on that application

### 4. Scroll to "Application URIs" Section
- On the application settings page, scroll down
- Look for **Application URIs** section

### 5. Add These URLs to EACH Field:

**Copy and paste these exact URLs into each field below:**

#### Allowed Callback URLs:
```
http://localhost:5176,http://localhost:5173
```

#### Allowed Logout URLs:
```
http://localhost:5176,http://localhost:5173
```

#### Allowed Web Origins:
```
http://localhost:5176,http://localhost:5173
```

#### Allowed Origins (CORS):
```
http://localhost:5176,http://localhost:5173
```

**IMPORTANT:** 
- Separate with commas (no spaces)
- Include BOTH 5176 and 5173 ports
- Use `http://` not `https://`

### 6. Save Changes
- Scroll to the bottom of the page
- Click **"Save Changes"** button
- Wait for "Application updated" confirmation

---

## ✅ Test the Fix:

1. Go back to your browser
2. Open: http://localhost:5176/
3. Click **"Log In"** button
4. You should now see Auth0 login page (no error!)
5. Login with your credentials
6. Should redirect back to app successfully

---

## 📸 Visual Guide:

**Step 1:** Find "Application URIs" section
```
┌─────────────────────────────────────────┐
│  Application URIs                       │
├─────────────────────────────────────────┤
│  Allowed Callback URLs *                │
│  ┌─────────────────────────────────┐   │
│  │ PASTE HERE: http://localhost... │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Step 2:** Paste the URLs in ALL FOUR fields

**Step 3:** Click "Save Changes" at bottom

---

## If You're Still Stuck:

### Can't find the application?
- Look for applications list at: https://manage.auth0.com/dashboard/us/campusdeviceloansystem/applications
- Your app should be there

### Don't remember which app?
- Look for Client ID: `FSRthsPtMHoAcpONqYhBaEri5Gg0xi0M`
- Or check your `.env.local` file for VITE_AUTH0_CLIENT_ID

### Save button not working?
- Make sure you're logged in
- Try refreshing the page
- Check for validation errors on the page

---

## Quick Copy-Paste URLs:

For **all four fields**, paste this:
```
http://localhost:5176,http://localhost:5173
```

---

## After This Works:

Once login works, your Auth0 integration is functional! 

**Next steps:**
1. Test login at http://localhost:5176/
2. Try reserving a device
3. Decide: Continue with CI/CD (recommended) or finish Auth0 automated tests

---

**Need help?** Tell me what you see in the Auth0 dashboard and I'll guide you through it!
