const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const envPath = path.join(__dirname, '.env');
const appPath = path.join(__dirname, 'src', 'app.ts');

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsedBody;
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          parsedBody = body;
        }
        resolve({
          statusCode: res.statusCode,
          body: parsedBody,
        });
      });
    });

    req.on('error', (e) => reject(e));
    if (data) {
      req.write(postData);
    }
    req.end();
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function touchApp() {
  const content = fs.readFileSync(appPath, 'utf8');
  const cleaned = content.replace(/\/\/\s*touch:\s*\d+/, '').trim();
  fs.writeFileSync(appPath, cleaned + '\n// touch: ' + Date.now(), 'utf8');
}

function cleanApp() {
  const content = fs.readFileSync(appPath, 'utf8');
  const cleaned = content.replace(/\/\/\s*touch:\s*\d+/, '').trim();
  fs.writeFileSync(appPath, cleaned + '\n', 'utf8');
}

async function clearLocalDb() {
  await mongoose.connect('mongodb://127.0.0.1:27017/crisisdesk');
  try {
    await mongoose.connection.db.collection('reports').deleteMany({});
    console.log('[Database] Cleared reports collection.');
  } catch (err) {
    // collection might not exist yet
  } finally {
    await mongoose.disconnect();
  }
}

async function run() {
  console.log('--- STARTING PHASE 7 ERROR HANDLING TESTS ---');

  // Read current .env
  const originalEnvContent = fs.readFileSync(envPath, 'utf8');

  // Temporarily use local MongoDB
  console.log('[Setup] Swapping MONGODB_URI to local MongoDB...');
  const localEnvContent = originalEnvContent.replace(
    /MONGODB_URI=.*/,
    'MONGODB_URI=mongodb://127.0.0.1:27017/crisisdesk'
  );
  fs.writeFileSync(envPath, localEnvContent, 'utf8');
  
  await clearLocalDb();
  
  console.log('Touching app.ts to trigger ts-node-dev reload...');
  touchApp();

  console.log('Waiting 5 seconds for server to boot with local DB...');
  await delay(5000);

  // 1. Test Validation Error: Missing description and location
  console.log('\n[Test 1] POST /api/reports with missing description and location...');
  try {
    const res = await makeRequest('POST', '/api/reports', {
      name: "Sajid Hasan",
      contact: "+8801900000001",
    });
    console.log('Status Code:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('Test 1 failed:', err);
  }

  // 2. Test Report Not Found: GET with non-existent ID
  console.log('\n[Test 2] GET /api/reports/6a53b789d22a1527b84a1f81 (non-existent report)...');
  try {
    const res = await makeRequest('GET', '/api/reports/6a53b789d22a1527b84a1f81');
    console.log('Status Code:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('Test 2 failed:', err);
  }

  // 3. Test Catch-all Unmatched Route
  console.log('\n[Test 3] GET /api/unmatched/route/path...');
  try {
    const res = await makeRequest('GET', '/api/unmatched/route/path');
    console.log('Status Code:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('Test 3 failed:', err);
  }

  // --- Teardown ---
  console.log('\n[Teardown] Restoring original .env config...');
  fs.writeFileSync(envPath, originalEnvContent, 'utf8');
  cleanApp();
  console.log('Teardown complete.');
}

run();
