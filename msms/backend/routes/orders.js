// routes/orders.js
const express  = require('express');
const { body } = require('express-validator');
const pool     = require('../db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/v1/orders
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like   = `%${search}%`;

    let where = 'WHERE (COALESCE(c.name,"Walk-in") LIKE ? OR CONCAT("ORD-",LPAD(o.order_id,5,"0")) LIKE ?)';
    const params = [like, like];
    if (status) { where += ' AND o.status = ?'; params.push(status); }

    const [rows] = await pool.query(
      `SELECT o.*, COALESCE(c.name,'Walk-in Customer') AS customer_name,
              c.phone AS customer_phone, e.name AS employee_name,
              COUNT(oi.item_id) AS item_count,
              CONCAT('ORD-',LPAD(o.order_id,5,'0')) AS invoice_number
       FROM orders o
       LEFT JOIN customers c  ON c.customer_id = o.customer_id
       JOIN  employees  e  ON e.employee_id = o.employee_id
       LEFT JOIN order_items oi ON oi.order_id = o.order_id
       ${where}
       GROUP BY o.order_id
       ORDER BY o.order_date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(DISTINCT o.order_id) AS total
       FROM orders o
       LEFT JOIN customers c ON c.customer_id = o.customer_id
       ${where}`, params
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const [[order]] = await pool.query(
      `SELECT o.*, COALESCE(c.name,'Walk-in Customer') AS customer_name, c.phone AS customer_phone,
              e.name AS employee_name, e.role AS employee_role,
              CONCAT('ORD-',LPAD(o.order_id,5,'0')) AS invoice_number,
              p.prescription_date, d.name AS doctor_name
       FROM orders o
       LEFT JOIN customers    c  ON c.customer_id    = o.customer_id
       JOIN  employees     e  ON e.employee_id    = o.employee_id
       LEFT JOIN prescriptions p  ON p.prescription_id = o.prescription_id
       LEFT JOIN doctors      d  ON d.doctor_id      = p.doctor_id
       WHERE o.order_id = ?`, [req.params.id]
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const [items] = await pool.query(
      `SELECT oi.*, m.name AS medicine_name, m.dosage_form, m.strength
       FROM order_items oi
       JOIN medicines m ON m.medicine_id = oi.medicine_id
       WHERE oi.order_id = ?`, [req.params.id]
    );

    const [[payment]] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ?', [req.params.id]
    );

    res.json({ ...order, items, payment: payment || null });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/orders/:id/bill  — calls GenerateBill stored procedure
router.get('/:id/bill', async (req, res) => {
  try {
    const [results] = await pool.query('CALL GenerateBill(?)', [req.params.id]);
    if (!results[0]?.length) return res.status(404).json({ error: 'Order not found' });
    res.json({ header: results[0][0], items: results[1] });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/v1/orders  — place a new order with items
router.post('/',
  [
    body('employee_id').isInt({ gt: 0 }).withMessage('Employee ID required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item required'),
    body('items.*.medicine_id').isInt({ gt: 0 }),
    body('items.*.quantity').isInt({ gt: 0 }),
    body('items.*.unit_price').isFloat({ gt: 0 }),
    body('discount_percent').optional().isFloat({ min: 0, max: 100 }),
    body('tax_percent').optional().isFloat({ min: 0 }),
  ],
  validate,
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const { customer_id, employee_id, prescription_id, discount_percent = 0,
              tax_percent = 0, notes, items, payment_method, amount_paid, transaction_ref } = req.body;

      // Insert order
      const [orderResult] = await conn.query(
        `INSERT INTO orders (customer_id, employee_id, prescription_id, status, discount_percent, tax_percent, notes)
         VALUES (?,?,?,?,?,?,?)`,
        [customer_id||null, employee_id, prescription_id||null, 'Pending', discount_percent, tax_percent, notes||null]
      );
      const orderId = orderResult.insertId;

      // Insert items (triggers handle stock deduction + total recalc)
      for (const item of items) {
        await conn.query(
          'INSERT INTO order_items (order_id, medicine_id, quantity, unit_price) VALUES (?,?,?,?)',
          [orderId, item.medicine_id, item.quantity, item.unit_price]
        );
      }

      // Process payment if provided
      if (payment_method && amount_paid !== undefined) {
        // Get updated total
        const [[{ total_amount }]] = await conn.query(
          'SELECT total_amount FROM orders WHERE order_id = ?', [orderId]
        );

        if (parseFloat(amount_paid) < parseFloat(total_amount)) {
          await conn.rollback();
          conn.release();
          return res.status(400).json({ error: `Amount paid (${amount_paid}) is less than total (${total_amount})` });
        }

        await conn.query(
          `INSERT INTO payments (order_id, amount_paid, payment_method, payment_status, transaction_ref, paid_at)
           VALUES (?,?,?,'Paid',?,NOW())`,
          [orderId, amount_paid, payment_method, transaction_ref||null]
        );

        await conn.query("UPDATE orders SET status='Completed' WHERE order_id=?", [orderId]);

        if (prescription_id) {
          await conn.query('UPDATE prescriptions SET is_used=1 WHERE prescription_id=?', [prescription_id]);
        }
      }

      await conn.commit();
      res.status(201).json({ message: 'Order placed successfully', order_id: orderId });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      const msg = err.sqlMessage || err.message || 'Internal server error';
      res.status(err.sqlMessage ? 400 : 500).json({ error: msg });
    } finally {
      conn.release();
    }
  }
);

// POST /api/v1/orders/:id/complete  — calls CompletePayment procedure
router.post('/:id/complete',
  [
    body('payment_method').isIn(['Cash','Card','Online','Insurance']).withMessage('Invalid payment method'),
    body('amount_paid').isFloat({ gt: 0 }).withMessage('Amount must be > 0'),
  ],
  validate,
  async (req, res) => {
    try {
      const { payment_method, amount_paid, transaction_ref } = req.body;
      await pool.query('CALL CompletePayment(?,?,?,?)',
        [req.params.id, payment_method, amount_paid, transaction_ref||null]
      );
      res.json({ message: 'Payment completed successfully' });
    } catch (err) {
      console.error(err);
      const msg = err.sqlMessage || err.message || 'Internal server error';
      res.status(400).json({ error: msg });
    }
  }
);

// PUT /api/v1/orders/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE orders SET status='Cancelled' WHERE order_id=? AND status='Pending'", [req.params.id]
    );
    if (!result.affectedRows) return res.status(400).json({ error: 'Order cannot be cancelled (not found or already processed)' });
    res.json({ message: 'Order cancelled' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
