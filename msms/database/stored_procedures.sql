-- ============================================================
-- Medical Store Management System (MSMS)
-- stored_procedures.sql
-- Student: Moavia Amir | ID: 2k24_BSAI_72
-- ============================================================

USE msms_db;

DROP PROCEDURE IF EXISTS GenerateBill;
DROP PROCEDURE IF EXISTS RestockMedicine;
DROP PROCEDURE IF EXISTS PlaceOrder;
DROP PROCEDURE IF EXISTS CompletePayment;

DELIMITER $$

-- ─────────────────────────────────────────
-- PROCEDURE 1: GenerateBill
-- Returns full bill dataset for an order
-- ─────────────────────────────────────────
CREATE PROCEDURE GenerateBill(IN p_order_id INT)
BEGIN
  -- Order header
  SELECT
    o.order_id,
    CONCAT('ORD-', LPAD(o.order_id, 5, '0'))  AS invoice_number,
    o.order_date,
    o.status,
    o.subtotal,
    o.discount_percent,
    ROUND(o.subtotal * o.discount_percent / 100, 2) AS discount_amount,
    o.tax_percent,
    ROUND((o.subtotal - o.subtotal * o.discount_percent / 100) * o.tax_percent / 100, 2) AS tax_amount,
    o.total_amount,
    o.notes                                    AS order_notes,
    -- Customer info
    COALESCE(c.name,  'Walk-in Customer')      AS customer_name,
    COALESCE(c.phone, 'N/A')                   AS customer_phone,
    -- Employee info
    e.name                                     AS cashier_name,
    e.role                                     AS cashier_role,
    -- Prescription info
    CONCAT('RX-', LPAD(p.prescription_id,3,'0')) AS prescription_number,
    p.prescription_date,
    -- Payment info
    py.payment_method,
    py.payment_status,
    py.amount_paid,
    py.transaction_ref,
    py.paid_at
  FROM  orders        o
  LEFT  JOIN customers    c  ON c.customer_id    = o.customer_id
  JOIN  employees     e  ON e.employee_id    = o.employee_id
  LEFT  JOIN prescriptions p  ON p.prescription_id = o.prescription_id
  LEFT  JOIN payments     py ON py.order_id       = o.order_id
  WHERE o.order_id = p_order_id;

  -- Order line items
  SELECT
    oi.item_id,
    m.name                        AS medicine_name,
    m.strength,
    m.dosage_form,
    oi.quantity,
    oi.unit_price,
    oi.subtotal                   AS line_subtotal
  FROM  order_items oi
  JOIN  medicines   m  ON m.medicine_id = oi.medicine_id
  WHERE oi.order_id = p_order_id
  ORDER BY oi.item_id;
END$$

-- ─────────────────────────────────────────
-- PROCEDURE 2: RestockMedicine
-- ─────────────────────────────────────────
CREATE PROCEDURE RestockMedicine(
  IN p_medicine_id  INT,
  IN p_quantity     INT,
  IN p_supplier_id  INT,
  IN p_expiry_date  DATE,
  IN p_batch        VARCHAR(100),
  IN p_employee_id  INT
)
BEGIN
  DECLARE v_exists INT DEFAULT 0;

  -- Validate quantity
  IF p_quantity <= 0 THEN
    SIGNAL SQLSTATE '45004'
      SET MESSAGE_TEXT = 'Restock quantity must be greater than zero.';
  END IF;

  -- Validate expiry date
  IF p_expiry_date <= CURDATE() THEN
    SIGNAL SQLSTATE '45005'
      SET MESSAGE_TEXT = 'Expiry date must be a future date.';
  END IF;

  -- Check stock record exists
  SELECT COUNT(*) INTO v_exists FROM stock WHERE medicine_id = p_medicine_id;

  IF v_exists = 0 THEN
    -- Create stock record if missing
    INSERT INTO stock (medicine_id, supplier_id, quantity, batch_number, expiry_date, last_restocked)
    VALUES (p_medicine_id, p_supplier_id, p_quantity, p_batch, p_expiry_date, NOW());
  ELSE
    UPDATE stock
    SET
      quantity       = quantity + p_quantity,
      supplier_id    = COALESCE(p_supplier_id, supplier_id),
      batch_number   = COALESCE(p_batch,       batch_number),
      expiry_date    = COALESCE(p_expiry_date, expiry_date),
      last_restocked = NOW()
    WHERE medicine_id = p_medicine_id;
  END IF;

  -- Resolve any open low-stock alerts for this medicine
  UPDATE low_stock_alerts
  SET is_resolved = 1
  WHERE medicine_id = p_medicine_id AND is_resolved = 0;

  -- Log the incoming stock transaction
  INSERT INTO stock_transactions (medicine_id, employee_id, qty_change, txn_type, reference)
  VALUES (p_medicine_id, p_employee_id, p_quantity, 'IN', CONCAT('RESTOCK-BATCH-', COALESCE(p_batch,'N/A')));

  SELECT CONCAT('Medicine ID ', p_medicine_id, ' restocked by ', p_quantity, ' units.') AS message;
END$$

-- ─────────────────────────────────────────
-- PROCEDURE 3: PlaceOrder
-- ─────────────────────────────────────────
CREATE PROCEDURE PlaceOrder(
  IN  p_customer_id     INT,
  IN  p_employee_id     INT,
  IN  p_prescription_id INT,
  IN  p_discount        DECIMAL(5,2),
  IN  p_tax             DECIMAL(5,2),
  IN  p_notes           TEXT,
  OUT p_order_id        INT
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  IF p_discount < 0 OR p_discount > 100 THEN
    SIGNAL SQLSTATE '45006'
      SET MESSAGE_TEXT = 'Discount percent must be between 0 and 100.';
  END IF;

  INSERT INTO orders
    (customer_id, employee_id, prescription_id, status, discount_percent, tax_percent, notes)
  VALUES
    (p_customer_id, p_employee_id, p_prescription_id, 'Pending', p_discount, p_tax, p_notes);

  SET p_order_id = LAST_INSERT_ID();

  COMMIT;
END$$

-- ─────────────────────────────────────────
-- PROCEDURE 4: CompletePayment
-- ─────────────────────────────────────────
CREATE PROCEDURE CompletePayment(
  IN p_order_id INT,
  IN p_method   VARCHAR(20),
  IN p_amount   DECIMAL(10,2),
  IN p_ref      VARCHAR(200)
)
BEGIN
  DECLARE v_total      DECIMAL(10,2);
  DECLARE v_status     VARCHAR(20);
  DECLARE v_pay_exists INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- Fetch order total and current status
  SELECT total_amount, status
  INTO   v_total, v_status
  FROM   orders
  WHERE  order_id = p_order_id
  FOR UPDATE;

  IF v_total IS NULL THEN
    SIGNAL SQLSTATE '45007'
      SET MESSAGE_TEXT = 'Order not found.';
  END IF;

  IF v_status = 'Completed' THEN
    SIGNAL SQLSTATE '45008'
      SET MESSAGE_TEXT = 'Order is already completed.';
  END IF;

  IF v_status = 'Cancelled' THEN
    SIGNAL SQLSTATE '45009'
      SET MESSAGE_TEXT = 'Cannot pay for a cancelled order.';
  END IF;

  IF p_amount < v_total THEN
    SIGNAL SQLSTATE '45010'
      SET MESSAGE_TEXT = 'Amount paid is less than the order total.';
  END IF;

  -- Check for duplicate payment record
  SELECT COUNT(*) INTO v_pay_exists FROM payments WHERE order_id = p_order_id;
  IF v_pay_exists > 0 THEN
    SIGNAL SQLSTATE '45011'
      SET MESSAGE_TEXT = 'A payment record already exists for this order.';
  END IF;

  INSERT INTO payments
    (order_id, amount_paid, payment_method, payment_status, transaction_ref, paid_at)
  VALUES
    (p_order_id, p_amount, p_method, 'Paid', p_ref, NOW());

  UPDATE orders
  SET    status = 'Completed'
  WHERE  order_id = p_order_id;

  -- Mark prescription as used if linked
  UPDATE prescriptions pr
  JOIN   orders o ON o.prescription_id = pr.prescription_id
  SET    pr.is_used = 1
  WHERE  o.order_id = p_order_id;

  COMMIT;

  SELECT 'Payment completed successfully.' AS message;
END$$

DELIMITER ;
