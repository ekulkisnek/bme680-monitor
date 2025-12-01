# Quick Fix: Disable Auto-Deploy

## 🚨 Problem
Every GitHub commit triggers a Vercel deployment. With ~50 batched commits/day, you're using **50% of your 100 deployments/day limit**.

## ✅ Solution (2 Steps)

### Step 1: Disable in Dashboard (Required)
1. Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/settings/git
2. Find **"Automatic Deployments"**
3. Toggle **OFF** or set to **"Disabled"**
4. Click **Save**

### Step 2: Commit vercel.json (Backup)
```bash
cd /home/pi/bme680-monitor
git add vercel.json
git commit -m "Disable auto-deploy to save deployment quota"
git push
```

**Done!** No more auto-deploys. 🎉

---

## 🚀 Deploy Manually When Needed

**Via Dashboard:**
- Go to Deployments → Click "Redeploy"

**Via CLI:**
```bash
vercel --prod
```

---

## 📊 Result

**Before:** ~50-100 deployments/day ❌  
**After:** 0 auto-deploys, manual only ✅

Your sensor data will still update in GitHub, but won't trigger deployments!






