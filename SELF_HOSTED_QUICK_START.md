# Self-Hosted Quick Start Guide

## 🚀 Complete Setup in 5 Minutes

### Step 1: Run Setup Script
```bash
cd /home/pi/bme680-monitor
./local_setup.sh
```

This will:
- ✅ Install Python dependencies (Flask, BME680 library)
- ✅ Create data directory
- ✅ Create systemd services
- ✅ Enable auto-start on boot

### Step 2: Start Services
```bash
sudo systemctl start bme680-local-server
sudo systemctl start bme680-local-sensor
```

### Step 3: Access Dashboard

**From Pi:**
- Open browser: `http://localhost:5000`

**From another device on your network:**
- Find Pi's IP: `hostname -I` (run on Pi)
- Open browser: `http://192.168.1.X:5000` (replace X with Pi's IP)
- Or try: `http://raspberrypi.local:5000`

---

## 📊 What You Get

- ✅ **Local dashboard** - Same UI as Vercel site
- ✅ **API endpoints** - `/api/store` and `/api/data`
- ✅ **Local storage** - Data in `/home/pi/bme680-monitor/data/sensor-data.json`
- ✅ **Auto-start** - Runs on boot automatically
- ✅ **No internet** - Works completely offline
- ✅ **Fast** - <1ms latency, local network

---

## 🔧 Configuration

### Change Server Port
Edit `local_server.py`:
```python
app.run(host='0.0.0.0', port=5000, debug=False)  # Change 5000 to your port
```

### Change Update Interval
Edit `local_sensor.py`:
```python
SENSOR_UPDATE_INTERVAL = 10  # Change to your interval (seconds)
```

### Access from Different Network
Edit `local_sensor.py`:
```python
LOCAL_SERVER_URL = 'http://192.168.1.X:5000'  # Replace X with Pi's IP
```

---

## 🛠️ Management Commands

**Start services:**
```bash
sudo systemctl start bme680-local-server
sudo systemctl start bme680-local-sensor
```

**Stop services:**
```bash
sudo systemctl stop bme680-local-server
sudo systemctl stop bme680-local-sensor
```

**Check status:**
```bash
sudo systemctl status bme680-local-server
sudo systemctl status bme680-local-sensor
```

**View logs:**
```bash
# Server logs
journalctl -u bme680-local-server -f

# Sensor logs
journalctl -u bme680-local-sensor -f

# Both logs
journalctl -u bme680-local-* -f
```

**Restart services:**
```bash
sudo systemctl restart bme680-local-server
sudo systemctl restart bme680-local-sensor
```

---

## 🌐 Remote Access Options

### Option A: Tailscale (Easiest & Most Secure)

1. **Install Tailscale on Pi:**
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

2. **Get Pi's Tailscale IP:**
```bash
tailscale ip
```

3. **Access from anywhere:**
- Install Tailscale on your phone/computer
- Access: `http://100.x.x.x:5000` (use Tailscale IP)

### Option B: Port Forwarding

1. **Log into router** admin panel
2. **Forward port 5000** to Pi's IP
3. **Set up DDNS** (DuckDNS is free)
4. **Access:** `http://yourname.duckdns.org:5000`

⚠️ **Security note**: Use HTTPS (Let's Encrypt) if exposing to internet!

---

## 📁 File Structure

```
/home/pi/bme680-monitor/
├── local_server.py          # Flask web server
├── local_sensor.py          # Sensor reader (sends to local server)
├── local_setup.sh           # Setup script
├── data/
│   └── sensor-data.json     # Stored sensor readings
└── public/
    └── index.html           # Dashboard (same as Vercel version)
```

---

## 🔄 Switching from Vercel to Local

**To switch your existing sensor service:**

1. **Edit sensor script:**
```bash
sudo nano /home/pi/chickencam/chickencam/bme680_sensor.py
```

2. **Change SERVER_URL:**
```python
# Old:
SERVER_URL = 'https://bme680-monitor.vercel.app'

# New:
SERVER_URL = 'http://localhost:5000'
```

3. **Restart service:**
```bash
sudo systemctl restart chickencam-bme680.service
```

**Or use the new local sensor service:**
```bash
sudo systemctl stop chickencam-bme680.service
sudo systemctl start bme680-local-sensor.service
```

---

## ✅ Advantages Over Vercel

| Feature | Vercel | Local Server |
|---------|--------|--------------|
| **Latency** | ~100-200ms | <1ms |
| **Cost** | Free (with limits) | Free (unlimited) |
| **Privacy** | Data on Vercel | Data on your Pi |
| **Offline** | ❌ Needs internet | ✅ Works offline |
| **Control** | Limited | ✅ Full control |
| **Storage** | 256 MB (KV) | Unlimited |
| **Remote Access** | ✅ Built-in | ⚠️ Needs setup |

---

## 🆘 Troubleshooting

**Can't access dashboard?**
- Check server is running: `sudo systemctl status bme680-local-server`
- Check firewall: `sudo ufw allow 5000`
- Try Pi's IP instead of localhost

**Sensor not sending data?**
- Check sensor service: `sudo systemctl status bme680-local-sensor`
- Check logs: `journalctl -u bme680-local-sensor -n 50`
- Verify sensor is connected: `i2cdetect -y 1`

**Port already in use?**
- Change port in `local_server.py` (line with `port=5000`)
- Or stop conflicting service: `sudo lsof -i :5000`

---

## 🎉 You're Done!

Your Pi now hosts everything locally:
- ✅ No Vercel needed
- ✅ No GitHub needed  
- ✅ No external services
- ✅ Complete control
- ✅ Works offline

**Access your dashboard and enjoy!** 🚀






