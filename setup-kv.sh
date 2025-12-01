#!/bin/bash
# Script to set up Vercel KV environment variables
# Run this after creating KV database in Vercel dashboard

set -e

VERCEL_TOKEN="${VERCEL_TOKEN:-oxUfegMXjwcOUULhpxKaRX9z}"
PROJECT_ID="prj_ezYBrL196iclWRGoLfCB5X3SNnm3"
TEAM_ID="team_WuBeQ3hxIx8UTXBYNadA0wjO"

echo "🔧 Vercel KV Setup Script"
echo "========================="
echo ""

# Check if KV credentials are provided
if [ -z "$KV_REST_API_URL" ] || [ -z "$KV_REST_API_TOKEN" ]; then
    echo "❌ Error: KV_REST_API_URL and KV_REST_API_TOKEN must be set"
    echo ""
    echo "To get these values:"
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select your project: bme680-monitor"
    echo "3. Go to: Storage → Create Database → KV"
    echo "4. Create KV database (free tier)"
    echo "5. Copy KV_REST_API_URL and KV_REST_API_TOKEN"
    echo ""
    echo "Then run:"
    echo "  export KV_REST_API_URL='your-url'"
    echo "  export KV_REST_API_TOKEN='your-token'"
    echo "  ./setup-kv.sh"
    exit 1
fi

echo "✅ Found KV credentials"
echo "📦 Project ID: $PROJECT_ID"
echo ""

# Add KV_REST_API_URL
echo "Setting KV_REST_API_URL..."
RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
    -d "{
        \"key\": \"KV_REST_API_URL\",
        \"value\": \"$KV_REST_API_URL\",
        \"type\": \"encrypted\",
        \"target\": [\"production\", \"preview\", \"development\"]
    }")

if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ KV_REST_API_URL set successfully"
else
    echo "⚠️  Response: $RESPONSE"
    # Check if it already exists
    if echo "$RESPONSE" | grep -q "already exists"; then
        echo "ℹ️  Variable already exists, updating..."
        ENV_ID=$(curl -s -X GET \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            "https://api.vercel.com/v9/projects/$PROJECT_ID/env" | \
            python3 -c "import sys, json; data=json.load(sys.stdin); print([e['id'] for e in data.get('envs', []) if e.get('key')=='KV_REST_API_URL'][0] if any(e.get('key')=='KV_REST_API_URL' for e in data.get('envs', [])) else '')" 2>/dev/null)
        
        if [ -n "$ENV_ID" ]; then
            curl -s -X PATCH \
                -H "Authorization: Bearer $VERCEL_TOKEN" \
                -H "Content-Type: application/json" \
                "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ENV_ID" \
                -d "{
                    \"value\": \"$KV_REST_API_URL\",
                    \"target\": [\"production\", \"preview\", \"development\"]
                }" > /dev/null
            echo "✅ KV_REST_API_URL updated"
        fi
    fi
fi

# Add KV_REST_API_TOKEN
echo "Setting KV_REST_API_TOKEN..."
RESPONSE=$(curl -s -X POST \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
    -d "{
        \"key\": \"KV_REST_API_TOKEN\",
        \"value\": \"$KV_REST_API_TOKEN\",
        \"type\": \"encrypted\",
        \"target\": [\"production\", \"preview\", \"development\"]
    }")

if echo "$RESPONSE" | grep -q '"id"'; then
    echo "✅ KV_REST_API_TOKEN set successfully"
else
    echo "⚠️  Response: $RESPONSE"
    # Check if it already exists
    if echo "$RESPONSE" | grep -q "already exists"; then
        echo "ℹ️  Variable already exists, updating..."
        ENV_ID=$(curl -s -X GET \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            "https://api.vercel.com/v9/projects/$PROJECT_ID/env" | \
            python3 -c "import sys, json; data=json.load(sys.stdin); print([e['id'] for e in data.get('envs', []) if e.get('key')=='KV_REST_API_TOKEN'][0] if any(e.get('key')=='KV_REST_API_TOKEN' for e in data.get('envs', [])) else '')" 2>/dev/null)
        
        if [ -n "$ENV_ID" ]; then
            curl -s -X PATCH \
                -H "Authorization: Bearer $VERCEL_TOKEN" \
                -H "Content-Type: application/json" \
                "https://api.vercel.com/v9/projects/$PROJECT_ID/env/$ENV_ID" \
                -d "{
                    \"value\": \"$KV_REST_API_TOKEN\",
                    \"target\": [\"production\", \"preview\", \"development\"]
                }" > /dev/null
            echo "✅ KV_REST_API_TOKEN updated"
        fi
    fi
fi

echo ""
echo "🎉 Environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Go to: https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor/deployments"
echo "2. Click 'Redeploy' on the latest deployment"
echo "3. Your site will now use KV for real-time storage!"
echo ""
