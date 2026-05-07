/**
 * Test Admin Login using built-in http
 */

const http = require('http');

async function testAdminLogin() {
  return new Promise((resolve, reject) => {
    console.log('🔐 Testing Admin Login...\n');

    const postData = JSON.stringify({
      email: 'admin@college.edu',
      password: 'admin123'
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200) {
            console.log('✅ Login successful!');
            console.log('Token:', response.token.substring(0, 50) + '...');
            console.log('User:', JSON.stringify(response.user, null, 2));
          } else {
            console.log('❌ Login failed:', response.message);
          }
          resolve();
        } catch (error) {
          console.log('❌ Parse error:', error.message);
          console.log('Raw response:', data);
          resolve();
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Request error:', error.message);
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

testAdminLogin();