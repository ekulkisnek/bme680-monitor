# Quick KV Setup Guide

Since Vercel KV creation needs to be done through the dashboard (not API), here's the fastest way:

## 🚀 Step-by-Step (5 minutes)

### Step 1: Create KV Database

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click your project**: `bme680-monitor`
3. **Click "Storage"** tab (in the top menu)
4. **Click "Create Database"** → **"KV"**
5. **Name it**: `bme680-kv` (or any name)
6. **Select Free tier** (Hobby plan)
7. **Click "Create"**

### Step 2: Get Connection Details

After creation, you'll see:
- **KV_REST_API_URL**: Something like `https://bme680-kv-xxxxx.upstash.io`
- **KV_REST_API_TOKEN**: A long token string

**Copy both values!**

### Step 3: Run Setup Script

```bash
cd /home/pi/bme680-monitor

# Set your KV credentials
export KV_REST_API_URL="your-url-here"
export KV_REST_API_TOKEN="your-token-here"

# Run the setup script (I've already created it for you!)
./setup-kv.sh
```

The script will automatically:
- ✅ Add `KV_REST_API_URL` to Vercel environment variables
- ✅ Add `KV_REST_API_TOKEN` to Vercel environment variables
- ✅ Set them for Production, Preview, and Development

### Step 4: Redeploy

1. Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/deployments
2. Click **"Redeploy"** on the latest deployment
3. Wait for deployment to complete

**Done!** Your site now uses KV for real-time storage! 🎉

## 🔍 Verify It's Working

After redeploy, check:
1. Visit: https://bme680-monitor.vercel.app
2. Data should appear instantly (no delays)
3. Check browser console for `storageType: 'kv'` in API responses

## 📊 What You Get

- ✅ **Real-time data**: Instant reads/writes (no batching delays)
- ✅ **Free tier**: 30,000 requests/month, 256 MB storage
- ✅ **Automatic backup**: GitHub still backs up every 100 readings or 1 hour
- ✅ **Clean Git history**: 99% fewer commits

## 🆘 Troubleshooting

**Script fails?** Make sure:
- You've copied the full URL and token (no extra spaces)
- Your Vercel token is still valid
- You're in the project directory

**Need help?** Check the script output - it will tell you what went wrong.






