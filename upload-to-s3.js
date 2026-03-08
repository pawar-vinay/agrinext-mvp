/**
 * Upload Backend Code to S3
 * This allows EC2 to download and deploy the code
 */

require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const bucketName = 'agrinext-images-1772367775698';

console.log('\n📦 Uploading Backend Code to S3\n');

async function uploadDirectory(dirPath, s3Prefix = '') {
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other unnecessary directories
      if (file === 'node_modules' || file === '.git' || file === 'tests') {
        continue;
      }
      await uploadDirectory(filePath, path.join(s3Prefix, file));
    } else {
      const s3Key = path.join('backend', s3Prefix, file).replace(/\\/g, '/');
      const fileContent = fs.readFileSync(filePath);
      
      try {
        await s3.putObject({
          Bucket: bucketName,
          Key: s3Key,
          Body: fileContent
        }).promise();
        console.log(`✅ Uploaded: ${s3Key}`);
      } catch (error) {
        console.log(`❌ Failed to upload ${s3Key}: ${error.message}`);
      }
    }
  }
}

async function uploadDatabase() {
  const dbFiles = ['schema.sql', 'seed-data.sql'];
  
  for (const file of dbFiles) {
    const filePath = path.join('database', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      const s3Key = `database/${file}`;
      
      try {
        await s3.putObject({
          Bucket: bucketName,
          Key: s3Key,
          Body: content
        }).promise();
        console.log(`✅ Uploaded: ${s3Key}`);
      } catch (error) {
        console.log(`❌ Failed to upload ${s3Key}: ${error.message}`);
      }
    }
  }
}

async function upload() {
  try {
    console.log('Uploading backend files...\n');
    await uploadDirectory('backend');
    
    console.log('\nUploading database files...\n');
    await uploadDatabase();
    
    console.log('\n✅ Upload complete!');
    console.log('\nFiles are now in S3 bucket:', bucketName);
    console.log('\nNext: Connect to EC2 and download these files');
  } catch (error) {
    console.log('\n❌ Upload failed:', error.message);
  }
}

upload();
