# Deployment Guide (Vercel + Railway/Render)

Quick deployment guide for production.

## Railway (Backend)

1. **Create Railway account** → New Project → Deploy from GitHub
2. **Add PostgreSQL** → New → Database → PostgreSQL
3. **Link PostgreSQL to Web Service**:
   - Railway automatically provides `DATABASE_URL` when PostgreSQL is linked
   - Go to your Web Service → Variables → `DATABASE_URL` should be auto-populated
   - If not, copy it from PostgreSQL service → Variables → `DATABASE_URL`
4. **Add Environment Variables**:

```env
NODE_ENV=production
PORT=10000
# CORS Configuration (use one of these):
# Option 1: Single origin (backward compatible)
FRONTEND_URL=https://your-frontend.vercel.app
# Option 2: Multiple origins (comma-separated, recommended)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app
# ⚠️ DATABASE_URL is automatically provided by Railway when PostgreSQL is linked
# Format: postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
# Direct connections work best with Prisma + pg.Pool (we handle pooling internally)
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
SESSION_SECRET=your-generated-secret-here
SESSION_SAMESITE=none
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
GEMINI_API_KEY=your-gemini-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=RentEase <your-email@gmail.com>
PAYMONGO_SECRET_KEY=sk_live_your-paymongo-secret-key
USE_LOCAL_STORAGE=false
```

5. **Run migrations**: Railway → Deployments → Run Command → `npx prisma migrate deploy`
6. **Get backend URL** from Railway dashboard

### ⚠️ Railway Database Connection Troubleshooting

If you get **"Tenant or user not found"** error:

1. **Verify DATABASE_URL**:
   - Railway automatically provides `DATABASE_URL` when PostgreSQL service is linked
   - Go to your Web Service → Variables → Check `DATABASE_URL` exists
   - If missing, go to PostgreSQL service → Variables → Copy `DATABASE_URL`
   - Ensure PostgreSQL service is linked to your web service

2. **Check Service Linking**:
   - Go to your Web Service → Settings → Service Dependencies
   - Ensure PostgreSQL service is listed and linked

3. **Verify Connection String Format**:
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```
   - Railway uses direct connections (no pooler needed)
   - The app uses `pg.Pool` for connection pooling internally

4. **Run Migrations**:
   - Make sure migrations are run: `npx prisma migrate deploy`
   - Check Railway logs for migration errors

## Vercel (Frontend)

1. **Create Vercel account** → Add New → Project → Import GitHub repo
2. **Configure**:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Add Environment Variables**:

```env
VITE_BACKEND_URL=https://your-backend.railway.app/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_USE_LOCAL_STORAGE=false
```

4. **Deploy** → Get frontend URL
5. **Update Railway** `FRONTEND_URL` with your Vercel URL

Done! 🚀

## Render (Backend)

1. **Create Render account** → New → Web Service → Connect GitHub repo
2. **Add PostgreSQL** → New → PostgreSQL
3. **Configure Web Service**:
   - **Build Command**: `cd backend && npm install && npx prisma generate`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: `backend` (if deploying from monorepo)
4. **Add Environment Variables**:

```env
NODE_ENV=production
PORT=10000
# CORS Configuration (use one of these):
# Option 1: Single origin (backward compatible)
FRONTEND_URL=https://your-frontend.vercel.app
# Option 2: Multiple origins (comma-separated, recommended)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://www.your-frontend.vercel.app
# ⚠️ IMPORTANT: Use the INTERNAL Database URL (direct connection, not pooler)
# Go to your PostgreSQL service → Connect → Copy "Internal Database URL"
# Direct connections work better with Prisma + pg.Pool (we handle pooling internally)
# Format: postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname
DATABASE_URL=postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname
SESSION_SECRET=your-generated-secret-here
SESSION_SAMESITE=none
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
GEMINI_API_KEY=your-gemini-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=RentEase <your-email@gmail.com>
PAYMONGO_SECRET_KEY=sk_live_your-paymongo-secret-key
USE_LOCAL_STORAGE=false
```

5. **Run migrations**: 
   - Go to your Render Web Service → Shell
   - Run: `cd backend && npx prisma migrate deploy`
   - Or add as a build step: `cd backend && npm install && npx prisma generate && npx prisma migrate deploy`

6. **Get backend URL** from Render dashboard

### ⚠️ Render Database Connection Troubleshooting

If you get **"Tenant or user not found"** error:

1. **Verify DATABASE_URL**:
   - Go to your PostgreSQL service on Render
   - Click "Connect" → Copy the **"Internal Database URL"** (not External, not Pooler)
   - **Use direct connection URL** - The app uses `pg.Pool` for connection pooling internally
   - Direct connection format: `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com:5432/dbname`
   - Pooler URLs (with `-pooler` in hostname) are optional but not required

2. **Check Database Status**:
   - Ensure PostgreSQL service is running (green status)
   - Wait a few minutes after creating the database

3. **Verify Connection String Format**:
   ```
   postgresql://username:password@host:port/database
   ```
   - If password contains special characters, they must be URL-encoded
   - Example: `@` becomes `%40`, `#` becomes `%23`

4. **Run Migrations**:
   - Make sure migrations are run: `npx prisma migrate deploy`
   - Check that tables exist in the database

5. **Check Logs**:
   - View Render service logs for detailed error messages
   - Look for connection errors or authentication failures

