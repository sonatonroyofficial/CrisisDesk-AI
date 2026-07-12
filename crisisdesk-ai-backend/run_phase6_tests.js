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

async function seedData() {
  await mongoose.connect('mongodb://127.0.0.1:27017/crisisdesk');
  const ReportModel = mongoose.model('Report', new mongoose.Schema({}, { strict: false }));
  
  // Seed Report 1
  const r1 = await ReportModel.create({
    description: "Gas leak in Sector 4",
    location: "Sector 4",
    category: "utility",
    urgency: "critical",
    status: "pending",
  });

  // Seed Report 2
  const r2 = await ReportModel.create({
    description: "Minor car collision on bridge",
    location: "Banani Bridge",
    category: "accident",
    urgency: "medium",
    status: "resolved",
  });

  // Seed Report 3
  const r3 = await ReportModel.create({
    description: "Patient with high fever and respiratory issues",
    location: "Uttara Sector 10",
    category: "medical",
    urgency: "high",
    status: "in_review",
  });

  await mongoose.disconnect();
  console.log('[Setup] Seeded 3 reports with distinct categories, urgencies, and statuses.');
  return { id1: r1._id.toString(), id2: r2._id.toString(), id3: r3._id.toString() };
}

async function run() {
  console.log('--- STARTING PHASE 6 STATS SUMMARY ENDPOINT TESTS ---');

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
  const seededIds = await seedData();
  
  console.log('Touching app.ts to trigger ts-node-dev reload...');
  touchApp();

  console.log('Waiting 5 seconds for server to boot with local DB...');
  await delay(5000);

  // 1. Fetch Stats Summary
  console.log('\n[Test 1] Querying stats summary GET /api/reports/stats/summary...');
  try {
    const res = await makeRequest('GET', '/api/reports/stats/summary');
    console.log('Status Code:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('Test 1 failed:', err);
  }

  // 2. Fetch specific report by ID to verify it is NOT swallowed by the stats router
  console.log(`\n[Test 2] Fetching Report by ID: ${seededIds.id1} (GET /api/reports/:id)...`);
  try {
    const res = await makeRequest('GET', `/api/reports/${seededIds.id1}`);
    console.log('Status Code:', res.statusCode);
    console.log('Body ID found:', res.body.data._id);
    console.log('Body Description:', res.body.data.description);
  } catch (err) {
    console.error('Test 2 failed:', err);
  }

  // --- Teardown ---
  console.log('\n[Teardown] Restoring original .env config...');
  fs.writeFileSync(envPath, originalEnvContent, 'utf8');
  cleanApp();
  console.log('Teardown complete.');
}

run();
