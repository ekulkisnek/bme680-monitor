#!/bin/bash
# Quick Tailscale setup script for remote access

set -e

echo "🔧 Setting up Tailscale for Remote Access"
echo "=========================================="
echo ""

# Check if Tailscale is already installed
if command -v tailscale &> /dev/null; then
    echo "✅ Tailscale is already installed"
    echo ""
    echo "To connect, run:"
    echo "  sudo tailscale up"
    echo ""
    echo "To get your Pi's Tailscale IP:"
    echo "  tailscale ip"
    echo ""
    exit 0
fi

# Install Tailscale
echo "📦 Installing Tailscale..."
curl -fsSL https://tailscale.com/install.sh | sh

echo ""
echo "✅ Tailscale installed!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Run this command to connect:"
echo "   sudo tailscale up"
echo ""
echo "2. Sign in when prompted (use Google/GitHub/Microsoft account)"
echo ""
echo "3. Get your Pi's Tailscale IP:"
echo "   tailscale ip"
echo ""
echo "4. Install Tailscale on your phone/computer:"
echo "   - App Store / Play Store: Search 'Tailscale'"
echo "   - Or download from: https://tailscale.com/download"
echo ""
echo "5. Sign in with the same account"
echo ""
echo "6. Access your dashboard:"
echo "   http://[TAILSCALE_IP]:5000"
echo ""
echo "💡 Tip: Enable MagicDNS in Tailscale settings for easier access!"
echo "   Then you can use: http://raspberrypi:5000"
echo ""






