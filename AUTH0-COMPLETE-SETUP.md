# Complete Auth0 Setup for Automated Testing

## Quick Fix Steps

### 1. Fix Callback URL Error (REQUIRED - 2 minutes)

**Go to Auth0 Dashboard:**
1. Open https://manage.auth0.com/
2. Login → Select tenant: **campusdeviceloansystem**
3. Go to **Applications** → Click your application
4. Scroll to **Application URIs** section

**Add these URLs (comma-separated):**
- **Allowed Callback URLs:** `http://localhost:5176, http://localhost:5173`
- **Allowed Logout URLs:** `http://localhost:5176, http://localhost:5173`  
- **Allowed Web Origins:** `http://localhost:5176, http://localhost:5173`
- **Allowed Origins (CORS):** `http://localhost:5176, http://localhost:5173`

**Click "Save Changes"** at the bottom.

✅ This fixes the "Callback URL mismatch" error!

---

### 2. Enable Password Grant for Automated Tests (OPTIONAL - 1 minute)

This allows the test script to automatically get tokens without manual login.

**In the same application:**
1. Scroll down to **Advanced Settings** (at bottom)
2. Click **Grant Types** tab
3. Check the box: ☑ **Password**
4. Click **Save Changes**

**Create Test Users:**
1. Go to **User Management** → **Users**
2. Click **Create User**
3. Create:
   - Email: `student@test.com`
   - Password: `TestPassword123!`
   - Connection: Username-Password-Authentication
4. Repeat for `staff@test.com` and `admin@test.com`

✅ Now automated tests can get tokens!

---

## Test the Fixes

### Test 1: Manual Login (Tests callback URL fix)
```powershell
# Frontend should already be running on http://localhost:5176/
# If not, start it:
cd frontend-react
npm run dev
```

1. Open http://localhost:5176/
2. Click "Log In"
3. Should redirect to Auth0 (no error!)
4. Login with `student@test.com` / `TestPassword123!`
5. Should redirect back successfully
6. User email appears in UI

**If this works:** ✅ Callback URL is fixed!

### Test 2: Automated Tests (Tests all 7 tests)
```powershell
# Make sure all services are running:
# - Device Catalogue on 7071
# - Loan Service on 7072
# - Email Service on 7073
# - Frontend on 5176

# Run complete test suite
.\test-all-services.ps1
```

**Expected Results:**
- If Password grant enabled: **7/7 tests PASS** ✅
- If Password grant NOT enabled: **3/7 tests PASS**, 4 skipped (still need manual testing)

---

## Test Coverage

| Test # | Endpoint | Auth Required | What It Tests |
|--------|----------|---------------|---------------|
| 1 | GET /devices | No | Device catalogue list |
| 2 | GET /devices/1 | No | Get specific device |
| 3 | GET /loans | No | Loan service running |
| 4 | POST /loans/reserve | **YES** | Auth0 JWT validation |
| 5 | POST /loans/{id}/collect | **YES** | Loan workflow |
| 6 | POST /loans/{id}/return | **YES** | Complete loan cycle |
| 7 | POST /handle-event | No | Email service integration |

---

## Troubleshooting

### "Callback URL mismatch" still appears
- Double-check you saved Auth0 settings
- Clear browser cache and cookies
- Try incognito/private window
- Verify exact URL: `http://localhost:5176` (no trailing slash in Auth0)

### Automated tests still skip 4-6
- Verify Password grant is checked and saved
- Confirm test users created with correct passwords
- Check Auth0 → Monitoring → Logs for authentication errors

### Email service test fails
- Check if email service is running: `curl http://localhost:7073/api/health`
- Verify port 7073 not in use by another process
- Check terminal output for email service errors

---

## Next Steps After All Tests Pass

Once you have **7/7 tests passing**, your local system is fully functional:

1. ✅ All services working
2. ✅ Auth0 authentication validated
3. ✅ Full loan workflow tested
4. ✅ Email notifications working

**Next Priority:** CI/CD Pipeline (25% of grade)
- Setup GitHub repository
- Create build workflows
- Deploy to Azure automatically
- See timeline in LOCAL-TEST-RESULTS.md

---

**Time Estimate:**
- Fix callback URL: 2 minutes
- Enable Password grant: 1 minute  
- Create test users: 3 minutes
- Run tests: 1 minute
- **Total: ~7 minutes to full testing!**
