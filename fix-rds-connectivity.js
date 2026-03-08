#!/usr/bin/env node

/**
 * Fix RDS Security Group to allow EC2 connectivity
 * This script adds an inbound rule to the RDS security group to allow PostgreSQL connections from the EC2 instance
 */

const { EC2Client, DescribeInstancesCommand, DescribeSecurityGroupsCommand, AuthorizeSecurityGroupIngressCommand } = require('@aws-sdk/client-ec2');
const { RDSClient, DescribeDBInstancesCommand } = require('@aws-sdk/client-rds');

const REGION = 'us-east-1';
const EC2_INSTANCE_ID = 'i-004ef74f37ba59da1';
const RDS_IDENTIFIER = 'agrinext-db-1772367775698';

const ec2Client = new EC2Client({ region: REGION });
const rdsClient = new RDSClient({ region: REGION });

async function main() {
  console.log('🔍 Checking RDS and EC2 connectivity...\n');

  try {
    // 1. Get EC2 instance security group
    console.log('Step 1: Getting EC2 instance security group...');
    const ec2Response = await ec2Client.send(new DescribeInstancesCommand({
      InstanceIds: [EC2_INSTANCE_ID]
    }));

    const ec2Instance = ec2Response.Reservations[0].Instances[0];
    const ec2SecurityGroups = ec2Instance.SecurityGroups;
    const ec2SecurityGroupId = ec2SecurityGroups[0].GroupId;
    
    console.log(`✓ EC2 Security Group: ${ec2SecurityGroupId} (${ec2SecurityGroups[0].GroupName})`);

    // 2. Get RDS instance security group
    console.log('\nStep 2: Getting RDS instance security group...');
    const rdsResponse = await rdsClient.send(new DescribeDBInstancesCommand({
      DBInstanceIdentifier: RDS_IDENTIFIER
    }));

    const rdsInstance = rdsResponse.DBInstances[0];
    const rdsSecurityGroups = rdsInstance.VpcSecurityGroups;
    const rdsSecurityGroupId = rdsSecurityGroups[0].VpcSecurityGroupId;
    
    console.log(`✓ RDS Security Group: ${rdsSecurityGroupId}`);
    console.log(`✓ RDS Endpoint: ${rdsInstance.Endpoint.Address}:${rdsInstance.Endpoint.Port}`);

    // 3. Check if rule already exists
    console.log('\nStep 3: Checking existing security group rules...');
    const sgResponse = await ec2Client.send(new DescribeSecurityGroupsCommand({
      GroupIds: [rdsSecurityGroupId]
    }));

    const rdsSecurityGroup = sgResponse.SecurityGroups[0];
    const existingRule = rdsSecurityGroup.IpPermissions.find(rule => 
      rule.FromPort === 5432 && 
      rule.UserIdGroupPairs?.some(pair => pair.GroupId === ec2SecurityGroupId)
    );

    if (existingRule) {
      console.log('✓ Security group rule already exists - EC2 can connect to RDS');
      console.log('\n✅ RDS connectivity is properly configured!');
      return;
    }

    // 4. Add security group rule
    console.log('\nStep 4: Adding security group rule to allow EC2 → RDS connection...');
    await ec2Client.send(new AuthorizeSecurityGroupIngressCommand({
      GroupId: rdsSecurityGroupId,
      IpPermissions: [{
        IpProtocol: 'tcp',
        FromPort: 5432,
        ToPort: 5432,
        UserIdGroupPairs: [{
          GroupId: ec2SecurityGroupId,
          Description: 'Allow PostgreSQL from EC2 instance'
        }]
      }]
    }));

    console.log('✓ Security group rule added successfully!');
    console.log(`\n✅ RDS connectivity fixed! EC2 (${ec2SecurityGroupId}) can now connect to RDS (${rdsSecurityGroupId}) on port 5432`);
    
    console.log('\n📝 Next steps:');
    console.log('1. Test database connection: node test-db.js');
    console.log('2. Start Phase 2 backend: pm2 start ecosystem.config.js');

  } catch (error) {
    if (error.name === 'InvalidPermission.Duplicate') {
      console.log('✓ Security group rule already exists');
      console.log('\n✅ RDS connectivity is properly configured!');
    } else {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  }
}

main();
