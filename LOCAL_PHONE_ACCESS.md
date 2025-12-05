# Local Setup with Phone Access

Quick setup guide for running RentEase locally and accessing it from your phone on the same Wi-Fi network.

## Step 1: Find Your Local IP Address

**Windows**:
```powershell
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.100)
```

**Mac/Linux**:
```bash
ifconfig
# or
ip addr
# Look for inet address (e.g., 192.168.1.100)
```

## Step 2: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 3: Set Up Database

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

## Step 4: Create Environment Files

**Replace `192.168.1.100` with your actual local IP address!**

**Backend** (`backend/.env`):
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://192.168.1.100:5173
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
VITE_BACKEND_URL=http://192.168.1.100:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 5: Configure Firewall

**Windows**:
1. Windows Defender Firewall → Allow an app
2. Allow Node.js for Private networks
3. Or allow ports 5000 and 5173

**Mac**:
1. System Preferences → Security & Privacy → Firewall
2. Firewall Options → Allow Node.js

**Linux**:
```bash
sudo ufw allow 5000
sudo ufw allow 5173
```

## Step 6: Start Servers

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

## Step 7: Access from Phone

1. **Connect phone to same Wi-Fi network**
2. **Open browser on phone**
3. **Navigate to**: `http://192.168.1.100:5173` (use your actual IP)

## Troubleshooting

- **Can't connect**: Check firewall, ensure ports 5000 and 5173 are open
- **IP changed**: If you reconnect to Wi-Fi, your IP may change - update `.env` files
- **CORS errors**: Backend automatically allows all origins in development mode

Done! 🎉

