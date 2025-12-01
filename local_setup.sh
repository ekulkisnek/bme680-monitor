#!/bin/bash
# Setup script for self-hosted BME680 monitor

set -e

echo "🔧 Setting up Self-Hosted BME680 Monitor"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "⚠️  Don't run as root. Run as regular user."
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
sudo apt update
sudo apt install -y python3-pip python3-flask
pip3 install flask flask-cors adafruit-circuitpython-bme680 requests --break-system-packages

# Create data directory
echo "📁 Creating data directory..."
mkdir -p /home/pi/bme680-monitor/data

# Make scripts executable
echo "🔨 Making scripts executable..."
chmod +x /home/pi/bme680-monitor/local_server.py
chmod +x /home/pi/bme680-monitor/local_sensor.py

# Create systemd service for server
echo "⚙️  Creating systemd service for server..."
sudo tee /etc/systemd/system/bme680-local-server.service > /dev/null <<EOF
[Unit]
Description=BME680 Local Monitor Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/bme680-monitor
ExecStart=/usr/bin/python3 /home/pi/bme680-monitor/local_server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Create systemd service for sensor
echo "⚙️  Creating systemd service for sensor..."
sudo tee /etc/systemd/system/bme680-local-sensor.service > /dev/null <<EOF
[Unit]
Description=BME680 Local Sensor Reader
After=network.target bme680-local-server.service
Requires=bme680-local-server.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/bme680-monitor
ExecStart=/usr/bin/python3 /home/pi/bme680-monitor/local_sensor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Enable services
echo "✅ Enabling services..."
sudo systemctl enable bme680-local-server.service
sudo systemctl enable bme680-local-sensor.service

# Get Pi's IP address
PI_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "✅ Setup complete!"
echo ""
echo "📊 Access your dashboard:"
echo "   Local:  http://localhost:5000"
echo "   Network: http://$PI_IP:5000"
echo "   Or: http://raspberrypi.local:5000"
echo ""
echo "🚀 To start services:"
echo "   sudo systemctl start bme680-local-server"
echo "   sudo systemctl start bme680-local-sensor"
echo ""
echo "📝 Check status:"
echo "   sudo systemctl status bme680-local-server"
echo "   sudo systemctl status bme680-local-sensor"
echo ""
echo "📋 View logs:"
echo "   journalctl -u bme680-local-server -f"
echo "   journalctl -u bme680-local-sensor -f"
echo ""






