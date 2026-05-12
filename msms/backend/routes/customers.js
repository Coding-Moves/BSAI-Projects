// routes/customers.js
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
      `SELECT c.*, COUNT(o.order_id) AS total_orders,
              COALESCE(SUM(o.total_amount),0) AS total_spent
       FROM customers c
       LEFT JOIN orders o ON o.customer_id = c.customer_id
       WHERE c.name LIKE ? OR c.phone LIKE ? OR c.email LIKE ?
       GROUP BY c.customer_id
       ORDER BY c.name LIMIT ? OFFSET ?`,
      [like, like, like, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM customers WHERE name LIKE ? OR phone LIKE ? OR email LIKE ?',
      [like, like, like]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/search/phone', async (req, res) => {
  try {
    const { phone } = req.query;
    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE phone LIKE ? LIMIT 10', [`%${phone}%`]
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
    body('gender').optional().isIn(['Male','Female','Other']),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, phone, email, date_of_birth, gender, address } = req.body;
      const [result] = await pool.query(
        'INSERT INTO customers (name, phone, email, date_of_birth, gender, address) VALUES (?,?,?,?,?,?)',
        [name, phone, email||null, date_of_birth||null, gender||null, address||null]
      );
      res.status(201).json({ message: 'Customer created', customer_id: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Phone number already exists' });
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/:id',
  [
    body('name').trim().notEmpty(),
    body('phone').trim().notEmpty(),
    body('email').optional({ checkFalsy: true }).isEmail(),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, phone, email, date_of_birth, gender, address } = req.body;
      const [result] = await pool.query(
        'UPDATE customers SET name=?,phone=?,email=?,date_of_birth=?,gender=?,address=? WHERE customer_id=?',
        [name, phone, email||null, date_of_birth||null, gender||null, address||null, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Customer not found' });
      res.json({ message: 'Customer updated' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM customers WHERE customer_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
