const http = require('http');

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
          headers: res.headers,
          body: JSON.parse(body),
        });
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('--- TEST 1: SUCCESS CASE ---');
  try {
    const successRes = await makeRequest({
      description: "Severe flooding reported in the low-lying residential area.",
      location: "Mirpur, Sector 10",
      contact: "+8801700000000",
      name: "Abir Rahman",
      language: "en",
    });
    console.log('Status Code:', successRes.statusCode);
    console.log('Body:', JSON.stringify(successRes.body, null, 2));
  } catch (error) {
    console.error('Test 1 failed:', error);
  }

  console.log('\n--- TEST 2: VALIDATION FAILURE CASE ---');
  try {
    const failureRes = await makeRequest({
      contact: "+8801700000000",
      name: "Abir Rahman",
      language: "en",
    });
    console.log('Status Code:', failureRes.statusCode);
    console.log('Body:', JSON.stringify(failureRes.body, null, 2));
  } catch (error) {
    console.error('Test 2 failed:', error);
  }
}

runTests();
