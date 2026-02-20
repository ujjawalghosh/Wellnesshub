# TODO: Fix Frontend-Only Authentication Issue

## Task: Fix WellnessHub frontend-only repo authentication

### Issues Identified:
1. Frontend has no .env configuration for backend API URL
2. api.js uses hardcoded relative path without fallback
3. Users don't know backend needs to run separately

### Plan:
- [x] 1. Create frontend/.env.example with proper Vite environment variables
- [x] 2. Update frontend/src/utils/api.js to use VITE_API_URL environment variable
- [x] 3. Update frontend/vite.config.js to handle proxy configuration via env
- [x] 4. Verify the changes work correctly

### Dependencies:
- Backend must be running on port 5000
- MongoDB must be accessible
