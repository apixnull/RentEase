# Frontend Deployment Guide - Vercel

This guide will help you deploy the RentEase frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your backend API deployed and accessible
3. Supabase project credentials

## Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub, GitLab, or Bitbucket.

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (if your repo has both frontend and backend)
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist` (should auto-detect)
   - **Install Command**: `npm install` (should auto-detect)

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. For production deployment:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

### Required Environment Variables:

```
VITE_BACKEND_URL=https://your-backend-url.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Environment Variable Details:

- **VITE_BACKEND_URL**: Your deployed backend API URL
  - Example: `https://rentease-backend.railway.app/api`
  - Make sure to include `/api` at the end if your backend serves API routes under `/api`

- **VITE_SUPABASE_URL**: Your Supabase project URL
  - Found in Supabase Dashboard → Settings → API

- **VITE_SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key
  - Found in Supabase Dashboard → Settings → API
  - ⚠️ **Important**: This is a sensitive key. Never commit it to Git.

3. Set these variables for all environments (Production, Preview, Development)

4. **Redeploy** your application after adding environment variables

## Step 4: Verify Deployment

1. Check the deployment logs in Vercel dashboard
2. Visit your deployed URL (e.g., `https://your-app.vercel.app`)
3. Test the application:
   - Login functionality
   - API calls
   - Socket.io connections (if backend supports WebSockets)

## Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificates

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes locally: `npm run build`

### Environment Variables Not Working

- Make sure variables are prefixed with `VITE_`
- Redeploy after adding/changing environment variables
- Check that variables are set for the correct environment (Production/Preview)

### Routing Issues (404 on refresh)

- The `vercel.json` file should handle this automatically
- If issues persist, verify the rewrite rule is correct

### API Connection Issues

- Verify `VITE_BACKEND_URL` is correct
- Check CORS settings on your backend
- Ensure backend allows requests from your Vercel domain

### Socket.io Connection Issues

- Vercel doesn't support WebSocket connections directly
- You'll need to use a separate service for Socket.io (Railway, Render, Fly.io)
- Update `VITE_BACKEND_URL` to point to your Socket.io-enabled backend

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Application builds successfully
- [ ] Login/authentication works
- [ ] API calls are successful
- [ ] Images/assets load correctly
- [ ] Routing works (no 404s on refresh)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic with Vercel)

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

