#!/usr/bin/env python3
"""
BME680 Sensor Reader for Local Server
Sends data to local Flask server instead of Vercel
"""
import sys
import time
import json
import requests
import board
import busio
from adafruit_bme680 import Adafruit_BME680_I2C
from datetime import datetime

# Configuration
LOCAL_SERVER_URL = 'http://localhost:5000'  # Change to Pi's IP for remote access
SENSOR_UPDATE_INTERVAL = 10
SENSOR_ADDRESS = 0x77

def send_to_local_server(data):
    """Send sensor data to local Flask server"""
    try:
        response = requests.post(
            f'{LOCAL_SERVER_URL}/api/store',
            json=data,
            headers={'Content-Type': 'application/json'},
            timeout=5
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Data sent to local server (Total: {result.get('totalReadings', 0)} readings)")
            return True
        else:
            print(f"✗ Server error: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Cannot connect to local server. Is it running?")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    """Main sensor reading loop"""
    try:
        print("Initializing I2C...", flush=True)
        i2c = busio.I2C(board.SCL, board.SDA)
        print("Connecting to BME680...", flush=True)
        sensor = Adafruit_BME680_I2C(i2c, address=SENSOR_ADDRESS)
        sensor.sea_level_pressure = 1013.25
        print("BME680 sensor initialized. Starting readings...\n", flush=True)
        print(f"Sending data to: {LOCAL_SERVER_URL}\n", flush=True)
        
        while True:
            # Read sensor
            temp = sensor.temperature
            humidity = sensor.relative_humidity
            pressure = sensor.pressure
            gas = sensor.gas
            altitude = sensor.altitude
            
            # Create data object
            sensor_data = {
                'temperature': round(temp, 2),
                'humidity': round(humidity, 2),
                'pressure': round(pressure, 2),
                'gas': int(gas),
                'altitude': round(altitude, 2),
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            
            # Display reading
            print(f"🌡️  {temp:.2f}°C  💧 {humidity:.2f}%  📊 {pressure:.2f}hPa  🫧 {gas:.0f}Ω  ⛰️ {altitude:.2f}m", flush=True)
            
            # Send to local server
            send_to_local_server(sensor_data)
            
            # Wait before next reading
            time.sleep(SENSOR_UPDATE_INTERVAL)
            
    except KeyboardInterrupt:
        print("\n\nStopped by user.", flush=True)
    except Exception as e:
        print(f"\nError: {e}", flush=True, file=sys.stderr)
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()

