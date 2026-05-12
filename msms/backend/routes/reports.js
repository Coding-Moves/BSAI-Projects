// routes/reports.js
const express = require('express');
const pool    = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/v1/reports/low-stock
router.get('/low-stock', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_LowStockAlert');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/reports/expiring-soon
router.get('/expiring-soon', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_ExpiringSoon');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/reports/sales-summary
router.get('/sales-summary', async (req, res) => {
  try {
    const { from, to } = req.query;
    let query = 'SELECT * FROM vw_SalesSummary';
    const params = [];
    if (from && to) {
      query = `SELECT DATE(o.order_date) AS sale_date, COUNT(o.order_id) AS total_orders,
               SUM(o.total_amount) AS total_revenue, AVG(o.total_amount) AS avg_order_value,
               COUNT(DISTINCT o.customer_id) AS unique_customers
               FROM orders o WHERE o.status='Completed' AND DATE(o.order_date) BETWEEN ? AND ?
               GROUP BY DATE(o.order_date) ORDER BY sale_date DESC`;
      params.push(from, to);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/reports/top-medicines
router.get('/top-medicines', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_TopSellingMedicines LIMIT 20');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/reports/employee-performance
router.get('/employee-performance', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vw_EmployeePerformance');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/reports/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM medicines WHERE is_active=1) AS total_medicines,
        (SELECT COUNT(*) FROM vw_LowStockAlert)            AS low_stock_count,
        (SELECT COUNT(*) FROM vw_ExpiringSoon)             AS expiring_soon_count,
        (SELECT COALESCE(SUM(total_amount),0)
         FROM orders WHERE status='Completed'
           AND DATE(order_date)=CURDATE())                 AS today_sales,
        (SELECT COUNT(*) FROM customers)                   AS total_customers,
        (SELECT COUNT(*) FROM orders WHERE status='Pending') AS pending_orders
    `);
    res.json(stats);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
