const http = require('http');
const db = require('./database');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting API Integration Tests ---');

  try {
    // 1. GET /api/menu
    const menuRes = await makeRequest('GET', '/api/menu');
    console.log('GET /api/menu:', menuRes.status === 200 && menuRes.body.success ? 'PASS' : 'FAIL', menuRes.body);

    // 2. GET /api/beans
    const beansRes = await makeRequest('GET', '/api/beans');
    console.log('GET /api/beans:', beansRes.status === 200 && beansRes.body.success ? 'PASS' : 'FAIL', beansRes.body);

    // 3. POST /api/orders
    const orderRes = await makeRequest('POST', '/api/orders', {
      customer_name: 'Test Customer',
      customer_phone: '03001234567',
      customer_email: 'test@example.com',
      items: [{ name: 'Cortado', price: 650 }],
      total_price: 650
    });
    console.log('POST /api/orders:', orderRes.status === 201 && orderRes.body.success ? 'PASS' : 'FAIL', orderRes.body);

    // 4. POST /api/reservations
    const resvRes = await makeRequest('POST', '/api/reservations', {
      name: 'Scholar Student',
      email: 'scholar@iub.edu.pk',
      phone: '03007654321',
      reservation_type: 'Study Pod A',
      date: '2026-11-01',
      time: '14:00',
      guests: 2,
      special_requests: 'Quiet area preferred'
    });
    console.log('POST /api/reservations:', resvRes.status === 201 && resvRes.body.success ? 'PASS' : 'FAIL', resvRes.body);

    // 5. POST /api/subscribe
    const subRes = await makeRequest('POST', '/api/subscribe', {
      email: `scholar_${Date.now()}@iub.edu.pk`
    });
    console.log('POST /api/subscribe:', subRes.status === 201 && subRes.body.success ? 'PASS' : 'FAIL', subRes.body);

    // 6. POST /api/contact
    const contactRes = await makeRequest('POST', '/api/contact', {
      name: 'Dr. Usman',
      email: 'usman@iub.edu.pk',
      phone: '03009998877',
      subject: 'Wholesale Inquiry',
      message: 'Interested in ordering beans for the department lounge.'
    });
    console.log('POST /api/contact:', contactRes.status === 201 && contactRes.body.success ? 'PASS' : 'FAIL', contactRes.body);

    console.log('--- All API Tests Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

// Start server child process for testing if server is not running
const { spawn } = require('child_process');
const serverProcess = spawn('node', ['server.js'], { stdio: 'inherit' });

setTimeout(() => {
  runTests().then(() => {
    serverProcess.kill();
  });
}, 1500);
