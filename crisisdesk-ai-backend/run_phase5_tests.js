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
  console.log('--- STARTING PHASE 5 CRUD & ADMIN ENDPOINT TESTS ---');

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

  // Pre-create 3 reports
  console.log('\n[Setup] Pre-creating 3 mock reports...');
  
  // Report A: Utility (Gas Leak)
  const repA = await makeRequest('POST', '/api/reports', {
    description: "Gas pipeline leakage in Sector 4",
    location: "Sector 4, Main Road",
    contact: "+8801900000001",
    name: "Sajid Hasan",
    language: "en",
  });
  const idA = repA.body.data._id;
  console.log(`Pre-created Report A: ${idA} (category: ${repA.body.data.category})`);

  // Report B: Accident (Car crash)
  const repB = await makeRequest('POST', '/api/reports', {
    description: "Car accident on highway near toll plaza",
    location: "Toll Plaza Highway",
    contact: "+8801900000002",
    name: "Rahim Ali",
    language: "en",
  });
  const idB = repB.body.data._id;
  console.log(`Pre-created Report B: ${idB} (category: ${repB.body.data.category})`);

  // Report C: Crime (Armed robbery)
  const repC = await makeRequest('POST', '/api/reports', {
    description: "Armed robbery reported at local convenience store",
    location: "Mirpur Road",
    contact: "+8801900000003",
    name: "Tariqul Islam",
    language: "en",
  });
  const idC = repC.body.data._id;
  console.log(`Pre-created Report C: ${idC} (category: ${repC.body.data.category})`);

  // Manually update Report B's status to in_review and Report C's status to assigned for testing
  await mongoose.connect('mongodb://127.0.0.1:27017/crisisdesk');
  const ReportModel = mongoose.model('Report', new mongoose.Schema({}, { strict: false }));
  await ReportModel.findByIdAndUpdate(idB, { status: 'in_review' });
  await ReportModel.findByIdAndUpdate(idC, { status: 'assigned' });
  await mongoose.disconnect();
  console.log('[Setup] Updated status of Report B to "in_review" and Report C to "assigned".');

  // --- 1. Test GET /api/reports ---
  console.log('\n--- 1. Testing GET /api/reports (List with filters) ---');
  
  // A. Search by text "leak"
  console.log('A. Query: ?search=leak');
  const listSearch = await makeRequest('GET', '/api/reports?search=leak');
  console.log('Status Code:', listSearch.statusCode);
  console.log('Body reports found:', listSearch.body.data.reports.map(r => ({ id: r._id, desc: r.description })));

  // B. Filter by category "accident"
  console.log('B. Query: ?category=accident');
  const listCat = await makeRequest('GET', '/api/reports?category=accident');
  console.log('Status Code:', listCat.statusCode);
  console.log('Body reports found:', listCat.body.data.reports.map(r => ({ id: r._id, category: r.category })));

  // C. Filter by status "assigned"
  console.log('C. Query: ?status=assigned');
  const listStatus = await makeRequest('GET', '/api/reports?status=assigned');
  console.log('Status Code:', listStatus.statusCode);
  console.log('Body reports found:', listStatus.body.data.reports.map(r => ({ id: r._id, status: r.status })));

  // --- 2. Test GET /api/reports/:id ---
  console.log('\n--- 2. Testing GET /api/reports/:id (Get by ID) ---');
  
  // A. Valid ID (Report A)
  console.log(`A. Querying Valid ID: ${idA}`);
  const getByIdSuccess = await makeRequest('GET', `/api/reports/${idA}`);
  console.log('Status Code:', getByIdSuccess.statusCode);
  console.log('Body:', JSON.stringify(getByIdSuccess.body, null, 2));

  // B. Invalid ObjectId format
  console.log('B. Querying Invalid ObjectId format: 123');
  const getByIdInvalidId = await makeRequest('GET', '/api/reports/123');
  console.log('Status Code:', getByIdInvalidId.statusCode);
  console.log('Body:', JSON.stringify(getByIdInvalidId.body, null, 2));

  // C. Non-existent ObjectId
  console.log('C. Querying Non-existent ObjectId: 6a53b2f1ec6bb382a66b1cff');
  const getByIdNonExistent = await makeRequest('GET', '/api/reports/6a53b2f1ec6bb382a66b1cff');
  console.log('Status Code:', getByIdNonExistent.statusCode);
  console.log('Body:', JSON.stringify(getByIdNonExistent.body, null, 2));

  // --- 3. Test PATCH /api/reports/:id/status ---
  console.log('\n--- 3. Testing PATCH /api/reports/:id/status (Update status) ---');
  
  // A. Valid update (Report A to 'resolved')
  console.log(`A. Updating Report A (${idA}) status to "resolved"...`);
  const updateSuccess = await makeRequest('PATCH', `/api/reports/${idA}/status`, { status: 'resolved' });
  console.log('Status Code:', updateSuccess.statusCode);
  console.log('Body:', JSON.stringify(updateSuccess.body, null, 2));

  // B. Invalid status body validation
  console.log(`B. Updating Report A (${idA}) with invalid status "unknown_status"...`);
  const updateInvalidStatus = await makeRequest('PATCH', `/api/reports/${idA}/status`, { status: 'unknown_status' });
  console.log('Status Code:', updateInvalidStatus.statusCode);
  console.log('Body:', JSON.stringify(updateInvalidStatus.body, null, 2));

  // --- 4. Test DELETE /api/reports/:id ---
  console.log('\n--- 4. Testing DELETE /api/reports/:id (Delete report) ---');
  
  // A. Delete Report C
  console.log(`A. Deleting Report C (${idC})...`);
  const deleteSuccess = await makeRequest('DELETE', `/api/reports/${idC}`);
  console.log('Status Code:', deleteSuccess.statusCode);
  console.log('Body:', JSON.stringify(deleteSuccess.body, null, 2));

  // B. Fetch Report C again to verify it is deleted (should return 404)
  console.log(`B. Fetching Deleted Report C (${idC}) to verify removal...`);
  const verifyDelete = await makeRequest('GET', `/api/reports/${idC}`);
  console.log('Status Code:', verifyDelete.statusCode);
  console.log('Body:', JSON.stringify(verifyDelete.body, null, 2));

  // --- Teardown ---
  console.log('\n[Teardown] Restoring original .env config...');
  fs.writeFileSync(envPath, originalEnvContent, 'utf8');
  cleanApp();
  console.log('Teardown complete.');
}

run();
