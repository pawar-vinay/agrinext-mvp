/**
 * Fix Security Group - Allow Port 3000 from Internet
 */

require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const ec2 = new AWS.EC2();

console.log('\n🔧 Fixing Security Group for Port 3000\n');

async function fixSecurityGroup() {
  try {
    // Get the security group
    const sgId = 'sg-01402410c86b50f62';
    
    console.log(`Checking security group: ${sgId}`);
    
    // Describe current rules
    const sg = await ec2.describeSecurityGroups({ GroupIds: [sgId] }).promise();
    const currentRules = sg.SecurityGroups[0].IpPermissions;
    
    console.log('\nCurrent inbound rules:');
    currentRules.forEach(rule => {
      console.log(`  Port ${rule.FromPort}: ${rule.IpRanges.map(r => r.CidrIp).join(', ')}`);
    });
    
    // Check if port 3000 rule exists
    const port3000Exists = currentRules.some(rule => 
      rule.FromPort === 3000 && rule.ToPort === 3000
    );
    
    if (port3000Exists) {
      console.log('\n✅ Port 3000 rule already exists');
      
      // Check if it allows 0.0.0.0/0
      const port3000Rule = currentRules.find(rule => rule.FromPort === 3000);
      const allowsAll = port3000Rule.IpRanges.some(r => r.CidrIp === '0.0.0.0/0');
      
      if (allowsAll) {
        console.log('✅ Port 3000 is open to the internet');
        console.log('\n🔍 The issue might be:');
        console.log('1. Server not binding to 0.0.0.0 (only localhost)');
        console.log('2. Firewall on EC2 instance');
        console.log('\nTry this on EC2:');
        console.log('  sudo iptables -L -n');
        console.log('  netstat -tlnp | grep 3000');
      } else {
        console.log('⚠️  Port 3000 exists but not open to internet');
        console.log('Adding 0.0.0.0/0 rule...');
        
        await ec2.authorizeSecurityGroupIngress({
          GroupId: sgId,
          IpPermissions: [{
            IpProtocol: 'tcp',
            FromPort: 3000,
            ToPort: 3000,
            IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'HTTP access for Agrinext API' }]
          }]
        }).promise();
        
        console.log('✅ Port 3000 now open to internet');
      }
    } else {
      console.log('\n⚠️  Port 3000 rule missing! Adding it now...');
      
      await ec2.authorizeSecurityGroupIngress({
        GroupId: sgId,
        IpPermissions: [{
          IpProtocol: 'tcp',
          FromPort: 3000,
          ToPort: 3000,
          IpRanges: [{ CidrIp: '0.0.0.0/0', Description: 'HTTP access for Agrinext API' }]
        }]
      }).promise();
      
      console.log('✅ Port 3000 rule added successfully');
    }
    
    console.log('\n📝 Next steps:');
    console.log('1. Wait 30 seconds for changes to apply');
    console.log('2. Try browser again: http://3.239.184.220:3000/health');
    console.log('3. If still not working, check server binding on EC2:');
    console.log('   netstat -tlnp | grep 3000');
    console.log('   (Should show 0.0.0.0:3000, not 127.0.0.1:3000)');
    
  } catch (error) {
    if (error.code === 'InvalidPermission.Duplicate') {
      console.log('✅ Port 3000 rule already exists');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

fixSecurityGroup();
