# Railway Environment Variables Setup Guide

## Quick Setup Instructions

1. Go to **Railway Dashboard** → Your Service → **Variables** tab
2. Click **"New Variable"** for each variable below
3. Copy and paste the values (replace placeholders with your actual values)
4. Click **"Deploy"** or **"Redeploy"** after setting all variables

---

## Required Environment Variables

### Core Configuration

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `5000` | Server port (Railway may override this) |
| `FRONTEND_URL` | `https://rent-ease-management.vercel.app` | Frontend URL for CORS (no trailing slash) |

### Database

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Railway PostgreSQL connection string (get from Railway Database service) |

### Security & Authentication

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `SESSION_SECRET` | `<generate-random-string>` | Secret for express-session (see generation below) |

### Supabase (File Storage)

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Supabase service role key (from Supabase dashboard) |

### Redis (Upstash)

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `UPSTASH_REDIS_REST_URL` | `https://...` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | `your-token` | Upstash Redis REST token |

### AI & Email Services

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `GEMINI_API_KEY` | `your-gemini-api-key` | Google Gemini API key (for AI features) |
| `RESEND_API_KEY` | `your-resend-api-key` | Resend API key (for email sending) |

### Payment (Optional - if using PayMongo)

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `PAYMONGO_SECRET_KEY` | `sk_...` | PayMongo secret key (if using payment features) |

---

## How to Generate Secrets

### Generate SESSION_SECRET

**On Linux/Mac:**
```bash
openssl rand -base64 32
```

**On Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Or use Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run this command once to get your SESSION_SECRET.

---

## Complete Example (Copy-Paste Ready)

Replace the placeholder values with your actual values:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://rent-ease-management.vercel.app
DATABASE_URL=postgresql://postgres:password@host:5432/database
SESSION_SECRET=your-generated-session-secret-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token
GEMINI_API_KEY=your-gemini-api-key
RESEND_API_KEY=re_your-resend-api-key
```

---

## Getting Your Values

### DATABASE_URL (Railway PostgreSQL)
1. Go to Railway Dashboard
2. Click on your **PostgreSQL database service**
3. Go to **Variables** tab
4. Copy the `DATABASE_URL` value
5. Paste it into your backend service variables

### SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
1. Go to [Upstash Dashboard](https://console.upstash.com)
2. Select your Redis database
3. Copy:
   - **UPSTASH_REDIS_REST_URL** → `UPSTASH_REDIS_REST_URL`
   - **UPSTASH_REDIS_REST_TOKEN** → `UPSTASH_REDIS_REST_TOKEN`

### GEMINI_API_KEY
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or copy your API key
3. Paste into `GEMINI_API_KEY`

### RESEND_API_KEY
1. Go to [Resend Dashboard](https://resend.com/api-keys)
2. Create or copy your API key
3. Paste into `RESEND_API_KEY`

---

## Verification Checklist

After setting all variables:

- [ ] All required variables are set
- [ ] `FRONTEND_URL` has no trailing slash
- [ ] `DATABASE_URL` is from Railway PostgreSQL service
- [ ] `SESSION_SECRET` is strong and unique
- [ ] Redeploy the service after setting variables
- [ ] Check Railway logs for any errors

---

## Troubleshooting

### CORS Errors
- Verify `FRONTEND_URL` matches exactly: `https://rent-ease-management.vercel.app` (no trailing slash)
- Redeploy after changing `FRONTEND_URL`

### Database Connection Errors
- Verify `DATABASE_URL` is correct from Railway PostgreSQL service
- Check if database is running in Railway

### Redis Connection Errors
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Check Upstash dashboard to ensure database is active

### Missing Environment Variables
- Check Railway logs for specific missing variable errors
- Ensure all variables are set in Railway (not just in local `.env`)

