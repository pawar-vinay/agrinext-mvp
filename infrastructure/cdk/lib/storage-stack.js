/**
 * Storage Stack - S3 Bucket
 * Creates S3 bucket for image storage
 */

const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const { Construct } = require('constructs');

class StorageStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3 bucket for crop disease images
    this.bucket = new s3.Bucket(this, 'AgrinextImageBucket', {
      bucketName: `agrinext-images-${cdk.Aws.ACCOUNT_ID}`,
      versioned: false,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT
          ],
          allowedOrigins: ['*'], // Restrict in production
          allowedHeaders: ['*'],
          maxAge: 3000
        }
      ],
      lifecycleRules: [
        {
          id: 'DeleteOldImages',
          enabled: true,
          expiration: cdk.Duration.days(90), // Delete images after 90 days
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(30)
            }
          ]
        }
      ],
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev/test only
      autoDeleteObjects: true
    });

    // Outputs
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.bucket.bucketName,
      description: 'S3 bucket name for images',
      exportName: 'AgrinextImageBucketName'
    });

    new cdk.CfnOutput(this, 'BucketArn', {
      value: this.bucket.bucketArn,
      description: 'S3 bucket ARN'
    });
  }
}

module.exports = { StorageStack };
