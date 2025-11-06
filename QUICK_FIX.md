# Quick Fix for Offline Status

The website shows "offline" because data storage isn't persisting. Here's the quickest fix:

## Option 1: Set Up Vercel KV (Recommended - 2 minutes)

1. Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/storage
2. Click "Create Database" → Select "KV" → Create
3. Copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`
4. Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/settings/environment-variables
5. Add both environment variables
6. Redeploy: `vercel --prod` or push to GitHub (auto-deploys)

## Option 2: Use Alternative Storage (Quick Workaround)

I can modify the code to use Upstash Redis or another free storage service.
