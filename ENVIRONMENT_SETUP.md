# Environment Variables Setup for Vercel

## Issue
The application is showing `WebSocket connection to 'wss://your-project.supabase.co/realtime/v1/websocket'` errors because environment variables are not configured in Vercel.

## Solution

### Option 1: Set Environment Variables in Vercel Dashboard (Recommended)

1. **Go to your Vercel project dashboard**:
   - Visit [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - Find your `Pro_Task` project

2. **Navigate to Settings**:
   - Click on your project
   - Go to "Settings" tab
   - Click on "Environment Variables" in the sidebar

3. **Add Environment Variables**:
   ```
   Name: VITE_SUPABASE_URL
   Value: https://wtgtriiwqwibobkignvd.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Z3RyaWl3cXdpYm9ia2lnbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc3ODksImV4cCI6MjA3MzU3Mzc4OX0.Z81rUE6QlZxuVUjTmkwj0BXN2xjXwraNXIeqzPcoQ6s
   ```

4. **Set Environment for**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Redeploy**:
   - After adding environment variables, trigger a new deployment
   - You can do this by pushing a new commit or using "Redeploy" button

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Enter: https://wtgtriiwqwibobkignvd.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Z3RyaWl3cXdpYm9ia2lnbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc3ODksImV4cCI6MjA3MzU3Mzc4OX0.Z81rUE6QlZxuVUjTmkwj0BXN2xjXwraNXIeqzPcoQ6s

# Redeploy
vercel --prod
```

## Verification

After setting up environment variables:

1. **Check the deployment logs** for any environment variable errors
2. **Test the application** - Supabase connection should work
3. **Verify in browser console** - WebSocket errors should be resolved

## Backup Plan

The application includes a localStorage fallback, so even if Supabase is temporarily unavailable, the app will continue to work using local storage.

## Security Note

- Environment variables are kept secure in Vercel and not exposed in the client code
- The `.env` file is properly excluded from git commits
- Only the `VITE_` prefixed variables are exposed to the client (this is normal for Vite)