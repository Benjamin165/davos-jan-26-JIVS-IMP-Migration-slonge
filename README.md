# JIVS IMP Migration Visual Companion

> Transform complex migration data into intuitive, beautiful dashboards that anyone can understand

## Links

- **GitHub Repository**: https://github.com/Benjamin165/davos-jan-26-JIVS-IMP-Migration-slonge
- **Project Board**: https://github.com/users/Benjamin165/projects/3/views/1

## Demo

[Demo video coming soon]

## Screenshots

[Screenshots coming soon - showing Dashboard, Visualizations, Trends, and Export features]

## Problem Statement

**Challenge:** Challenge 1 - Enterprise Data Migration Visibility

JIVS IMP Migration generates complex matrix and Excel-based reports that are difficult for less-experienced users and junior consultants to understand. The data is dense, technical, and lacks visual clarity, making it challenging to quickly assess migration status, identify issues, and communicate results to stakeholders.

## Solution

A visual companion web application that transforms raw migration data into modern, interactive dashboards. The app provides intuitive visualizations, AI-powered predictions, and comprehensive export capabilities to make migration data accessible to everyone on the team.

### Key Features

- **Interactive Dashboards**: Real-time status overview with 3,976 reconciliation records and filterable data tables
- **Data Quality Trends**: Timeline visualization showing fail counts over time with period comparison
- **AI-Powered Predictions**: OpenAI GPT-4o integration for trend analysis and future fail count predictions
- **AI-Powered Visualizations**: Natural language chart generation - just describe what you want to see
- **Template Library**: Pre-built visualization templates (bar, line, pie, donut, area, table charts)
- **Custom Dashboard Builder**: Create and save personalized dashboard views
- **Multi-Format Export**: Export data to PDF, CSV, and JSON formats
- **Test Rules Management**: Problem-first display with 4,399 validation results
- **Drill-Down Analysis**: Side panel for detailed record inspection without page navigation
- **Comparison Views**: Side-by-side comparison of migration runs with diff highlighting
- **Decline Warnings**: Automatic alerts when data quality is deteriorating
- **Beginner-Friendly**: Guided tours, tooltips, and contextual help for new users
- **JIVS Dark Theme**: Professional dark UI with smooth animations

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 with Vite |
| UI Framework | Tailwind CSS + Framer Motion |
| Charts | Recharts |
| State Management | Zustand |
| Backend | Node.js + Express |
| Database | SQLite |
| Authentication | JWT |
| AI Integration | OpenAI GPT-4o |
| Real-time | Server-Sent Events (SSE) |
| Export | PDF/CSV/JSON generation |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Frontend (React/Vite)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Dashboard   │  │Visualizations│  │  Test Rules  │              │
│  │   (Main)     │  │   Builder    │  │    View      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Data Quality │  │  Comparison  │  │   Settings   │              │
│  │   Trends     │  │     View     │  │   (AI Key)   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │   API Layer   │
                    │  (Express)    │
                    └───────┬───────┘
                            │
    ┌───────────────────────┼───────────────────────┐
    │           │           │           │           │
┌───▼───┐  ┌────▼────┐  ┌───▼───┐  ┌────▼────┐  ┌───▼───┐
│ Recon │  │  Trend  │  │  AI   │  │  Viz    │  │Export │
│Service│  │Analyzer │  │Service│  │ Service │  │Service│
└───┬───┘  └────┬────┘  └───┬───┘  └────┬────┘  └───┬───┘
    │           │           │           │           │
    └───────────┴───────────┼───────────┴───────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
    ┌───────▼───────┐  ┌────▼────┐  ┌───────▼───────┐
    │SQLite Database│  │ OpenAI  │  │  App Settings │
    │ (8,375 rows)  │  │ GPT-4o  │  │  (API Keys)   │
    └───────────────┘  └─────────┘  └───────────────┘
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn
- OpenAI API key (optional, for AI predictions)

### Installation

```bash
# Clone the repository
git clone https://github.com/Benjamin165/davos-jan-26-JIVS-IMP-Migration-slonge.git
cd davos-jan-26-JIVS-IMP-Migration-slonge

# Run the setup script (Unix/Linux/Mac)
chmod +x init.sh
./init.sh

# Or manually install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (terminal 1)
cd backend
npm run dev

# Start frontend (terminal 2)
cd frontend
npm run dev
```

### Environment Variables

The application uses SQLite and doesn't require external environment variables for basic operation. Default configuration works out of the box.

For production deployment, you may configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port | No (default: 3001) |
| `JWT_SECRET` | Secret for JWT tokens | No (generated automatically) |
| `NODE_ENV` | Environment mode | No (default: development) |

### OpenAI Configuration

To enable AI-powered predictions:

1. Navigate to **Settings** in the application
2. Go to the **AI Configuration** tab
3. Enter your OpenAI API key
4. Click **Validate** to verify the key works
5. Save the configuration

## Usage

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Default Credentials

After running the setup script:
- **Admin**: admin@jivs.com / admin123
- **User**: user@jivs.com / user123

### Data Quality Trends

1. Navigate to **Data Quality Trends** from the sidebar
2. Select time period: Daily, Weekly, or Monthly
3. Filter by specific object using the dropdown
4. View timeline chart showing fail count trends
5. Check period comparison for first-half vs second-half analysis
6. Click **Generate AI Predictions** for future trend forecasts

### Creating Visualizations

1. Navigate to the **Visualizations** page
2. Use the AI prompt: "Show me failed records by object type as a pie chart"
3. Or click **Create Custom** to use the step-by-step wizard
4. Select chart type → Map data fields → Configure filters → Preview → Save

### Exporting Data

1. Go to the **Dashboard** page
2. Apply any filters (status, severity, etc.)
3. Click the **Export** button
4. Choose format: PDF, CSV, or JSON

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Dashboards
- `GET /api/dashboards` - List user dashboards
- `POST /api/dashboards` - Create dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard

### Reconciliation
- `GET /api/reconciliation` - List with pagination/filters
- `GET /api/reconciliation/summary` - Summary statistics
- `GET /api/reconciliation/:id` - Get record details

### Test Rules
- `GET /api/test-rules` - List test rules with filters
- `GET /api/test-rules/summary` - Summary statistics
- `GET /api/test-rules/:id` - Get rule details

### Data Quality Trends
- `GET /api/trends/timeline` - Aggregated fail counts over time
- `GET /api/trends/objects/:objectName/timeline` - Object-specific timeline
- `GET /api/trends/compare` - Compare two time periods
- `GET /api/trends/objects` - List objects with trend data
- `GET /api/trends/summary` - Overall trend summary

### AI Predictions
- `POST /api/ai/predict` - Generate AI predictions for trends
- `GET /api/ai/settings/status` - Check if AI is configured
- `POST /api/ai/settings` - Save OpenAI API key
- `DELETE /api/ai/settings` - Remove API key

### Visualizations
- `GET /api/visualizations/templates` - Get visualization templates
- `GET /api/visualizations` - List saved visualizations
- `POST /api/visualizations` - Create visualization
- `DELETE /api/visualizations/:id` - Delete visualization
- `POST /api/ai/generate-visual` - Generate visualization from prompt

### Exports
- `POST /api/exports/pdf` - Export to PDF
- `POST /api/exports/csv` - Export to CSV
- `POST /api/exports/json` - Export to JSON

## Team

| Name | Role | GitHub |
|------|------|--------|
| Benjamin Tobler | Full Stack Developer | [@Benjamin165](https://github.com/Benjamin165) |

## Results

Generated outputs and features are accessible through the application:

- `frontend/src/pages/Dashboard.jsx` - Main dashboard with export functionality
- `frontend/src/pages/DataQualityTrends.jsx` - Timeline visualization and AI predictions
- `frontend/src/pages/Visualizations.jsx` - AI-powered visualization builder
- `frontend/src/pages/Dashboards.jsx` - Custom dashboard management
- `frontend/src/pages/Settings.jsx` - Application and AI configuration
- `backend/src/routes/` - API endpoints for all features
- `backend/src/services/openaiService.js` - OpenAI GPT-4o integration
- `backend/src/services/trendAnalyzer.js` - Trend analysis algorithms

## Project Structure

```
.
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Sidebar, Header components
│   │   │   ├── trends/     # Trend visualization components
│   │   │   └── ui/         # Base UI components
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
│   │   │   ├── trends.js   # Data quality trends endpoints
│   │   │   └── ai.js       # AI prediction endpoints
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   │   ├── openaiService.js   # OpenAI integration
│   │   │   └── trendAnalyzer.js   # Trend calculations
│   │   └── utils/          # Utility functions
│   └── data/               # SQLite database and mock data
│
├── shared/                 # Shared types and constants
├── init.sh                 # Development setup script
└── features.db             # Feature tracking database
```

## JIVS Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Canvas | `#0D0D0D` | Page background |
| Card | `#1A1A1A` | Card and panel backgrounds |
| Border | `#2A2A2A` | Borders and dividers |
| Hover | `#262626` | Hover states |
| Primary | `#2E5BFF` | Primary actions, links, accents |
| Success | `#22C55E` | Positive states, improvements |
| Warning | `#F59E0B` | Warnings, attention needed |
| Error | `#EF4444` | Errors, failures, critical |
| Text Primary | `#FFFFFF` | Headings, important text |
| Text Secondary | `#9CA3AF` | Body text, labels |
| Text Muted | `#6B7280` | Placeholders, hints |

### UI Features
- Professional dark theme optimized for data-heavy interfaces
- Smooth page transitions with Framer Motion
- Animated chart entries and loading states
- Consistent 4px border radius on interactive elements
- Loading overlays that preserve scroll position
- Sparkline micro-charts for trend indicators
- Collapsible panels for progressive disclosure

### Typography
- **Font**: System font stack (Inter when available)
- **Headings**: Bold, tight tracking
- **Labels**: Uppercase, 11px, bold, wide tracking
- **Data**: Monospace for numbers

## Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd backend
npm start
```

## Acknowledgments

- **Recharts** - Beautiful and composable charting library
- **Framer Motion** - Production-ready animation library
- **Tailwind CSS** - Utility-first CSS framework
- **OpenAI** - GPT-4o for AI-powered predictions
- **Lucide Icons** - Beautiful icon set
- **DMI Hackathon Team** - For the challenge and support

---

*Built for Davos Hackathon 2026*
