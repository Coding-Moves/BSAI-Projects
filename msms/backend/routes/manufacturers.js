// routes/manufacturers.js
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
      `SELECT * FROM manufacturers WHERE name LIKE ? OR country LIKE ? ORDER BY name LIMIT ? OFFSET ?`,
      [like, like, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM manufacturers WHERE name LIKE ? OR country LIKE ?', [like, like]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM manufacturers WHERE manufacturer_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Manufacturer not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('contact_email').optional().isEmail().withMessage('Invalid email'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, country, contact_email, phone, address } = req.body;
      const [result] = await pool.query(
        'INSERT INTO manufacturers (name, country, contact_email, phone, address) VALUES (?,?,?,?,?)',
        [name, country||null, contact_email||null, phone||null, address||null]
      );
      res.status(201).json({ message: 'Manufacturer created', manufacturer_id: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Duplicate entry' });
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/:id',
  [body('name').trim().notEmpty()],
  validate,
  async (req, res) => {
    try {
      const { name, country, contact_email, phone, address } = req.body;
      const [result] = await pool.query(
        'UPDATE manufacturers SET name=?,country=?,contact_email=?,phone=?,address=? WHERE manufacturer_id=?',
        [name, country||null, contact_email||null, phone||null, address||null, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Manufacturer not found' });
      res.json({ message: 'Manufacturer updated' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM manufacturers WHERE manufacturer_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Manufacturer not found' });
    res.json({ message: 'Manufacturer deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
