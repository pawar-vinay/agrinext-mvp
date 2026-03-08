/**
 * Backend Stack - EC2 Instance
 * Creates EC2 instance for Node.js backend
 */

const cdk = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const iam = require('aws-cdk-lib/aws-iam');
const { Construct } = require('constructs');

class BackendStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { database, bucket } = props;

    // Import VPC from database stack
    const vpc = ec2.Vpc.fromLookup(this, 'ImportedVPC', {
      vpcId: cdk.Fn.importValue('AgrinextVPCId')
    });

    // Security group for EC2
    const webSecurityGroup = new ec2.SecurityGroup(this, 'WebSecurityGroup', {
      vpc,
      description: 'Security group for Agrinext backend server',
      allowAllOutbound: true
    });

    // Allow HTTP and SSH
    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      'Allow HTTP'
    );

    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(3000),
      'Allow Node.js app'
    );

    webSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH'
    );

    // IAM role for EC2
    const role = new iam.Role(this, 'BackendInstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
      ]
    });

    // Grant S3 access
    bucket.grantReadWrite(role);

    // Grant Secrets Manager access for database credentials
    database.secret.grantRead(role);

    // User data script to set up Node.js
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      '#!/bin/bash',
      'set -e',
      '',
      '# Update system',
      'yum update -y',
      '',
      '# Install Node.js 18',
      'curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -',
      'yum install -y nodejs',
      '',
      '# Install Git',
      'yum install -y git',
      '',
      '# Install PM2 globally',
      'npm install -g pm2',
      '',
      '# Create app directory',
      'mkdir -p /home/ec2-user/agrinext',
      'cd /home/ec2-user/agrinext',
      '',
      '# Set ownership',
      'chown -R ec2-user:ec2-user /home/ec2-user/agrinext',
      '',
      '# Create systemd service for PM2',
      'env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user',
      '',
      'echo "Node.js setup complete!"'
    );

    // EC2 instance (Free Tier eligible)
    this.instance = new ec2.Instance(this, 'BackendInstance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO // Free tier eligible
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2(),
      securityGroup: webSecurityGroup,
      role,
      userData,
      keyName: 'agrinext-key' // You'll need to create this key pair manually
    });

    // Outputs
    new cdk.CfnOutput(this, 'InstanceId', {
      value: this.instance.instanceId,
      description: 'EC2 instance ID'
    });

    new cdk.CfnOutput(this, 'InstancePublicIP', {
      value: this.instance.instancePublicIp,
      description: 'EC2 instance public IP'
    });

    new cdk.CfnOutput(this, 'InstancePublicDNS', {
      value: this.instance.instancePublicDnsName,
      description: 'EC2 instance public DNS'
    });

    new cdk.CfnOutput(this, 'SSHCommand', {
      value: `ssh -i agrinext-key.pem ec2-user@${this.instance.instancePublicDnsName}`,
      description: 'SSH command to connect to instance'
    });
  }
}

module.exports = { BackendStack };
