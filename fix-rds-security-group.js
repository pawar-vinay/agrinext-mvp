/**
 * Fix RDS Security Group to Allow EC2 Access
 */

require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const ec2 = new AWS.EC2();
const rds = new AWS.RDS();

console.log('\n🔧 Fixing RDS Security Group\n');

async function fixRDSSecurityGroup() {
  try {
    // Get RDS instance details
    console.log('Step 1: Getting RDS instance details...');
    const dbInstances = await rds.describeDBInstances({
      DBInstanceIdentifier: 'agrinext-db-1772367775698'
    }).promise();
    
    const dbInstance = dbInstances.DBInstances[0];
    const dbSecurityGroups = dbInstance.VpcSecurityGroups;
    const dbSgId = dbSecurityGroups[0].VpcSecurityGroupId;
    
    console.log(`✅ RDS Security Group: ${dbSgId}`);
    
    // Get EC2 security group
    console.log('\nStep 2: Getting EC2 security group...');
    const ec2SgId = 'sg-01402410c86b50f62';
    console.log(`✅ EC2 Security Group: ${ec2SgId}`);
    
    // Add rule to allow EC2 to access RDS
    console.log('\nStep 3: Adding inbound rule to RDS security group...');
    try {
      await ec2.authorizeSecurityGroupIngress({
        GroupId: dbSgId,
        IpPermissions: [{
          IpProtocol: 'tcp',
          FromPort: 5432,
          ToPort: 5432,
          UserIdGroupPairs: [{
            GroupId: ec2SgId,
            Description: 'Allow EC2 backend to access RDS'
          }]
        }]
      }).promise();
      console.log('✅ Inbound rule added successfully');
    } catch (e) {
      if (e.code === 'InvalidPermission.Duplicate') {
        console.log('✅ Rule already exists');
      } else {
        throw e;
      }
    }
    
    console.log('\n✅ RDS security group fixed!');
    console.log('\nNow try connecting from EC2:');
    console.log('  psql -h agrinext-db-1772367775698.cyjeessmab3d.us-east-1.rds.amazonaws.com -U postgres -d agrinext_mvp');
    
  } catch (error) {
    console.log('\n❌ Error:', error.message);
  }
}

fixRDSSecurityGroup();
