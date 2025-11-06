// API endpoint to store BME680 sensor data
// This endpoint receives POST requests from the Raspberry Pi

const MAX_RECORDS = 1000; // Keep last 1000 readings

// In-memory storage (persists per serverless function instance)
// Note: For production, configure Vercel KV for persistent storage
let memoryStore = {
  data: [],
  lastUpdated: null
};

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
    
    // Try to use Vercel KV if configured
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
      
      console.log(`Stored data to KV: ${allData.length} total readings`);
      
    } catch (kvError) {
      // Fallback: Use in-memory storage
      console.log('KV not configured, using in-memory storage');
      
      // Use memory store
      allData = memoryStore.data || [];
      allData.push(sensorData);
      
      // Keep only last MAX_RECORDS
      if (allData.length > MAX_RECORDS) {
        allData = allData.slice(-MAX_RECORDS);
      }
      
      memoryStore.data = allData;
      memoryStore.lastUpdated = sensorData.timestamp;
      
      console.log(`Stored data to memory: ${allData.length} total readings`);
    }

    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Data stored successfully',
      timestamp: sensorData.timestamp,
      totalReadings: allData.length
    });
    
  } catch (error) {
    console.error('Error storing sensor data:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

