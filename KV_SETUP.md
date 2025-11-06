# Vercel KV Setup Instructions

To enable persistent storage for historical sensor data, you need to configure Vercel KV:

1. Go to your Vercel project dashboard: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor

2. Navigate to **Storage** → **Create Database** → **KV**

3. Create a new KV database (free tier is available)

4. Copy the connection details:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

5. Add these as environment variables in your Vercel project:
   - Go to **Settings** → **Environment Variables**
   - Add `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   - Redeploy the project

Once KV is configured, historical data will persist across deployments and function invocations!

## Current Status

Currently, the site uses in-memory storage which works but:
- Data is lost when serverless functions restart
- Each function invocation may have separate storage
- Data doesn't persist across deployments

With KV configured, all data will be stored persistently in Vercel's KV database.

