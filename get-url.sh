#!/bin/bash
# Script to get the Vercel deployment URL

echo "Checking Vercel deployment URLs..."
echo ""

# Try common Vercel URL patterns
URLS=(
  "https://bme680-monitor.vercel.app"
  "https://bme680-monitor-lukes-projects-fe2e76bf.vercel.app"
  "https://bme680-monitor-ekulkisnek.vercel.app"
)

for url in "${URLS[@]}"; do
  echo "Testing: $url"
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  if [ "$response" = "200" ] || [ "$response" = "404" ]; then
    echo "  ✓ Response: $response (might be valid)"
  else
    echo "  ✗ Response: $response"
  fi
done

echo ""
echo "The production URL should be visible in your Vercel dashboard:"
echo "https://vercel.com/lukes-projects-fe2e76bf/bme680-monitor"

