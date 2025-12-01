# Disable Auto-Deploy - Stop Using All Your Deployments!

## 🎯 Problem
- Vercel free tier: **100 deployments/day**
- Every GitHub commit triggers a deployment
- With batched commits (~50/day), you're using **50% of your daily limit**
- Plus any manual commits = **hitting the limit fast**

## ✅ Solution: Disable Auto-Deploy

### Method 1: Via Dashboard (Easiest) ⭐

1. **Go to Vercel Dashboard**: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/settings
2. **Click "Git"** in left sidebar
3. **Find "Automatic Deployments"**
4. **Toggle OFF** or set to **"Disabled"**
5. **Save**

**Done!** No more auto-deploys from GitHub commits.

### Method 2: Via vercel.json (Already Done)

I've created `vercel.json` with:
```json
{
  "git": {
    "deploymentEnabled": false
  },
  "github": {
    "autoDeployOnPush": false
  }
}
```

**Next step**: Commit and push this file, then disable in dashboard too (to be sure).

---

## 🚀 Manual Deployment (When You Need It)

### Option 1: Via Vercel Dashboard
1. Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/deployments
2. Click **"Redeploy"** on latest deployment
3. Or click **"Deploy"** → **"Deploy from GitHub"**

### Option 2: Via Vercel CLI
```bash
cd /home/pi/bme680-monitor
vercel --prod
```

### Option 3: Via GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel
on:
  workflow_dispatch:  # Manual trigger only

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📊 Deployment Usage After Disabling

**Before:**
- ~50 auto-deploys/day (from batched commits)
- Plus manual commits
- **Total: ~50-100/day** ❌ (hitting limit)

**After:**
- 0 auto-deploys ✅
- Manual deploys only when you need them
- **Total: ~0-5/day** ✅ (plenty of headroom)

---

## 💡 When to Deploy Manually

**Deploy when:**
- ✅ You update the website code
- ✅ You change API endpoints
- ✅ You update environment variables
- ✅ You want to test changes

**Don't deploy when:**
- ❌ Sensor data updates (just JSON file changes)
- ❌ Documentation updates
- ❌ Small fixes that don't affect the site

---

## 🔧 Quick Commands

**Disable auto-deploy:**
```bash
# Already done via vercel.json
git add vercel.json
git commit -m "Disable auto-deploy to save deployment quota"
git push
```

**Manual deploy when needed:**
```bash
vercel --prod
```

**Check deployment count:**
- Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/deployments
- Look at deployment history

---

## ✅ Verification

After disabling:
1. Make a test commit (that doesn't affect the site)
2. Push to GitHub
3. Check Vercel dashboard
4. **Should NOT create a new deployment** ✅

---

## 🎉 Benefits

- ✅ **Save deployments** - Only deploy when needed
- ✅ **Stay within limits** - 100/day is plenty for manual deploys
- ✅ **More control** - Deploy when YOU want to
- ✅ **Sensor data updates** - Don't trigger deploys anymore

**Your sensor data will still update in GitHub, but won't trigger Vercel deployments!** 🚀






