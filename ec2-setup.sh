#!/bin/bash
# Agrinext EC2 Setup Script
# Run this on the EC2 instance to deploy the backend

echo "🚀 Agrinext Backend Deployment"
echo "=============================="

# Install Node.js
echo ""
echo "📦 Installing Node.js..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install 18
npm install -g pm2

# Install PostgreSQL client
echo ""
echo "🗄️  Installing PostgreSQL client..."
sudo yum install -y postgresql15

# Download backend code from S3
echo ""
echo "📥 Downloading backend code from S3..."
mkdir -p ~/agrinext
cd ~/agrinext
aws s3 cp s3://agrinext-images-1772367775698/backend/ ./backend/ --recursive
aws s3 cp s3://agrinext-images-1772367775698/database/ ./database/ --recursive

# Create .env file
echo ""
echo "📝 Creating environment configuration..."
cat > ~/agrinext/backend/.env << 'EOF'
# Database - UPDATE THIS WITH YOUR RDS ENDPOINT!
DB_HOST=YOUR_RDS_ENDPOINT_HERE.rds.amazonaws.com
DB_PORT=5432
DB_NAME=agrinext_mvp
DB_USER=postgres
DB_PASSWORD=Agrinextow7s74of!

# AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=agrinext-images-1772367775698

# Server
PORT=3000
NODE_ENV=production
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit .env file and update DB_HOST with your RDS endpoint:"
echo "   nano ~/agrinext/backend/.env"
echo ""
echo "2. Install dependencies:"
echo "   cd ~/agrinext/backend && npm install"
echo ""
echo "3. Initialize database (once RDS is ready):"
echo "   psql -h YOUR_RDS_ENDPOINT -U postgres -d agrinext_mvp -f ~/agrinext/database/schema.sql"
echo "   psql -h YOUR_RDS_ENDPOINT -U postgres -d agrinext_mvp -f ~/agrinext/database/seed-data.sql"
echo ""
echo "4. Start the server:"
echo "   pm2 start ~/agrinext/backend/src/server.js --name agrinext-api"
echo "   pm2 save"
echo ""
echo "5. Test:"
echo "   curl http://localhost:3000/health"
echo ""
