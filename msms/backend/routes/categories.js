// routes/categories.js
const express  = require('express');
const { body } = require('express-validator');
const pool     = require('../db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/v1/categories
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 100 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like   = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(m.medicine_id) AS medicine_count
       FROM categories c
       LEFT JOIN medicines m ON m.category_id = c.category_id
       WHERE c.category_name LIKE ?
       GROUP BY c.category_id
       ORDER BY c.category_name
       LIMIT ? OFFSET ?`,
      [like, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM categories WHERE category_name LIKE ?', [like]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE category_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/v1/categories
router.post('/',
  [body('category_name').trim().notEmpty().withMessage('Category name is required').isLength({ max: 100 })],
  validate,
  async (req, res) => {
    try {
      const { category_name, description } = req.body;
      const [result] = await pool.query(
        'INSERT INTO categories (category_name, description) VALUES (?, ?)',
        [category_name, description || null]
      );
      res.status(201).json({ message: 'Category created', category_id: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Category name already exists' });
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /api/v1/categories/:id
router.put('/:id',
  [body('category_name').trim().notEmpty().withMessage('Category name is required')],
  validate,
  async (req, res) => {
    try {
      const { category_name, description } = req.body;
      const [result] = await pool.query(
        'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
        [category_name, description || null, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Category not found' });
      res.json({ message: 'Category updated' });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Category name already exists' });
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /api/v1/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE category_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
