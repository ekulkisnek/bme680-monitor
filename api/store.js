// API endpoint to store BME680 sensor data
// Uses GitHub as free persistent storage with batching to reduce commits

const MAX_RECORDS = 500; // Keep last 500 readings
const GITHUB_REPO = 'ekulkisnek/bme680-monitor';
const GITHUB_FILE = 'sensor-data.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_BATCH_SIZE = 100; // Commit to GitHub every N readings
const GITHUB_BATCH_INTERVAL_MS = 60 * 60 * 1000; // Or every hour (whichever comes first)

// Track pending commits
let pendingReadings = [];
let lastGitHubCommit = Date.now();

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
    
    // Initialize pending readings array if needed (for GitHub batching)
    if (!global.pendingReadings) {
      global.pendingReadings = [];
    }
    if (!global.lastGitHubCommit) {
      global.lastGitHubCommit = Date.now();
    }
    
    // PRIORITY 1: Store in KV first (if available) for REAL-TIME access
    // This ensures near-live data even with GitHub batching
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
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
        console.log(`Stored ${allData.length} readings to KV (real-time)`);
      } catch (kvError) {
        console.error('KV storage error:', kvError.message);
        // Fall through to other storage methods
      }
    }
    
    // PRIORITY 2: Queue for GitHub backup (batched commits)
    // This provides backup/archival with clean Git history
    if (GITHUB_TOKEN) {
      global.pendingReadings.push(sensorData);
      
      // Option 1: Try GitHub storage (FREE and persistent!) - with batching
    if (GITHUB_TOKEN) {
      const shouldCommit = 
        global.pendingReadings.length >= GITHUB_BATCH_SIZE ||
        (Date.now() - global.lastGitHubCommit) >= GITHUB_BATCH_INTERVAL_MS;
      
      if (shouldCommit) {
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

          let fileSha = undefined;
          if (getResponse.status === 200) {
            const fileData = await getResponse.json();
            fileSha = fileData.sha;
            const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
            allData = JSON.parse(content);
          }

          // Add all pending readings
          allData.push(...global.pendingReadings);
          
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
                message: `Batch update: ${global.pendingReadings.length} sensor readings (${new Date().toISOString()})`,
                content: Buffer.from(JSON.stringify(allData, null, 2)).toString('base64'),
                sha: fileSha
              })
            }
          );

          if (updateResponse.ok) {
            storageType = 'github';
            console.log(`Committed ${global.pendingReadings.length} readings to GitHub (total: ${allData.length})`);
            global.pendingReadings = []; // Clear pending
            global.lastGitHubCommit = Date.now();
          } else {
            const errorData = await updateResponse.json();
            console.error('GitHub storage error:', errorData.message);
            // Keep pending readings for next attempt
          }
        } catch (githubError) {
          console.error('GitHub storage error:', githubError.message);
          // Keep pending readings for next attempt
        }
      } else {
        // Not time to commit yet, but still read current data for accurate count
        try {
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
        } catch (err) {
          // Ignore errors, we'll commit later
        }
        storageType = 'github-pending';
        const timeUntilCommit = Math.max(0, GITHUB_BATCH_INTERVAL_MS - (Date.now() - global.lastGitHubCommit));
        console.log(`Queued reading (${global.pendingReadings.length}/${GITHUB_BATCH_SIZE} pending, next commit in ${Math.round(timeUntilCommit / 1000)}s)`);
      }
    }

    // If KV wasn't available, fall back to memory storage

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
    const pendingCount = global.pendingReadings ? global.pendingReadings.length : 0;
    const totalReadings = allData.length || 0;
    const githubBackupStatus = GITHUB_TOKEN && pendingCount > 0 
      ? `${pendingCount} queued for backup` 
      : (GITHUB_TOKEN ? 'backed up' : 'no backup');
    
    return res.status(200).json({ 
      success: true, 
      message: 'Data stored successfully',
      timestamp: sensorData.timestamp,
      totalReadings: totalReadings,
      storageType: storageType,
      githubBackup: githubBackupStatus
    });
    
  } catch (error) {
    console.error('Error storing sensor data:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
