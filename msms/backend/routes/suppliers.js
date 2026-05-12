// routes/suppliers.js
const express  = require('express');
const { body } = require('express-validator');
const pool     = require('../db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT * FROM suppliers WHERE (name LIKE ? OR contact_person LIKE ?) ORDER BY name LIMIT ? OFFSET ?`,
      [like, like, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM suppliers WHERE name LIKE ? OR contact_person LIKE ?', [like, like]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM suppliers WHERE supplier_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
    body('email').optional().isEmail(),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, contact_person, phone, email, address, rating } = req.body;
      const [result] = await pool.query(
        'INSERT INTO suppliers (name, contact_person, phone, email, address, rating) VALUES (?,?,?,?,?,?)',
        [name, contact_person||null, phone, email||null, address||null, rating||null]
      );
      res.status(201).json({ message: 'Supplier created', supplier_id: result.insertId });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

router.put('/:id',
  [
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('rating').optional().isFloat({ min: 1, max: 5 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, contact_person, phone, email, address, rating, is_active } = req.body;
      const [result] = await pool.query(
        'UPDATE suppliers SET name=?,contact_person=?,phone=?,email=?,address=?,rating=?,is_active=? WHERE supplier_id=?',
        [name, contact_person||null, phone, email||null, address||null, rating||null, is_active !== undefined ? (is_active ? 1 : 0) : 1, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Supplier not found' });
      res.json({ message: 'Supplier updated' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE suppliers SET is_active = 0 WHERE supplier_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deactivated' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
