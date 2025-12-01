#!/bin/bash
# Cloudflare Tunnel setup script

set -e

echo "🔧 Setting up Cloudflare Tunnel"
echo "================================="
echo ""

# Check if cloudflared is installed
if command -v cloudflared &> /dev/null; then
    echo "✅ cloudflared is already installed"
    echo ""
    echo "To create a tunnel, run:"
    echo "  cloudflared tunnel login"
    echo "  cloudflared tunnel create bme680"
    echo ""
    exit 0
fi

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    ARCH_TYPE="arm64"
elif [ "$ARCH" = "armv7l" ] || [ "$ARCH" = "armv6l" ]; then
    ARCH_TYPE="arm"
else
    echo "❌ Unsupported architecture: $ARCH"
    exit 1
fi

echo "📦 Installing cloudflared for $ARCH_TYPE..."

# Download latest release
LATEST_VERSION=$(curl -s https://api.github.com/repos/cloudflare/cloudflared/releases/latest | grep tag_name | cut -d '"' -f 4)
DOWNLOAD_URL="https://github.com/cloudflare/cloudflared/releases/download/${LATEST_VERSION}/cloudflared-linux-${ARCH_TYPE}"

echo "Downloading cloudflared ${LATEST_VERSION}..."
curl -L "$DOWNLOAD_URL" -o /tmp/cloudflared
chmod +x /tmp/cloudflared
sudo mv /tmp/cloudflared /usr/local/bin/cloudflared

echo ""
echo "✅ cloudflared installed!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Authenticate with Cloudflare:"
echo "   cloudflared tunnel login"
echo ""
echo "2. Create a tunnel:"
echo "   cloudflared tunnel create bme680"
echo ""
echo "3. Configure DNS (optional):"
echo "   cloudflared tunnel route dns bme680 yourname.yourdomain.com"
echo ""
echo "4. Create config file:"
echo "   mkdir -p ~/.cloudflared"
echo "   nano ~/.cloudflared/config.yml"
echo ""
echo "   Paste this (adjust as needed):"
echo "   ---"
echo "   tunnel: bme680"
echo "   credentials-file: /home/pi/.cloudflared/[TUNNEL-ID].json"
echo "   ingress:"
echo "     - hostname: yourname.yourdomain.com"
echo "       service: http://localhost:5000"
echo "     - service: http_status:404"
echo ""
echo "5. Run tunnel:"
echo "   cloudflared tunnel run bme680"
echo ""
echo "💡 To run as service:"
echo "   sudo cloudflared service install"
echo "   sudo systemctl enable cloudflared"
echo "   sudo systemctl start cloudflared"
echo ""






