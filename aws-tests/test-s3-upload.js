/**
 * S3 Upload Test
 * Tests S3 bucket creation and file upload
 */

require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const testBucketName = `agrinext-test-${Date.now()}`;
const testFileName = 'test-image.txt';
const testFileContent = 'This is a test file for Agrinext MVP';

console.log('\n🧪 S3 Upload Test\n');

async function runS3Test() {
  try {
    // Step 1: Create test bucket
    console.log('Step 1: Creating test bucket...');
    await s3.createBucket({ Bucket: testBucketName }).promise();
    console.log(`✅ Bucket created: ${testBucketName}`);
    
    // Step 2: Upload test file
    console.log('\nStep 2: Uploading test file...');
    const uploadParams = {
      Bucket: testBucketName,
      Key: testFileName,
      Body: testFileContent,
      ContentType: 'text/plain'
    };
    
    const uploadResult = await s3.upload(uploadParams).promise();
    console.log(`✅ File uploaded: ${uploadResult.Location}`);
    
    // Step 3: List objects in bucket
    console.log('\nStep 3: Listing bucket contents...');
    const listResult = await s3.listObjectsV2({ Bucket: testBucketName }).promise();
    console.log(`✅ Found ${listResult.Contents.length} object(s) in bucket`);
    listResult.Contents.forEach(obj => {
      console.log(`   - ${obj.Key} (${obj.Size} bytes)`);
    });
    
    // Step 4: Download file
    console.log('\nStep 4: Downloading file...');
    const downloadResult = await s3.getObject({
      Bucket: testBucketName,
      Key: testFileName
    }).promise();
    const downloadedContent = downloadResult.Body.toString('utf-8');
    console.log(`✅ File downloaded successfully`);
    console.log(`   Content: "${downloadedContent}"`);
    
    // Step 5: Delete file
    console.log('\nStep 5: Cleaning up - Deleting file...');
    await s3.deleteObject({
      Bucket: testBucketName,
      Key: testFileName
    }).promise();
    console.log(`✅ File deleted`);
    
    // Step 6: Delete bucket
    console.log('\nStep 6: Cleaning up - Deleting bucket...');
    await s3.deleteBucket({ Bucket: testBucketName }).promise();
    console.log(`✅ Bucket deleted`);
    
    // Success
    console.log('\n' + '='.repeat(60));
    console.log('🎉 All S3 tests passed successfully!');
    console.log('='.repeat(60));
    console.log('\nYour S3 configuration is working correctly.');
    console.log('You can now use S3 for image storage in Agrinext.\n');
    
  } catch (error) {
    console.log('\n❌ Test failed');
    console.log('Error:', error.message);
    
    // Cleanup on error
    try {
      console.log('\nAttempting cleanup...');
      await s3.deleteObject({ Bucket: testBucketName, Key: testFileName }).promise();
      await s3.deleteBucket({ Bucket: testBucketName }).promise();
      console.log('✅ Cleanup completed');
    } catch (cleanupError) {
      console.log('⚠️  Cleanup failed (bucket may not exist)');
    }
    
    console.log('\nPlease check:');
    console.log('  1. AWS credentials are correct');
    console.log('  2. IAM user has S3 permissions');
    console.log('  3. Region is correct\n');
    process.exit(1);
  }
}

runS3Test();
