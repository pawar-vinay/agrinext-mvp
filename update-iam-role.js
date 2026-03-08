#!/usr/bin/env node

/**
 * Script to attach AmazonS3FullAccess policy to AgrinextEC2Role
 * This allows EC2 instance to upload images to S3
 */

const { IAMClient, AttachRolePolicyCommand, ListAttachedRolePoliciesCommand } = require('@aws-sdk/client-iam');

const ROLE_NAME = 'AgrinextEC2Role';
const POLICY_ARN = 'arn:aws:iam::aws:policy/AmazonS3FullAccess';
const REGION = 'us-east-1';

async function updateIAMRole() {
  console.log('🔧 Starting IAM Role Update...\n');

  // Create IAM client
  const iamClient = new IAMClient({ region: REGION });

  try {
    // Step 1: Check current policies
    console.log(`📋 Checking current policies for role: ${ROLE_NAME}`);
    const listCommand = new ListAttachedRolePoliciesCommand({
      RoleName: ROLE_NAME
    });
    
    const listResponse = await iamClient.send(listCommand);
    console.log('Current attached policies:');
    listResponse.AttachedPolicies.forEach(policy => {
      console.log(`  - ${policy.PolicyName}`);
    });
    console.log();

    // Step 2: Check if AmazonS3FullAccess is already attached
    const hasS3FullAccess = listResponse.AttachedPolicies.some(
      policy => policy.PolicyArn === POLICY_ARN
    );

    if (hasS3FullAccess) {
      console.log('✅ AmazonS3FullAccess policy is already attached!');
      console.log('✅ No changes needed.\n');
      return;
    }

    // Step 3: Attach AmazonS3FullAccess policy
    console.log('📎 Attaching AmazonS3FullAccess policy...');
    const attachCommand = new AttachRolePolicyCommand({
      RoleName: ROLE_NAME,
      PolicyArn: POLICY_ARN
    });

    await iamClient.send(attachCommand);
    console.log('✅ Successfully attached AmazonS3FullAccess policy!\n');

    // Step 4: Verify the attachment
    console.log('🔍 Verifying policy attachment...');
    const verifyResponse = await iamClient.send(listCommand);
    console.log('Updated attached policies:');
    verifyResponse.AttachedPolicies.forEach(policy => {
      console.log(`  - ${policy.PolicyName}`);
    });
    console.log();

    console.log('============================================');
    console.log('✅ IAM Role Update Complete!');
    console.log('============================================\n');
    console.log('Summary:');
    console.log(`  - Role: ${ROLE_NAME}`);
    console.log(`  - Policy Added: AmazonS3FullAccess`);
    console.log(`  - EC2 can now upload images to S3 ✅\n`);
    console.log('Next Step: Connect to EC2 and run deployment script');
    console.log('============================================\n');

  } catch (error) {
    console.error('❌ Error updating IAM role:', error.message);
    
    if (error.name === 'NoSuchEntityException') {
      console.error(`\n⚠️  Role "${ROLE_NAME}" not found.`);
      console.error('Please verify the role name in AWS Console.');
    } else if (error.name === 'AccessDeniedException') {
      console.error('\n⚠️  Access denied. Your AWS credentials may not have IAM permissions.');
      console.error('Required permission: iam:AttachRolePolicy');
    } else {
      console.error('\nFull error:', error);
    }
    
    process.exit(1);
  }
}

// Run the script
updateIAMRole();
