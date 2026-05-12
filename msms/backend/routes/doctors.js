// routes/doctors.js
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
      `SELECT * FROM doctors WHERE (name LIKE ? OR specialization LIKE ? OR license_number LIKE ?) AND is_active = 1
       ORDER BY name LIMIT ? OFFSET ?`,
      [like, like, like, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM doctors WHERE (name LIKE ? OR specialization LIKE ?) AND is_active = 1',
      [like, like]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM doctors WHERE doctor_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Doctor not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('license_number').trim().notEmpty().withMessage('License number required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, specialization, license_number, phone, hospital } = req.body;
      const [result] = await pool.query(
        'INSERT INTO doctors (name, specialization, license_number, phone, hospital) VALUES (?,?,?,?,?)',
        [name, specialization||null, license_number, phone||null, hospital||null]
      );
      res.status(201).json({ message: 'Doctor created', doctor_id: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'License number already exists' });
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/:id',
  [body('name').trim().notEmpty(), body('license_number').trim().notEmpty()],
  validate,
  async (req, res) => {
    try {
      const { name, specialization, license_number, phone, hospital, is_active } = req.body;
      const [result] = await pool.query(
        'UPDATE doctors SET name=?,specialization=?,license_number=?,phone=?,hospital=?,is_active=? WHERE doctor_id=?',
        [name, specialization||null, license_number, phone||null, hospital||null, is_active !== undefined ? (is_active?1:0) : 1, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Doctor not found' });
      res.json({ message: 'Doctor updated' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE doctors SET is_active = 0 WHERE doctor_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Doctor deactivated' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
