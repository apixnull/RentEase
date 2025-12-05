# Local Development Setup (No Phone Access)

Quick setup guide for running RentEase locally on your computer only.

## Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 2: Set Up Database

```bash
# Create database (PostgreSQL)
createdb rentease

# Or using SQL
psql -U postgres
CREATE DATABASE rentease;

# Run migrations
cd backend
npx prisma migrate dev
npx prisma generate
```

## Step 3: Create Environment Files

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/rentease
SESSION_SECRET=your-generated-secret-here
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
PAYMONGO_SECRET_KEY=sk_test_your-paymongo-secret-key
```

**Frontend** (`frontend/.env`):
```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 4: Start Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

## Step 5: Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

Done! 🎉

