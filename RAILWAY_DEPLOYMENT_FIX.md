# Railway Deployment Fix Guide

## Issue: `npm ci` Failing During Railway Build

If you're seeing this error:
```
ERROR: failed to build: failed to solve: process "npm ci" did not complete successfully: exit code: 1
```

## Solutions

### Solution 1: Regenerate package-lock.json (Recommended)

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Delete old package-lock.json**:
   ```bash
   rm package-lock.json
   ```

3. **Reinstall dependencies**:
   ```bash
   npm install
   ```

4. **Commit and push**:
   ```bash
   git add package-lock.json
   git commit -m "Regenerate package-lock.json for Railway deployment"
   git push
   ```

5. **Redeploy on Railway** - Railway will automatically trigger a new build

### Solution 2: Use npm install instead of npm ci

1. **In Railway Dashboard**:
   - Go to your service → **Settings** → **Build**
   - Change **Build Command** from `npm ci` to `npm install`
   - Save and redeploy

### Solution 3: Set Root Directory in Railway

1. **In Railway Dashboard**:
   - Go to your service → **Settings** → **Source**
   - Set **Root Directory** to `backend`
   - Save and redeploy

### Solution 4: Add Node Version Specification

Create a `.nvmrc` file in the `backend` directory:

```bash
cd backend
echo "22.21.1" > .nvmrc
git add .nvmrc
git commit -m "Add Node version specification"
git push
```

Or set it in Railway environment variables:
- Variable: `NODE_VERSION`
- Value: `22.21.1`

## Verify Your Setup

1. **Check package-lock.json exists**:
   ```bash
   ls -la backend/package-lock.json
   ```

2. **Test locally**:
   ```bash
   cd backend
   npm ci
   ```

3. **If npm ci works locally but fails on Railway**:
   - Check Railway logs for specific error messages
   - Ensure all dependencies in package.json are available on npm
   - Verify Node version matches between local and Railway

## Railway Configuration

The `backend/railway.json` file has been created to help Railway detect the correct build settings. Railway should automatically:
- Detect Node.js from package.json or .nvmrc
- Run `npm install` (or `npm ci` if package-lock.json is valid)
- Run `npm run postinstall` (which runs `prisma generate`)
- Start the server with `npm start`

## Environment Variables Checklist

Make sure these are set in Railway:

- `NODE_ENV=production`
- `PORT=5000` (or Railway's assigned port)
- `DATABASE_URL` (Railway PostgreSQL connection string)
- `FRONTEND_URL=https://rent-ease-management.vercel.app`
- `JWT_SECRET=<your-secret>`
- `SESSION_SECRET=<your-secret>`
- `SUPABASE_URL=<your-supabase-url>`
- `SUPABASE_SERVICE_ROLE_KEY=<your-key>`
- `UPSTASH_REDIS_REST_URL=<your-redis-url>`
- `UPSTASH_REDIS_REST_TOKEN=<your-redis-token>`
- `GEMINI_API_KEY=<your-key>` (if using)
- `RESEND_API_KEY=<your-key>` (if using)

## Still Having Issues?

1. Check Railway build logs for the exact error message
2. Try building locally: `cd backend && npm ci`
3. If local build works, the issue is likely Railway-specific configuration
4. Contact Railway support with the full error log

