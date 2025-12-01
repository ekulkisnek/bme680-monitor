#!/bin/bash
# ZeroTier setup script

set -e

echo "🔧 Setting up ZeroTier"
echo "======================"
echo ""

# Check if ZeroTier is installed
if command -v zerotier-cli &> /dev/null; then
    echo "✅ ZeroTier is already installed"
    echo ""
    echo "To join a network, run:"
    echo "  sudo zerotier-cli join [NETWORK_ID]"
    echo ""
    echo "To get your ZeroTier IP:"
    echo "  zerotier-cli listnetworks"
    echo ""
    exit 0
fi

echo "📦 Installing ZeroTier..."
curl -s https://install.zerotier.com | sudo bash

echo ""
echo "✅ ZeroTier installed!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Sign up at: https://my.zerotier.com"
echo ""
echo "2. Create a network in the dashboard"
echo ""
echo "3. Join the network:"
echo "   sudo zerotier-cli join [NETWORK_ID]"
echo ""
echo "4. Authorize your Pi in the ZeroTier dashboard"
echo ""
echo "5. Get your ZeroTier IP:"
echo "   zerotier-cli listnetworks"
echo "   # Or: ip addr show zt0"
echo ""
echo "6. Install ZeroTier on your other devices:"
echo "   - https://www.zerotier.com/download/"
echo ""
echo "7. Access your dashboard:"
echo "   http://[ZEROTIER_IP]:5000"
echo ""
echo "💡 Tip: ZeroTier assigns IPs like 10.147.x.x"
echo ""






