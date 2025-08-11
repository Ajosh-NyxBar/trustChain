#!/bin/bash

# TrustChain Setup Script
# This script sets up the complete TrustChain development environment

echo "🚀 Setting up TrustChain - Blockchain Supply Chain Management System"
echo "=================================================================="

# Check Node.js version
echo "📋 Checking prerequisites..."
node_version=$(node -v 2>/dev/null | cut -c 2-)
if [ -z "$node_version" ]; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if version is >= 18
if [ "$(printf '%s\n' "18.0.0" "$node_version" | sort -V | head -n1)" != "18.0.0" ]; then
    echo "❌ Node.js version $node_version is too old. Please install Node.js 18+ and try again."
    exit 1
fi

echo "✅ Node.js version $node_version detected"

# Check npm
npm_version=$(npm -v 2>/dev/null)
if [ -z "$npm_version" ]; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version $npm_version detected"

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git and try again."
    exit 1
fi

echo "✅ Git is available"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo ""
echo "🎨 Setting up frontend..."
cd frontend
if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found"
    exit 1
fi

npm install
echo "✅ Frontend dependencies installed"

# Install backend dependencies
echo ""
echo "⚙️ Setting up backend..."
cd ../backend
if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found"
    exit 1
fi

npm install
echo "✅ Backend dependencies installed"

# Install blockchain dependencies
echo ""
echo "🔗 Setting up blockchain..."
cd ../blockchain
if [ ! -f "package.json" ]; then
    echo "❌ Blockchain package.json not found"
    exit 1
fi

npm install
echo "✅ Blockchain dependencies installed"

# Setup environment files
echo ""
echo "🔧 Setting up environment files..."
cd ..

# Copy environment templates
if [ ! -f "blockchain/.env" ]; then
    cp blockchain/.env.example blockchain/.env
    echo "✅ Blockchain .env file created"
else
    echo "⚠️ Blockchain .env file already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Frontend .env file created"
else
    echo "⚠️ Frontend .env file already exists"
fi

if [ ! -f "backend/.env" ]; then
    echo "NODE_ENV=development
PORT=3001
DB_URL=mongodb://localhost:27017/trustchain
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:5173" > backend/.env
    echo "✅ Backend .env file created"
else
    echo "⚠️ Backend .env file already exists"
fi

# Compile smart contracts
echo ""
echo "⚡ Compiling smart contracts..."
cd blockchain
npm run compile

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts compiled successfully"
else
    echo "❌ Smart contract compilation failed"
    exit 1
fi

# Check if we can deploy to localhost
echo ""
echo "🔍 Checking blockchain deployment..."

# Start hardhat node in background for testing
npm run node > /dev/null 2>&1 &
HARDHAT_PID=$!

# Wait a moment for node to start
sleep 5

# Deploy contracts to localhost
npm run deploy:localhost > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Smart contracts deployed to localhost successfully"
    
    # Kill hardhat node
    kill $HARDHAT_PID 2>/dev/null
else
    echo "⚠️ Smart contract deployment test failed (this is normal if no network is available)"
    # Kill hardhat node
    kill $HARDHAT_PID 2>/dev/null
fi

# Final setup
cd ..

echo ""
echo "🎉 TrustChain setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment files:"
echo "   - blockchain/.env (add your private key for testnet deployment)"
echo "   - frontend/.env (add IPFS credentials)"
echo "   - backend/.env (configure database connection)"
echo ""
echo "2. To start development:"
echo "   npm run dev"
echo ""
echo "3. To deploy to Mumbai testnet:"
echo "   cd blockchain && npm run deploy:mumbai"
echo ""
echo "📚 Documentation:"
echo "   - Frontend: ./frontend/README.md"
echo "   - Backend: ./backend/README.md"
echo "   - Blockchain: ./blockchain/README.md"
echo ""
echo "🔗 Quick commands:"
echo "   npm run dev               # Start all services"
echo "   npm run dev:frontend      # Start frontend only"
echo "   npm run dev:backend       # Start backend only"
echo "   npm run dev:blockchain    # Start blockchain node only"
echo "   npm run deploy:contracts  # Deploy smart contracts"
echo "   npm run test              # Run all tests"
echo ""
echo "Happy coding! 🚀"
