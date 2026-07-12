const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const envPath = path.join(__dirname, '.env');
const appPath = path.join(__dirname, 'src', 'app.ts');

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/reports',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: JSON.parse(body),
        });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
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
  console.log('--- STARTING PHASE 4 DUPLICATE DETECTION TESTS ---');

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

  // 1. Submit First Report
  console.log('\n[Test 1] Submitting First Report...');
  let report1Id = null;
  try {
    const res = await makeRequest({
      description: "A huge tree fell onto the main road blocking traffic.",
      location: "Banani, Road 11",
      contact: "+8801900000001",
      name: "Sajid Hasan",
      language: "en",
    });
    console.log('Status Code:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
    report1Id = res.body.data._id;
  } catch (err) {
    console.error('Test 1 failed:', err);
  }

  // 2. Submit Similar Report (Duplicate with > 60% Jaccard word overlap)
  console.log('\n[Test 2] Submitting Second (Similar) Report...');
  try {
    const res = await makeRequest({
      description: "A huge tree fell onto the main road blocking traffic. There are many cars stranded here.",
      location: "  banani, road 11  ", // slightly different casing/whitespace to test normalization
      contact: "+8801900000002",
      name: "Anon User",
      language: "en",
    });
    console.log('Status Code:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('Test 2 failed:', err);
  }

  // 3. Restore .env
  console.log('\n[Teardown] Restoring original .env config...');
  fs.writeFileSync(envPath, originalEnvContent, 'utf8');
  cleanApp();
  console.log('Teardown complete.');
}

run();
