// routes/medicines.js
const express  = require('express');
const { body } = require('express-validator');
const pool     = require('../db');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const DOSAGE_FORMS = ['Tablet','Capsule','Syrup','Injection','Cream','Drop','Inhaler','Powder','Patch'];

// GET /api/v1/medicines
router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10, category_id, active } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like   = `%${search}%`;

    let where = 'WHERE (m.name LIKE ? OR m.generic_name LIKE ?)';
    const params = [like, like];

    if (category_id) { where += ' AND m.category_id = ?'; params.push(category_id); }
    if (active !== undefined) { where += ' AND m.is_active = ?'; params.push(active === 'true' ? 1 : 0); }

    const [rows] = await pool.query(
      `SELECT m.*, c.category_name, mfr.name AS manufacturer_name,
              s.quantity AS stock_qty, s.expiry_date, s.reorder_level,
              CASE WHEN s.quantity IS NULL OR s.quantity = 0 THEN 'Out of Stock'
                   WHEN s.quantity < s.reorder_level THEN 'Low Stock'
                   ELSE 'In Stock' END AS stock_status
       FROM medicines m
       LEFT JOIN categories   c   ON c.category_id     = m.category_id
       LEFT JOIN manufacturers mfr ON mfr.manufacturer_id = m.manufacturer_id
       LEFT JOIN stock         s   ON s.medicine_id     = m.medicine_id
       ${where}
       ORDER BY m.name
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM medicines m ${where}`, params
    );

    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// GET /api/v1/medicines/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, c.category_name, mfr.name AS manufacturer_name,
              s.quantity AS stock_qty, s.expiry_date, s.reorder_level, s.batch_number,
              s.manufacturing_date, s.last_restocked, sup.name AS supplier_name
       FROM medicines m
       LEFT JOIN categories    c   ON c.category_id      = m.category_id
       LEFT JOIN manufacturers mfr ON mfr.manufacturer_id = m.manufacturer_id
       LEFT JOIN stock         s   ON s.medicine_id      = m.medicine_id
       LEFT JOIN suppliers     sup ON sup.supplier_id    = s.supplier_id
       WHERE m.medicine_id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Medicine not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

// POST /api/v1/medicines
router.post('/',
  [
    body('name').trim().notEmpty().isLength({ min: 2 }).withMessage('Name min 2 chars'),
    body('dosage_form').isIn(DOSAGE_FORMS).withMessage('Invalid dosage form'),
    body('unit_price').isFloat({ gt: 0 }).withMessage('Price must be > 0'),
    body('category_id').optional().isInt({ gt: 0 }),
    body('manufacturer_id').optional().isInt({ gt: 0 }),
    body('requires_prescription').optional().isBoolean(),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, generic_name, category_id, manufacturer_id, dosage_form,
              strength, unit_price, requires_prescription, description } = req.body;
      const [result] = await pool.query(
        `INSERT INTO medicines
           (name, generic_name, category_id, manufacturer_id, dosage_form, strength, unit_price, requires_prescription, description)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [name, generic_name||null, category_id||null, manufacturer_id||null,
         dosage_form, strength||null, unit_price, requires_prescription ? 1 : 0, description||null]
      );
      res.status(201).json({ message: 'Medicine created', medicine_id: result.insertId });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

// PUT /api/v1/medicines/:id
router.put('/:id',
  [
    body('name').trim().notEmpty().isLength({ min: 2 }),
    body('dosage_form').isIn(DOSAGE_FORMS),
    body('unit_price').isFloat({ gt: 0 }),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, generic_name, category_id, manufacturer_id, dosage_form,
              strength, unit_price, requires_prescription, description, is_active } = req.body;
      const [result] = await pool.query(
        `UPDATE medicines SET name=?, generic_name=?, category_id=?, manufacturer_id=?,
         dosage_form=?, strength=?, unit_price=?, requires_prescription=?, description=?, is_active=?
         WHERE medicine_id=?`,
        [name, generic_name||null, category_id||null, manufacturer_id||null,
         dosage_form, strength||null, unit_price, requires_prescription ? 1 : 0,
         description||null, is_active !== undefined ? (is_active ? 1 : 0) : 1, req.params.id]
      );
      if (!result.affectedRows) return res.status(404).json({ error: 'Medicine not found' });
      res.json({ message: 'Medicine updated' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

// DELETE /api/v1/medicines/:id  (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE medicines SET is_active = 0 WHERE medicine_id = ?', [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Medicine not found' });
    res.json({ message: 'Medicine deactivated' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
