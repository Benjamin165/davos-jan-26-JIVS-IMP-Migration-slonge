# Quick Start Guide

## Development Setup (5 minutes)

### Prerequisites
- Node.js 18+
- npm

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/Benjamin165/davos-jan-26-JIVS-IMP-Migration-slonge.git
   cd davos-jan-26-JIVS-IMP-Migration-slonge
   ```

2. Run the setup script:
   ```bash
   chmod +x init.sh
   ./init.sh
   ```

3. Configure environment:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env if needed (defaults work for development)
   ```

4. Start backend (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

5. Start frontend (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. Open browser:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

7. Login with default credentials:
   - Admin: admin@jivs.com / admin123
   - User: user@jivs.com / user123

## Docker Setup (Alternative)

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" > jwt_secret.txt

# Edit backend/.env and paste the JWT secret
# Then start containers
docker compose up -d

# View logs
docker compose logs -f
```

## Troubleshooting

### Port already in use
```bash
# Backend (3001)
lsof -ti:3001 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

### Database locked
```bash
rm backend/data/*.sqlite-shm
rm backend/data/*.sqlite-wal
```

### Dependencies issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### JWT_SECRET error
If you see "JWT_SECRET environment variable is required":
```bash
# Make sure backend/.env exists with JWT_SECRET set
cp backend/.env.example backend/.env
# Edit backend/.env and change JWT_SECRET to a random string
```

## Next Steps

- Read the full [README.md](README.md) for complete documentation
- Check out the [API endpoints](README.md#api-endpoints)
- Explore the [project structure](README.md#project-structure)
- Review [security best practices](README.md#security-best-practices)
