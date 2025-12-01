#!/bin/bash
# Caddy reverse proxy setup script

set -e

echo "🔧 Setting up Caddy Reverse Proxy"
echo "==================================="
echo ""

# Check if Caddy is installed
if command -v caddy &> /dev/null; then
    echo "✅ Caddy is already installed"
    echo ""
    echo "Edit config: sudo nano /etc/caddy/Caddyfile"
    echo "Restart: sudo systemctl restart caddy"
    echo ""
    exit 0
fi

echo "📦 Installing Caddy..."

# Install dependencies
sudo apt-get update
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl

# Add Caddy repository
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list

# Install Caddy
sudo apt-get update
sudo apt-get install -y caddy

echo ""
echo "✅ Caddy installed!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Configure Caddyfile:"
echo "   sudo nano /etc/caddy/Caddyfile"
echo ""
echo "2. Paste this (replace with your domain):"
echo "   ---"
echo "   yourname.duckdns.org {"
echo "       reverse_proxy localhost:5000"
echo "   }"
echo ""
echo "   Or for local access:"
echo "   ---"
echo "   localhost {"
echo "       reverse_proxy localhost:5000"
echo "   }"
echo ""
echo "3. Test configuration:"
echo "   sudo caddy validate --config /etc/caddy/Caddyfile"
echo ""
echo "4. Start Caddy:"
echo "   sudo systemctl enable caddy"
echo "   sudo systemctl start caddy"
echo ""
echo "5. Access your dashboard:"
echo "   https://yourname.duckdns.org"
echo ""
echo "💡 Caddy automatically gets SSL certificates from Let's Encrypt!"
echo "💡 Make sure port 80 and 443 are forwarded if accessing from internet"
echo ""






