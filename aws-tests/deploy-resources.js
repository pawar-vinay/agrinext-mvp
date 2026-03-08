/**
 * AWS Resource Deployment Script
 * Deploys S3, RDS, and EC2 resources for Agrinext
 */

require('dotenv').config();
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();
const ec2 = new AWS.EC2();
const rds = new AWS.RDS();

console.log('\n🚀 Agrinext AWS Deployment\n');
console.log('='.repeat(60));

// Generate unique names
const timestamp = Date.now();
const bucketName = `agrinext-images-${timestamp}`;
const dbInstanceId = `agrinext-db-${timestamp}`;
const ec2InstanceName = `agrinext-backend-${timestamp}`;

async function deployS3Bucket() {
  console.log('\n📦 Step 1: Creating S3 Bucket...');
  
  try {
    await s3.createBucket({ Bucket: bucketName }).promise();
    console.log(`✅ S3 Bucket created: ${bucketName}`);
    
    // Enable versioning
    await s3.putBucketVersioning({
      Bucket: bucketName,
      VersioningConfiguration: { Status: 'Enabled' }
    }).promise();
    console.log('✅ Versioning enabled');
    
    return bucketName;
  } catch (error) {
    console.log(`❌ Failed to create S3 bucket: ${error.message}`);
    throw error;
  }
}

async function createSecurityGroup() {
  console.log('\n🔒 Step 2: Creating Security Groups...');
  
  try {
    // Get default VPC
    const vpcs = await ec2.describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();
    const vpcId = vpcs.Vpcs[0].VpcId;
    console.log(`✅ Using VPC: ${vpcId}`);
    
    // Create security group for EC2
    const sgResult = await ec2.createSecurityGroup({
      GroupName: `agrinext-backend-sg-${timestamp}`,
      Description: 'Security group for Agrinext backend server',
      VpcId: vpcId
    }).promise();
    
    const sgId = sgResult.GroupId;
    console.log(`✅ Security Group created: ${sgId}`);
    
    // Add inbound rules
    await ec2.authorizeSecurityGroupIngress({
      GroupId: sgId,
      IpPermissions: [
        {
          IpProtocol: 'tcp',
          FromPort: 22,
          ToPort: 22,
          IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'SSH access' }]
        },
        {
          IpProtocol: 'tcp',
          FromPort: 3000,
          ToPort: 3000,
          IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'HTTP access' }]
        }
      ]
    }).promise();
    console.log('✅ Inbound rules added (SSH: 22, HTTP: 3000)');
    
    return { vpcId, sgId };
  } catch (error) {
    console.log(`❌ Failed to create security group: ${error.message}`);
    throw error;
  }
}

async function deployRDS(vpcId, sgId) {
  console.log('\n🗄️  Step 3: Creating RDS PostgreSQL Database...');
  console.log('⏳ This will take 10-15 minutes...');
  
  try {
    const dbPassword = 'Agrinext' + Math.random().toString(36).substring(2, 10) + '!';
    
    const params = {
      DBInstanceIdentifier: dbInstanceId,
      DBInstanceClass: 'db.t3.micro',
      Engine: 'postgres',
      MasterUsername: 'postgres',
      MasterUserPassword: dbPassword,
      AllocatedStorage: 20,
      DBName: 'agrinext_mvp',
      PubliclyAccessible: true,
      VpcSecurityGroupIds: [sgId],
      BackupRetentionPeriod: 0,
      StorageType: 'gp2'
    };
    
    await rds.createDBInstance(params).promise();
    console.log(`✅ RDS instance creation initiated: ${dbInstanceId}`);
    console.log(`   Database: agrinext_mvp`);
    console.log(`   Username: postgres`);
    console.log(`   Password: ${dbPassword}`);
    console.log(`   ⚠️  SAVE THIS PASSWORD!`);
    
    return { dbInstanceId, dbPassword };
  } catch (error) {
    console.log(`❌ Failed to create RDS instance: ${error.message}`);
    throw error;
  }
}

async function deployEC2(sgId) {
  console.log('\n💻 Step 4: Creating EC2 Instance...');
  
  try {
    // Get latest Amazon Linux 2023 AMI
    const images = await ec2.describeImages({
      Owners: ['amazon'],
      Filters: [
        { Name: 'name', Values: ['al2023-ami-2023.*-x86_64'] },
        { Name: 'state', Values: ['available'] }
      ]
    }).promise();
    
    const amiId = images.Images.sort((a, b) => 
      new Date(b.CreationDate) - new Date(a.CreationDate)
    )[0].ImageId;
    
    console.log(`✅ Using AMI: ${amiId}`);
    
    // User data script to install Node.js
    const userData = `#!/bin/bash
yum update -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 18
npm install -g pm2
yum install -y postgresql15
`;
    
    // Try to find available Free Tier instance type
    let instanceType = 't2.micro';
    try {
      const types = await ec2.describeInstanceTypes({
        Filters: [{ Name: 'free-tier-eligible', Values: ['true'] }]
      }).promise();
      if (types.InstanceTypes.length > 0) {
        instanceType = types.InstanceTypes[0].InstanceType;
        console.log(`✅ Using Free Tier instance type: ${instanceType}`);
      }
    } catch (e) {
      console.log(`⚠️  Using default: ${instanceType}`);
    }
    
    const params = {
      ImageId: amiId,
      InstanceType: instanceType,
      MinCount: 1,
      MaxCount: 1,
      SecurityGroupIds: [sgId],
      UserData: Buffer.from(userData).toString('base64'),
      TagSpecifications: [{
        ResourceType: 'instance',
        Tags: [{ Key: 'Name', Value: ec2InstanceName }]
      }]
    };
    
    const result = await ec2.runInstances(params).promise();
    const instanceId = result.Instances[0].InstanceId;
    console.log(`✅ EC2 instance created: ${instanceId}`);
    console.log('⏳ Waiting for instance to start...');
    
    // Wait for instance to be running
    await ec2.waitFor('instanceRunning', { InstanceIds: [instanceId] }).promise();
    
    // Get public IP
    const instances = await ec2.describeInstances({ InstanceIds: [instanceId] }).promise();
    const publicIp = instances.Reservations[0].Instances[0].PublicIpAddress;
    
    console.log(`✅ Instance is running!`);
    console.log(`   Public IP: ${publicIp}`);
    console.log(`   SSH: ssh -i agrinext-key.pem ec2-user@${publicIp}`);
    
    return { instanceId, publicIp };
  } catch (error) {
    console.log(`❌ Failed to create EC2 instance: ${error.message}`);
    throw error;
  }
}

async function deploy() {
  try {
    // Step 1: S3
    const bucket = await deployS3Bucket();
    
    // Step 2: Security Group
    const { vpcId, sgId } = await createSecurityGroup();
    
    // Step 3: RDS (this takes time)
    const { dbInstanceId, dbPassword } = await deployRDS(vpcId, sgId);
    
    // Step 4: EC2
    const { instanceId, publicIp } = await deployEC2(sgId);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Deployment Successful!');
    console.log('='.repeat(60));
    console.log('\n📋 Resource Summary:\n');
    console.log(`S3 Bucket:       ${bucket}`);
    console.log(`RDS Instance:    ${dbInstanceId} (creating...)`);
    console.log(`EC2 Instance:    ${instanceId}`);
    console.log(`Public IP:       ${publicIp}`);
    console.log(`Security Group:  ${sgId}`);
    console.log('\n🔐 Database Credentials:\n');
    console.log(`Host:     (will be available in 10-15 minutes)`);
    console.log(`Database: agrinext_mvp`);
    console.log(`Username: postgres`);
    console.log(`Password: ${dbPassword}`);
    console.log('\n⚠️  IMPORTANT: Save these credentials!');
    console.log('\n📝 Next Steps:\n');
    console.log(`1. Wait for RDS to finish creating (10-15 minutes)`);
    console.log(`2. SSH into EC2: ssh ec2-user@${publicIp}`);
    console.log(`3. Upload backend code to EC2`);
    console.log(`4. Configure environment variables`);
    console.log(`5. Initialize database schema`);
    console.log(`6. Start the server`);
    console.log('\n');
    
  } catch (error) {
    console.log('\n❌ Deployment failed');
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
}

deploy();
