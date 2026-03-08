/**
 * AWS Connection Test Script
 * Tests connection to AWS account and verifies credentials
 */

const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
};

// Test functions
async function testIAMConnection() {
  log.section('Testing IAM Connection...');
  const iam = new AWS.IAM();
  
  try {
    const user = await iam.getUser().promise();
    log.success('IAM Connection successful');
    log.info(`User: ${user.User.UserName}`);
    log.info(`User ARN: ${user.User.Arn}`);
    log.info(`Account ID: ${user.User.UserId.substring(0, 12)}`);
    return true;
  } catch (error) {
    log.error('IAM Connection failed');
    log.error(`Error: ${error.message}`);
    return false;
  }
}

async function testS3Connection() {
  log.section('Testing S3 Connection...');
  const s3 = new AWS.S3();
  
  try {
    const buckets = await s3.listBuckets().promise();
    log.success('S3 Connection successful');
    log.info(`Found ${buckets.Buckets.length} bucket(s)`);
    
    if (buckets.Buckets.length > 0) {
      log.info('Existing buckets:');
      buckets.Buckets.slice(0, 5).forEach(bucket => {
        console.log(`  - ${bucket.Name}`);
      });
      if (buckets.Buckets.length > 5) {
        log.info(`  ... and ${buckets.Buckets.length - 5} more`);
      }
    }
    return true;
  } catch (error) {
    log.error('S3 Connection failed');
    log.error(`Error: ${error.message}`);
    return false;
  }
}

async function testEC2Connection() {
  log.section('Testing EC2 Connection...');
  const ec2 = new AWS.EC2();
  
  try {
    const instances = await ec2.describeInstances().promise();
    log.success('EC2 Connection successful');
    
    const totalInstances = instances.Reservations.reduce(
      (count, reservation) => count + reservation.Instances.length, 
      0
    );
    log.info(`Found ${totalInstances} EC2 instance(s)`);
    
    if (totalInstances > 0) {
      instances.Reservations.forEach(reservation => {
        reservation.Instances.forEach(instance => {
          const name = instance.Tags?.find(tag => tag.Key === 'Name')?.Value || 'Unnamed';
          log.info(`  - ${instance.InstanceId} (${name}) - ${instance.State.Name}`);
        });
      });
    }
    return true;
  } catch (error) {
    log.error('EC2 Connection failed');
    log.error(`Error: ${error.message}`);
    return false;
  }
}

async function testRDSConnection() {
  log.section('Testing RDS Connection...');
  const rds = new AWS.RDS();
  
  try {
    const databases = await rds.describeDBInstances().promise();
    log.success('RDS Connection successful');
    log.info(`Found ${databases.DBInstances.length} RDS instance(s)`);
    
    if (databases.DBInstances.length > 0) {
      databases.DBInstances.forEach(db => {
        log.info(`  - ${db.DBInstanceIdentifier} (${db.Engine}) - ${db.DBInstanceStatus}`);
      });
    }
    return true;
  } catch (error) {
    log.error('RDS Connection failed');
    log.error(`Error: ${error.message}`);
    return false;
  }
}

async function testLambdaConnection() {
  log.section('Testing Lambda Connection...');
  const lambda = new AWS.Lambda();
  
  try {
    const functions = await lambda.listFunctions().promise();
    log.success('Lambda Connection successful');
    log.info(`Found ${functions.Functions.length} Lambda function(s)`);
    
    if (functions.Functions.length > 0) {
      functions.Functions.slice(0, 5).forEach(func => {
        log.info(`  - ${func.FunctionName} (${func.Runtime})`);
      });
      if (functions.Functions.length > 5) {
        log.info(`  ... and ${functions.Functions.length - 5} more`);
      }
    }
    return true;
  } catch (error) {
    log.error('Lambda Connection failed');
    log.error(`Error: ${error.message}`);
    return false;
  }
}

async function testCloudWatchConnection() {
  log.section('Testing CloudWatch Connection...');
  const cloudwatch = new AWS.CloudWatch();
  
  try {
    const alarms = await cloudwatch.describeAlarms({ MaxRecords: 10 }).promise();
    log.success('CloudWatch Connection successful');
    log.info(`Found ${alarms.MetricAlarms.length} alarm(s)`);
    return true;
  } catch (error) {
    log.error('CloudWatch Connection failed');
    log.error(`Error: ${error.message}`);
    return false;
  }
}

async function checkCredentials() {
  log.section('Checking AWS Credentials...');
  
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';
  
  if (!accessKeyId || !secretAccessKey) {
    log.error('AWS credentials not found in environment variables');
    log.warning('Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    return false;
  }
  
  log.success('AWS credentials found in environment');
  log.info(`Access Key ID: ${accessKeyId.substring(0, 8)}...`);
  log.info(`Region: ${region}`);
  return true;
}

// Main test runner
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('AWS Connection Test Suite');
  console.log('='.repeat(60));
  
  // Check credentials first
  const hasCredentials = await checkCredentials();
  if (!hasCredentials) {
    log.error('\nTests aborted: Missing AWS credentials');
    process.exit(1);
  }
  
  // Run all tests
  const results = {
    iam: await testIAMConnection(),
    s3: await testS3Connection(),
    ec2: await testEC2Connection(),
    rds: await testRDSConnection(),
    lambda: await testLambdaConnection(),
    cloudwatch: await testCloudWatchConnection()
  };
  
  // Summary
  log.section('Test Summary');
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  console.log('\nResults:');
  Object.entries(results).forEach(([service, passed]) => {
    const status = passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`  ${service.toUpperCase().padEnd(15)} ${status}`);
  });
  
  console.log('\n' + '='.repeat(60));
  if (passed === total) {
    log.success(`All tests passed! (${passed}/${total})`);
    log.info('Your AWS connection is working correctly! 🎉');
  } else {
    log.warning(`Some tests failed (${passed}/${total} passed)`);
    log.info('Check the errors above for details');
  }
  console.log('='.repeat(60) + '\n');
  
  process.exit(passed === total ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log.error('Unexpected error:');
  console.error(error);
  process.exit(1);
});
