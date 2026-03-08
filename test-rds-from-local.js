#!/usr/bin/env node

/**
 * Test RDS connectivity from local machine
 * This helps diagnose if the issue is with RDS itself or EC2 connectivity
 */

const { Client } = require('pg');

const client = new Client({
  host: 'agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com',
  port: 5432,
  database: 'agrinext_mvp',
  user: 'postgres',
  password: 'Agrinextow7s74of!',
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  console.log('Testing RDS connection from local machine...');
  console.log('Host:', client.host);
  console.log('Database:', client.database);
  console.log('');

  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    await client.end();
    console.log('✅ Connection test passed!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('');
    console.error('This is expected if:');
    console.error('1. RDS security group does not allow connections from your IP');
    console.error('2. RDS is in a private subnet (not publicly accessible)');
    console.error('');
    console.error('The EC2 instance should still be able to connect from within the VPC.');
    process.exit(1);
  }
}

testConnection();
