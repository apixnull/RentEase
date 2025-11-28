# Deployment Configuration Summary

## Current Deployment URLs

- **Frontend**: https://rent-ease-management.vercel.app/
- **Backend**: https://rentease-production-1e1b.up.railway.app

## Environment-Based Configuration

Both frontend and backend now automatically detect the environment and use the appropriate URLs:

### Frontend Configuration

**File**: `frontend/src/api/axios.ts` and `frontend/src/hooks/useSocket.ts`

- **Development Mode** (`npm run dev`):
  - API: `http://localhost:5000/api`
  - Socket.io: Uses Vite proxy (`/`)

- **Production Mode** (`npm run build`):
  - API: `https://rentease-production-1e1b.up.railway.app/api`
  - Socket.io: `https://rentease-production-1e1b.up.railway.app`

- **Override**: Set `VITE_BACKEND_URL` to override automatic detection

### Backend Configuration

**Files**: `backend/src/app.js` and `backend/src/server.js`

- **Development Mode** (`NODE_ENV=development`):
  - CORS Origin: `http://localhost:5173`
  - Socket.io Origin: `http://localhost:5173`

- **Production Mode** (`NODE_ENV=production`):
  - CORS Origin: `https://rent-ease-management.vercel.app`
  - Socket.io Origin: `https://rent-ease-management.vercel.app`

- **Override**: Set `FRONTEND_URL` to override automatic detection

## Vercel Environment Variables

Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

```
VITE_BACKEND_URL=https://rentease-production-1e1b.up.railway.app/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Railway Environment Variables

Go to: Railway Dashboard → Your Service → Variables

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<Railway PostgreSQL Connection String>
FRONTEND_URL=https://rent-ease-management.vercel.app
SESSION_SECRET=<strong-random-string>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
GEMINI_API_KEY=your-gemini-api-key
RESEND_API_KEY=your-resend-api-key
```

### Railway Deployment Fix for `npm ci` Error

If you're getting `npm ci` errors during Railway deployment:

1. **Regenerate package-lock.json**:
   ```bash
   cd backend
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Update package-lock.json"
   git push
   ```

2. **Or use npm install instead** (if package-lock.json is problematic):
   - In Railway dashboard, go to your service → Settings → Build
   - Change build command from `npm ci` to `npm install`

3. **Ensure Node version matches**:
   - Railway should auto-detect Node version from `package.json` or `.nvmrc`
   - You can also set it in Railway environment variables: `NODE_VERSION=22.21.1`

## Testing the Configuration

### Test Frontend → Backend API

1. Open browser console on your frontend
2. Make an API call (e.g., login)
3. Check Network tab - should call `https://rentease-production-1e1b.up.railway.app/api/...`

### Test Socket.io Connection

1. Open browser console on your frontend
2. Look for: `✅ Socket.IO connected: <socket-id>`
3. If error, check CORS settings in backend

### Test Backend CORS

1. Visit: `https://rentease-production-1e1b.up.railway.app/`
2. Should see: `{"message":"✅ Welcome to the API root route"}`
3. Check browser console for CORS errors when making API calls

## Troubleshooting

### CORS Errors

- **Symptom**: `Access-Control-Allow-Origin` errors in browser console
- **Fix**: 
  1. Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
  2. Ensure no trailing slashes
  3. Redeploy backend after changing environment variables

### Socket.io Connection Failed

- **Symptom**: Socket.io fails to connect
- **Fix**:
  1. Check `FRONTEND_URL` in backend matches frontend URL
  2. Verify Socket.io CORS settings in `backend/src/server.js`
  3. Check Railway logs for connection errors

### API Calls Failing

- **Symptom**: 404 or connection errors
- **Fix**:
  1. Verify `VITE_BACKEND_URL` in Vercel includes `/api` at the end
  2. Check backend is running: `https://rentease-production-1e1b.up.railway.app/`
  3. Verify API routes are correct

## Next Steps

1. ✅ Set environment variables in Vercel
2. ✅ Set environment variables in Railway
3. ✅ Redeploy both frontend and backend
4. ✅ Test API connections
5. ✅ Test Socket.io connections
6. ✅ Verify CORS is working

