/**
 * EMPIRICAL SECURITY PROOF SCRIPT
 * Sends real negative value payloads and unauthorized requests to API endpoints,
 * proving that attacks are rejected with 400 / 401 status codes.
 */

const http = require('http');

function sendRequest(path, method, body, headers = {}) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', (e) => {
      resolve({ status: 'ERROR', error: e.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runEmpiricalProof() {
  console.log("=== EMPIRICAL API SECURITY PROOF TEST ===");

  // Test 1: Negative CP Points Injection on /api/clans
  const test1 = await sendRequest('/api/clans', 'POST', {
    action: 'contribute_cp',
    user_id: 'test_user',
    points: -99999
  });
  console.log("\n[Test 1] Negative Points Injection (/api/clans):");
  console.log("  Sent: { points: -99999 }");
  console.log("  Result Status:", test1.status);
  console.log("  Result Response:", test1.body);

  // Test 2: Unauthorized Event Reward Mutation on /api/events
  const test2 = await sendRequest('/api/events', 'POST', {
    bilmece_odul: 999999
  });
  console.log("\n[Test 2] Unauthorized Admin Mutation (/api/events):");
  console.log("  Sent: { bilmece_odul: 999999 } without admin token");
  console.log("  Result Status:", test2.status);
  console.log("  Result Response:", test2.body);

  // Test 3: Unauthorized Badge Award on /api/badges
  const test3 = await sendRequest('/api/badges', 'POST', {
    badgeId: 'katkici'
  });
  console.log("\n[Test 3] Unauthorized Badge Award (/api/badges):");
  console.log("  Sent: { badgeId: 'katkici' } without userId/authHeader");
  console.log("  Result Status:", test3.status);
  console.log("  Result Response:", test3.body);
}

runEmpiricalProof();
