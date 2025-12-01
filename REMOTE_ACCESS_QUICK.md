# Remote Access - Quick Guide

## 🚀 Fastest Way: Tailscale (5 minutes)

### Step 1: Install on Pi
```bash
cd /home/pi/bme680-monitor
./setup_tailscale.sh
sudo tailscale up
```

### Step 2: Install on Your Phone/Computer
- **Phone**: Install "Tailscale" app (App Store/Play Store)
- **Computer**: Download from https://tailscale.com/download
- Sign in with same account

### Step 3: Get Pi's IP
```bash
tailscale ip
```

### Step 4: Access Dashboard
Open browser: `http://100.x.x.x:5000` (use the IP from step 3)

**Works from anywhere!** 🎉

---

## 🌐 Other Options

### Port Forwarding (Public URL)
- Set up DuckDNS: https://www.duckdns.org/
- Port forward 5000 on router
- Access: `http://yourname.duckdns.org:5000`

### ngrok (Quick Testing)
```bash
ngrok http 5000
```
Share the URL it gives you (temporary, free tier)

### Local Network Only
- Connect to same WiFi
- Access: `http://raspberrypi.local:5000`

---

## 📱 Sharing with Others

**Tailscale**: Add them to your Tailscale network, they can access via IP

**Port Forwarding**: Share the DuckDNS URL with anyone

**ngrok**: Share the ngrok URL (temporary)

---

See `REMOTE_ACCESS_GUIDE.md` for detailed instructions!






