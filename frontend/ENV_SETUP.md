# Frontend Environment Variables Setup

## Automatic Environment Detection

The frontend automatically detects the environment and uses the appropriate URLs:

- **Development** (`npm run dev`): Uses `http://localhost:5000/api`
- **Production** (`npm run build`): Uses `https://rentease-vnw8.onrender.com/api`

## Environment Variables for Vercel

Set these in your Vercel project dashboard (Settings → Environment Variables):

### Required Variables

```
VITE_BACKEND_URL=https://rentease-vnw8.onrender.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Optional Override

If you set `VITE_BACKEND_URL`, it will override the automatic environment detection.

## Local Development

Create a `.env` file in the `frontend` directory:

```env
# Optional: Override backend URL
VITE_BACKEND_URL=http://localhost:5000/api

# Required: Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: The `.env` file is already in `.gitignore` and should never be committed.

