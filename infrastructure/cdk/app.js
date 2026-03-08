#!/usr/bin/env node
/**
 * AWS CDK App Entry Point
 * Deploys Agrinext infrastructure to AWS
 */

const cdk = require('aws-cdk-lib');
const { DatabaseStack } = require('./lib/database-stack');
const { StorageStack } = require('./lib/storage-stack');
const { BackendStack } = require('./lib/backend-stack');

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
};

// Stack 1: Database (RDS PostgreSQL)
const databaseStack = new DatabaseStack(app, 'AgrinextDatabaseStack', {
  env,
  description: 'Agrinext MVP - PostgreSQL Database'
});

// Stack 2: Storage (S3 for images)
const storageStack = new StorageStack(app, 'AgrinextStorageStack', {
  env,
  description: 'Agrinext MVP - S3 Image Storage'
});

// Stack 3: Backend (EC2 with Node.js)
const backendStack = new BackendStack(app, 'AgrinextBackendStack', {
  env,
  description: 'Agrinext MVP - Backend API',
  database: databaseStack.database,
  bucket: storageStack.bucket
});

// Add dependencies
backendStack.addDependency(databaseStack);
backendStack.addDependency(storageStack);

app.synth();
