# Vercel KV Dashboard Setup - Step by Step

## 🎯 Quick Setup (5 minutes)

### Step 1: Navigate to Your Project
1. Go to: **https://vercel.com/dashboard**
2. Log in if needed
3. Find and click on your project: **`bme680-monitor`**

### Step 2: Go to Storage Tab
1. In your project, look at the top menu bar
2. Click on **"Storage"** tab (between "Deployments" and "Settings")
3. If you don't see "Storage", it might be under **"Settings" → "Storage"**

### Step 3: Create KV Database
1. Click the **"Create Database"** button (usually blue/purple)
2. You'll see options like:
   - **KV** (Key-Value store - what we want)
   - **Postgres** (SQL database)
   - **Blob** (File storage)
3. Click **"KV"** or **"Create KV Database"**

### Step 4: Configure Database
1. **Name**: Enter something like `bme680-kv` or `sensor-data`
2. **Region**: Choose closest to you (or leave default)
3. **Plan**: Select **"Free"** or **"Hobby"** (free tier)
4. Click **"Create"** or **"Create Database"**

### Step 5: Copy Credentials
After creation, you'll see a screen with:
- **KV_REST_API_URL**: Something like `https://bme680-kv-xxxxx.upstash.io`
- **KV_REST_API_TOKEN**: A long token string (starts with `AX` or similar)

**IMPORTANT**: Copy both values! You'll need them.

### Step 6: Add Environment Variables
1. Go to **"Settings"** tab (top menu)
2. Click **"Environment Variables"** (left sidebar)
3. Click **"Add New"** button
4. Add first variable:
   - **Key**: `KV_REST_API_URL`
   - **Value**: Paste the URL you copied
   - **Environments**: Check all three (Production, Preview, Development)
   - Click **"Save"**
5. Click **"Add New"** again
6. Add second variable:
   - **Key**: `KV_REST_API_TOKEN`
   - **Value**: Paste the token you copied
   - **Environments**: Check all three (Production, Preview, Development)
   - Click **"Save"**

### Step 7: Redeploy
1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** menu (three dots)
4. Click **"Redeploy"**
5. Wait for deployment to complete (~1-2 minutes)

**Done!** Your site now uses KV for real-time storage! 🎉

---

## 🔍 Visual Guide

If you get stuck, here's what to look for:

```
Vercel Dashboard
├── Projects
│   └── bme680-monitor
│       ├── [Deployments] ← Click here to redeploy
│       ├── [Storage] ← Click here to create KV
│       └── [Settings] ← Click here for env vars
│           └── Environment Variables
│               └── Add New (button)
```

---

## 🆘 Troubleshooting

**Can't find "Storage" tab?**
- It might be under Settings → Storage
- Or try: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/storage

**Don't see "Create Database" button?**
- Make sure you're on the Storage page
- Refresh the page
- Check if you're on the free tier (Hobby plan)

**Credentials not showing?**
- Click on the database name to see details
- Look for "Connection" or "Credentials" section
- Try refreshing the page

**Environment variables not saving?**
- Make sure you selected all three environments
- Check for typos in the key names
- Try logging out and back in

---

## ✅ Verification

After redeploy, check:
1. Visit: https://bme680-monitor.vercel.app
2. Open browser console (F12)
3. Look for API calls - should show `storageType: 'kv'`
4. Data should appear instantly (no delays)






