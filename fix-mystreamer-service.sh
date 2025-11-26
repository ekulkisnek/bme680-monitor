#!/bin/bash
# Quick fix script for mystreamer.service
# Fixes the incorrect file path issue

echo "🔧 Fixing mystreamer.service..."

# Backup current service file
sudo cp /etc/systemd/system/mystreamer.service /etc/systemd/system/mystreamer.service.backup

# Check if the correct file exists
if [ ! -f "/home/pi/chickencam/chickencam/pi_app.py" ]; then
    echo "❌ Error: /home/pi/chickencam/chickencam/pi_app.py not found!"
    echo "Please verify the file exists."
    exit 1
fi

# Update the service file
sudo sed -i 's|/home/pi/chickencam/app.py|/home/pi/chickencam/chickencam/pi_app.py|g' /etc/systemd/system/mystreamer.service

# Reload systemd
sudo systemctl daemon-reload

# Show updated service file
echo ""
echo "✅ Service file updated. New configuration:"
echo ""
sudo systemctl cat mystreamer.service | grep ExecStart

echo ""
echo "📋 Next steps:"
echo "1. Test the service: sudo systemctl start mystreamer.service"
echo "2. Check status: sudo systemctl status mystreamer.service"
echo "3. View logs: sudo journalctl -u mystreamer.service -f"
echo "4. Enable on boot: sudo systemctl enable mystreamer.service"
echo ""
echo "⚠️  Note: Make sure CAMERA_INDICES in pi_app.py matches your camera setup!"

