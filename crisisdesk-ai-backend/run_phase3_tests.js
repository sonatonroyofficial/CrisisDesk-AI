const http = require('http');
const fs = require('fs');
const path = require('path');

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

// Helper to trigger ts-node-dev restart by writing a timestamp comment to app.ts
function touchApp() {
  const content = fs.readFileSync(appPath, 'utf8');
  // Strip any existing touch comments at the bottom
  const cleaned = content.replace(/\/\/\s*touch:\s*\d+/, '').trim();
  fs.writeFileSync(appPath, cleaned + '\n// touch: ' + Date.now(), 'utf8');
}

// Clean app.ts comment
function cleanApp() {
  const content = fs.readFileSync(appPath, 'utf8');
  const cleaned = content.replace(/\/\/\s*touch:\s*\d+/, '').trim();
  fs.writeFileSync(appPath, cleaned + '\n', 'utf8');
}

async function run() {
  console.log('--- STARTING PHASE 3 END-TO-END TESTS (WITH PROCESS RELOAD) ---');

  // Read current .env
  const originalEnvContent = fs.readFileSync(envPath, 'utf8');

  // 1. Success Case
  console.log('\n[Test 1] Testing Success Case (Gemini Classification)...');
  try {
    const res = await makeRequest({
      description: "Severe fire broke out in a chemical warehouse. Massive smoke, people trapped.",
      location: "Chawkbazar, Old Dhaka",
      contact: "+8801500000001",
      name: "Tariqul Islam",
      language: "en",
    });
    console.log('Status Code:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('Test 1 failed:', err);
  }

  // 2. Modify .env to simulate bad API key
  console.log('\n[Setup] Simulating invalid Gemini API Key in .env...');
  const badEnvContent = originalEnvContent.replace(
    /GEMINI_API_KEY=.*/,
    'GEMINI_API_KEY=invalid_bad_key_for_testing'
  );
  fs.writeFileSync(envPath, badEnvContent, 'utf8');
  
  console.log('Touching app.ts to trigger ts-node-dev process reload...');
  touchApp();

  console.log('Waiting 5 seconds for server to reload with invalid key...');
  await delay(5000);

  // 3. Fallback Case
  console.log('\n[Test 2] Testing Fallback Case (Mismatched/Bad API Key)...');
  try {
    const res = await makeRequest({
      description: "এখানে একটি বড় সড়ক দুর্ঘটনা ঘটেছে, আগুন লেগেছে বাসের ইঞ্জিনে। অনেক মানুষ আহত।",
      location: "Gabtoli Bus Terminal",
      contact: "+8801500000002",
      name: "Rahim Ali",
      language: "bn",
    });
    console.log('Status Code:', res.statusCode);
    console.log('Body:', JSON.stringify(res.body, null, 2));
  } catch (err) {
    console.error('Test 2 failed:', err);
  }

  // 4. Restore .env
  console.log('\n[Teardown] Restoring original .env config...');
  fs.writeFileSync(envPath, originalEnvContent, 'utf8');
  
  console.log('Cleaning app.ts touch comment to trigger reload back to normal...');
  cleanApp();
  console.log('Teardown complete.');
}

run();
