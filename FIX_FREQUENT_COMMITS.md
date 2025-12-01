# Fix: Too Frequent GitHub Commits

## 🚨 Problem

Your sensor script (`/home/pi/chickencam/chickencam/bme680_sensor.py`) is committing to GitHub **on every reading** (every 10 seconds), bypassing the batched API.

**Current behavior:**
- Sensor reads every 10 seconds
- Commits directly to GitHub every 10 seconds
- **Result**: ~8,640 commits/day ❌

**What you're seeing:**
- Website shows readings every ~11-12 seconds (normal)
- But each reading triggers a GitHub commit (not batched)
- This will hit GitHub limits fast!

## ✅ Solution: Remove Direct GitHub Commits

The Vercel API already handles batching. You should **only** send to the Vercel API, not commit directly to GitHub.

### Option 1: Remove Direct GitHub Storage (Recommended)

Edit the sensor script to only use Vercel API:

```python
# Remove or comment out the direct GitHub commit
# github_ok = store_to_github(data)  # ❌ REMOVE THIS

# Only send to Vercel API (which batches)
if self.send_to_server(data):
    print(f"  ✓ Data sent to Vercel API")
```

### Option 2: Implement Batching in Sensor Script

If you want to keep direct GitHub storage, add batching:

```python
# At top of file
pending_readings = []
last_commit = time.time()
BATCH_SIZE = 100
BATCH_INTERVAL = 3600  # 1 hour

# In run() loop:
pending_readings.append(data)

if len(pending_readings) >= BATCH_SIZE or (time.time() - last_commit) >= BATCH_INTERVAL:
    # Commit batch
    for reading in pending_readings:
        store_to_github(reading)
    pending_readings = []
    last_commit = time.time()
```

## 🎯 Recommended Fix

**Remove direct GitHub commits** - Let Vercel API handle everything with batching.

The Vercel API:
- ✅ Batches commits (every 100 readings or 1 hour)
- ✅ Reduces commits from 8,640/day to 24/day
- ✅ Already configured and working

---

## 📝 Quick Fix Steps

1. **Edit sensor script:**
   ```bash
   sudo nano /home/pi/chickencam/chickencam/bme680_sensor.py
   ```

2. **Comment out or remove line 169:**
   ```python
   # github_ok = store_to_github(data)  # REMOVED - using Vercel API batching instead
   ```

3. **Restart service:**
   ```bash
   sudo systemctl restart chickencam-bme680.service
   ```

4. **Verify:**
   ```bash
   journalctl -u chickencam-bme680.service -f
   ```
   Should see: "✓ Data sent to Vercel API" but NO "✓ Data stored to GitHub"

---

## 📊 Expected Result

**Before:**
- Commits: ~8,640/day (every 10 seconds)
- API calls: ~17,280/day
- Risk: ❌ Hitting limits

**After:**
- Commits: ~24/day (batched)
- API calls: ~48/day
- Risk: ✅ Well within limits

---

**You don't need to unplug the Pi** - just remove the direct GitHub commit from the sensor script!





