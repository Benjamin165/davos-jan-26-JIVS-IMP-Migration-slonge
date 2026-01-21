import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../models/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, name, role, theme_preference, created_at, updated_at FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const params = [];

    if (search) {
      query += ' WHERE email LIKE ? OR name LIKE ?';
      countQuery += ' WHERE email LIKE ? OR name LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const users = db.prepare(query).all(...params, parseInt(limit), offset);
    const { total } = db.prepare(countQuery).get(...params.slice(0, 2));

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single user
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = db.prepare(`
      SELECT id, email, name, role, theme_preference, notification_settings, tour_completed, created_at, updated_at
      FROM users WHERE id = ?
    `).get(id);

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

// Update user
router.put('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, theme_preference, notification_settings, tour_completed, role } = req.body;

    // Users can only update their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (name.trim().length === 0) {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      updates.push('name = ?');
      params.push(name.trim());
    }

    if (theme_preference !== undefined) {
      if (!['dark', 'light'].includes(theme_preference)) {
        return res.status(400).json({ error: 'Invalid theme preference' });
      }
      updates.push('theme_preference = ?');
      params.push(theme_preference);
    }

    if (notification_settings !== undefined) {
      updates.push('notification_settings = ?');
      params.push(JSON.stringify(notification_settings));
    }

    if (tour_completed !== undefined) {
      updates.push('tour_completed = ?');
      params.push(tour_completed ? 1 : 0);
    }

    // Only admin can change roles
    if (role !== undefined && req.user.role === 'admin') {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updatedUser = db.prepare(`
      SELECT id, email, name, role, theme_preference, notification_settings, tour_completed, updated_at
      FROM users WHERE id = ?
    `).get(id);

    res.json({
      message: 'User updated successfully',
      user: {
        ...updatedUser,
        notification_settings: JSON.parse(updatedUser.notification_settings || '{}'),
        tour_completed: Boolean(updatedUser.tour_completed)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    // Users can delete their own account, admins can delete any account
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If deleting own account, require password confirmation
    if (req.user.id === parseInt(id)) {
      if (!password) {
        return res.status(400).json({ error: 'Password confirmation required' });
      }

      const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(id);
      const validPassword = await bcrypt.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (cascades to related tables)
    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
