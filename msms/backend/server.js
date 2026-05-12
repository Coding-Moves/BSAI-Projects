// server.js — MSMS Express Application
// Student: Moavia Amir | 2k24_BSAI_72

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');

const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// ─── Routes ──────────────────────────────────────────────
app.use('/api/v1/auth',          require('./routes/auth'));
app.use('/api/v1/categories',    require('./routes/categories'));
app.use('/api/v1/manufacturers', require('./routes/manufacturers'));
app.use('/api/v1/suppliers',     require('./routes/suppliers'));
app.use('/api/v1/medicines',     require('./routes/medicines'));
app.use('/api/v1/stock',         require('./routes/stock'));
app.use('/api/v1/doctors',       require('./routes/doctors'));
app.use('/api/v1/customers',     require('./routes/customers'));
app.use('/api/v1/employees',     require('./routes/employees'));
app.use('/api/v1/prescriptions', require('./routes/prescriptions'));
app.use('/api/v1/orders',        require('./routes/orders'));
app.use('/api/v1/payments',      require('./routes/payments'));
app.use('/api/v1/reports',       require('./routes/reports'));

// ─── Health check ────────────────────────────────────────
app.get('/api/v1/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── 404 handler ─────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
});

// ─── Start ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀  MSMS API running on http://localhost:${PORT}`));
