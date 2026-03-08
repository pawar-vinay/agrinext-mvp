/**
 * Deploy EC2 Instance Only
 * Use this when S3 and RDS are already created
 */

require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const ec2 = new AWS.EC2();

console.log('\n💻 Deploying EC2 Instance for Agrinext\n');
console.log('='.repeat(60));

const timestamp = Date.now();
const ec2InstanceName = `agrinext-backend-${timestamp}`;

async function deployEC2() {
  try {
    // Get existing security group or create new one
    console.log('\n🔒 Checking Security Groups...');
    const sgs = await ec2.describeSecurityGroups({
      Filters: [{ Name: 'group-name', Values: ['agrinext-backend-sg-*'] }]
    }).promise();
    
    let sgId;
    if (sgs.SecurityGroups.length > 0) {
      sgId = sgs.SecurityGroups[0].GroupId;
      console.log(`✅ Using existing Security Group: ${sgId}`);
    } else {
      // Create new security group
      const vpcs = await ec2.describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();
      const vpcId = vpcs.Vpcs[0].VpcId;
      
      const sgResult = await ec2.createSecurityGroup({
        GroupName: `agrinext-backend-sg-${timestamp}`,
        Description: 'Security group for Agrinext backend',
        VpcId: vpcId
      }).promise();
      
      sgId = sgResult.GroupId;
      console.log(`✅ Security Group created: ${sgId}`);
      
      await ec2.authorizeSecurityGroupIngress({
        GroupId: sgId,
        IpPermissions: [
          {
            IpProtocol: 'tcp',
            FromPort: 22,
            ToPort: 22,
            IpRanges: [{ CidrIp: '0.0.0.0/0' }]
          },
          {
            IpProtocol: 'tcp',
            FromPort: 3000,
            ToPort: 3000,
            IpRanges: [{ CidrIp: '0.0.0.0/0' }]
          }
        ]
      }).promise();
      console.log('✅ Inbound rules added');
    }
    
    // Get latest Amazon Linux 2023 AMI
    console.log('\n📀 Finding Amazon Linux AMI...');
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
    
    // Find available Free Tier instance type
    console.log('\n🔍 Finding Free Tier instance type...');
    let instanceType = 't3.micro'; // fallback
    try {
      const types = await ec2.describeInstanceTypes({
        Filters: [{ Name: 'free-tier-eligible', Values: ['true'] }]
      }).promise();
      if (types.InstanceTypes.length > 0) {
        // Prefer t3.micro, then t2.micro
        const preferred = types.InstanceTypes.find(t => t.InstanceType === 't3.micro') ||
                         types.InstanceTypes.find(t => t.InstanceType === 't2.micro') ||
                         types.InstanceTypes[0];
        instanceType = preferred.InstanceType;
      }
    } catch (e) {
      console.log(`⚠️  Could not query instance types, using ${instanceType}`);
    }
    console.log(`✅ Using instance type: ${instanceType}`);
    
    // User data script
    const userData = `#!/bin/bash
yum update -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 18
npm install -g pm2
yum install -y postgresql15
`;
    
    // Launch instance
    console.log('\n🚀 Launching EC2 instance...');
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
    console.log('⏳ Waiting for instance to start (this may take 2-3 minutes)...');
    
    // Wait for instance
    await ec2.waitFor('instanceRunning', { InstanceIds: [instanceId] }).promise();
    
    // Get public IP
    const instances = await ec2.describeInstances({ InstanceIds: [instanceId] }).promise();
    const publicIp = instances.Reservations[0].Instances[0].PublicIpAddress;
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 EC2 Instance Deployed Successfully!');
    console.log('='.repeat(60));
    console.log('\n📋 Instance Details:\n');
    console.log(`Instance ID:  ${instanceId}`);
    console.log(`Instance Type: ${instanceType}`);
    console.log(`Public IP:    ${publicIp}`);
    console.log(`SSH Command:  ssh ec2-user@${publicIp}`);
    console.log('\n⚠️  Note: You need a key pair to SSH. Create one in AWS Console if needed.');
    console.log('\n📝 Next Steps:\n');
    console.log('1. Create/download EC2 key pair from AWS Console');
    console.log('2. SSH into instance: ssh -i your-key.pem ec2-user@' + publicIp);
    console.log('3. Upload backend code');
    console.log('4. Configure environment variables');
    console.log('5. Start the server');
    console.log('\n');
    
  } catch (error) {
    console.log('\n❌ Deployment failed');
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
}

deployEC2();
