// routes/stock.js
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
      `SELECT s.*, m.name AS medicine_name, m.dosage_form, m.strength,
              sup.name AS supplier_name,
              CASE WHEN s.quantity = 0 THEN 'Out of Stock'
                   WHEN s.quantity < s.reorder_level THEN 'Low Stock'
                   ELSE 'In Stock' END AS stock_status
       FROM stock s
       JOIN medicines m ON m.medicine_id = s.medicine_id
       LEFT JOIN suppliers sup ON sup.supplier_id = s.supplier_id
       WHERE m.name LIKE ?
       ORDER BY m.name LIMIT ? OFFSET ?`,
      [like, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM stock s JOIN medicines m ON m.medicine_id = s.medicine_id WHERE m.name LIKE ?`, [like]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/v1/stock/restock — calls stored procedure
router.post('/restock',
  [
    body('medicine_id').isInt({ gt: 0 }).withMessage('Valid medicine_id required'),
    body('quantity').isInt({ gt: 0 }).withMessage('Quantity must be > 0'),
    body('expiry_date').isDate().withMessage('Valid expiry date required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { medicine_id, quantity, supplier_id, expiry_date, batch_number } = req.body;
      await pool.query(
        'CALL RestockMedicine(?, ?, ?, ?, ?, ?)',
        [medicine_id, quantity, supplier_id||null, expiry_date, batch_number||null, req.user.id]
      );
      res.json({ message: `Medicine restocked by ${quantity} units.` });
    } catch (err) {
      console.error(err);
      const msg = err.sqlMessage || err.message || 'Internal server error';
      res.status(400).json({ error: msg });
    }
  }
);

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, m.name AS medicine_name FROM stock s
       JOIN medicines m ON m.medicine_id = s.medicine_id
       WHERE s.stock_id = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Stock record not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
