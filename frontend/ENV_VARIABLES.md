# Environment Variables Reference

This file lists all environment variables needed for the RentEase frontend.

## Required Environment Variables

### VITE_BACKEND_URL
- **Description**: The URL of your backend API
- **Development**: `http://localhost:5000/api`
- **Production**: Your deployed backend URL (e.g., `https://your-backend.railway.app/api`)
- **Example**: `https://rentease-api.railway.app/api`

### VITE_SUPABASE_URL
- **Description**: Your Supabase project URL
- **Where to find**: Supabase Dashboard → Settings → API → Project URL
- **Example**: `https://abcdefghijklmnop.supabase.co`

### VITE_SUPABASE_SERVICE_ROLE_KEY
- **Description**: Your Supabase service role key (for server-side operations)
- **Where to find**: Supabase Dashboard → Settings → API → Service Role Key
- **⚠️ Security**: Never commit this to Git or expose it in client-side code
- **Note**: This is used for file uploads and other server-side operations

## Optional Environment Variables

### VITE_USE_LOCAL_STORAGE
- **Description**: Enable local file storage for image uploads (development only)
- **Default**: Automatically enabled when `MODE=development`
- **Usage**: 
  - Set to `true` to force local storage mode
  - Set to `false` to use Supabase even in development
  - Leave unset to auto-detect based on environment mode
- **Note**: Local storage uploads files to backend and serves them at `/local-images/` route

## Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the `VITE_` prefix
4. Select the environments where they should be available:
   - **Production**: For production deployments
   - **Preview**: For preview deployments (pull requests)
   - **Development**: For local development (if using Vercel CLI)

5. After adding variables, **redeploy** your application

## Local Development

Create a `.env` file in the `frontend` directory:

```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: Override local storage behavior
# VITE_USE_LOCAL_STORAGE=true  # Force local storage
# VITE_USE_LOCAL_STORAGE=false # Force Supabase storage
```

**Important**: The `.env` file is already in `.gitignore` and should never be committed.

