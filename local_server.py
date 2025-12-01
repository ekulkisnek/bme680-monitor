#!/usr/bin/env python3
"""
Self-Hosted BME680 Monitor Server
Runs directly on Raspberry Pi - no external services needed
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
from pathlib import Path

app = Flask(__name__, static_folder='public', static_url_path='')
CORS(app)  # Allow cross-origin requests

# Configuration
DATA_DIR = Path(__file__).parent / 'data'
DATA_FILE = DATA_DIR / 'sensor-data.json'
MAX_RECORDS = 500

# Ensure data directory exists
DATA_DIR.mkdir(exist_ok=True)

def load_data():
    """Load sensor data from JSON file"""
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_data(data):
    """Save sensor data to JSON file"""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except IOError as e:
        print(f"Error saving data: {e}")
        return False

@app.route('/')
def index():
    """Serve the dashboard HTML"""
    return send_from_directory('public', 'index.html')

@app.route('/api/store', methods=['POST', 'OPTIONS'])
def store_data():
    """Store sensor data"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        sensor_data = request.get_json()
        
        # Validate required fields
        if not sensor_data or not all(k in sensor_data for k in ['temperature', 'humidity', 'pressure']):
            return jsonify({'error': 'Missing required sensor data fields'}), 400
        
        # Add timestamp if not provided
        if 'timestamp' not in sensor_data:
            sensor_data['timestamp'] = datetime.utcnow().isoformat() + 'Z'
        
        # Load existing data
        all_data = load_data()
        
        # Add new reading
        all_data.append(sensor_data)
        
        # Keep only last MAX_RECORDS
        if len(all_data) > MAX_RECORDS:
            all_data = all_data[-MAX_RECORDS:]
        
        # Save data
        if save_data(all_data):
            return jsonify({
                'success': True,
                'message': 'Data stored successfully',
                'timestamp': sensor_data['timestamp'],
                'totalReadings': len(all_data),
                'storageType': 'local'
            }), 200
        else:
            return jsonify({'error': 'Failed to save data'}), 500
            
    except Exception as e:
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

@app.route('/api/data', methods=['GET', 'OPTIONS'])
def get_data():
    """Retrieve sensor data"""
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    
    try:
        # Load data
        readings = load_data()
        
        # Get limit parameter
        limit = request.args.get('limit', type=int)
        if limit and limit > 0:
            readings = readings[-limit:]
        
        return jsonify({
            'success': True,
            'count': len(readings),
            'data': readings,
            'storageType': 'local'
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    data_count = len(load_data())
    return jsonify({
        'status': 'healthy',
        'storage': 'local',
        'totalReadings': data_count,
        'dataFile': str(DATA_FILE)
    }), 200

if __name__ == '__main__':
    print("=" * 60)
    print("BME680 Local Monitor Server")
    print("=" * 60)
    print(f"Data storage: {DATA_FILE}")
    print(f"Dashboard: http://localhost:5000")
    print(f"API: http://localhost:5000/api/data")
    print("=" * 60)
    print("Press Ctrl+C to stop")
    print()
    
    # Run server
    app.run(host='0.0.0.0', port=5000, debug=False)






