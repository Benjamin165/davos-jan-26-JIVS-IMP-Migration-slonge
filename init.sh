#!/bin/bash

# JIVS IMP Migration Visual Companion - Development Setup Script
# This script sets up the complete development environment

set -e

echo "============================================"
echo "JIVS IMP Migration Visual Companion"
echo "Development Environment Setup"
echo "============================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "ERROR: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo ""

# Create directory structure if needed
echo "Setting up project structure..."
mkdir -p frontend/src/{components,pages,hooks,context,utils,styles}
mkdir -p frontend/src/components/{ui,layout,charts,dashboard,common}
mkdir -p frontend/public
mkdir -p backend/src/{routes,middleware,models,utils,services}
mkdir -p backend/data
mkdir -p shared

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    npm init -y
fi
npm install express cors jsonwebtoken bcryptjs better-sqlite3 dotenv xlsx uuid
npm install --save-dev nodemon

# Install frontend dependencies
echo ""
echo "Installing frontend dependencies..."
cd ../frontend
if [ ! -f "package.json" ]; then
    npm create vite@latest . -- --template react
fi
npm install
npm install tailwindcss postcss autoprefixer @tailwindcss/forms
npm install framer-motion recharts
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-switch
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react
npm install react-router-dom
npm install zustand
npm install axios

# Initialize Tailwind CSS
npx tailwindcss init -p

cd ..

echo ""
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
echo "To start development:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3001"
echo ""
echo "Default credentials (after seeding):"
echo "   Admin: admin@jivs.com / admin123"
echo "   User: user@jivs.com / user123"
echo ""
