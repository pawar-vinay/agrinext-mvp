/**
 * Database Stack - RDS PostgreSQL
 * Creates PostgreSQL database in AWS Free Tier
 */

const cdk = require('aws-cdk-lib');
const ec2 = require('aws-cdk-lib/aws-ec2');
const rds = require('aws-cdk-lib/aws-rds');
const { Construct } = require('constructs');

class DatabaseStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // VPC for database
    const vpc = new ec2.Vpc(this, 'AgrinextVPC', {
      maxAzs: 2,
      natGateways: 0, // Free tier - no NAT gateway
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC
        }
      ]
    });

    // Security group for database
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for Agrinext PostgreSQL database',
      allowAllOutbound: true
    });

    // Allow PostgreSQL access from anywhere (restrict in production)
    dbSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL access'
    );

    // RDS PostgreSQL instance (Free Tier eligible)
    this.database = new rds.DatabaseInstance(this, 'AgrinextDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_14
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO // Free tier eligible
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'agrinext_mvp',
      credentials: rds.Credentials.fromGeneratedSecret('postgres'),
      allocatedStorage: 20, // Free tier: 20GB
      maxAllocatedStorage: 20,
      publiclyAccessible: true,
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/test only
      backupRetention: cdk.Duration.days(0) // No backups for free tier
    });

    // Outputs
    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: this.database.dbInstanceEndpointAddress,
      description: 'PostgreSQL database endpoint'
    });

    new cdk.CfnOutput(this, 'DatabasePort', {
      value: this.database.dbInstanceEndpointPort,
      description: 'PostgreSQL database port'
    });

    new cdk.CfnOutput(this, 'DatabaseSecretArn', {
      value: this.database.secret.secretArn,
      description: 'ARN of the database credentials secret'
    });

    new cdk.CfnOutput(this, 'VPCId', {
      value: vpc.vpcId,
      description: 'VPC ID',
      exportName: 'AgrinextVPCId'
    });

    // Export VPC for other stacks
    this.vpc = vpc;
  }
}

module.exports = { DatabaseStack };
