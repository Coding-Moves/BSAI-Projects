// routes/payments.js
const express = require('express');
const pool    = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, method, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like   = `%${search}%`;

    let where = 'WHERE (CONCAT("ORD-",LPAD(o.order_id,5,"0")) LIKE ? OR COALESCE(c.name,"Walk-in") LIKE ?)';
    const params = [like, like];
    if (method) { where += ' AND py.payment_method = ?'; params.push(method); }
    if (status) { where += ' AND py.payment_status = ?'; params.push(status); }

    const [rows] = await pool.query(
      `SELECT py.*, o.total_amount, o.order_date,
              CONCAT('ORD-',LPAD(o.order_id,5,'0')) AS invoice_number,
              COALESCE(c.name,'Walk-in Customer') AS customer_name,
              e.name AS cashier_name
       FROM payments py
       JOIN orders    o  ON o.order_id    = py.order_id
       LEFT JOIN customers c  ON c.customer_id = o.customer_id
       JOIN employees  e  ON e.employee_id = o.employee_id
       ${where}
       ORDER BY py.paid_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM payments py
       JOIN orders o ON o.order_id = py.order_id
       LEFT JOIN customers c ON c.customer_id = o.customer_id
       ${where}`, params
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT py.*, CONCAT('ORD-',LPAD(o.order_id,5,'0')) AS invoice_number,
              o.total_amount, COALESCE(c.name,'Walk-in') AS customer_name
       FROM payments py
       JOIN orders o ON o.order_id = py.order_id
       LEFT JOIN customers c ON c.customer_id = o.customer_id
       WHERE py.payment_id = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
