#!/bin/bash
set -e

echo "==================================="
echo "Production Deployment Checklist"
echo "==================================="
echo ""

# Check required environment variables
if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET environment variable not set"
    echo ""
    echo "Generate a secure JWT secret with:"
    echo "  node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
    echo ""
    echo "Then set it:"
    echo "  export JWT_SECRET=<your-generated-secret>"
    exit 1
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
    echo "❌ ERROR: JWT_SECRET must be at least 32 characters long"
    exit 1
fi

echo "✓ JWT_SECRET is set and secure"

# Check .env file doesn't exist in production
if [ -f "backend/.env" ]; then
    echo "⚠️  WARNING: backend/.env file exists"
    echo "    In production, use environment variables instead of .env files"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✓ Environment check passed"

# Build frontend
echo ""
echo "Building frontend..."
cd frontend
npm ci --only=production
npm run build
cd ..

echo "✓ Frontend built successfully"

# Install backend dependencies
echo ""
echo "Installing backend dependencies..."
cd backend
npm ci --only=production
cd ..

echo "✓ Backend dependencies installed"

echo ""
echo "==================================="
echo "Deployment preparation complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Ensure JWT_SECRET environment variable is set"
echo "2. Set CORS_ORIGINS to your production domain"
echo "3. Start backend: cd backend && NODE_ENV=production npm start"
echo "4. Serve frontend/dist with nginx or static file server"
echo ""
echo "Or use Docker:"
echo "  docker compose up -d"
