-- ============================================================
-- Medical Store Management System (MSMS)
-- sample_data.sql — Realistic Pakistani Sample Data
-- Student: Moavia Amir | ID: 2k24_BSAI_72
-- ============================================================

USE msms_db;

-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
INSERT INTO categories (category_name, description) VALUES
('Analgesic',        'Pain relievers and fever reducers'),
('Antibiotic',       'Medicines that fight bacterial infections'),
('Antacid',          'Medicines for acid reflux and stomach issues'),
('Antihistamine',    'Medicines for allergies and hay fever'),
('Cardiovascular',   'Medicines for heart and blood pressure'),
('Antidiabetic',     'Medicines for diabetes management'),
('Respiratory',      'Medicines for asthma, COPD, and respiratory conditions'),
('Dermatological',   'Skin creams, ointments, and topical medicines'),
('Gastrointestinal', 'Medicines for digestive issues'),
('Vitamins',         'Vitamins, minerals, and dietary supplements'),
('Antifungal',       'Medicines for fungal infections'),
('ORS & Rehydration','Oral rehydration solutions and electrolytes');

-- ─────────────────────────────────────────
-- MANUFACTURERS
-- ─────────────────────────────────────────
INSERT INTO manufacturers (name, country, contact_email, phone, address) VALUES
('Getz Pharma (Pvt) Ltd',      'Pakistan', 'info@getzpharma.com',       '021-35141000', 'Plot 143, Sector 7-A, Industrial Area, Karachi'),
('GSK Pakistan Ltd',           'Pakistan', 'gsk.pakistan@gsk.com',      '021-35661891', 'Clifton, Karachi, Sindh'),
('Pfizer Pakistan Ltd',        'Pakistan', 'pfizer.pk@pfizer.com',      '021-35293333', 'DHA Phase-IV, Karachi'),
('Searle Pakistan Ltd',        'Pakistan', 'info@searle.com.pk',        '021-35650043', 'F-268, S.I.T.E., Karachi'),
('Barrett Hodgson Pakistan',   'Pakistan', 'info@barretthodgson.com',   '021-32463121', 'Plot 23, Korangi Industrial Area, Karachi'),
('AGP Limited',                'Pakistan', 'info@agp.com.pk',           '021-34322155', 'Plot 16, Sector 22, Korangi Industrial Area, Karachi'),
('Ferozsons Laboratories',     'Pakistan', 'info@ferozsons.com.pk',     '042-35761010', '50-Empress Road, Lahore'),
('Reckitt Benckiser Pakistan', 'Pakistan', 'rb.pakistan@rb.com',        '021-35660040', 'Karachi, Sindh'),
('Abbott Laboratories Pakistan','Pakistan','abbott.pk@abbott.com',      '051-2876000',  'Islamabad, Pakistan'),
('Novartis Pakistan Ltd',      'Pakistan', 'novartis.pk@novartis.com',  '021-35610501', 'Clifton, Karachi');

-- ─────────────────────────────────────────
-- SUPPLIERS
-- ─────────────────────────────────────────
INSERT INTO suppliers (name, contact_person, phone, email, address, rating, is_active) VALUES
('Getz Pharma Direct',       'Tariq Mehmood',  '03001234501', 'tariq@getzpharma.com',       'Karachi, Sindh',         4.8, 1),
('Searle Pakistan Dist.',    'Hamid Ansari',   '03001234502', 'hamid@searledist.com',        'Lahore, Punjab',         4.5, 1),
('Barrett Hodgson Supply',   'Nadia Siddiqui', '03001234503', 'nadia@bhsupply.com.pk',       'Karachi, Sindh',         4.2, 1),
('AGP Distributors',         'Kashif Ali',     '03001234504', 'kashif@agpdist.com',          'Karachi, Sindh',         4.6, 1),
('MedLink Supplies',         'Usman Ghani',    '03001234505', 'usman@medlink.pk',            'Hyderabad, Sindh',       4.0, 1),
('PharmaHub Karachi',        'Saima Akhtar',   '03001234506', 'saima@pharmahub.pk',          'Karachi, Sindh',         3.8, 1),
('HealthSource Pakistan',    'Bilal Raza',     '03001234507', 'bilal@healthsource.pk',       'Rawalpindi, Punjab',     4.3, 1),
('National Pharma Trading',  'Aamir Liaquat',  '03001234508', 'aamir@npt.com.pk',            'Islamabad, ICT',         4.1, 1),
('City Pharma Supplies',     'Farida Khatoon', '03001234509', 'farida@citypharma.pk',        'Faisalabad, Punjab',     3.9, 1),
('Sunrise Medical Dist.',    'Irfan Sheikh',   '03001234510', 'irfan@sunrisemed.pk',         'Multan, Punjab',         4.4, 1);

-- ─────────────────────────────────────────
-- MEDICINES
-- ─────────────────────────────────────────
INSERT INTO medicines (name, generic_name, category_id, manufacturer_id, dosage_form, strength, unit_price, requires_prescription, description, is_active) VALUES
('Panadol Extra',         'Paracetamol + Caffeine', 1,  1,  'Tablet',   '500mg/65mg', 25.00,  0, 'Fast-acting pain reliever with caffeine',               1),
('Brufen',                'Ibuprofen',              1,  2,  'Tablet',   '400mg',      35.00,  0, 'Anti-inflammatory pain reliever',                       1),
('Ponstan',               'Mefenamic Acid',         1,  3,  'Capsule',  '500mg',      45.00,  0, 'Pain relief for menstrual and dental pain',             1),
('Disprin',               'Aspirin',                1,  8,  'Tablet',   '300mg',      15.00,  0, 'Pain relief and antiplatelet agent',                    1),
('Augmentin',             'Amoxicillin+Clavulanate',2,  2,  'Tablet',   '625mg',      185.00, 1, 'Broad-spectrum antibiotic combination',                 1),
('Amoxil',                'Amoxicillin',            2,  3,  'Capsule',  '500mg',      95.00,  1, 'Penicillin-type antibiotic',                            1),
('Flagyl',                'Metronidazole',          2,  4,  'Tablet',   '400mg',      55.00,  1, 'Antibiotic for anaerobic infections',                   1),
('Cipro',                 'Ciprofloxacin',          2,  5,  'Tablet',   '500mg',      120.00, 1, 'Fluoroquinolone antibiotic',                            1),
('Nexium',                'Esomeprazole',           3,  2,  'Tablet',   '20mg',       145.00, 1, 'Proton pump inhibitor for acid reflux',                 1),
('Gaviscon',              'Sodium Alginate',        3,  8,  'Tablet',   '500mg',      85.00,  0, 'Antacid for heartburn and indigestion',                 1),
('Clarityne',             'Loratadine',             4,  5,  'Tablet',   '10mg',       65.00,  0, 'Non-drowsy antihistamine for allergies',                1),
('Ventolin',              'Salbutamol',             7,  2,  'Inhaler',  '100mcg',     350.00, 1, 'Bronchodilator for asthma relief',                      1),
('Betadine',              'Povidone Iodine',        8,  8,  'Drop',     '10%',        180.00, 0, 'Antiseptic solution for wounds',                        1),
('ORS Sachet',            'ORS Formula',            12, 9,  'Powder',   'Standard',   25.00,  0, 'Oral rehydration salts for dehydration',                1),
('Glucophage',            'Metformin',              6,  10, 'Tablet',   '500mg',      75.00,  1, 'First-line antidiabetic medication',                    1),
('Amlodipine',            'Amlodipine Besylate',    5,  6,  'Tablet',   '5mg',        55.00,  1, 'Calcium channel blocker for hypertension',              1),
('Lasix',                 'Furosemide',             5,  1,  'Tablet',   '40mg',       40.00,  1, 'Loop diuretic for edema and hypertension',              1),
('Calpol Suspension',     'Paracetamol',            1,  2,  'Syrup',    '120mg/5ml',  85.00,  0, 'Paracetamol suspension for children',                  1),
('Dermovate Cream',       'Clobetasol Propionate',  8,  2,  'Cream',    '0.05%',      220.00, 1, 'Potent corticosteroid for skin conditions',             1),
('Septran DS',            'Co-Trimoxazole',         2,  2,  'Tablet',   '960mg',      35.00,  1, 'Sulfonamide antibiotic combination',                    1);

-- ─────────────────────────────────────────
-- STOCK
-- ─────────────────────────────────────────
INSERT INTO stock (medicine_id, supplier_id, quantity, reorder_level, batch_number, manufacturing_date, expiry_date) VALUES
(1,  1, 500, 50,  'GTZ-2024-001', '2024-01-15', '2026-12-31'),
(2,  2, 350, 50,  'GSK-2024-012', '2024-02-10', '2026-10-31'),
(3,  3, 200, 30,  'PFZ-2024-003', '2024-03-01', '2026-09-30'),
(4,  4, 400, 40,  'RCK-2024-007', '2024-01-20', '2026-11-30'),
(5,  2, 150, 25,  'GSK-2024-020', '2024-04-15', '2026-06-30'),
(6,  3, 180, 25,  'PFZ-2024-015', '2024-03-20', '2026-08-31'),
(7,  4, 120, 20,  'SRL-2024-009', '2024-02-28', '2026-07-31'),
(8,  5, 80,  15,  'BHD-2024-011', '2024-05-01', '2026-05-31'),
(9,  2, 90,  15,  'GSK-2024-033', '2024-04-01', '2026-04-30'),
(10, 6, 250, 30,  'RCK-2024-022', '2024-01-10', '2026-12-31'),
(11, 7, 300, 30,  'PFZ-2024-028', '2024-03-15', '2027-03-31'),
(12, 2, 60,  10,  'GSK-2024-041', '2024-06-01', '2026-06-30'),
(13, 6, 150, 20,  'RCK-2024-018', '2024-02-15', '2026-12-31'),
(14, 8, 600, 100, 'ABT-2024-005', '2024-01-01', '2027-06-30'),
(15, 10,200, 30,  'NVT-2024-017', '2024-05-10', '2027-05-31'),
(16, 4, 8,   15,  'AGP-2024-023', '2024-04-20', '2026-04-30'),
(17, 1, 5,   15,  'GTZ-2024-031', '2024-03-10', '2026-03-31'),
(18, 2, 120, 20,  'GSK-2024-038', '2024-06-15', '2026-11-30'),
(19, 2, 70,  10,  'GSK-2024-044', '2024-05-20', '2026-08-31'),
(20, 2, 95,  15,  'GSK-2024-049', '2024-04-05', '2026-09-30');

-- ─────────────────────────────────────────
-- DOCTORS
-- ─────────────────────────────────────────
INSERT INTO doctors (name, specialization, license_number, phone, hospital, is_active) VALUES
('Dr. Imran Khan',       'General Physician',    'PMDC-12345', '03011001001', 'Civil Hospital Karachi',        1),
('Dr. Farrukh Ahmed',    'Cardiologist',         'PMDC-23456', '03011001002', 'Aga Khan Hospital Karachi',     1),
('Dr. Sana Malik',       'Dermatologist',        'PMDC-34567', '03011001003', 'Jinnah Hospital Karachi',       1),
('Dr. Tariq Hussain',    'Pulmonologist',        'PMDC-45678', '03011001004', 'Liaquat National Hospital',     1),
('Dr. Amna Siddiqui',    'Endocrinologist',      'PMDC-56789', '03011001005', 'Aga Khan Hospital Karachi',     1),
('Dr. Rizwan Qureshi',   'Gastroenterologist',   'PMDC-67890', '03011001006', 'Civil Hospital Karachi',        1),
('Dr. Zainab Fatima',    'Gynecologist',         'PMDC-78901', '03011001007', 'South City Hospital Karachi',   1),
('Dr. Salman Mirza',     'Orthopedic Surgeon',   'PMDC-89012', '03011001008', 'Shifa International Islamabad', 1),
('Dr. Hina Baig',        'Pediatrician',         'PMDC-90123', '03011001009', 'The Children\'s Hospital Lahore',1),
('Dr. Naveed Alam',      'Neurologist',          'PMDC-01234', '03011001010', 'Liaquat National Hospital',     1);

-- ─────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────
INSERT INTO customers (name, phone, email, date_of_birth, gender, address) VALUES
('Ahmed Ali Khan',     '03001000001', 'ahmed.ali@gmail.com',     '1985-06-15', 'Male',   'House 12, Block A, PECHS, Karachi'),
('Fatima Noor',        '03001000002', 'fatima.noor@yahoo.com',   '1990-03-22', 'Female', 'Flat 5, Gulshan-e-Iqbal, Karachi'),
('Muhammad Usman',     '03001000003', 'musman@hotmail.com',      '1978-11-08', 'Male',   'Plot 45, DHA Phase 2, Karachi'),
('Ayesha Siddiqui',    '03001000004', 'ayesha.s@gmail.com',      '1995-07-14', 'Female', 'House 7, North Nazimabad, Karachi'),
('Bilal Raza',         '03001000005', 'bilal.raza@gmail.com',    '1982-01-30', 'Male',   'House 33, Gulberg II, Lahore'),
('Sana Zahid',         '03001000006', 'sana.zahid@yahoo.com',    '1993-09-05', 'Female', 'Street 4, G-9/1, Islamabad'),
('Asif Mehmood',       '03001000007', 'asif.m@gmail.com',        '1970-12-20', 'Male',   'House 22, Satellite Town, Rawalpindi'),
('Nadia Akhtar',       '03001000008', 'nadia.a@hotmail.com',     '1988-04-17', 'Female', 'Flat 12, Clifton Block 4, Karachi'),
('Imran Shaikh',       '03001000009', 'imran.shaikh@gmail.com',  '1975-08-25', 'Male',   'House 67, Model Town, Lahore'),
('Zara Hussain',       '03001000010', 'zara.h@gmail.com',        '1998-02-11', 'Female', 'House 9, F-8/3, Islamabad'),
('Tariq Javed',        '03001000011', 'tariq.j@yahoo.com',       '1965-05-03', 'Male',   'House 15, Gulshan Block 13, Karachi'),
('Rabia Waseem',       '03001000012', 'rabia.w@gmail.com',       '1992-10-28', 'Female', 'Flat 8, Garden West, Karachi');

-- ─────────────────────────────────────────
-- EMPLOYEES (password_hash = bcrypt of 'admin123')
-- ─────────────────────────────────────────
INSERT INTO employees (name, role, phone, email, salary, hire_date, is_active, username, password_hash) VALUES
('Moavia Amir',      'Admin',      '03211000001', 'moavia@curepharma.pk',   75000.00, '2022-01-01', 1, 'admin',    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMKgP0ZuNT0g1VNhJF8WCJ9VkG'),
('Dr. Khalid Baig',  'Pharmacist', '03211000002', 'khalid@curepharma.pk',   65000.00, '2022-03-15', 1, 'pharmacist1','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMKgP0ZuNT0g1VNhJF8WCJ9VkG'),
('Sara Qureshi',     'Cashier',    '03211000003', 'sara@curepharma.pk',     35000.00, '2023-01-10', 1, 'cashier1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMKgP0ZuNT0g1VNhJF8WCJ9VkG'),
('Hassan Raza',      'Manager',    '03211000004', 'hassan@curepharma.pk',   55000.00, '2022-06-01', 1, 'manager1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMKgP0ZuNT0g1VNhJF8WCJ9VkG'),
('Amina Tariq',      'Pharmacist', '03211000005', 'amina@curepharma.pk',    62000.00, '2023-04-15', 1, 'pharmacist2','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMKgP0ZuNT0g1VNhJF8WCJ9VkG'),
('Rizwan Ahmed',     'Cashier',    '03211000006', 'rizwan@curepharma.pk',   33000.00, '2024-02-01', 1, 'cashier2', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMKgP0ZuNT0g1VNhJF8WCJ9VkG');
-- Note: All passwords above hash to 'admin123'. Change immediately in production.

-- ─────────────────────────────────────────
-- PRESCRIPTIONS
-- ─────────────────────────────────────────
INSERT INTO prescriptions (customer_id, doctor_id, prescription_date, valid_until, notes, is_used) VALUES
(1, 1, '2026-04-01', '2026-07-01', 'Antibiotic course for throat infection', 0),
(2, 5, '2026-04-10', '2026-10-10', 'Diabetes management — monthly refill', 0),
(3, 2, '2026-04-15', '2027-04-15', 'Hypertension maintenance therapy',       0),
(4, 7, '2026-04-20', '2026-07-20', 'Prescribed for hormonal treatment',      0),
(5, 4, '2026-04-25', '2026-10-25', 'Asthma — Ventolin inhaler refill',       0),
(1, 6, '2026-03-15', '2026-06-15', 'PPI for gastroesophageal reflux',        1),
(8, 3, '2026-04-05', '2026-07-05', 'Dermovate cream for eczema',             0),
(9, 2, '2026-04-22', '2027-04-22', 'Long-term cardiac medication',           0),
(10,9, '2026-04-28', '2026-07-28', 'Pediatric antibiotic course',            0),
(11,1, '2026-05-01', '2026-08-01', 'General infection treatment',            0);

-- ─────────────────────────────────────────
-- ORDERS + ORDER ITEMS + PAYMENTS (sample completed orders)
-- ─────────────────────────────────────────
INSERT INTO orders (customer_id, employee_id, prescription_id, status, subtotal, discount_percent, tax_percent, total_amount, notes) VALUES
(1,  3, 6,    'Completed', 275.00, 5.00, 0.00, 261.25, 'Regular customer discount applied'),
(2,  3, NULL, 'Completed', 195.00, 0.00, 0.00, 195.00, 'Walk-in purchase'),
(3,  3, NULL, 'Completed', 110.00, 0.00, 0.00, 110.00, NULL),
(5,  3, 5,    'Completed', 700.00, 10.00,0.00, 630.00, 'Bulk purchase — Ventolin + antibiotics'),
(NULL,3,NULL, 'Completed', 75.00,  0.00, 0.00, 75.00,  'Walk-in customer'),
(4,  3, NULL, 'Pending',   230.00, 0.00, 0.00, 230.00, NULL),
(8,  3, 7,    'Completed', 220.00, 0.00, 0.00, 220.00, 'Dermovate + supplement'),
(11, 3, NULL, 'Completed', 135.00, 5.00, 0.00, 128.25, NULL);

INSERT INTO order_items (order_id, medicine_id, quantity, unit_price) VALUES
(1, 9,  1, 145.00), (1, 14, 4, 25.00), (1, 10, 1, 85.00),
(2, 18, 1, 85.00),  (2, 14, 2, 25.00), (2, 10, 1, 85.00),
(3, 1,  2, 25.00),  (3, 4,  4, 15.00),
(4, 12, 1, 350.00), (4, 6,  1, 95.00), (4, 8,  1, 120.00), (4, 14, 6, 25.00),
(5, 14, 3, 25.00),
(7, 19, 1, 220.00),
(8, 1,  3, 25.00),  (8, 14, 2, 25.00), (8, 10, 1, 85.00);

INSERT INTO payments (order_id, amount_paid, payment_method, payment_status, transaction_ref, paid_at) VALUES
(1, 261.25, 'Cash',   'Paid',    NULL,         '2026-04-02 10:30:00'),
(2, 195.00, 'Card',   'Paid',    'TXN-9981234','2026-04-10 14:15:00'),
(3, 110.00, 'Cash',   'Paid',    NULL,         '2026-04-16 09:45:00'),
(4, 630.00, 'Online', 'Paid',    'TXN-9982345','2026-04-25 16:00:00'),
(5, 75.00,  'Cash',   'Paid',    NULL,         '2026-04-26 11:20:00'),
(7, 220.00, 'Cash',   'Paid',    NULL,         '2026-04-06 13:30:00'),
(8, 128.25, 'Card',   'Paid',    'TXN-9983456','2026-05-01 17:00:00');
