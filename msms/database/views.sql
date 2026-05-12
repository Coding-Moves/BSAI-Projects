-- ============================================================
-- Medical Store Management System (MSMS)
-- views.sql — All Database Views
-- Student: Moavia Amir | ID: 2k24_BSAI_72
-- ============================================================

USE msms_db;

DROP VIEW IF EXISTS vw_LowStockAlert;
DROP VIEW IF EXISTS vw_ExpiringSoon;
DROP VIEW IF EXISTS vw_SalesSummary;
DROP VIEW IF EXISTS vw_TopSellingMedicines;
DROP VIEW IF EXISTS vw_EmployeePerformance;
DROP VIEW IF EXISTS vw_SupplierRatings;
DROP VIEW IF EXISTS vw_FullInventory;

-- ─────────────────────────────────────────
-- VIEW 1: Low Stock Alert
-- ─────────────────────────────────────────
CREATE VIEW vw_LowStockAlert AS
SELECT
  m.medicine_id,
  m.name                   AS medicine_name,
  m.dosage_form,
  m.strength,
  c.category_name,
  s.quantity               AS current_stock,
  s.reorder_level,
  (s.reorder_level - s.quantity) AS units_below_reorder,
  s.expiry_date,
  sup.name                 AS supplier_name,
  sup.phone                AS supplier_phone
FROM  medicines m
JOIN  stock     s   ON s.medicine_id  = m.medicine_id
JOIN  categories c  ON c.category_id  = m.category_id
LEFT  JOIN suppliers sup ON sup.supplier_id = s.supplier_id
WHERE s.quantity < s.reorder_level
  AND m.is_active = 1
ORDER BY units_below_reorder DESC;

-- ─────────────────────────────────────────
-- VIEW 2: Expiring Soon (within 30 days)
-- ─────────────────────────────────────────
CREATE VIEW vw_ExpiringSoon AS
SELECT
  m.medicine_id,
  m.name                      AS medicine_name,
  m.dosage_form,
  m.strength,
  c.category_name,
  s.quantity                  AS current_stock,
  s.batch_number,
  s.expiry_date,
  DATEDIFF(s.expiry_date, CURDATE()) AS days_until_expiry,
  sup.name                    AS supplier_name
FROM  medicines m
JOIN  stock     s   ON s.medicine_id  = m.medicine_id
JOIN  categories c  ON c.category_id  = m.category_id
LEFT  JOIN suppliers sup ON sup.supplier_id = s.supplier_id
WHERE s.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  AND m.is_active = 1
ORDER BY s.expiry_date ASC;

-- ─────────────────────────────────────────
-- VIEW 3: Sales Summary (by date)
-- ─────────────────────────────────────────
CREATE VIEW vw_SalesSummary AS
SELECT
  DATE(o.order_date)            AS sale_date,
  COUNT(o.order_id)             AS total_orders,
  SUM(o.total_amount)           AS total_revenue,
  AVG(o.total_amount)           AS avg_order_value,
  SUM(o.discount_percent * o.subtotal / 100) AS total_discounts_given,
  COUNT(DISTINCT o.customer_id) AS unique_customers
FROM  orders o
WHERE o.status = 'Completed'
GROUP BY DATE(o.order_date)
ORDER BY sale_date DESC;

-- ─────────────────────────────────────────
-- VIEW 4: Top Selling Medicines
-- ─────────────────────────────────────────
CREATE VIEW vw_TopSellingMedicines AS
SELECT
  m.medicine_id,
  m.name                   AS medicine_name,
  m.dosage_form,
  m.strength,
  c.category_name,
  SUM(oi.quantity)         AS total_sold,
  SUM(oi.subtotal)         AS total_revenue,
  COUNT(DISTINCT oi.order_id) AS order_count,
  m.unit_price
FROM  order_items oi
JOIN  medicines   m  ON m.medicine_id = oi.medicine_id
JOIN  categories  c  ON c.category_id = m.category_id
JOIN  orders      o  ON o.order_id    = oi.order_id
WHERE o.status = 'Completed'
GROUP BY m.medicine_id, m.name, m.dosage_form, m.strength, c.category_name, m.unit_price
ORDER BY total_sold DESC;

-- ─────────────────────────────────────────
-- VIEW 5: Employee Performance
-- ─────────────────────────────────────────
CREATE VIEW vw_EmployeePerformance AS
SELECT
  e.employee_id,
  e.name                   AS employee_name,
  e.role,
  COUNT(o.order_id)        AS total_orders,
  COALESCE(SUM(o.total_amount), 0) AS total_revenue_handled,
  COALESCE(AVG(o.total_amount), 0) AS avg_order_value,
  COUNT(CASE WHEN o.status = 'Completed' THEN 1 END) AS completed_orders,
  COUNT(CASE WHEN o.status = 'Cancelled' THEN 1 END) AS cancelled_orders
FROM  employees e
LEFT  JOIN orders o ON o.employee_id = e.employee_id
WHERE e.is_active = 1
GROUP BY e.employee_id, e.name, e.role
ORDER BY total_revenue_handled DESC;

-- ─────────────────────────────────────────
-- VIEW 6: Supplier Ratings
-- ─────────────────────────────────────────
CREATE VIEW vw_SupplierRatings AS
SELECT
  sup.supplier_id,
  sup.name                 AS supplier_name,
  sup.contact_person,
  sup.phone,
  sup.email,
  sup.rating,
  COUNT(s.stock_id)        AS medicines_supplied,
  SUM(s.quantity)          AS total_units_in_stock,
  sup.is_active
FROM  suppliers sup
LEFT  JOIN stock s ON s.supplier_id = sup.supplier_id
GROUP BY sup.supplier_id, sup.name, sup.contact_person, sup.phone, sup.email, sup.rating, sup.is_active
ORDER BY sup.rating DESC;

-- ─────────────────────────────────────────
-- VIEW 7: Full Inventory
-- ─────────────────────────────────────────
CREATE VIEW vw_FullInventory AS
SELECT
  m.medicine_id,
  m.name                   AS medicine_name,
  m.generic_name,
  m.dosage_form,
  m.strength,
  m.unit_price,
  m.requires_prescription,
  m.is_active              AS medicine_active,
  c.category_name,
  mfr.name                 AS manufacturer_name,
  mfr.country,
  s.stock_id,
  s.quantity               AS stock_qty,
  s.reorder_level,
  CASE
    WHEN s.quantity = 0              THEN 'Out of Stock'
    WHEN s.quantity < s.reorder_level THEN 'Low Stock'
    ELSE 'In Stock'
  END                      AS stock_status,
  s.batch_number,
  s.manufacturing_date,
  s.expiry_date,
  DATEDIFF(s.expiry_date, CURDATE()) AS days_to_expiry,
  s.last_restocked,
  sup.name                 AS supplier_name
FROM  medicines   m
LEFT  JOIN categories  c   ON c.category_id     = m.category_id
LEFT  JOIN manufacturers mfr ON mfr.manufacturer_id = m.manufacturer_id
LEFT  JOIN stock       s   ON s.medicine_id     = m.medicine_id
LEFT  JOIN suppliers   sup ON sup.supplier_id   = s.supplier_id
ORDER BY m.name ASC;
