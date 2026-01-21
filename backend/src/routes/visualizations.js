import express from 'express';
import db from '../models/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all visualizations for current user
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const { dashboard_id, include_templates } = req.query;

    let query = `
      SELECT v.id, v.user_id, v.dashboard_id, v.name, v.type, v.config,
             v.is_template, v.is_system_template, v.created_at, v.updated_at,
             d.name as dashboard_name
      FROM visualizations v
      LEFT JOIN dashboards d ON v.dashboard_id = d.id
      WHERE v.user_id = ?
    `;
    const params = [req.user.id];

    if (dashboard_id) {
      query += ' AND v.dashboard_id = ?';
      params.push(dashboard_id);
    }

    if (!include_templates) {
      query += ' AND v.is_template = 0';
    }

    query += ' ORDER BY v.created_at DESC';

    const visualizations = db.prepare(query).all(...params);

    res.json({
      visualizations: visualizations.map(v => ({
        ...v,
        is_template: Boolean(v.is_template),
        is_system_template: Boolean(v.is_system_template),
        config: JSON.parse(v.config || '{}')
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get templates library
router.get('/templates', authenticateToken, (req, res, next) => {
  try {
    const { category } = req.query;

    let query = `
      SELECT id, user_id, name, type, config, is_system_template, created_at
      FROM visualizations
      WHERE is_template = 1 AND (is_system_template = 1 OR user_id = ?)
    `;
    const params = [req.user.id];

    if (category) {
      query += ' AND json_extract(config, "$.category") = ?';
      params.push(category);
    }

    query += ' ORDER BY is_system_template DESC, created_at DESC';

    const templates = db.prepare(query).all(...params);

    res.json({
      templates: templates.map(t => ({
        ...t,
        is_system_template: Boolean(t.is_system_template),
        config: JSON.parse(t.config || '{}')
      }))
    });
  } catch (error) {
    next(error);
  }
});

// Get single visualization
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const visualization = db.prepare(`
      SELECT v.*, d.name as dashboard_name
      FROM visualizations v
      LEFT JOIN dashboards d ON v.dashboard_id = d.id
      WHERE v.id = ?
    `).get(id);

    if (!visualization) {
      return res.status(404).json({ error: 'Visualization not found' });
    }

    // Check access: owned by user, system template, or admin
    if (visualization.user_id !== req.user.id &&
        !visualization.is_system_template &&
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      ...visualization,
      is_template: Boolean(visualization.is_template),
      is_system_template: Boolean(visualization.is_system_template),
      config: JSON.parse(visualization.config || '{}')
    });
  } catch (error) {
    next(error);
  }
});

// Create visualization
router.post('/', authenticateToken, (req, res, next) => {
  try {
    const { name, type, config = {}, dashboard_id, is_template = false } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Visualization name is required' });
    }

    const validTypes = ['bar', 'line', 'pie', 'area', 'table', 'donut'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Verify dashboard exists and belongs to user
    if (dashboard_id) {
      const dashboard = db.prepare('SELECT user_id FROM dashboards WHERE id = ?').get(dashboard_id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      if (dashboard.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied to this dashboard' });
      }
    }

    const result = db.prepare(`
      INSERT INTO visualizations (user_id, dashboard_id, name, type, config, is_template)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.user.id, dashboard_id || null, name.trim(), type, JSON.stringify(config), is_template ? 1 : 0);

    const visualization = db.prepare('SELECT * FROM visualizations WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'Visualization created successfully',
      visualization: {
        ...visualization,
        is_template: Boolean(visualization.is_template),
        is_system_template: Boolean(visualization.is_system_template),
        config: JSON.parse(visualization.config || '{}')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update visualization
router.put('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, config, dashboard_id, is_template } = req.body;

    const visualization = db.prepare('SELECT * FROM visualizations WHERE id = ?').get(id);

    if (!visualization) {
      return res.status(404).json({ error: 'Visualization not found' });
    }

    if (visualization.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Cannot edit system templates unless admin
    if (visualization.is_system_template && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot edit system templates' });
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

    if (type !== undefined) {
      const validTypes = ['bar', 'line', 'pie', 'area', 'table', 'donut'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
      }
      updates.push('type = ?');
      params.push(type);
    }

    if (config !== undefined) {
      updates.push('config = ?');
      params.push(JSON.stringify(config));
    }

    if (dashboard_id !== undefined) {
      if (dashboard_id) {
        const dashboard = db.prepare('SELECT user_id FROM dashboards WHERE id = ?').get(dashboard_id);
        if (!dashboard || (dashboard.user_id !== req.user.id && req.user.role !== 'admin')) {
          return res.status(403).json({ error: 'Invalid dashboard' });
        }
      }
      updates.push('dashboard_id = ?');
      params.push(dashboard_id || null);
    }

    if (is_template !== undefined) {
      updates.push('is_template = ?');
      params.push(is_template ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    db.prepare(`UPDATE visualizations SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM visualizations WHERE id = ?').get(id);

    res.json({
      message: 'Visualization updated successfully',
      visualization: {
        ...updated,
        is_template: Boolean(updated.is_template),
        is_system_template: Boolean(updated.is_system_template),
        config: JSON.parse(updated.config || '{}')
      }
    });
  } catch (error) {
    next(error);
  }
});

// Delete visualization
router.delete('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;

    const visualization = db.prepare('SELECT * FROM visualizations WHERE id = ?').get(id);

    if (!visualization) {
      return res.status(404).json({ error: 'Visualization not found' });
    }

    if (visualization.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (visualization.is_system_template && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot delete system templates' });
    }

    db.prepare('DELETE FROM visualizations WHERE id = ?').run(id);

    res.json({ message: 'Visualization deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Create system template (admin only)
router.post('/system-template', authenticateToken, requireAdmin, (req, res, next) => {
  try {
    const { name, type, config = {} } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const result = db.prepare(`
      INSERT INTO visualizations (user_id, name, type, config, is_template, is_system_template)
      VALUES (?, ?, ?, ?, 1, 1)
    `).run(req.user.id, name.trim(), type, JSON.stringify(config));

    const template = db.prepare('SELECT * FROM visualizations WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      message: 'System template created successfully',
      template: {
        ...template,
        is_template: true,
        is_system_template: true,
        config: JSON.parse(template.config || '{}')
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
