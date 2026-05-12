// routes/prescriptions.js
const express  = require('express');
const { body } = require('express-validator');
const pool     = require('../db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, customer_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like   = `%${search}%`;

    let where = 'WHERE (c.name LIKE ? OR c.phone LIKE ? OR d.name LIKE ?)';
    const params = [like, like, like];
    if (customer_id) { where += ' AND p.customer_id = ?'; params.push(customer_id); }

    const [rows] = await pool.query(
      `SELECT p.*, c.name AS customer_name, c.phone AS customer_phone,
              d.name AS doctor_name, d.specialization
       FROM prescriptions p
       JOIN customers c ON c.customer_id = p.customer_id
       JOIN doctors   d ON d.doctor_id   = p.doctor_id
       ${where}
       ORDER BY p.prescription_date DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM prescriptions p
       JOIN customers c ON c.customer_id = p.customer_id
       JOIN doctors   d ON d.doctor_id   = p.doctor_id
       ${where}`, params
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS customer_name, c.phone AS customer_phone,
              d.name AS doctor_name, d.specialization, d.license_number, d.hospital
       FROM prescriptions p
       JOIN customers c ON c.customer_id = p.customer_id
       JOIN doctors   d ON d.doctor_id   = p.doctor_id
       WHERE p.prescription_id = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Prescription not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/',
  [
    body('customer_id').isInt({ gt: 0 }).withMessage('Valid customer required'),
    body('doctor_id').isInt({ gt: 0 }).withMessage('Valid doctor required'),
    body('prescription_date').isDate().withMessage('Valid date required'),
    body('valid_until').optional().isDate(),
  ],
  validate,
  async (req, res) => {
    try {
      const { customer_id, doctor_id, prescription_date, valid_until, notes } = req.body;
      const [result] = await pool.query(
        'INSERT INTO prescriptions (customer_id, doctor_id, prescription_date, valid_until, notes) VALUES (?,?,?,?,?)',
        [customer_id, doctor_id, prescription_date, valid_until||null, notes||null]
      );
      res.status(201).json({ message: 'Prescription created', prescription_id: result.insertId });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

router.put('/:id',
  [
    body('customer_id').isInt({ gt: 0 }),
    body('doctor_id').isInt({ gt: 0 }),
    body('prescription_date').isDate(),
  ],
  validate,
  async (req, res) => {
    try {
      const { customer_id, doctor_id, prescription_date, valid_until, notes, is_used } = req.body;
      const [result] = await pool.query(
        'UPDATE prescriptions SET customer_id=?,doctor_id=?,prescription_date=?,valid_until=?,notes=?,is_used=? WHERE prescription_id=?',
        [customer_id, doctor_id, prescription_date, valid_until||null, notes||null, is_used?1:0, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Prescription not found' });
      res.json({ message: 'Prescription updated' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM prescriptions WHERE prescription_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Prescription not found' });
    res.json({ message: 'Prescription deleted' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
