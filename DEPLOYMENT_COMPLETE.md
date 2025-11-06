# BME680 Monitor - Deployment Complete! ✅

## 🌐 Live Website
**URL:** https://bme680-monitor.vercel.app

The website is live and ready to receive data from your Raspberry Pi!

## 📡 API Endpoints

1. **Store Sensor Data** (POST)
   - URL: `https://bme680-monitor.vercel.app/api/store`
   - Method: POST
   - Body: JSON with temperature, humidity, pressure, gas, altitude, timestamp

2. **Retrieve Historical Data** (GET)
   - URL: `https://bme680-monitor.vercel.app/api/data?limit=100`
   - Method: GET
   - Returns: Array of historical readings

## 🔧 Raspberry Pi Configuration

The sensor script has been updated to send data to the new Vercel site:
- **File:** `/home/pi/chickencam/chickencam/bme680_sensor.py`
- **Service:** `chickencam-bme680.service`
- **Status:** ✅ Running (restarted with new configuration)

## 📊 Features

- ✅ Real-time sensor data display
- ✅ Historical data tracking (up to 1000 readings)
- ✅ Beautiful, responsive web interface
- ✅ Auto-refresh every 10 seconds
- ✅ Timestamp tracking for all readings

## ⚠️ Important: Persistent Storage Setup

For persistent historical data storage across deployments, configure Vercel KV (see `KV_SETUP.md`).

Current setup uses in-memory storage which:
- Works for testing and single sessions
- Data may be lost on function restarts
- Configure KV for production persistence

## 🚀 Next Steps

1. **Verify sensor data is flowing:**
   ```bash
   journalctl -u chickencam-bme680.service -f
   ```

2. **Check website for live data:**
   - Visit: https://bme680-monitor.vercel.app
   - Data should appear within 10-20 seconds if sensor is working

3. **Configure KV storage** (optional but recommended):
   - Follow instructions in `KV_SETUP.md`
   - This ensures data persists across deployments

## 📝 GitHub Repository

Code is available at: https://github.com/ekulkisnek/bme680-monitor

## 🔍 Troubleshooting

If no data appears:
1. Check sensor is connected: `i2cdetect -y 1`
2. Check service logs: `journalctl -u chickencam-bme680.service -n 50`
3. Test API manually: `curl -X POST https://bme680-monitor.vercel.app/api/store -H "Content-Type: application/json" -d '{"temperature":25,"humidity":60,"pressure":1013,"gas":50000,"altitude":100,"timestamp":"2024-01-01T00:00:00Z"}'`

---

**Status:** ✅ Deployed and Running!
**Last Updated:** $(date)

