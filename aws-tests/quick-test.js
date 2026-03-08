/**
 * Quick AWS Connection Test
 * Fast test to verify AWS credentials are working
 */

require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

console.log('\n🔍 Quick AWS Connection Test\n');
console.log('Testing AWS credentials...\n');

// Test with STS (Security Token Service) - fastest way to verify credentials
const sts = new AWS.STS();

sts.getCallerIdentity({}, (err, data) => {
  if (err) {
    console.log('❌ Connection FAILED\n');
    console.log('Error:', err.message);
    console.log('\nPossible issues:');
    console.log('  1. Invalid AWS credentials');
    console.log('  2. Credentials not set in environment variables');
    console.log('  3. Network connectivity issues');
    console.log('\nPlease check your .env file or environment variables.\n');
    process.exit(1);
  } else {
    console.log('✅ Connection SUCCESSFUL!\n');
    console.log('Account Details:');
    console.log('  Account ID:', data.Account);
    console.log('  User ARN:', data.Arn);
    console.log('  User ID:', data.UserId);
    console.log('\n🎉 Your AWS credentials are working correctly!\n');
    process.exit(0);
  }
});
