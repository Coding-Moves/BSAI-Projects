-- ============================================================
-- Medical Store Management System (MSMS)
-- schema.sql — Full Database Schema (MySQL 8.0, 3NF Normalized)
-- Student: Moavia Amir | ID: 2k24_BSAI_72
-- Course: Database Lab — 4th Semester BS AI
-- Instructor: Sir Ahsan Ahmed
-- ============================================================

CREATE DATABASE IF NOT EXISTS msms_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE msms_db;

-- ─────────────────────────────────────────
-- 1. CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  category_id   INT           NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100)  NOT NULL,
  description   TEXT,
  PRIMARY KEY (category_id),
  UNIQUE KEY uq_category_name (category_name)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 2. MANUFACTURERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS manufacturers (
  manufacturer_id INT          NOT NULL AUTO_INCREMENT,
  name            VARCHAR(200) NOT NULL,
  country         VARCHAR(100),
  contact_email   VARCHAR(150),
  phone           VARCHAR(20),
  address         TEXT,
  PRIMARY KEY (manufacturer_id),
  UNIQUE KEY uq_manufacturer_name  (name),
  UNIQUE KEY uq_manufacturer_email (contact_email)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 3. SUPPLIERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id    INT           NOT NULL AUTO_INCREMENT,
  name           VARCHAR(200)  NOT NULL,
  contact_person VARCHAR(100),
  phone          VARCHAR(20)   NOT NULL,
  email          VARCHAR(150),
  address        TEXT,
  rating         DECIMAL(3,1)  DEFAULT NULL,
  is_active      TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (supplier_id),
  CONSTRAINT chk_supplier_rating CHECK (rating BETWEEN 1.0 AND 5.0)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 4. MEDICINES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS medicines (
  medicine_id            INT           NOT NULL AUTO_INCREMENT,
  name                   VARCHAR(200)  NOT NULL,
  generic_name           VARCHAR(200),
  category_id            INT,
  manufacturer_id        INT,
  dosage_form            ENUM('Tablet','Capsule','Syrup','Injection','Cream','Drop','Inhaler','Powder','Patch') NOT NULL,
  strength               VARCHAR(50),
  unit_price             DECIMAL(10,2) NOT NULL,
  requires_prescription  TINYINT(1)    NOT NULL DEFAULT 0,
  description            TEXT,
  is_active              TINYINT(1)    NOT NULL DEFAULT 1,
  PRIMARY KEY (medicine_id),
  CONSTRAINT chk_medicine_price CHECK (unit_price > 0),
  CONSTRAINT fk_medicine_category     FOREIGN KEY (category_id)     REFERENCES categories(category_id)     ON DELETE SET NULL,
  CONSTRAINT fk_medicine_manufacturer FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(manufacturer_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 5. STOCK
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock (
  stock_id           INT          NOT NULL AUTO_INCREMENT,
  medicine_id        INT          NOT NULL,
  supplier_id        INT,
  quantity           INT          NOT NULL DEFAULT 0,
  reorder_level      INT          NOT NULL DEFAULT 10,
  batch_number       VARCHAR(100),
  manufacturing_date DATE,
  expiry_date        DATE         NOT NULL,
  last_restocked     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (stock_id),
  UNIQUE KEY uq_stock_medicine (medicine_id),
  CONSTRAINT chk_stock_qty     CHECK (quantity >= 0),
  CONSTRAINT chk_stock_expiry  CHECK (expiry_date > manufacturing_date),
  CONSTRAINT fk_stock_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
  CONSTRAINT fk_stock_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 6. DOCTORS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id       INT          NOT NULL AUTO_INCREMENT,
  name            VARCHAR(200) NOT NULL,
  specialization  VARCHAR(150),
  license_number  VARCHAR(100) NOT NULL,
  phone           VARCHAR(20),
  hospital        VARCHAR(200),
  is_active       TINYINT(1)   NOT NULL DEFAULT 1,
  PRIMARY KEY (doctor_id),
  UNIQUE KEY uq_doctor_license (license_number)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 7. CUSTOMERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  customer_id   INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(200) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  email         VARCHAR(150),
  date_of_birth DATE,
  gender        ENUM('Male','Female','Other'),
  address       TEXT,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  UNIQUE KEY uq_customer_phone (phone)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 8. EMPLOYEES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  employee_id   INT           NOT NULL AUTO_INCREMENT,
  name          VARCHAR(200)  NOT NULL,
  role          ENUM('Pharmacist','Cashier','Manager','Admin') NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  email         VARCHAR(150),
  salary        DECIMAL(10,2),
  hire_date     DATE          NOT NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  username      VARCHAR(100)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  PRIMARY KEY (employee_id),
  UNIQUE KEY uq_employee_phone    (phone),
  UNIQUE KEY uq_employee_email    (email),
  UNIQUE KEY uq_employee_username (username),
  CONSTRAINT chk_employee_salary CHECK (salary > 0)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 9. PRESCRIPTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prescriptions (
  prescription_id   INT       NOT NULL AUTO_INCREMENT,
  customer_id       INT       NOT NULL,
  doctor_id         INT       NOT NULL,
  prescription_date DATE      NOT NULL,
  valid_until       DATE,
  notes             TEXT,
  is_used           TINYINT(1) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (prescription_id),
  CONSTRAINT chk_prescription_valid CHECK (valid_until IS NULL OR valid_until >= prescription_date),
  CONSTRAINT fk_prescription_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id)  ON DELETE RESTRICT,
  CONSTRAINT fk_prescription_doctor   FOREIGN KEY (doctor_id)   REFERENCES doctors(doctor_id)      ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 10. ORDERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  order_id         INT           NOT NULL AUTO_INCREMENT,
  customer_id      INT,
  employee_id      INT           NOT NULL,
  prescription_id  INT,
  order_date       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status           ENUM('Pending','Completed','Cancelled','Refunded') NOT NULL DEFAULT 'Pending',
  subtotal         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_percent DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  tax_percent      DECIMAL(5,2)  NOT NULL DEFAULT 0.00,
  total_amount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notes            TEXT,
  PRIMARY KEY (order_id),
  CONSTRAINT chk_order_discount CHECK (discount_percent BETWEEN 0 AND 100),
  CONSTRAINT fk_order_customer     FOREIGN KEY (customer_id)     REFERENCES customers(customer_id)         ON DELETE SET NULL,
  CONSTRAINT fk_order_employee     FOREIGN KEY (employee_id)     REFERENCES employees(employee_id)         ON DELETE RESTRICT,
  CONSTRAINT fk_order_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 11. ORDER ITEMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  item_id     INT           NOT NULL AUTO_INCREMENT,
  order_id    INT           NOT NULL,
  medicine_id INT           NOT NULL,
  quantity    INT           NOT NULL,
  unit_price  DECIMAL(10,2) NOT NULL,
  subtotal    DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  PRIMARY KEY (item_id),
  CONSTRAINT chk_item_qty  CHECK (quantity > 0),
  CONSTRAINT fk_item_order    FOREIGN KEY (order_id)    REFERENCES orders(order_id)    ON DELETE CASCADE,
  CONSTRAINT fk_item_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- 12. PAYMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  payment_id      INT           NOT NULL AUTO_INCREMENT,
  order_id        INT           NOT NULL,
  amount_paid     DECIMAL(10,2) NOT NULL,
  payment_method  ENUM('Cash','Card','Online','Insurance') NOT NULL,
  payment_status  ENUM('Paid','Pending','Failed','Refunded') NOT NULL DEFAULT 'Pending',
  transaction_ref VARCHAR(200),
  paid_at         TIMESTAMP,
  notes           TEXT,
  PRIMARY KEY (payment_id),
  UNIQUE KEY uq_payment_order (order_id),
  CONSTRAINT chk_payment_amount CHECK (amount_paid >= 0),
  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- AUXILIARY TABLE: LOW STOCK ALERTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  alert_id      INT       NOT NULL AUTO_INCREMENT,
  medicine_id   INT       NOT NULL,
  current_qty   INT       NOT NULL,
  reorder_level INT       NOT NULL,
  alerted_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_resolved   TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (alert_id),
  CONSTRAINT fk_alert_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- AUXILIARY TABLE: STOCK TRANSACTIONS LOG
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock_transactions (
  txn_id      INT           NOT NULL AUTO_INCREMENT,
  medicine_id INT           NOT NULL,
  employee_id INT,
  qty_change  INT           NOT NULL,
  txn_type    ENUM('IN','OUT') NOT NULL,
  reference   VARCHAR(200),
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (txn_id),
  CONSTRAINT fk_txn_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE CASCADE,
  CONSTRAINT fk_txn_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
) ENGINE=InnoDB;
