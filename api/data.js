// API endpoint to retrieve historical BME680 sensor data

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let readings = [];
    let storageType = 'unknown';
    
    // Try to use Vercel KV if configured
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { createClient } = await import('@vercel/kv');
        const kv = createClient({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        });
        
        readings = await kv.get('bme680_readings') || [];
        
        if (!Array.isArray(readings)) {
          readings = [];
        }
        
        storageType = 'kv';
        console.log(`Retrieved ${readings.length} readings from KV`);
        
      } catch (kvError) {
        console.error('KV retrieval error:', kvError.message);
      }
    }
    
    // If KV not available, try Upstash REST API
    if (storageType === 'unknown' && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/bme680_readings`, {
          headers: {
            'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.result) {
            readings = JSON.parse(data.result);
            storageType = 'upstash';
            console.log(`Retrieved ${readings.length} readings from Upstash`);
          }
        }
      } catch (upstashError) {
        console.error('Upstash retrieval error:', upstashError.message);
      }
    }

    // Get limit parameter
    const limit = parseInt(req.query.limit) || readings.length;
    const limitedReadings = readings.slice(-limit);

    // Return data with CORS headers
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({
        success: true,
        count: limitedReadings.length,
        data: limitedReadings,
        storageType: storageType
      });
      
  } catch (error) {
    console.error('Error retrieving sensor data:', error);
    return res.status(500)
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ 
        error: 'Internal server error', 
        message: error.message 
      });
  }
}
