-- ============================================================
-- Medical Store Management System (MSMS)
-- indexes.sql — Performance Indexes
-- Student: Moavia Amir | ID: 2k24_BSAI_72
-- ============================================================

USE msms_db;

-- Medicines
CREATE INDEX idx_medicine_name       ON medicines(name);
CREATE INDEX idx_medicine_category   ON medicines(category_id);
CREATE INDEX idx_medicine_active     ON medicines(is_active);

-- Stock
CREATE INDEX idx_stock_expiry        ON stock(expiry_date);
CREATE INDEX idx_stock_qty           ON stock(quantity);

-- Customers
CREATE INDEX idx_customer_phone      ON customers(phone);
CREATE INDEX idx_customer_name       ON customers(name);

-- Orders
CREATE INDEX idx_order_date          ON orders(order_date);
CREATE INDEX idx_order_status        ON orders(status);
CREATE INDEX idx_order_customer      ON orders(customer_id);

-- Order Items
CREATE INDEX idx_item_order          ON order_items(order_id);
CREATE INDEX idx_item_medicine       ON order_items(medicine_id);

-- Payments
CREATE INDEX idx_payment_status      ON payments(payment_status);
CREATE INDEX idx_payment_method      ON payments(payment_method);

-- Stock Transactions
CREATE INDEX idx_txn_medicine        ON stock_transactions(medicine_id);
CREATE INDEX idx_txn_type            ON stock_transactions(txn_type);
CREATE INDEX idx_txn_created         ON stock_transactions(created_at);
