-- ============================================================
-- Medical Store Management System (MSMS)
-- triggers.sql — All Database Triggers
-- Student: Moavia Amir | ID: 2k24_BSAI_72
-- Course: Database Lab — 4th Semester BS AI
-- Instructor: Sir Ahsan Ahmed
-- ============================================================

USE msms_db;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS after_order_item_insert_stock;
DROP TRIGGER IF EXISTS after_order_item_insert_lowstock;
DROP TRIGGER IF EXISTS after_order_item_insert_update_total;
DROP TRIGGER IF EXISTS before_stock_update_expiry_check;

DELIMITER $$

-- ─────────────────────────────────────────
-- TRIGGER 1: Deduct stock on order item insert
-- ─────────────────────────────────────────
CREATE TRIGGER after_order_item_insert_stock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  DECLARE v_current_qty INT;

  SELECT quantity INTO v_current_qty
  FROM stock
  WHERE medicine_id = NEW.medicine_id;

  IF v_current_qty IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'No stock record found for this medicine.';
  END IF;

  IF v_current_qty < NEW.quantity THEN
    SIGNAL SQLSTATE '45001'
      SET MESSAGE_TEXT = 'Insufficient stock: cannot fulfil requested quantity.';
  END IF;

  UPDATE stock
  SET quantity = quantity - NEW.quantity
  WHERE medicine_id = NEW.medicine_id;

  -- Log the outgoing stock transaction
  INSERT INTO stock_transactions (medicine_id, employee_id, qty_change, txn_type, reference)
  SELECT NEW.medicine_id,
         o.employee_id,
         NEW.quantity,
         'OUT',
         CONCAT('ORDER-', NEW.order_id)
  FROM orders o
  WHERE o.order_id = NEW.order_id;
END$$

-- ─────────────────────────────────────────
-- TRIGGER 2: Low stock alert after order item insert
-- ─────────────────────────────────────────
CREATE TRIGGER after_order_item_insert_lowstock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  DECLARE v_qty         INT;
  DECLARE v_reorder     INT;

  SELECT quantity, reorder_level
  INTO   v_qty, v_reorder
  FROM   stock
  WHERE  medicine_id = NEW.medicine_id;

  IF v_qty IS NOT NULL AND v_qty < v_reorder THEN
    -- Only insert alert if one doesn't already exist for today
    IF NOT EXISTS (
      SELECT 1 FROM low_stock_alerts
      WHERE medicine_id = NEW.medicine_id
        AND DATE(alerted_at) = CURDATE()
        AND is_resolved = 0
    ) THEN
      INSERT INTO low_stock_alerts (medicine_id, current_qty, reorder_level)
      VALUES (NEW.medicine_id, v_qty, v_reorder);
    END IF;
  END IF;
END$$

-- ─────────────────────────────────────────
-- TRIGGER 3: Recalculate order totals after item insert
-- ─────────────────────────────────────────
CREATE TRIGGER after_order_item_insert_update_total
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  DECLARE v_subtotal        DECIMAL(10,2);
  DECLARE v_discount_pct    DECIMAL(5,2);
  DECLARE v_tax_pct         DECIMAL(5,2);
  DECLARE v_discount_amt    DECIMAL(10,2);
  DECLARE v_tax_amt         DECIMAL(10,2);
  DECLARE v_total           DECIMAL(10,2);

  -- Sum all line-item subtotals for this order
  SELECT COALESCE(SUM(quantity * unit_price), 0)
  INTO   v_subtotal
  FROM   order_items
  WHERE  order_id = NEW.order_id;

  -- Fetch discount/tax percentages
  SELECT discount_percent, tax_percent
  INTO   v_discount_pct, v_tax_pct
  FROM   orders
  WHERE  order_id = NEW.order_id;

  SET v_discount_amt = ROUND(v_subtotal * v_discount_pct / 100, 2);
  SET v_tax_amt      = ROUND((v_subtotal - v_discount_amt) * v_tax_pct / 100, 2);
  SET v_total        = v_subtotal - v_discount_amt + v_tax_amt;

  UPDATE orders
  SET    subtotal     = v_subtotal,
         total_amount = v_total
  WHERE  order_id = NEW.order_id;
END$$

-- ─────────────────────────────────────────
-- TRIGGER 4: Prevent expired stock updates
-- ─────────────────────────────────────────
CREATE TRIGGER before_stock_update_expiry_check
BEFORE UPDATE ON stock
FOR EACH ROW
BEGIN
  IF NEW.expiry_date < CURDATE() THEN
    SIGNAL SQLSTATE '45002'
      SET MESSAGE_TEXT = 'Cannot set expiry_date to a past date.';
  END IF;

  IF NEW.manufacturing_date IS NOT NULL
     AND NEW.expiry_date <= NEW.manufacturing_date THEN
    SIGNAL SQLSTATE '45003'
      SET MESSAGE_TEXT = 'expiry_date must be after manufacturing_date.';
  END IF;
END$$

DELIMITER ;
