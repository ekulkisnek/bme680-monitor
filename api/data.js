// API endpoint to retrieve historical BME680 sensor data

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Shared memory store (fallback if KV not configured)
let memoryStore = {
  data: [],
  lastUpdated: null
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
    
    // Try to use Vercel KV if configured
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
      
      console.log(`Retrieved ${readings.length} readings from KV`);
      
    } catch (kvError) {
      // Fallback: Use in-memory storage
      console.log('KV not configured, using in-memory storage');
      readings = memoryStore.data || [];
      console.log(`Retrieved ${readings.length} readings from memory`);
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
        data: limitedReadings
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

