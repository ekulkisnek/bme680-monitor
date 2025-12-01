# mystreamer.service Fix Summary

**Date**: November 25, 2025  
**Status**: ✅ **COMPLETED**

---

## Changes Made

### 1. ✅ Fixed Service File Path
- **Before**: `/home/pi/chickencam/app.py` (doesn't exist)
- **After**: `/home/pi/chickencam/chickencam/pi_app.py` (correct path)
- **Location**: `/etc/systemd/system/mystreamer.service`

### 2. ✅ Added Dynamic Camera Detection
- **File**: `/home/pi/chickencam/chickencam/pi_app.py`
- **Added**: `detect_cameras()` function that:
  - Automatically detects available USB cameras (indices 0-9)
  - Tests each camera to verify it works
  - Falls back to ffmpeg-based detection if OpenCV fails
  - Falls back to index [1] if no cameras detected
- **Benefit**: No longer hard-coded to camera index 1, handles multiple cameras

### 3. ✅ Improved Service Logging
- Added `StandardOutput=journal` and `StandardError=journal` to service file
- Added `SyslogIdentifier=mystreamer` for easier log filtering
- **Benefit**: Can now see camera detection output and debug issues

### 4. ✅ Enabled Auto-Start on Boot
- Service is enabled: `sudo systemctl enable mystreamer.service`
- **Status**: ✅ Service will start automatically on boot

---

## Current Service Configuration

```ini
[Unit]
Description=Camera Stream Service
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/chickencam
ExecStart=/home/pi/chickencam/venv/bin/python /home/pi/chickencam/chickencam/pi_app.py
Restart=always
StandardOutput=journal
StandardError=journal
SyslogIdentifier=mystreamer

[Install]
WantedBy=multi-user.target
```

---

## Service Status

**Current Status**: Running (with restart policy)  
**Boot Status**: ✅ Enabled (will start on boot)  
**Restart Policy**: Always restart (will retry if camera unavailable)

---

## Camera Detection

The service now automatically detects cameras on startup:
- Checks indices 0-9 for USB cameras
- Tests each camera to verify it can capture frames
- Falls back to ffmpeg detection if OpenCV fails
- Falls back to index [1] if no cameras found

**Detection Output** (visible in logs):
```
🔍 Detecting available cameras...
  ✓ Camera X detected and working
✅ Found N working camera(s): [X, Y, ...]
```

---

## Dual Webcam Support

The dynamic detection will automatically find multiple cameras if they're plugged in. The service will:
1. Detect all available cameras
2. Create WebRTC streams for each detected camera
3. Handle camera initialization sequentially to avoid conflicts

**Note**: If you have issues with 2 webcams:
- Make sure both are USB 2.0+ compatible
- Try plugging them into different USB ports
- Check USB bandwidth (may need USB 3.0 hub)
- The service will retry if cameras aren't immediately available

---

## Monitoring & Debugging

### Check Service Status
```bash
sudo systemctl status mystreamer.service
```

### View Live Logs
```bash
sudo journalctl -u mystreamer.service -f
```

### View Recent Logs
```bash
sudo journalctl -u mystreamer.service --since "10 minutes ago"
```

### Check Camera Detection
```bash
sudo journalctl -u mystreamer.service | grep -E "(Detecting|Found|Camera|✓|⚠️)"
```

### Restart Service
```bash
sudo systemctl restart mystreamer.service
```

---

## Troubleshooting

### Camera Not Detected
1. Check if camera is plugged in: `lsusb | grep -i camera`
2. Check video devices: `ls -la /dev/video*`
3. Verify permissions: `groups pi | grep video` (should show "video")
4. Check if camera is in use: `lsof /dev/video*`

### Service Keeps Restarting
- This is normal if camera isn't available
- Service will keep retrying until camera is plugged in
- Check logs to see why camera initialization fails

### Dual Webcam Issues
- Make sure both cameras are detected (check logs)
- Try unplugging/replugging cameras
- Initialize cameras one at a time (already implemented)
- Check USB bandwidth limitations

---

## Next Steps

1. ✅ Service is fixed and enabled for boot
2. ✅ Dynamic camera detection is implemented
3. ⚠️ **Test with actual webcam(s) plugged in**
4. ⚠️ **Verify WebRTC connection to Vercel server**

The service is now ready and will automatically start on boot. It will detect available cameras and handle multiple cameras if plugged in.

---

## Files Modified

1. `/etc/systemd/system/mystreamer.service` - Fixed path, added logging
2. `/home/pi/chickencam/chickencam/pi_app.py` - Added dynamic camera detection

## Files Created

1. `/home/pi/bme680-monitor/mystreamer-audit-and-streaming-options.md` - Detailed analysis
2. `/home/pi/bme680-monitor/mystreamer-fix-summary.md` - This file
3. `/home/pi/bme680-monitor/fix-mystreamer-service.sh` - Fix script (for reference)






