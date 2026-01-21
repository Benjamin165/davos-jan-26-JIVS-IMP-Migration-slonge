import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (name.trim().length === 0) {
      return res.status(400).json({ error: 'Name cannot be empty' });
    }

    // Check if email exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, role, theme_preference, notification_settings)
      VALUES (?, ?, ?, 'user', 'dark', '{"email": true, "push": false, "alerts": true}')
    `).run(email.toLowerCase(), passwordHash, name.trim());

    const userId = result.lastInsertRowid;

    // Create default dashboard
    db.prepare(`
      INSERT INTO dashboards (user_id, name, is_default, layout)
      VALUES (?, 'Main Dashboard', 1, '[]')
    `).run(userId);

    // Generate token and create session
    const token = generateToken(userId);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(userId, token, expiresAt);

    // Create welcome notification
    db.prepare(`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (?, 'success', 'Welcome to JIVS Migration!', 'Get started by exploring the dashboard and taking the guided tour.')
    `).run(userId);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: name.trim(),
        role: 'user',
        theme_preference: 'dark'
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token and create session
    const token = generateToken(user.id);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Clean up old sessions for this user
    db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND expires_at < datetime("now")').run(user.id);

    db.prepare(`
      INSERT INTO user_sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, token, expiresAt);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        theme_preference: user.theme_preference,
        tour_completed: Boolean(user.tour_completed)
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticateToken, (req, res, next) => {
  try {
    // Delete the session
    db.prepare('DELETE FROM user_sessions WHERE token = ?').run(req.token);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res, next) => {
  try {
    const user = db.prepare(`
      SELECT id, email, name, role, theme_preference, notification_settings, tour_completed, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      ...user,
      notification_settings: JSON.parse(user.notification_settings || '{}'),
      tour_completed: Boolean(user.tour_completed)
    });
  } catch (error) {
    next(error);
  }
});

// Reset password request (simplified - just validates email exists)
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());

    // Always return success to prevent email enumeration
    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
});

// Update password
router.put('/password', authenticateToken, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newPasswordHash, req.user.id);

    // Invalidate all other sessions
    db.prepare('DELETE FROM user_sessions WHERE user_id = ? AND token != ?').run(req.user.id, req.token);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
