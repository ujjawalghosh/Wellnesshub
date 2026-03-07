# Login 400 Error Fix - TODO

## Task: Fix login 400 Bad Request error

### Steps:
- [x] 1. Analyze codebase to identify root cause
- [x] 2. Fix backend/routes/auth.js - Update nested field paths
- [ ] 3. Check frontend/src/utils/api.js - Verify production API URL (optional)
- [ ] 4. Redeploy backend to Render
- [ ] 5. Test login functionality

## Root Cause:
In `backend/routes/auth.js`, the code accessed `user.goals` and `user.fitnessLevel` directly, but these fields are nested inside `wellnessProfile` in the User model.

## Fixes Applied:
Changed all occurrences of:
- `user.goals` → `user.wellnessProfile?.goals || []`
- `user.fitnessLevel` → `user.wellnessProfile?.fitnessLevel || 'beginner'`
- `req.user.preferences` → `req.user.wellnessProfile?.preferences || {}`

Fixed in these routes:
- POST /register
- POST /login  
- GET /me
- POST /verify-otp
- POST /verify-email
- POST /login-with-2fa

## Next Steps:
1. Deploy backend to Render: `git add . && git commit -m "Fix login 400 error" && git push`
2. Wait for deployment to complete
3. Test login on the website

