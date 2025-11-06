// API endpoint to store BME680 sensor data
// Uses GitHub as free persistent storage

const MAX_RECORDS = 500; // Keep last 500 readings
const GITHUB_REPO = 'ekulkisnek/bme680-monitor';
const GITHUB_FILE = 'sensor-data.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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
    let storageType = 'memory';
    
    // Option 1: Try GitHub storage (FREE and persistent!)
    if (GITHUB_TOKEN) {
      try {
        // Get existing file
        const getResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'BME680-Monitor'
            }
          }
        );

        if (getResponse.status === 200) {
          const fileData = await getResponse.json();
          const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
          allData = JSON.parse(content);
        }

        // Add new reading
        allData.push(sensorData);
        
        // Keep only last MAX_RECORDS (most recent)
        if (allData.length > MAX_RECORDS) {
          allData = allData.slice(-MAX_RECORDS);
        }

        // Update file on GitHub
        const updateResponse = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json',
              'User-Agent': 'BME680-Monitor'
            },
            body: JSON.stringify({
              message: `Update sensor data: ${new Date().toISOString()}`,
              content: Buffer.from(JSON.stringify(allData, null, 2)).toString('base64'),
              sha: getResponse.status === 200 ? (await getResponse.json()).sha : undefined
            })
          }
        );

        if (updateResponse.ok) {
          storageType = 'github';
          console.log(`Stored ${allData.length} readings to GitHub`);
        } else {
          const errorData = await updateResponse.json();
          console.error('GitHub storage error:', errorData.message);
          // Fall through to memory storage
          allData = allData.slice(-MAX_RECORDS);
        }
      } catch (githubError) {
        console.error('GitHub storage error:', githubError.message);
        // Fall through to memory storage
      }
    }

    // Option 2: Try Vercel KV if configured
    if (storageType === 'memory' && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      try {
        const { createClient } = await import('@vercel/kv');
        const kv = createClient({
          url: process.env.KV_REST_API_URL,
          token: process.env.KV_REST_API_TOKEN,
        });
        
        const existingData = await kv.get('bme680_readings') || [];
        allData = Array.isArray(existingData) ? existingData : [];
        allData.push(sensorData);
        
        if (allData.length > MAX_RECORDS) {
          allData = allData.slice(-MAX_RECORDS);
        }
        
        await kv.set('bme680_readings', allData);
        storageType = 'kv';
        console.log(`Stored ${allData.length} readings to KV`);
      } catch (kvError) {
        console.error('KV storage error:', kvError.message);
      }
    }

    // Option 3: Memory storage (fallback - not persistent)
    if (storageType === 'memory') {
      // In-memory storage (module-level variable)
      // Note: This won't persist across serverless invocations
      if (!global.bme680Data) {
        global.bme680Data = [];
      }
      global.bme680Data.push(sensorData);
      if (global.bme680Data.length > MAX_RECORDS) {
        global.bme680Data = global.bme680Data.slice(-MAX_RECORDS);
      }
      allData = global.bme680Data;
      console.log(`Stored ${allData.length} readings to memory (not persistent)`);
    }

    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Data stored successfully',
      timestamp: sensorData.timestamp,
      totalReadings: allData.length,
      storageType: storageType
    });
    
  } catch (error) {
    console.error('Error storing sensor data:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
