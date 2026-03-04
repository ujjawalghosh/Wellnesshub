# TODO - Fix Vercel Deployment

## ✅ Completed Fixes:

1. **Updated root vercel.json** - Configured for monorepo with:
   - Frontend build (Vite)
   - Backend serverless function
   - Proper routes for API and frontend

2. **Updated backend/vercel.json** - Fixed routes configuration

3. **Updated frontend/package.json** - Added vercel-build script

4. **Updated backend/package.json** - Added vercel-build script

5. **Updated frontend/src/utils/api.js** - Added comment clarifying production behavior

## 🚀 Deployment Steps:

1. **Push changes to GitHub**
2. **Deploy to Vercel** - Connect your GitHub repo
3. **Set Environment Variables in Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add: `MONGODB_URI` = your MongoDB Atlas connection string
   - Add: `JWT_SECRET` = a secure random string
   - Add (optional): `OPENAI_API_KEY` = your OpenAI key

4. **Deploy** - Vercel will automatically build both frontend and backend

## Important Notes:
- Make sure MongoDB Atlas allows connections from Vercel (add 0.0.0.0/0 in Network Access)
- The frontend and backend will be served from the same domain
- API calls from frontend will work automatically via Vercel routing

