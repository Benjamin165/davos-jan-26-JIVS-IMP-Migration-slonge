import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM notifications WHERE user_id = ?';
    let countQuery = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?';
    const params = [req.user.id];

    if (unread_only === 'true') {
      query += ' AND is_read = 0';
      countQuery += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

    const notifications = db.prepare(query).all(...params, parseInt(limit), offset);
    const { total } = db.prepare(countQuery).get(params[0]);
    const { unread } = db.prepare('SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);

    res.json({
      notifications: notifications.map(n => ({
        ...n,
        is_read: Boolean(n.is_read)
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      },
      unreadCount: unread
    });
  } catch (error) {
    next(error);
  }
});

// Get unread count
router.get('/count', authenticateToken, (req, res, next) => {
  try {
    const { unread } = db.prepare('SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id);

    res.json({ unreadCount: unread });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.put('/read-all', authenticateToken, (req, res, next) => {
  try {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(req.user.id);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    db.prepare('DELETE FROM notifications WHERE id = ?').run(id);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
});

// Clear all notifications
router.delete('/', authenticateToken, (req, res, next) => {
  try {
    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(req.user.id);

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    next(error);
  }
});

// Create notification (internal use, could be called by other services)
router.post('/', authenticateToken, (req, res, next) => {
  try {
    const { user_id, type = 'info', title, message, link } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const targetUserId = user_id || req.user.id;

    // Only admin can create notifications for other users
    if (targetUserId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const validTypes = ['alert', 'warning', 'info', 'success'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const result = db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (?, ?, ?, ?, ?)
    `).run(targetUserId, type, title, message, link);

    const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Notification created',
      notification: {
        ...notification,
        is_read: Boolean(notification.is_read)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
