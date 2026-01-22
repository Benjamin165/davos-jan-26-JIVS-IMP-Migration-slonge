import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboards.js';
import visualizationRoutes from './routes/visualizations.js';
import reconciliationRoutes from './routes/reconciliation.js';
import testRulesRoutes from './routes/testRules.js';
import runsRoutes from './routes/runs.js';
import notificationRoutes from './routes/notifications.js';
import exportRoutes from './routes/exports.js';
import aiRoutes from './routes/ai.js';
import trendsRoutes from './routes/trends.js';
import { initializeDatabase } from './models/database.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Initialize database
initializeDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboards', dashboardRoutes);
app.use('/api/visualizations', visualizationRoutes);
app.use('/api/reconciliation', reconciliationRoutes);
app.use('/api/test-rules', testRulesRoutes);
app.use('/api/runs', runsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/trends', trendsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║       JIVS IMP Migration Visual Companion - Backend          ║
╠══════════════════════════════════════════════════════════════╣
║   Server running on: http://localhost:${PORT}                   ║
║   Health check:      http://localhost:${PORT}/api/health        ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
