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

## Using Custom XLSX Data

To use your own XLSX files instead of procedurally-generated mock data:

### Step 1: Place your XLSX files
Copy your XLSX files to the `backend/data/` folder:
```bash
cp your-recon-data.xlsx backend/data/challenge-1-recon-data.xlsx
cp your-testrule-data.xlsx backend/data/challenge-1-testrule-data.xlsx
```

### Step 2: Run the XLSX import
```bash
cd backend
npm run seed:xlsx
```

### Alternative: Custom file paths
Set environment variables to use files from any location:
```bash
export RECON_XLSX_PATH=/path/to/your/recon-data.xlsx
export TESTRULE_XLSX_PATH=/path/to/your/testrule-data.xlsx
npm run seed:xlsx
```

### Expected XLSX Columns

**Reconciliation Data** (challenge-1-recon-data.xlsx):
- `SourceObject` / `Source Object` - Source database object name
- `TargetObject` / `Target Object` - Target database object name
- `SourceRowCount` - Number of rows in source
- `TargetRowCount` - Number of rows in target
- `LoadStatus` / `Status` - Status: pending, running, completed, failed, warning
- `Severity` - Severity level: info, low, medium, high, critical
- `Phase` - Migration phase: Extract, Transform, Load, Validate, Reconcile
- `ObjectType` - Type: Table, View, Procedure, Function, etc.

**Test Rules Data** (challenge-1-testrule-data.xlsx):
- `TestRuleName` / `RuleName` - Unique rule identifier
- `PassCount` - Number of passed validations
- `FailCount` - Number of failed validations
- `TotalCount` - Total records tested
- `Status` - Result: pass, fail, pending, warning
- `Severity` - Severity: low, medium, high, critical
- `Category` - Rule category

## Next Steps

- Read the full [README.md](README.md) for complete documentation
- Check out the [API endpoints](README.md#api-endpoints)
- Explore the [project structure](README.md#project-structure)
- Review [security best practices](README.md#security-best-practices)
