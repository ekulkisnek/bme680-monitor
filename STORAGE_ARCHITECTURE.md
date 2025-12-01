# Storage Architecture - Real-Time + Backup

## 🎯 Best of Both Worlds

This project now uses a **hybrid storage approach** that gives you:
- ✅ **Real-time data** (instant updates, no delays)
- ✅ **Clean Git history** (batched commits, ~99% reduction)
- ✅ **Free tier** (both KV and GitHub are free)

## 📊 How It Works

### Real-Time Storage: Vercel KV (Priority 1)
- **Instant writes**: Every sensor reading is stored immediately
- **Instant reads**: Frontend gets latest data with no delay
- **Free tier**: 30,000 requests/month, 256 MB storage
- **Perfect for**: Live dashboard, real-time monitoring

### Backup Storage: GitHub (Priority 2)
- **Batched commits**: Every 100 readings OR every hour (whichever comes first)
- **Clean history**: ~24-100 commits/day instead of 3,580/day
- **Free & persistent**: Unlimited storage, version history
- **Perfect for**: Backup, archival, version control

## 🔄 Data Flow

```
Sensor Reading (every 10s)
    ↓
1. Store in KV immediately → ✅ Available instantly
    ↓
2. Queue for GitHub batch → ⏳ Commits every 100 readings or 1 hour
    ↓
Frontend reads from KV → ✅ Always gets latest data
```

## ✅ Answers to Your Questions

### 1. Does free tier get Vercel KV?
**YES!** Free Hobby plan includes:
- 30,000 requests/month
- 256 MB storage
- 256 MB data transfer/month

**Your usage**: ~8,640 readings/month = well within limits ✅

### 2. Will batching commits affect near-live data?
**NO!** With KV, data is **instant**:
- KV stores immediately → Frontend reads from KV → No delay
- GitHub batching only affects backup commits, not live data
- Frontend polls every 10 seconds → Gets latest KV data instantly

### 3. Does database work with Vercel free tier?
**YES!** KV is perfect:
- ✅ Simple key-value store (Redis-compatible)
- ✅ Built-in Vercel integration
- ✅ No complex setup needed
- ✅ Works seamlessly with serverless functions

**Full SQL database** would be overkill and more complex. KV is ideal for this use case.

## 🚀 Setup Instructions

### Step 1: Create Vercel KV Database (2 minutes)

1. Go to your Vercel project: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor
2. Click **Storage** → **Create Database** → **KV**
3. Create database (free tier)
4. Copy the connection details:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Step 2: Add Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Add both variables:
   - `KV_REST_API_URL` = (from step 1)
   - `KV_REST_API_TOKEN` = (from step 1)
3. Select: Production, Preview, Development
4. Click **Save**

### Step 3: Redeploy

1. Go to **Deployments**
2. Click **Redeploy** on latest deployment

**That's it!** Your site will now:
- Store data in KV (real-time)
- Backup to GitHub (batched)

## 📈 Performance Comparison

| Metric | Before (GitHub only) | After (KV + GitHub) |
|--------|---------------------|---------------------|
| **Commits/day** | ~3,580 | ~24-100 |
| **Data freshness** | Up to 1 hour delay | Instant |
| **Git history** | Cluttered | Clean |
| **API rate limits** | Risk of hitting limits | Well within limits |
| **Frontend updates** | Delayed | Real-time |

## 🎉 Benefits

1. **Real-time dashboard**: Data appears instantly
2. **Clean Git history**: 99% fewer commits
3. **Reliable backup**: GitHub stores everything
4. **Free forever**: Both KV and GitHub are free
5. **Simple setup**: Just add 2 environment variables

## 🔍 Monitoring

Check your storage status:
- **KV usage**: Vercel Dashboard → Storage → Your KV database
- **GitHub commits**: Your repo will show batched commits
- **API response**: Check `storageType` and `githubBackup` fields

## 💡 Why This Approach?

- **KV for speed**: Instant reads/writes, perfect for live data
- **GitHub for backup**: Free, persistent, version-controlled
- **Batching for cleanliness**: Reduces commits without losing data
- **Hybrid for reliability**: If KV fails, GitHub backup exists

---

**Result**: You get real-time data with clean Git history, all on free tiers! 🎊






