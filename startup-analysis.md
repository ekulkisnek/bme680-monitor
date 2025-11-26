# Raspberry Pi Startup Services Analysis

## Complete List of All 36 Enabled Services

### ✅ Running Services (26 total)

| # | Service Name | Status | Purpose |
|---|--------------|--------|---------|
| 1 | **accounts-daemon.service** | ✅ Running | User account management for GUI |
| 2 | **avahi-daemon.service** | ✅ Running | mDNS/DNS-SD network discovery (Bonjour) |
| 3 | **bluetooth.service** | ✅ Running | Bluetooth support |
| 4 | **chickencam-bme680.service** | ✅ Running | **BME680 sensor reader (your project)** |
| 5 | **console-setup.service** | ✅ Running | Console keyboard setup |
| 6 | **containerd.service** | ✅ Running | Container runtime (for Docker) |
| 7 | **cron.service** | ✅ Running | Scheduled task daemon |
| 8 | **cups-browsed.service** | ✅ Running | Network printer discovery |
| 9 | **cups.service** | ✅ Running | Printing system daemon |
| 10 | **docker.service** | ✅ Running | Docker container engine |
| 11 | **dphys-swapfile.service** | ✅ Running | Swap file management |
| 12 | **fake-hwclock.service** | ✅ Running | Hardware clock emulation |
| 13 | **glamor-test.service** | ✅ Running | Graphics acceleration test |
| 14 | **keyboard-setup.service** | ✅ Running | Keyboard configuration |
| 15 | **lightdm.service** | ✅ Running | Desktop GUI login manager |
| 16 | **ModemManager.service** | ✅ Running | Mobile modem management |
| 17 | **networking.service** | ✅ Running | Network interface configuration |
| 18 | **NetworkManager.service** | ✅ Running | Network connection manager |
| 19 | **NetworkManager-wait-online.service** | ✅ Running | Waits for network connectivity |
| 20 | **rp1-test.service** | ✅ Running | Raspberry Pi hardware test |
| 21 | **rpi-eeprom-update.service** | ✅ Running | Raspberry Pi EEPROM updates |
| 22 | **ssh.service** | ✅ Running | SSH remote access server |
| 23 | **systemd-timesyncd.service** | ✅ Running | Network time synchronization |
| 24 | **triggerhappy.service** | ✅ Running | Global hotkey daemon |
| 25 | **udisks2.service** | ✅ Running | USB/disk auto-mounting |
| 26 | **wpa_supplicant.service** | ✅ Running | Wi-Fi authentication |

### ⏸️ Enabled But Not Running (10 total)

| # | Service Name | Status | Purpose |
|---|--------------|--------|---------|
| 27 | **apparmor.service** | ⏸️ Enabled | Security framework (loads on demand) |
| 28 | **e2scrub_reap.service** | ⏸️ Enabled | Filesystem check (timer-based) |
| 29 | **getty@.service** | ⏸️ Enabled | Console login (spawns on demand) |
| 30 | **hciuart.service** | ⏸️ Enabled | Bluetooth UART (loads on demand) |
| 31 | **mystreamer.service** | ⏸️ Enabled | **Camera stream service (FAILED)** |
| 32 | **NetworkManager-dispatcher.service** | ⏸️ Enabled | Network event dispatcher (loads on demand) |
| 33 | **rpi-display-backlight.service** | ⏸️ Enabled | Display backlight control (shutdown only) |
| 34 | **sshswitch.service** | ⏸️ Enabled | SSH switching utility (loads on demand) |
| 35 | **systemd-pstore.service** | ⏸️ Enabled | Persistent storage for kernel logs |
| 36 | **wayvnc-control.service** | ⏸️ Enabled | VNC control service (inactive) |

---

## Detailed Explanation: Custom Project Services

### 🐔 chickencam-bme680.service

**Status**: ✅ **Running and Active**

**Purpose**: This is your main BME680 environmental sensor monitoring service. It continuously reads temperature, humidity, pressure, and gas resistance from a BME680 sensor connected to your Raspberry Pi.

**What it does**:
- Reads sensor data every 10 seconds (`SENSOR_UPDATE_INTERVAL = 10`)
- Sends data to Vercel API endpoint (`https://bme680-monitor.vercel.app`)
- Stores data directly to GitHub repository (`ekulkisnek/bme680-monitor`) as backup
- Maintains up to 500 sensor readings in `sensor-data.json`
- Logs readings with emoji indicators (🌡️ temperature, 💧 humidity, 📊 pressure, 🫧 gas, ⛰️ altitude)

**Service Configuration**:
- **User**: `pi`
- **Working Directory**: `/home/pi/chickencam/chickencam`
- **Executable**: `/home/pi/chickencam/venv/bin/python3 /home/pi/chickencam/chickencam/bme680_sensor.py`
- **Restart Policy**: Always restart (with 10 second delay)
- **Startup**: After network is available

**Current Status**:
- Running since: Wed 2025-11-05 21:42:59 CST (2+ weeks uptime)
- Process ID: 769
- CPU Usage: 22+ minutes total
- Status: Successfully storing data to GitHub (500 total readings)

**Recommendation**: ✅ **KEEP ENABLED** - This is your core project functionality. Disabling it would stop all sensor monitoring.

---

### 📹 mystreamer.service

**Status**: ❌ **Enabled but FAILED** (not running)

**Purpose**: This service was intended to run a camera streaming application (`app.py`) for your "Chicken Cam" project.

**What it's supposed to do**:
- Start a camera stream service after network is available
- Run Python application from `/home/pi/chickencam/app.py`
- Provide camera streaming functionality

**Service Configuration**:
- **User**: `pi`
- **Working Directory**: `/home/pi/chickencam`
- **Executable**: `/home/pi/chickencam/venv/bin/python /home/pi/chickencam/app.py`
- **Restart Policy**: Always restart

**Why it's failing**:
The service fails immediately on startup with error:
```
can't open file '/home/pi/chickencam/app.py': [Errno 2] No such file or directory
```

**Root Cause**: The file `/home/pi/chickencam/app.py` does not exist. The service was configured to run this file, but it appears to have been removed, renamed, or never created.

**Current State**:
- Service is enabled but has failed 5 times
- Systemd stopped trying to restart it (rate limiting)
- No impact on boot time (fails immediately, doesn't block startup)
- Uses minimal resources (just failed attempts)

**Recommendation**: 
1. **Option A** - If you need camera streaming:
   - Find or create the `app.py` file
   - Or update the service to point to the correct file (possibly `pi_app.py` which exists)
   - Fix the service configuration

2. **Option B** - If camera streaming is not needed:
   - Disable the service: `sudo systemctl disable mystreamer.service`
   - This will clean up the error logs and prevent failed restart attempts

**Impact**: Currently has **zero impact** on boot time since it fails immediately, but disabling it will clean up logs and prevent unnecessary restart attempts.

---

## Current Boot Performance
- **Total boot time**: ~22 seconds (2.85s kernel + 19.05s userspace)
- **Graphical target reached**: 19.0 seconds

## Top Startup Time Consumers
1. **NetworkManager-wait-online.service**: 7.014s (waits for network)
2. **e2scrub_reap.service**: 6.952s (filesystem check)
3. **docker.service**: 6.387s (Docker daemon)
4. **apt-daily-upgrade.service**: 5.551s (package updates)
5. **fstrim.service**: 2.856s (SSD trim)
6. **containerd.service**: 2.856s (container runtime)

---

## Service Analysis by Category

### 🔴 ESSENTIAL - DO NOT DISABLE
These services are critical for basic system operation:

| Service | Purpose | Impact if Disabled |
|---------|---------|-------------------|
| **ssh.service** | Remote SSH access | ❌ Lose remote access |
| **NetworkManager.service** | Network connectivity | ❌ No internet/network |
| **systemd-timesyncd.service** | Time synchronization | ⚠️ Clock may drift |
| **cron.service** | Scheduled tasks | ⚠️ Cron jobs won't run |
| **getty@.service** | Console login | ❌ Can't login locally |
| **systemd-udevd.service** | Device management | ❌ Hardware won't work |
| **dbus.service** | Inter-process communication | ❌ System won't boot properly |

**Estimated speedup if disabled**: 0s (don't disable these!)

---

### 🟡 CUSTOM PROJECT SERVICES - REQUIRED FOR YOUR PROJECT
These are specific to your BME680 monitoring project:

| Service | Purpose | Status | Impact if Disabled |
|---------|---------|--------|-------------------|
| **chickencam-bme680.service** | BME680 sensor reader | ✅ Running | ❌ **Lose sensor monitoring** |
| **mystreamer.service** | Camera stream service | ❌ Failed (not running) | ⚠️ Already disabled (failed) |

**Recommendation**: 
- Keep `chickencam-bme680.service` - it's your main project
- Fix or disable `mystreamer.service` - it's failing anyway

**Estimated speedup if disabled**: ~0.1s (minimal, but you'd lose functionality)

---

### 🟠 OPTIONAL BUT USEFUL - CONSIDER KEEPING
These provide useful features but aren't strictly necessary:

| Service | Purpose | Startup Time | Impact if Disabled | Speedup |
|---------|---------|--------------|-------------------|---------|
| **lightdm.service** | Desktop GUI login | 1.121s | ❌ No graphical desktop | ~1-2s |
| **udisks2.service** | Auto-mount USB drives | 1.548s | ⚠️ Manual mount required | ~1.5s |
| **accounts-daemon.service** | User account management | 889ms | ⚠️ Some GUI features break | ~0.9s |
| **polkit.service** | Authorization framework | 825ms | ⚠️ Some admin tasks harder | ~0.8s |
| **triggerhappy.service** | Global hotkeys | <100ms | ⚠️ Hotkeys won't work | <0.1s |

**Total potential speedup**: ~4-5 seconds
**Recommendation**: Disable if you don't need GUI or USB auto-mount

---

### 🟢 OPTIONAL - CAN SAFELY DISABLE
These can be disabled without breaking core functionality:

| Service | Purpose | Startup Time | Impact if Disabled | Speedup |
|---------|---------|--------------|-------------------|---------|
| **docker.service** | Docker containers | 6.387s | ⚠️ Docker won't work | **~6.4s** |
| **containerd.service** | Container runtime | 2.856s | ⚠️ Required by Docker | **~2.9s** |
| **cups.service** | Printing system | <100ms | ⚠️ Can't print | <0.1s |
| **cups-browsed.service** | Network printer discovery | <100ms | ⚠️ Network printers won't auto-discover | <0.1s |
| **bluetooth.service** | Bluetooth support | <100ms | ⚠️ Bluetooth won't work | <0.1s |
| **avahi-daemon.service** | mDNS/Bonjour | 645ms | ⚠️ Network discovery won't work | ~0.6s |
| **ModemManager.service** | Mobile modem management | 1.755s | ⚠️ Mobile modems won't work | ~1.8s |
| **wayvnc-control.service** | VNC control | Inactive | None (already inactive) | 0s |
| **rpi-display-backlight.service** | Display backlight control | Inactive | None (already inactive) | 0s |
| **sshswitch.service** | SSH switch utility | <100ms | ⚠️ SSH switching feature lost | <0.1s |

**Total potential speedup**: ~12-13 seconds
**Recommendation**: 
- **Disable Docker** if not using containers: **~9.3s speedup** (docker + containerd)
- Disable printing services if no printer: ~0.2s
- Disable Bluetooth if not using: ~0.1s
- Disable Avahi if not needed: ~0.6s
- Disable ModemManager if no mobile modem: ~1.8s

---

### 🔵 SYSTEM MAINTENANCE - TIMER-BASED (NOT STARTUP BLOCKING)
These run periodically but don't block startup:

| Service | Purpose | When It Runs | Impact if Disabled |
|---------|---------|--------------|-------------------|
| **apt-daily.service** | Daily package updates | Timer-based | ⚠️ Won't auto-update |
| **apt-daily-upgrade.service** | Package upgrades | Timer-based | ⚠️ Won't auto-upgrade |
| **fstrim.service** | SSD trim (if using SSD) | Timer-based | ⚠️ SSD may slow over time |
| **e2scrub_reap.service** | Filesystem check | Timer-based | ⚠️ Filesystem errors may go undetected |

**Note**: These show up in `systemd-analyze blame` but don't block boot - they run in background.
**Speedup**: 0s (they don't block startup)

---

## Recommended Optimizations

### 🚀 Quick Wins (High Impact, Low Risk)

1. **Disable Docker** (if not using containers):
   ```bash
   sudo systemctl disable docker.service containerd.service
   ```
   **Speedup**: ~9.3 seconds ⚡

2. **Disable ModemManager** (if no mobile modem):
   ```bash
   sudo systemctl disable ModemManager.service
   ```
   **Speedup**: ~1.8 seconds

3. **Disable Avahi** (if not using network discovery):
   ```bash
   sudo systemctl disable avahi-daemon.service
   ```
   **Speedup**: ~0.6 seconds

4. **Disable Printing Services** (if no printer):
   ```bash
   sudo systemctl disable cups.service cups-browsed.service
   ```
   **Speedup**: ~0.2 seconds

5. **Disable Bluetooth** (if not using):
   ```bash
   sudo systemctl disable bluetooth.service
   ```
   **Speedup**: ~0.1 seconds

**Total Quick Win Speedup**: ~12 seconds (from ~22s to ~10s boot time)

### 🎯 Medium Impact (If You Don't Need GUI)

6. **Disable Desktop Environment** (if running headless):
   ```bash
   sudo systemctl disable lightdm.service
   sudo systemctl set-default multi-user.target
   ```
   **Speedup**: ~1-2 seconds

7. **Disable USB Auto-mount**:
   ```bash
   sudo systemctl disable udisks2.service
   ```
   **Speedup**: ~1.5 seconds

**Total Medium Impact Speedup**: ~2.5-3.5 seconds

### ⚠️ Fix Failed Service

8. **Fix or Disable mystreamer.service** (currently failing):
   ```bash
   # Check why it's failing:
   sudo journalctl -u mystreamer.service -n 50
   
   # If not needed, disable it:
   sudo systemctl disable mystreamer.service
   ```

---

## Summary

### Current State
- **36 enabled services**
- **26 running services**
- **Boot time**: ~22 seconds
- **1 failed service** (mystreamer.service)

### Maximum Potential Speedup
- **Conservative** (disable Docker + optional services): ~12 seconds → **~10s boot time**
- **Aggressive** (also disable GUI): ~15 seconds → **~7s boot time**

### Priority Actions
1. ✅ **Disable Docker** if not using (biggest impact: ~9.3s)
2. ✅ **Disable ModemManager** if no mobile modem (~1.8s)
3. ✅ **Fix or disable mystreamer.service** (currently failing)
4. ⚠️ **Disable GUI** if running headless (~1-2s)

---

## Commands to Review Before Disabling

```bash
# Check what Docker containers are running:
docker ps -a

# Check if Bluetooth devices are connected:
bluetoothctl devices

# Check if printers are configured:
lpstat -p

# Check if you're using network discovery:
avahi-browse -a
```

---

## How to Disable Services

```bash
# Disable a service (won't start on next boot):
sudo systemctl disable <service-name>

# Stop a service immediately (without disabling):
sudo systemctl stop <service-name>

# Re-enable if needed:
sudo systemctl enable <service-name>
sudo systemctl start <service-name>
```

