const { Client } = require('pg');

// Test 1: Using hostname
console.log('Test 1: Connecting with hostname...');
const clientHostname = new Client({
  host: 'agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'agrinext_mvp',
  user: 'postgres',
  password: 'Agrinextow7s74of!',
  connectionTimeoutMillis: 10000,
});

async function testHostname() {
  try {
    await clientHostname.connect();
    console.log('✅ Hostname connection successful!');
    const result = await clientHostname.query('SELECT NOW()');
    console.log('Current time:', result.rows[0].now);
    await clientHostname.end();
    return true;
  } catch (error) {
    console.error('❌ Hostname connection failed:', error.message);
    return false;
  }
}

// Test 2: Using IP address directly
console.log('\nTest 2: Connecting with IP address...');
const clientIP = new Client({
  host: '172.31.82.239',
  port: 5432,
  database: 'agrinext_mvp',
  user: 'postgres',
  password: 'Agrinextow7s74of!',
  connectionTimeoutMillis: 10000,
});

async function testIP() {
  try {
    await clientIP.connect();
    console.log('✅ IP connection successful!');
    const result = await clientIP.query('SELECT NOW()');
    console.log('Current time:', result.rows[0].now);
    await clientIP.end();
    return true;
  } catch (error) {
    console.error('❌ IP connection failed:', error.message);
    return false;
  }
}

async function runTests() {
  const hostnameWorks = await testHostname();
  const ipWorks = await testIP();
  
  console.log('\n=== Results ===');
  console.log('Hostname:', hostnameWorks ? '✅ Works' : '❌ Failed');
  console.log('IP Address:', ipWorks ? '✅ Works' : '❌ Failed');
  
  if (!hostnameWorks && ipWorks) {
    console.log('\n💡 Solution: Use IP address instead of hostname in .env file');
    console.log('Change DB_HOST from hostname to: 172.31.82.239');
  }
}

runTests();
