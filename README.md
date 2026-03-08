# AgriNext MVP

Agricultural advisory platform empowering rural Indian farmers with AI-powered disease detection, expert agronomy advice, and multilingual access to government schemes.

## 🌾 Overview

AgriNext addresses three critical challenges faced by rural farmers:
1. **Crop Disease Detection**: AI-powered image analysis for early disease identification
2. **Agronomy Advisory**: Real-time farming advice personalized to location and crops
3. **Government Schemes**: Simplified access to benefits in local languages

**Live Demo**: http://3.239.184.220:3000

## ✨ Features

- 🔍 **Disease Detection**: Upload crop images, get instant AI analysis
- 💡 **Expert Advice**: Ask farming questions, receive personalized guidance
- 📋 **Government Schemes**: Browse and check eligibility for benefits
- 🌐 **Multilingual**: English, Hindi, Telugu support
- 📱 **Mobile-First**: Responsive design for all devices
- 🔐 **Secure**: JWT authentication, encrypted data

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 13.x
- AWS account (for S3 storage)
- API keys: OpenAI, Hugging Face

### Installation

```bash
# Clone repository
git clone https://github.com/pawar-vinay/agrinext-mvp.git
cd agrinext-mvp

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run build

# Setup web app
cd ../web-app
npm install
npm run build

# Setup database
cd ../database
./setup.sh  # or setup.ps1 on Windows
```

### Running Locally

```bash
# Start backend
cd backend
npm run dev
# Backend runs on http://localhost:3000

# Start web app (in another terminal)
cd web-app
npm run dev
# Web app runs on http://localhost:5173
```


## 📁 Project Structure

```
agrinext-mvp/
├── backend/              # Node.js + Express API
│   ├── src/             # TypeScript source code
│   ├── tests/           # Test files
│   └── package.json     # Dependencies
├── web-app/             # React + Vite frontend
│   ├── src/             # React components
│   └── package.json     # Dependencies
├── database/            # Database schema and migrations
│   ├── schema.sql       # Database schema
│   ├── migrations/      # Migration scripts
│   └── seed-data.sql    # Initial data
├── deploy/              # Deployment scripts
├── .kiro/specs/         # Project specifications
└── docs/                # Documentation
```

## 🛠️ Technology Stack

**Frontend**:
- React 18.x
- TypeScript
- Vite
- Axios
- Tailwind CSS

**Backend**:
- Node.js 18.x
- Express.js
- TypeScript
- PostgreSQL
- JWT Authentication

**AI/ML**:
- Hugging Face (Disease Detection)
- OpenAI GPT-3.5 (Advisory)

**Infrastructure**:
- AWS EC2 (Compute)
- AWS RDS (Database)
- AWS S3 (Storage)

## 📖 Documentation

- [Complete Walkthrough](AGRINEXT-WALKTHROUGH.md) - Comprehensive guide
- [Architecture](ARCHITECTURE-DIAGRAM.md) - System architecture
- [Git Guide](GIT-COMMIT-GUIDE.md) - Commit guidelines
- [Deployment](deploy/README.md) - Deployment instructions
- [Database](database/README.md) - Database documentation

## 🔑 Configuration

### Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Database
DB_HOST=your-database-host
DB_PASSWORD=your-database-password

# API Keys
OPENAI_API_KEY=your-openai-key
HUGGINGFACE_API_KEY=your-huggingface-key

# AWS
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
```


## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### API Testing
```bash
# Health check
curl http://localhost:3000/health

# Disease detection (with demo token)
curl -X POST http://localhost:3000/api/v1/diseases/detect \
  -H "Authorization: Bearer demo-token-12345" \
  -F "image=@test-image.jpg"
```

## 🚀 Deployment

### AWS EC2 Deployment

See [Deployment Guide](deploy/README.md) for detailed instructions.

Quick deployment:
```bash
# Build and deploy
./deploy-webapp-to-backend.ps1
```

## 📊 MVP Roadmap

### ✅ Phase 1-2: Completed
- User authentication with demo mode
- Disease detection with Hugging Face
- Web application deployment
- Database setup

### 🔄 Phase 3: In Progress
- Advisory service with OpenAI
- Rating system
- History tracking

### ⏳ Phase 4-6: Planned
- Government schemes database
- Weather integration
- Testing and pilot launch

See [AGRINEXT-WALKTHROUGH.md](AGRINEXT-WALKTHROUGH.md) for complete roadmap.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is proprietary. All rights reserved.

## 👥 Team

- Development Team: AgriNext
- Contact: [Your contact information]

## 🔗 Links

- **Live Demo**: http://3.239.184.220:3000
- **Documentation**: [AGRINEXT-WALKTHROUGH.md](AGRINEXT-WALKTHROUGH.md)
- **GitHub**: https://github.com/pawar-vinay/agrinext-mvp

## ⚠️ Security Notice

**NEVER commit**:
- `.env` files with real credentials
- `*.pem` SSH keys
- AWS credential files
- API keys or secrets

Always use `.env.example` templates with placeholder values.

---

**Built with ❤️ for Indian Farmers**
