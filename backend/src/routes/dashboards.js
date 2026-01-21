import express from 'express';
import db from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all dashboards for current user
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const dashboards = db.prepare(`
      SELECT id, user_id, name, is_default, layout, created_at, updated_at
      FROM dashboards
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `).all(req.user.id);

    res.json({
      dashboards: dashboards.map(d => ({
        ...d,
        is_default: Boolean(d.is_default),
        layout: JSON.parse(d.layout || '[]')
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get single dashboard
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const dashboard = db.prepare(`
      SELECT id, user_id, name, is_default, layout, created_at, updated_at
      FROM dashboards WHERE id = ?
    `).get(id);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Check access
    if (dashboard.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get visualizations for this dashboard
    const visualizations = db.prepare(`
      SELECT id, name, type, config, created_at
      FROM visualizations
      WHERE dashboard_id = ?
    `).all(id);

    res.json({
      ...dashboard,
      is_default: Boolean(dashboard.is_default),
      layout: JSON.parse(dashboard.layout || '[]'),
      visualizations: visualizations.map(v => ({
        ...v,
        config: JSON.parse(v.config || '{}')
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Create dashboard
router.post('/', authenticateToken, (req, res, next) => {
  try {
    const { name, layout = [], is_default = false } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Dashboard name is required' });
    }

    // Check for duplicate name
    const existing = db.prepare(`
      SELECT id FROM dashboards WHERE user_id = ? AND name = ?
    `).get(req.user.id, name.trim());

    if (existing) {
      return res.status(409).json({ error: 'A dashboard with this name already exists' });
    }

    // If setting as default, unset other defaults
    if (is_default) {
      db.prepare('UPDATE dashboards SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    }

    const result = db.prepare(`
      INSERT INTO dashboards (user_id, name, is_default, layout)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, name.trim(), is_default ? 1 : 0, JSON.stringify(layout));

    const dashboard = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Dashboard created successfully',
      dashboard: {
        ...dashboard,
        is_default: Boolean(dashboard.is_default),
        layout: JSON.parse(dashboard.layout || '[]')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update dashboard
router.put('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, layout, is_default } = req.body;

    const dashboard = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(id);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    if (dashboard.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates = [];
    const params = [];

    if (name !== undefined) {
      if (name.trim().length === 0) {
        return res.status(400).json({ error: 'Dashboard name cannot be empty' });
      }
      // Check for duplicate name
      const existing = db.prepare(`
        SELECT id FROM dashboards WHERE user_id = ? AND name = ? AND id != ?
      `).get(req.user.id, name.trim(), id);

      if (existing) {
        return res.status(409).json({ error: 'A dashboard with this name already exists' });
      }

      updates.push('name = ?');
      params.push(name.trim());
    }

    if (layout !== undefined) {
      updates.push('layout = ?');
      params.push(JSON.stringify(layout));
    }

    if (is_default !== undefined) {
      if (is_default) {
        db.prepare('UPDATE dashboards SET is_default = 0 WHERE user_id = ?').run(req.user.id);
      }
      updates.push('is_default = ?');
      params.push(is_default ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE dashboards SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(id);

    res.json({
      message: 'Dashboard updated successfully',
      dashboard: {
        ...updated,
        is_default: Boolean(updated.is_default),
        layout: JSON.parse(updated.layout || '[]')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Set default dashboard
router.put('/:id/default', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const dashboard = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(id);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    if (dashboard.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Unset all defaults and set this one
    db.prepare('UPDATE dashboards SET is_default = 0 WHERE user_id = ?').run(req.user.id);
    db.prepare('UPDATE dashboards SET is_default = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    res.json({ message: 'Default dashboard updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Duplicate dashboard
router.post('/:id/duplicate', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const dashboard = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(id);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    if (dashboard.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create copy with "(Copy)" suffix
    const newName = `${dashboard.name} (Copy)`;

    const result = db.prepare(`
      INSERT INTO dashboards (user_id, name, is_default, layout)
      VALUES (?, ?, 0, ?)
    `).run(req.user.id, newName, dashboard.layout);

    const newDashboard = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(result.lastInsertRowid);

    // Copy visualizations
    const visualizations = db.prepare('SELECT * FROM visualizations WHERE dashboard_id = ?').all(id);

    for (const viz of visualizations) {
      db.prepare(`
        INSERT INTO visualizations (user_id, dashboard_id, name, type, config, is_template)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.user.id, newDashboard.id, viz.name, viz.type, viz.config, 0);
    }

    res.status(201).json({
      message: 'Dashboard duplicated successfully',
      dashboard: {
        ...newDashboard,
        is_default: Boolean(newDashboard.is_default),
        layout: JSON.parse(newDashboard.layout || '[]')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete dashboard
router.delete('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const dashboard = db.prepare('SELECT * FROM dashboards WHERE id = ?').get(id);

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    if (dashboard.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Count user's dashboards
    const { count } = db.prepare('SELECT COUNT(*) as count FROM dashboards WHERE user_id = ?').get(req.user.id);

    if (count <= 1) {
      return res.status(400).json({ error: 'Cannot delete your only dashboard' });
    }

    // Delete dashboard (visualizations will be set to NULL dashboard_id)
    db.prepare('DELETE FROM dashboards WHERE id = ?').run(id);

    // If deleted dashboard was default, set another as default
    if (dashboard.is_default) {
      const another = db.prepare('SELECT id FROM dashboards WHERE user_id = ? LIMIT 1').get(req.user.id);
      if (another) {
        db.prepare('UPDATE dashboards SET is_default = 1 WHERE id = ?').run(another.id);
      }
    }

    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
