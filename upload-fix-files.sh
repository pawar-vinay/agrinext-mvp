#!/bin/bash

# Upload fix files to EC2 via S3
# Run this script locally to upload the ecosystem config and fix script

set -e

BUCKET_NAME="agrinext-images-1772367775698"
REGION="us-east-1"

echo "Uploading fix files to S3..."

# Upload ecosystem config
aws s3 cp ecosystem.config.js s3://$BUCKET_NAME/deployment/ --region $REGION
echo "✓ Uploaded ecosystem.config.js"

# Upload fix script
aws s3 cp fix-env-and-restart.sh s3://$BUCKET_NAME/deployment/ --region $REGION
echo "✓ Uploaded fix-env-and-restart.sh"

echo ""
echo "Files uploaded successfully!"
echo ""
echo "Now connect to EC2 and run these commands:"
echo ""
echo "# Download the files"
echo "cd ~/agrinext-phase2/backend"
echo "aws s3 cp s3://$BUCKET_NAME/deployment/ecosystem.config.js . --region $REGION"
echo "aws s3 cp s3://$BUCKET_NAME/deployment/fix-env-and-restart.sh . --region $REGION"
echo ""
echo "# Make script executable and run it"
echo "chmod +x fix-env-and-restart.sh"
echo "./fix-env-and-restart.sh"
