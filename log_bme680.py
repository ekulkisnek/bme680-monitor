#!/usr/bin/env python3
import sys
import time
import board
import busio
from adafruit_bme680 import Adafruit_BME680_I2C

try:
    print("Initializing I2C...", flush=True)
    i2c = busio.I2C(board.SCL, board.SDA)
    print("Connecting to BME680...", flush=True)
    sensor = Adafruit_BME680_I2C(i2c, address=0x77)
    sensor.sea_level_pressure = 1013.25
    print("BME680 sensor initialized. Starting readings...\n", flush=True)
    
    while True:
        print(f"Temp: {sensor.temperature:.2f}°C, Humidity: {sensor.relative_humidity:.2f}%, Pressure: {sensor.pressure:.2f}hPa, Gas: {sensor.gas:.0f}Ω, Altitude: {sensor.altitude:.2f}m", flush=True)
        time.sleep(3)
except KeyboardInterrupt:
    print("\nStopped.", flush=True)
except Exception as e:
    print(f"Error: {e}", flush=True, file=sys.stderr)
    import traceback
    traceback.print_exc()

