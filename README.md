# JIVS IMP Migration Visual Companion

A visual companion application for JIVS IMP Migration that transforms complex matrix/Excel data into intuitive, beautiful dashboards. The app helps less-experienced users and junior consultants understand migration status, results, and data through modern visualizations.

## Features

- **Reconciliation Dashboard**: Summary cards, status charts, filterable data tables with 3,976 rows
- **Test Rules View**: Problem-first display with 4,399 validation results, grouped by rule type
- **Multiple Dashboards**: Create, customize, and switch between personalized dashboard views
- **Drill-Down Panel**: Slide-out side panel for detailed views without leaving the page
- **Prompt-Based Visuals**: Natural language input for custom chart creation
- **Comparison Views**: Side-by-side comparison of migration runs with diff highlighting
- **Exports**: PDF, CSV, and JSON export capabilities
- **Beginner Support**: Guided tour, tooltips, and help panel for new users
- **Beautiful Design**: 21st.dev inspired UI with smooth animations and glassmorphism effects

## Technology Stack

### Frontend
- React with Vite
- Tailwind CSS with Framer Motion animations
- Recharts for data visualization
- Shadcn/ui-style components (Radix UI)
- Zustand for state management

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- Server-Sent Events for real-time updates

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

```bash
# Run the setup script
chmod +x init.sh
./init.sh

# Start backend (terminal 1)
cd backend
npm run dev

# Start frontend (terminal 2)
cd frontend
npm run dev
```

### Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Default Credentials
After running the seed script:
- Admin: admin@jivs.com / admin123
- User: user@jivs.com / user123

## Project Structure

```
.
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS and Tailwind styles
│   └── public/             # Static assets
│
├── backend/                # Node.js backend server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── data/               # SQLite database and mock data
│
├── shared/                 # Shared types and constants
├── init.sh                 # Development setup script
└── features.db             # Feature tracking database
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Dashboards
- `GET /api/dashboards` - List user dashboards
- `POST /api/dashboards` - Create dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard

### Reconciliation Data
- `GET /api/reconciliation` - List with pagination/filters
- `GET /api/reconciliation/summary` - Summary statistics
- `GET /api/reconciliation/:id` - Single record details

### Test Rules
- `GET /api/test-rules` - List with pagination/filters
- `GET /api/test-rules/failures` - Failed rules only
- `GET /api/test-rules/summary` - Summary by category

### Exports
- `POST /api/exports/pdf` - Export to PDF
- `POST /api/exports/csv` - Export to CSV
- `POST /api/exports/json` - Export to JSON

## Design System

### Colors
- Primary: #3B82F6 (Modern blue, OCC-inspired)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Dark backgrounds: #0F172A, #1E293B

### UI Features
- Smooth page transitions with Framer Motion
- Animated chart entries
- Glassmorphism effects on cards
- Loading skeletons
- Micro-interactions on all interactive elements

## Development

### Running Tests
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

### Building for Production
```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && npm start
```

## License

This project was created for the DMI Hackathon - January 2026.
