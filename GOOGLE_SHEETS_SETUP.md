# Google Sheets Integration - Complete Setup

## ✅ What Was Done

1. **Installed libraries**: `gspread` and `oauth2client` in the venv
2. **Added Google Sheets integration** to sensor script
3. **Added Fahrenheit conversion** (displays both °C and °F)
4. **Updated sensor script** to send data to Google Sheets
5. **Restarted service** to apply changes

## 📊 Google Sheet Configuration

- **Sheet Name**: `backporchlogdec1`
- **Credentials File**: `/home/pi/bme680-monitor/sheetsapigardentrack1-5094526407cb.json`
- **Service Account**: `sheetsapigardentrack1serviceac@sheetsapigardentrack1.iam.gserviceaccount.com`

## 📋 Sheet Column Format

The data is appended in this order:
1. **Timestamp** (ISO format)
2. **Temperature (°C)**
3. **Temperature (°F)** ← NEW!
4. **Humidity (%)**
5. **Pressure (hPa)**
6. **Gas (Ω)**
7. **Altitude (m)**

## 🔧 Setup Your Google Sheet Headers

Make sure your Google Sheet (`backporchlogdec1`) has headers in row 1:

```
Timestamp | Temperature (°C) | Temperature (°F) | Humidity (%) | Pressure (hPa) | Gas (Ω) | Altitude (m)
```

## ✅ Verify It's Working

### Check Logs:
```bash
journalctl -u chickencam-bme680.service -f
```

You should see:
- `✓ Data appended to Google Sheet` (every 10 seconds)
- Temperature displayed as: `🌡️ Temperature: X.XX°C (XX.XX°F)`

### Check Your Google Sheet:
- Open: https://sheets.google.com
- Find sheet: `backporchlogdec1`
- New rows should appear every 10 seconds
- Each row has: Timestamp, Temp C, Temp F, Humidity, Pressure, Gas, Altitude

## 🎯 What Happens Now

**Every 10 seconds:**
1. ✅ Sensor reads data
2. ✅ Displays: `Temperature: X.XX°C (XX.XX°F)` ← Shows both!
3. ✅ Sends to Vercel API (batched to GitHub)
4. ✅ Appends to Google Sheet ← NEW!

## 📊 Data Flow

```
Sensor Reading (every 10s)
    ↓
1. Display (with °C and °F)
    ↓
2. Send to Vercel API → Batched to GitHub
    ↓
3. Append to Google Sheet ← NEW!
```

## 🆘 Troubleshooting

**If you see "Google Sheets error":**
1. Check sheet name matches exactly: `backporchlogdec1`
2. Verify sheet is shared with service account email
3. Check credentials file path is correct
4. Check logs for specific error message

**If no data appears in sheet:**
1. Check sheet headers are in row 1
2. Verify service account has "Editor" access
3. Check logs: `journalctl -u chickencam-bme680.service -f`

## 🎉 Done!

Your sensor now:
- ✅ Sends to Vercel API (batched)
- ✅ Appends to Google Sheets (every reading)
- ✅ Shows Fahrenheit alongside Celsius
- ✅ All working automatically!



