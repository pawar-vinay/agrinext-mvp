/**
 * Test IAM Permissions
 */

require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const ec2 = new AWS.EC2();
const rds = new AWS.RDS();
const iam = new AWS.IAM();

console.log('\n🔍 Testing IAM Permissions\n');

async function testPermissions() {
  // Test IAM
  console.log('Testing IAM access...');
  try {
    const user = await iam.getUser().promise();
    console.log(`✅ IAM: Can read user info (${user.User.UserName})`);
    
    // Try to list attached policies
    try {
      const policies = await iam.listAttachedUserPolicies({ UserName: user.User.UserName }).promise();
      console.log(`✅ IAM: Found ${policies.AttachedPolicies.length} attached policies:`);
      policies.AttachedPolicies.forEach(p => console.log(`   - ${p.PolicyName}`));
    } catch (e) {
      console.log(`⚠️  IAM: Cannot list policies - ${e.message}`);
    }
  } catch (error) {
    console.log(`❌ IAM: ${error.message}`);
  }
  
  // Test S3
  console.log('\nTesting S3 access...');
  try {
    await s3.listBuckets().promise();
    console.log('✅ S3: Can list buckets');
  } catch (error) {
    console.log(`❌ S3: ${error.message}`);
  }
  
  // Test EC2
  console.log('\nTesting EC2 access...');
  try {
    await ec2.describeInstances().promise();
    console.log('✅ EC2: Can describe instances');
  } catch (error) {
    console.log(`❌ EC2: ${error.message}`);
  }
  
  // Test RDS
  console.log('\nTesting RDS access...');
  try {
    await rds.describeDBInstances().promise();
    console.log('✅ RDS: Can describe DB instances');
  } catch (error) {
    console.log(`❌ RDS: ${error.message}`);
  }
  
  console.log('\n');
}

testPermissions();
