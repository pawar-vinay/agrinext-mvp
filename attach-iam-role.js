/**
 * Attach IAM Role to EC2 Instance for S3 Access
 */

require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const ec2 = new AWS.EC2();
const iam = new AWS.IAM();

const instanceId = 'i-004ef74f37ba59da1';
const roleName = 'AgrinextEC2Role';
const instanceProfileName = 'AgrinextEC2InstanceProfile';

console.log('\n🔧 Attaching IAM Role to EC2 Instance\n');

async function attachRole() {
  try {
    // 1. Create IAM role
    console.log('Step 1: Creating IAM role...');
    try {
      await iam.createRole({
        RoleName: roleName,
        AssumeRolePolicyDocument: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{
            Effect: 'Allow',
            Principal: { Service: 'ec2.amazonaws.com' },
            Action: 'sts:AssumeRole'
          }]
        })
      }).promise();
      console.log('✅ IAM role created');
    } catch (e) {
      if (e.code === 'EntityAlreadyExists') {
        console.log('✅ IAM role already exists');
      } else {
        throw e;
      }
    }
    
    // 2. Attach S3 policy to role
    console.log('\nStep 2: Attaching S3 policy...');
    await iam.attachRolePolicy({
      RoleName: roleName,
      PolicyArn: 'arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess'
    }).promise();
    console.log('✅ S3 policy attached');
    
    // 3. Create instance profile
    console.log('\nStep 3: Creating instance profile...');
    try {
      await iam.createInstanceProfile({
        InstanceProfileName: instanceProfileName
      }).promise();
      console.log('✅ Instance profile created');
    } catch (e) {
      if (e.code === 'EntityAlreadyExists') {
        console.log('✅ Instance profile already exists');
      } else {
        throw e;
      }
    }
    
    // 4. Add role to instance profile
    console.log('\nStep 4: Adding role to instance profile...');
    try {
      await iam.addRoleToInstanceProfile({
        InstanceProfileName: instanceProfileName,
        RoleName: roleName
      }).promise();
      console.log('✅ Role added to instance profile');
    } catch (e) {
      if (e.code === 'LimitExceeded') {
        console.log('✅ Role already in instance profile');
      } else {
        throw e;
      }
    }
    
    // 5. Attach instance profile to EC2
    console.log('\nStep 5: Attaching instance profile to EC2...');
    try {
      await ec2.associateIamInstanceProfile({
        IamInstanceProfile: {
          Name: instanceProfileName
        },
        InstanceId: instanceId
      }).promise();
      console.log('✅ Instance profile attached to EC2');
    } catch (e) {
      if (e.code === 'IncorrectState') {
        console.log('✅ Instance profile already attached');
      } else {
        throw e;
      }
    }
    
    console.log('\n✅ Setup complete!');
    console.log('\n⏳ Wait 30 seconds for permissions to propagate...');
    console.log('\nThen try the S3 command again on EC2:');
    console.log('  aws s3 cp s3://agrinext-images-1772367775698/ec2-setup.sh . --region us-east-1');
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

attachRole();
