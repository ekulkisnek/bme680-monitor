// API endpoint to retrieve historical BME680 sensor data

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
    let storageType = 'memory';
    const GITHUB_REPO = 'ekulkisnek/bme680-monitor';
    const GITHUB_FILE = 'sensor-data.json';
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

    // Option 1: Try GitHub storage (FREE and persistent!)
    // First try with token if available, then fallback to public access
    try {
      let response;
      if (GITHUB_TOKEN) {
        // Use authenticated request (can update)
        response = await fetch(
          `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE}?ref=main`,
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'BME680-Monitor'
            }
          }
        );
      } else {
        // Use public raw URL (read-only but works without auth)
        response = await fetch(
          `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${GITHUB_FILE}`,
          {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'BME680-Monitor'
            }
          }
        );
      }

      if (response.ok) {
        let content;
        if (GITHUB_TOKEN && response.status === 200) {
          // GitHub API returns base64 encoded
          const fileData = await response.json();
          content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        } else {
          // Raw URL returns plain text
          content = await response.text();
        }
        
        readings = JSON.parse(content);
        
        if (!Array.isArray(readings)) {
          readings = [];
        }
        
        storageType = 'github';
        console.log(`Retrieved ${readings.length} readings from GitHub`);
      } else if (response.status === 404) {
        // File doesn't exist yet, return empty array
        console.log('GitHub file not found yet, returning empty array');
      }
    } catch (githubError) {
      console.error('GitHub retrieval error:', githubError.message);
    }
    
    // Option 2: Try Vercel KV if configured
    if (readings.length === 0 && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
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

    // Option 3: Memory storage (fallback)
    if (readings.length === 0 && global.bme680Data) {
      readings = global.bme680Data;
      storageType = 'memory';
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
