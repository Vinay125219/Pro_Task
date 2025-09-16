# 🚀 URGENT: Set Up Vercel Environment Variables

You need to add the Supabase environment variables to Vercel to fix the database connection issue.

## Step 1: Add Environment Variables to Vercel

### Option A: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your **Pro_Task** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
Variable Name: VITE_SUPABASE_URL
Value: https://wtgtriiwqwibobkignvd.supabase.co
Environment: Production, Preview, Development

Variable Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Z3RyaWl3cXdpYm9ia2lnbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc3ODksImV4cCI6MjA3MzU3Mzc4OX0.Z81rUE6QlZxuVUjTmkwj0BXN2xjXwraNXIeqzPcoQ6s
Environment: Production, Preview, Development
```

### Option B: Via Vercel CLI
```bash
vercel env add VITE_SUPABASE_URL
# Enter: https://wtgtriiwqwibobkignvd.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0Z3RyaWl3cXdpYm9ia2lnbnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5OTc3ODksImV4cCI6MjA3MzU3Mzc4OX0.Z81rUE6QlZxuVUjTmkwj0BXN2xjXwraNXIeqzPcoQ6s

vercel --prod
```

## Step 2: Set Up Supabase Database

1. **Go to [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Select your project**: `wtgtriiwqwibobkignvd`
3. **Go to SQL Editor**
4. **Copy and paste** the entire content from `SUPABASE_PRODUCTION_SETUP.sql`
5. **Click "Run"**

## Step 3: Redeploy After Environment Variables

After adding environment variables:
1. **Wait 2-3 minutes**
2. **Go back to Vercel dashboard**
3. **Find the latest deployment**
4. **Click "..." → "Redeploy"**

OR trigger a new deployment by pushing this commit.

## Expected Result

✅ **Supabase connection successful**  
✅ **Database tables properly created**  
✅ **Tasks and projects can be created**  
✅ **No more 400 errors**  
✅ **Beautiful responsive UI**

## Verification

After deployment, check browser console:
- Should see: "✅ Supabase connection successful"
- Should NOT see: "❌ Error creating task"
- Tasks and projects should save to database