// routes/employees.js
const express  = require('express');
const bcrypt   = require('bcryptjs');
const { body } = require('express-validator');
const pool     = require('../db');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const ROLES = ['Pharmacist','Cashier','Manager','Admin'];

router.get('/', async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT employee_id, name, role, phone, email, salary, hire_date, is_active, username
       FROM employees
       WHERE (name LIKE ? OR role LIKE ? OR username LIKE ?) AND is_active = 1
       ORDER BY name LIMIT ? OFFSET ?`,
      [like, like, like, parseInt(limit), offset]
    );
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM employees WHERE (name LIKE ? OR role LIKE ?) AND is_active = 1', [like, like]
    );
    res.json({ data: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT employee_id, name, role, phone, email, salary, hire_date, is_active, username FROM employees WHERE employee_id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Employee not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

router.post('/',
  authorize('Admin', 'Manager'),
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('role').isIn(ROLES).withMessage('Invalid role'),
    body('phone').trim().notEmpty().withMessage('Phone required'),
    body('username').trim().notEmpty().isLength({ min: 3 }).withMessage('Username min 3 chars'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('salary').optional().isFloat({ gt: 0 }),
    body('email').optional({ checkFalsy: true }).isEmail(),
    body('hire_date').isDate().withMessage('Valid hire date required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, role, phone, email, salary, hire_date, username, password } = req.body;
      const hash = await bcrypt.hash(password, 12);
      const [result] = await pool.query(
        'INSERT INTO employees (name,role,phone,email,salary,hire_date,username,password_hash) VALUES (?,?,?,?,?,?,?,?)',
        [name, role, phone, email||null, salary||null, hire_date, username, hash]
      );
      res.status(201).json({ message: 'Employee created', employee_id: result.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Phone, email, or username already exists' });
      console.error(err); res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.put('/:id',
  authorize('Admin', 'Manager'),
  [
    body('name').trim().notEmpty(),
    body('role').isIn(ROLES),
    body('phone').trim().notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, role, phone, email, salary, hire_date, is_active, password } = req.body;
      if (password) {
        const hash = await bcrypt.hash(password, 12);
        await pool.query(
          'UPDATE employees SET name=?,role=?,phone=?,email=?,salary=?,hire_date=?,is_active=?,password_hash=? WHERE employee_id=?',
          [name, role, phone, email||null, salary||null, hire_date, is_active!==undefined?(is_active?1:0):1, hash, req.params.id]
        );
      } else {
        await pool.query(
          'UPDATE employees SET name=?,role=?,phone=?,email=?,salary=?,hire_date=?,is_active=? WHERE employee_id=?',
          [name, role, phone, email||null, salary||null, hire_date, is_active!==undefined?(is_active?1:0):1, req.params.id]
        );
      }
      res.json({ message: 'Employee updated' });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
  }
);

router.delete('/:id', authorize('Admin'), async (req, res) => {
  try {
    const [result] = await pool.query('UPDATE employees SET is_active = 0 WHERE employee_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deactivated' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Internal server error' }); }
});

module.exports = router;
