# Authentication Fix Plan - WellnessHub ✅ COMPLETED

## Fixes Applied:

### 1. ✅ Fixed frontend/src/utils/api.js
- Added environment detection using `window.location.hostname`
- **Localhost**: Uses `http://localhost:5000`
- **Vercel Production**: Uses relative API path (same domain)

### 2. ✅ Created backend/vercel.json
- Configures Vercel to route API requests to Express server

### 3. ✅ Updated root vercel.json
- Routes `/api/*` to backend/server.js

---

## Required Setup for Authentication to Work:

### For Localhost (Development):
1. **Start MongoDB** locally on port 27017
2. **Start Backend**: `cd backend && npm run dev` (runs on port 5000)
3. **Start Frontend**: `cd frontend && npm run dev` (runs on port 5173)
4. **Test**: Open http://localhost:5173 and try login/register

### For Vercel (Production):
1. **Set Environment Variables** in Vercel:
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Your secret key for JWT tokens
   
2. **Deploy** both frontend and backend to Vercel

### Create MongoDB Atlas Database:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account and cluster
3. Get connection string (format: mongodb+srv://...)
4. Add to Vercel environment variables as `MONGODB_URI`
