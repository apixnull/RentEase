# Backend Environment Variables Setup

## Automatic Environment Detection

The backend automatically detects the environment and uses the appropriate URLs:

- **Development** (`NODE_ENV=development`): Uses `http://localhost:5173` for CORS
- **Production** (`NODE_ENV=production`): Uses `https://rent-ease-management.vercel.app` for CORS

## Environment Variables for Render

Set these in your Render service dashboard (Environment tab):

### Required Variables

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<Internal Database URL from Render>
FRONTEND_URL=https://rent-ease-management.vercel.app
SESSION_SECRET=<generate-strong-random-string>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
GEMINI_API_KEY=your-gemini-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=RentEase <your-email@gmail.com>
```

### Optional Override

If you set `FRONTEND_URL`, it will override the automatic environment detection.

## Local Development

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://user:password@localhost:5432/rentease
SESSION_SECRET=your-local-session-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
UPSTASH_REDIS_REST_URL=your-upstash-redis-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-redis-token
GEMINI_API_KEY=your-gemini-api-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=RentEase <your-email@gmail.com>
```

**Note**: The `.env` file is already in `.gitignore` and should never be committed.

## Generating Secrets

To generate strong secrets for Session:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

