# Deployment Guide (Vercel + Railway)

Quick deployment guide for production.

## Railway (Backend)

1. **Create Railway account** → New Project → Deploy from GitHub
2. **Add PostgreSQL** → New → Database → PostgreSQL
3. **Add Environment Variables**:

```env
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend.vercel.app
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

4. **Run migrations**: Railway → Deployments → Run Command → `npx prisma migrate deploy`
5. **Get backend URL** from Railway dashboard

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

