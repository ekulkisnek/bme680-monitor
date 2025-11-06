// API endpoint to store BME680 sensor data
// This endpoint receives POST requests from the Raspberry Pi

const MAX_RECORDS = 1000; // Keep last 1000 readings

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sensorData = req.body;
    
    // Validate required fields
    if (sensorData.temperature === undefined || 
        sensorData.humidity === undefined || 
        sensorData.pressure === undefined) {
      return res.status(400).json({ error: 'Missing required sensor data fields' });
    }

    // Add server-side timestamp if not provided
    if (!sensorData.timestamp) {
      sensorData.timestamp = new Date().toISOString();
    }

    let allData = [];
    let storageType = 'unknown';
    
    // Try to use Vercel KV if configured
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { createClient } = await import('@vercel/kv');
        const kv = createClient({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        });
        
        const existingData = await kv.get('bme680_readings') || [];
        allData = Array.isArray(existingData) ? existingData : [];
        
        // Add new reading
        allData.push(sensorData);
        
        // Keep only last MAX_RECORDS
        if (allData.length > MAX_RECORDS) {
          allData = allData.slice(-MAX_RECORDS);
        }
        
        // Store back to KV
        await kv.set('bme680_readings', allData);
        await kv.set('bme680_last_updated', sensorData.timestamp);
        
        storageType = 'kv';
        console.log(`Stored data to KV: ${allData.length} total readings`);
        
      } catch (kvError) {
        console.error('KV storage error:', kvError.message);
        // Fall through to alternative storage
      }
    }
    
    // If KV not available/configured, use Upstash REST API as fallback
    if (storageType === 'unknown') {
      try {
        // Try Upstash REST API (free tier available)
        const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
        const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
        
        if (UPSTASH_URL && UPSTASH_TOKEN) {
          // Get existing data
          const getResponse = await fetch(`${UPSTASH_URL}/get/bme680_readings`, {
            headers: {
              'Authorization': `Bearer ${UPSTASH_TOKEN}`
            }
          });
          
          if (getResponse.ok) {
            const getData = await getResponse.json();
            allData = getData.result ? JSON.parse(getData.result) : [];
          }
          
          // Add new reading
          allData.push(sensorData);
          
          // Keep only last MAX_RECORDS
          if (allData.length > MAX_RECORDS) {
            allData = allData.slice(-MAX_RECORDS);
          }
          
          // Store back
          await fetch(`${UPSTASH_URL}/set/bme680_readings`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${UPSTASH_TOKEN}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(JSON.stringify(allData))
          });
          
          storageType = 'upstash';
          console.log(`Stored data to Upstash: ${allData.length} total readings`);
        }
      } catch (upstashError) {
        console.error('Upstash storage error:', upstashError.message);
      }
    }

    // Return success (even if storage isn't persistent, at least acknowledge receipt)
    return res.status(200).json({ 
      success: true, 
      message: 'Data stored successfully',
      timestamp: sensorData.timestamp,
      totalReadings: allData.length,
      storageType: storageType,
      note: storageType === 'unknown' ? 'Configure KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN for persistent storage' : undefined
    });
    
  } catch (error) {
    console.error('Error storing sensor data:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
