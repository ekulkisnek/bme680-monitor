# Storage Setup - Using GitHub (FREE!)

I've implemented GitHub-based storage! This is completely free and works immediately.

## ✅ What I Did

- Updated `api/store.js` and `api/data.js` to use GitHub as storage
- Created `sensor-data.json` file in the repo
- Data is stored persistently in GitHub (free, unlimited, reliable!)

## 🔧 Setup (1 minute)

Add your GitHub token to Vercel environment variables:

### Option 1: Via Vercel Dashboard (Easiest)
1. Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/settings/environment-variables
2. Click "Add New"
3. Key: `GITHUB_TOKEN`
4. Value: `[Your GitHub token]` - Use the token you provided earlier
5. Select "Production", "Preview", and "Development"
6. Click "Save"
7. Go to Deployments → Click "Redeploy" on latest deployment

### Option 2: Via CLI
```bash
cd /home/pi/bme680-monitor
vercel env add GITHUB_TOKEN production
# Enter your GitHub token when prompted
vercel --prod
```

## 🎉 How It Works

- Each sensor reading is appended to `sensor-data.json`
- Data persists in GitHub (visible in the repo!)
- Automatically keeps last 500 readings
- No limits, completely free, reliable storage

## 📊 View Your Data

You can even view the raw data file directly:
https://github.com/ekulkisnek/bme680-monitor/blob/main/sensor-data.json

Once you add the `GITHUB_TOKEN` environment variable and redeploy, the website will show live data!

