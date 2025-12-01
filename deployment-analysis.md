# Vercel Deployment Analysis - Why 100 Deployments?

**Date**: November 25, 2025  
**Issue**: Hit Vercel free tier limit of 100 deployments/day

---

## 🔍 What Happened

**Found**: Exactly **100 deployments** of the `bme680-monitor` project  
**Timeframe**: All within ~4 minutes (20:43 - 20:47 CST today)  
**Frequency**: One deployment every **10-15 seconds**

### Deployment Pattern
```
bme680-monitor - 2025-11-25 20:47:21
bme680-monitor - 2025-11-25 20:47:10
bme680-monitor - 2025-11-25 20:46:57
bme680-monitor - 2025-11-25 20:46:46
... (continuing every ~10 seconds)
bme680-monitor - 2025-11-25 20:43:39
```

---

## 🚨 Root Cause Analysis

This pattern suggests:

1. **Deployment Loop**: An automated script or process was repeatedly deploying
2. **Retry Mechanism Gone Wrong**: A deployment script with retry logic that kept failing and retrying
3. **GitHub Auto-Deploy**: If GitHub integration is enabled, rapid commits could trigger auto-deploys
4. **CI/CD Pipeline**: A continuous deployment setup that was misconfigured

### Most Likely Scenarios:

#### Scenario 1: Deployment Script with Retry Logic
A script that:
- Tries to deploy
- Fails (maybe due to build error, timeout, etc.)
- Retries immediately
- Repeats 100 times

#### Scenario 2: GitHub Auto-Deploy Triggered by Many Commits
If Vercel is connected to GitHub:
- Multiple commits pushed rapidly
- Each commit triggers a deployment
- 100 commits = 100 deployments

#### Scenario 3: Manual Rapid Deployments
Someone/something was:
- Running `vercel --prod` repeatedly
- Or clicking "Redeploy" in dashboard repeatedly
- Testing deployment process

---

## 🔧 How to Prevent This

### 1. Check for Auto-Deploy Scripts
```bash
# Check for deployment scripts
find /home/pi -name "*deploy*" -type f
find /home/pi -name "*vercel*" -type f

# Check cron jobs
crontab -l
systemctl list-timers --all
```

### 2. Review GitHub Integration
- Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/settings/git
- Check if auto-deploy is enabled
- Review deployment triggers

### 3. Add Rate Limiting to Scripts
If you have deployment scripts, add:
- Minimum time between deployments (e.g., 1 minute)
- Maximum retries (e.g., 3 attempts)
- Exponential backoff

### 4. Monitor Deployments
Set up alerts or check deployment history regularly:
```bash
# Check recent deployments
vercel ls --token YOUR_TOKEN
```

---

## 💡 Recommendations

1. **Disable Auto-Deploy Temporarily** (if enabled)
   - Go to Vercel project settings
   - Turn off GitHub auto-deploy if not needed
   - Or configure it to only deploy on main branch

2. **Review Deployment Scripts**
   - Check for any scripts that might be deploying automatically
   - Add safeguards (rate limiting, max retries)

3. **Use Preview Deployments for Testing**
   - Use `vercel` (without `--prod`) for testing
   - Only use `vercel --prod` when ready for production

4. **Wait for Rate Limit Reset**
   - Rate limit resets after 24 hours from first deployment
   - Or upgrade to Vercel Pro for higher limits

---

## 📊 Current Status

- **Total deployments today**: 100 (limit reached)
- **Rate limit reset**: ~24 hours from first deployment (around 20:43 CST tomorrow)
- **Can deploy**: No (until limit resets)
- **Alternative**: Deploy via Vercel dashboard (may bypass CLI limit)

---

## 🎯 Next Steps

1. ✅ **Identified the issue**: 100 rapid deployments of bme680-monitor
2. 🔍 **Investigate**: Check for automated deployment scripts or GitHub webhooks
3. ⏳ **Wait**: Rate limit will reset in ~24 hours
4. 🚀 **Deploy**: Use dashboard or wait for CLI limit reset

---

## 📝 Notes

The `chickenfeedluke` project is ready to deploy but blocked by the rate limit. Once the limit resets (or if you deploy via dashboard), it should work fine.

The rapid deployments suggest something automated was running. Check your deployment workflows and scripts to prevent this from happening again.






