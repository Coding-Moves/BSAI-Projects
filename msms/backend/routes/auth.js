// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const pool = require("../db");
const validate = require("../middleware/validate");

const router = express.Router();

// POST /api/v1/auth/login
router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const { username, password } = req.body;
      const [rows] = await pool.query(
        "SELECT * FROM employees WHERE username = ? AND is_active = 1",
        [username],
      );
      if (!rows.length) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      const employee = rows[0];
      // Debug log for diagnosis
      console.log("DEBUG LOGIN:", {
        username,
        password,
        hash: employee.password_hash,
      });
      const match = await bcrypt.compare(password, employee.password_hash);
      console.log("DEBUG BCRYPT RESULT:", match);
      if (!match) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      const token = jwt.sign(
        {
          id: employee.employee_id,
          username: employee.username,
          role: employee.role,
          name: employee.name,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
      );
      const { password_hash, ...safe } = employee;
      res.json({ token, user: safe });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/v1/auth/me
router.get(
  "/me",
  require("../middleware/auth").authenticate,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT employee_id,name,role,phone,email,username,hire_date FROM employees WHERE employee_id = ?",
        [req.user.id],
      );
      if (!rows.length)
        return res.status(404).json({ error: "User not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

module.exports = router;
