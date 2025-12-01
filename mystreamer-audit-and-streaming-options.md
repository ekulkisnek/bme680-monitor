# mystreamer.service Audit & Streaming Options Analysis

**Date**: December 2025  
**Service**: mystreamer.service  
**Issue**: Dual webcam problems + Streaming architecture recommendations

---

## 1. mystreamer.service Audit

### Current Status: ❌ FAILED

**Service Configuration**:
```ini
[Unit]
Description=Camera Stream Service
After=network.target

[Service]
User=pi
WorkingDirectory=/home/pi/chickencam
ExecStart=/home/pi/chickencam/venv/bin/python /home/pi/chickencam/app.py
Restart=always

[Install]
WantedBy=multi-user.target
```

### Problem Identified

**Root Cause**: Service is trying to run `/home/pi/chickencam/app.py` which **does not exist**.

**Actual File Location**: `/home/pi/chickencam/chickencam/pi_app.py`

**Error Logs**:
```
can't open file '/home/pi/chickencam/app.py': [Errno 2] No such file or directory
```

**Impact**: 
- Service fails immediately on startup
- Systemd rate-limited after 5 failed attempts
- Currently not running (no impact on system, but logs errors)

### Fix Required

**Option 1: Update service to point to correct file**
```bash
sudo systemctl edit --full mystreamer.service
# Change ExecStart to:
ExecStart=/home/pi/chickencam/venv/bin/python /home/pi/chickencam/chickencam/pi_app.py
```

**Option 2: Create symlink** (if you want to keep the service as-is)
```bash
ln -s /home/pi/chickencam/chickencam/pi_app.py /home/pi/chickencam/app.py
```

**Option 3: Disable if not needed**
```bash
sudo systemctl disable mystreamer.service
```

---

## 2. Dual Webcam Issue Analysis

### Current Code Configuration

**File**: `/home/pi/chickencam/chickencam/pi_app.py`

**Current Setting** (Line 38):
```python
CAMERA_INDICES = [1]  # Single USB webcam at /dev/video1
```

**Comment**: "Only 1 camera plugged in now - using index 1"

### Why Dual Webcams Fail

#### Issue 1: Hard-coded Camera Index
- Code is hard-coded to use camera index `1` only
- When 2 webcams are plugged in, they may be assigned different indices
- Need dynamic camera detection

#### Issue 2: Camera Device Mapping
- USB webcams can appear at `/dev/video0`, `/dev/video1`, `/dev/video2`, etc.
- The mapping can change when devices are plugged/unplugged
- Index `1` might not always be the correct camera

#### Issue 3: OpenCV/FFmpeg Resource Conflicts
- The code uses both OpenCV (`cv2.VideoCapture`) and FFmpeg fallback
- Multiple cameras accessing resources simultaneously can cause conflicts
- USB bandwidth limitations on Raspberry Pi

### Recommended Fixes for Dual Webcam Support

#### Fix 1: Dynamic Camera Detection
```python
import subprocess
import re

def detect_cameras():
    """Detect available USB cameras"""
    cameras = []
    # Check /dev/video* devices
    result = subprocess.run(['ls', '/dev/video*'], capture_output=True, text=True)
    for device in result.stdout.strip().split('\n'):
        if device:
            # Extract index
            match = re.search(r'/dev/video(\d+)', device)
            if match:
                idx = int(match.group(1))
                # Test if camera works
                cap = cv2.VideoCapture(idx)
                if cap.isOpened():
                    ret, _ = cap.read()
                    if ret:
                        cameras.append(idx)
                    cap.release()
    return sorted(cameras)

# Use detected cameras
CAMERA_INDICES = detect_cameras() or [1]  # Fallback to [1] if none found
```

#### Fix 2: Sequential Camera Initialization
```python
# Initialize cameras one at a time with delays
for idx in CAMERA_INDICES:
    try:
        camera = Camera(idx)
        # Small delay between initializations
        await asyncio.sleep(0.5)
    except Exception as e:
        print(f"Failed to initialize camera {idx}: {e}")
```

#### Fix 3: Use Device Paths Instead of Indices
```python
# More reliable: use /dev/video* paths directly
CAMERA_DEVICES = ['/dev/video1', '/dev/video2']  # Explicit paths
```

#### Fix 4: Add Camera Selection Logic
```python
# Allow specifying which camera to use via environment variable
import os
CAMERA_INDICES = os.getenv('CAMERA_INDICES', '1').split(',')
CAMERA_INDICES = [int(x.strip()) for x in CAMERA_INDICES]
```

---

## 3. Streaming Options for Web Pages

### Current Implementation: WebRTC (Peer-to-Peer)

**How it works**:
- Raspberry Pi creates WebRTC offer
- Sends offer to Vercel server
- Browser fetches offer, creates answer
- Direct peer-to-peer connection established
- Video streams directly from Pi to browser (bypasses Vercel)

**Pros**:
- ✅ Low latency (direct connection)
- ✅ No server bandwidth usage
- ✅ Works with Vercel free tier (only signaling, not streaming)
- ✅ Good for real-time streaming

**Cons**:
- ⚠️ Requires STUN/TURN servers for NAT traversal
- ⚠️ Complex setup
- ⚠️ May fail behind strict firewalls

---

### Option 1: Frame-by-Frame HTTP (MJPEG Stream)

**How it works**:
- Pi captures frames continuously
- Sends frames as JPEG images via HTTP
- Browser requests frames periodically or uses multipart stream
- Simple HTTP requests, no WebRTC

**Implementation**:
```python
# On Pi (Flask/FastAPI server)
@app.route('/stream')
def stream():
    def generate():
        while True:
            ret, frame = camera.read()
            if ret:
                _, buffer = cv2.imencode('.jpg', frame)
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + 
                       buffer.tobytes() + b'\r\n')
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')
```

```html
<!-- On webpage -->
<img src="http://pi-ip:port/stream" />
```

**Pros**:
- ✅ Simple to implement
- ✅ Works everywhere (standard HTTP)
- ✅ No WebRTC complexity
- ✅ Can use Vercel as proxy (if update frequency is low)

**Cons**:
- ⚠️ Higher latency (HTTP overhead)
- ⚠️ More bandwidth (JPEG compression per frame)
- ⚠️ Not ideal for high FPS

**Vercel Free Tier**: ⚠️ **Problematic** - Serverless functions have 10s timeout (Hobby) or 60s (Pro). Can't maintain long-lived connections.

---

### Option 2: Periodic Image Updates (Snapshot API)

**How it works**:
- Pi captures frame every N seconds
- Uploads JPEG to Vercel API endpoint
- Vercel stores/returns latest image
- Browser polls Vercel for latest image

**Implementation**:
```python
# On Pi - upload latest frame
import base64
import requests

def upload_frame():
    ret, frame = camera.read()
    if ret:
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        requests.post('https://your-app.vercel.app/api/frame', json={
            'image': img_base64,
            'timestamp': time.time()
        })
```

```javascript
// Vercel API endpoint
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Store latest frame
    // Could use Vercel KV, or just return it
    return res.json({ success: true });
  } else {
    // Return latest frame
    return res.json({ image: latestFrame });
  }
}
```

```html
<!-- Browser - poll for updates -->
<script>
setInterval(async () => {
  const response = await fetch('/api/frame');
  const data = await response.json();
  document.getElementById('camera').src = 'data:image/jpeg;base64,' + data.image;
}, 2000); // Update every 2 seconds
</script>
```

**Pros**:
- ✅ Works perfectly with Vercel free tier
- ✅ Simple HTTP requests
- ✅ Can control update frequency
- ✅ No long-lived connections

**Cons**:
- ⚠️ Not real-time (depends on poll interval)
- ⚠️ Higher bandwidth (base64 encoding overhead)
- ⚠️ Requires storage for latest frame

**Vercel Free Tier**: ✅ **Perfect fit** - Short-lived API calls, no streaming needed.

---

### Option 3: WebSocket Streaming (Requires Separate Server)

**How it works**:
- Pi runs WebSocket server
- Browser connects via WebSocket
- Pi sends frames continuously
- Real-time bidirectional communication

**Implementation**:
```python
# On Pi - WebSocket server (requires separate server, can't use Vercel)
import asyncio
import websockets
import cv2
import base64

async def stream_handler(websocket, path):
    camera = cv2.VideoCapture(0)
    while True:
        ret, frame = camera.read()
        if ret:
            _, buffer = cv2.imencode('.jpg', frame)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            await websocket.send(img_base64)
        await asyncio.sleep(0.033)  # ~30 FPS

start_server = websockets.serve(stream_handler, "0.0.0.0", 8765)
asyncio.get_event_loop().run_until_complete(start_server)
```

**Pros**:
- ✅ Real-time streaming
- ✅ Lower latency than HTTP polling
- ✅ Efficient binary data transfer

**Cons**:
- ❌ **Can't use Vercel** - Requires persistent server connection
- ⚠️ Need separate server (not serverless)
- ⚠️ More complex setup

**Vercel Free Tier**: ❌ **Not possible** - Vercel serverless functions can't maintain WebSocket connections.

---

### Option 4: HLS (HTTP Live Streaming) - Advanced

**How it works**:
- Pi creates video segments using FFmpeg
- Uploads segments to storage (S3, Cloudflare R2, etc.)
- Browser uses HLS.js to play segments
- Creates playlist file pointing to segments

**Pros**:
- ✅ Industry standard
- ✅ Adaptive bitrate
- ✅ Works with CDN

**Cons**:
- ⚠️ Complex setup
- ⚠️ Requires storage service
- ⚠️ Higher latency (segment-based)

**Vercel Free Tier**: ⚠️ **Partial** - Can serve playlist/segments, but need external storage.

---

### Option 5: RTSP/RTMP → Cloud Service → Web

**How it works**:
- Pi streams to cloud service (YouTube Live, Twitch, Cloudflare Stream, etc.)
- Embed cloud player on webpage
- Cloud handles transcoding and delivery

**Pros**:
- ✅ Professional quality
- ✅ Handles scaling
- ✅ CDN delivery

**Cons**:
- ⚠️ Cost (may have free tiers)
- ⚠️ External dependency
- ⚠️ More setup

**Vercel Free Tier**: ✅ **Works** - Just embed iframe, no Vercel processing needed.

---

## 4. Vercel Free Tier Limitations

### Key Constraints

1. **Function Execution Time**:
   - **Hobby (Free)**: 10 seconds max
   - **Pro**: 60 seconds max
   - **Impact**: Can't maintain long-lived streaming connections

2. **Concurrent Functions**:
   - **Hobby**: Limited concurrent executions
   - **Impact**: May throttle under load

3. **Bandwidth**:
   - **Hobby**: 100 GB/month
   - **Impact**: Streaming video can consume quickly

4. **No Persistent Connections**:
   - Serverless functions are stateless
   - Can't maintain WebSocket or long HTTP connections
   - Each request is independent

### What Works with Vercel Free Tier

✅ **Short-lived API calls** (snapshot uploads, frame polling)  
✅ **Static file serving** (pre-uploaded images)  
✅ **WebRTC signaling** (current implementation - only signaling, not streaming)  
✅ **REST APIs** (frame upload/download endpoints)

### What Doesn't Work

❌ **Long-lived streaming** (MJPEG multipart, WebSocket)  
❌ **Real-time bidirectional communication** (requires persistent connection)  
❌ **High-frequency updates** (bandwidth limits)

---

## 5. How Update Frequency Changes Options

### High Frequency (Real-time, 30 FPS)

**Best Options**:
1. **WebRTC** (current) - Direct Pi → Browser, bypasses Vercel ✅
2. **RTSP/RTMP → Cloud** - Professional solution ✅
3. **WebSocket** - Requires separate server ❌ (can't use Vercel)

**Vercel Role**: Only for signaling (WebRTC) or static page hosting

---

### Medium Frequency (1-5 FPS)

**Best Options**:
1. **Periodic Snapshot API** - Upload frame every 1-5 seconds ✅
   - Pi → Vercel API (POST frame)
   - Browser → Vercel API (GET latest frame)
   - Works perfectly with Vercel free tier

2. **MJPEG Stream** - If you run separate server on Pi ✅
   - Can't proxy through Vercel (timeout)
   - But can embed `<img src="http://pi-ip/stream">` in Vercel-hosted page

**Vercel Role**: API for frame storage/retrieval

---

### Low Frequency (Every 10+ seconds)

**Best Options**:
1. **Periodic Snapshot API** - Perfect fit ✅
   - Very efficient with Vercel free tier
   - Low bandwidth usage
   - Simple implementation

2. **Static Image Updates** - Upload to Vercel storage ✅
   - Update image file periodically
   - Serve as static asset
   - Zero serverless function costs

**Vercel Role**: Perfect for this use case - minimal costs, simple implementation

---

## 6. Recommendations

### For Your Current Setup (Dual Webcam Issue)

1. **Fix mystreamer.service**:
   ```bash
   sudo systemctl edit --full mystreamer.service
   # Update ExecStart to correct path
   ```

2. **Add Dynamic Camera Detection**:
   - Modify `pi_app.py` to detect available cameras
   - Don't hard-code camera indices
   - Add fallback logic if cameras aren't found

3. **Test Dual Camera Setup**:
   - Use the existing `test_dual_stream.py` script
   - Verify both cameras can be accessed concurrently
   - Check USB bandwidth (may need USB 3.0 hub)

### For Streaming Architecture

**If you need real-time streaming (30 FPS)**:
- ✅ **Keep WebRTC** (current implementation)
- Fix dual camera support
- Ensure STUN/TURN servers are configured

**If you can accept lower frequency (1-5 FPS)**:
- ✅ **Switch to Periodic Snapshot API**
- Much simpler implementation
- Works perfectly with Vercel free tier
- Lower bandwidth usage
- Easier to debug

**If updates are infrequent (10+ seconds)**:
- ✅ **Periodic Snapshot API** is ideal
- Or even simpler: upload image file to Vercel storage
- Serve as static asset

### Recommended Implementation: Periodic Snapshot API

**Why this is best for Vercel free tier**:
- ✅ No long-lived connections
- ✅ Short API calls (< 1 second each)
- ✅ Works within execution time limits
- ✅ Simple to implement
- ✅ Easy to scale update frequency

**Architecture**:
```
Pi → Capture Frame → Upload to Vercel API → Store in KV/Memory
Browser → Poll Vercel API → Get Latest Frame → Display
```

**Update Frequency**: Adjustable (1-10 seconds recommended)

---

## 7. Implementation Example: Periodic Snapshot API

### Pi Side (Python)

```python
import cv2
import requests
import base64
import time

def capture_and_upload():
    camera = cv2.VideoCapture(1)  # Or detect dynamically
    while True:
        ret, frame = camera.read()
        if ret:
            # Resize to reduce bandwidth
            frame = cv2.resize(frame, (640, 480))
            
            # Encode as JPEG
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Upload to Vercel
            try:
                response = requests.post(
                    'https://your-app.vercel.app/api/frame',
                    json={
                        'image': img_base64,
                        'timestamp': time.time(),
                        'camera_index': 1
                    },
                    timeout=5
                )
                if response.ok:
                    print(f"✓ Frame uploaded at {time.time()}")
            except Exception as e:
                print(f"✗ Upload failed: {e}")
        
        time.sleep(2)  # Update every 2 seconds

if __name__ == '__main__':
    capture_and_upload()
```

### Vercel API (`api/frame.js`)

```javascript
// Store latest frame (could use Vercel KV for persistence)
let latestFrame = null;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Store latest frame
    latestFrame = {
      image: req.body.image,
      timestamp: req.body.timestamp,
      camera_index: req.body.camera_index
    };
    return res.status(200).json({ success: true });
  } else {
    // Return latest frame
    if (latestFrame) {
      return res.status(200).json(latestFrame);
    } else {
      return res.status(404).json({ error: 'No frame available' });
    }
  }
}
```

### Browser Side (HTML/JS)

```html
<img id="camera" style="max-width: 100%;" />

<script>
async function updateFrame() {
  try {
    const response = await fetch('/api/frame');
    if (response.ok) {
      const data = await response.json();
      document.getElementById('camera').src = 
        'data:image/jpeg;base64,' + data.image;
    }
  } catch (error) {
    console.error('Failed to update frame:', error);
  }
}

// Update every 2 seconds
setInterval(updateFrame, 2000);
updateFrame(); // Initial load
</script>
```

---

## Summary

1. **mystreamer.service**: Fix path to `/home/pi/chickencam/chickencam/pi_app.py`
2. **Dual Webcam**: Add dynamic camera detection, don't hard-code indices
3. **Streaming**: For Vercel free tier, use **Periodic Snapshot API** (best fit)
4. **Update Frequency**: Lower frequency = better fit for Vercel free tier
5. **Current WebRTC**: Keep if you need real-time, but it's more complex

**Recommended Path Forward**:
- Fix service path
- Add camera detection
- Consider switching to snapshot API if real-time isn't critical
- Much simpler, works perfectly with Vercel free tier






