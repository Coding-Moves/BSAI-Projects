# 🏥 Medical Store Management System (MSMS)

> **Student:** Muawiya Amir | **ID:** 2k24_BSAI_72
> **Course:** Database Lab — 4th Semester BS Artificial Intelligence
> **Instructor:** Sir Ahsan Ahmed

---

## 🚦 How to Run (Quick Start)

1. **Install dependencies**  
   Open two terminals and run:
   - In `backend` folder:  
     `npm install`
   - In `frontend` folder:  
     `npm install`

2. **Set up environment**
   - Copy `backend/.env.example` to `backend/.env` and fill in your MySQL info.

3. **Set up the database**
   - Import all SQL files in `database/` into your MySQL server (see detailed steps below).

4. **Start the servers**
   - In `backend`:  
     `npm start`
   - In `frontend`:  
     `npm run dev`

5. **Open the app**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

---

## ✨ Features

### Core Modules

- **Inventory Management** — Add, edit, search medicines with dosage form, strength, price, and prescription flag
- **Point of Sale (POS)** — Real-time cart, customer lookup, prescription validation, live total calculation
- **Prescription Tracking** — Link doctor prescriptions to customers; enforce Rx-only sales
- **Supplier Management** — Track suppliers with ratings and contact details
- **Customer Management** — Profiles with purchase history and total spending
- **Employee Management** — Role-based accounts (Admin / Manager / Pharmacist / Cashier)
- **Payment Processing** — Cash, Card, Online, Insurance; full transaction log
- **Reports & Analytics** — Low stock, expiry alerts, sales summary with charts, top-selling medicines

### Database Features

- 12 normalized tables (3NF)
- 4 Triggers (stock deduction, low-stock alert, order total recalc, expiry check)
- 4 Stored Procedures (GenerateBill, RestockMedicine, PlaceOrder, CompletePayment)
- 7 Views (LowStockAlert, ExpiringSoon, SalesSummary, TopSellingMedicines, EmployeePerformance, SupplierRatings, FullInventory)
- Indexes on high-frequency query columns

### UI/UX Extras

- 🌙 Dark mode (persisted in localStorage)
- 🖨️ Printable invoices (`window.print()` hides sidebar/navbar)
- 📥 PDF bill download (A5 size via jsPDF + html2canvas)
- 📊 Sales bar chart (Recharts)
- 📤 Export to CSV on every report tab
- 🔔 Toast notifications for all actions
- 🔴 Red dot badge on sidebar when medicines expire within 7 days
- ⚠️ Low-stock banner on dashboard
- JWT authentication with role-based route protection

---

## 🛠 Tech Stack

| Layer    | Technology                            |
| -------- | ------------------------------------- |
| Frontend | React 18, Vite, TailwindCSS, Recharts |
| Backend  | Node.js, Express 4, mysql2            |
| Database | MySQL 8.0                             |
| Auth     | JWT (jsonwebtoken) + bcryptjs         |
| Forms    | react-hook-form + Zod validation      |
| PDF      | jsPDF + html2canvas                   |

---

## 📋 Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MySQL 8.0** running locally

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone "https://github.com/Coding-Moves/BSAI-Projects.git"
cd msms
```

### 2. Install all dependencies

```bash
npm run install:all
```

This installs root, backend, and frontend packages in one command.

### 3. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=msms_db
JWT_SECRET=change_this_to_a_random_secret
PORT=5000
```

### 4. Set up the MySQL database

Open **MySQL Workbench** (or any MySQL client) and run the SQL files **in this exact order**:

```sql
-- Step 1: Create tables
SOURCE /path/to/msms/database/schema.sql;

-- Step 2: Insert sample data
SOURCE /path/to/msms/database/sample_data.sql;

-- Step 3: Create triggers
SOURCE /path/to/msms/database/triggers.sql;

-- Step 4: Create stored procedures
SOURCE /path/to/msms/database/stored_procedures.sql;

-- Step 5: Create views
SOURCE /path/to/msms/database/views.sql;

-- Step 6: Create indexes
SOURCE /path/to/msms/database/indexes.sql;
```

Or run them from the command line:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p msms_db < database/sample_data.sql
mysql -u root -p msms_db < database/triggers.sql
mysql -u root -p msms_db < database/stored_procedures.sql
mysql -u root -p msms_db < database/views.sql
mysql -u root -p msms_db < database/indexes.sql
```

### 5. Start the application

```bash
cd ..
npm run dev
```

This runs both frontend and backend concurrently:

- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:5173

---

## 🔐 Default Login

| Username | Password   | Role  |
| -------- | ---------- | ----- |
| `admin`  | `admin123` | Admin |

> ⚠️ Change the default password immediately after first login in production.

---

## 🗂 Project Structure

```
msms/
├── README.md
├── package.json              ← root (concurrently)
├── .gitignore
│
├── docs/
|   ├── report.pdf
|   ├── proposal.pdf
|   ├── manual.pdf
|   ├── ER_diagram.pdf
|
├── backend/
│   ├── server.js             ← Express entry point
│   ├── db.js                 ← MySQL connection pool
│   ├── .env.example
│   ├── routes/
│   │   ├── auth.js           ← POST /auth/login, GET /auth/me
│   │   ├── medicines.js
│   │   ├── categories.js
│   │   ├── manufacturers.js
│   │   ├── suppliers.js
│   │   ├── stock.js          ← includes POST /restock
│   │   ├── customers.js
│   │   ├── doctors.js
│   │   ├── employees.js
│   │   ├── prescriptions.js
│   │   ├── orders.js         ← includes bill + complete endpoints
│   │   ├── payments.js
│   │   └── reports.js        ← calls all 4 views + dashboard stats
│   └── middleware/
│       ├── auth.js           ← JWT verify + role authorize
│       └── validate.js       ← express-validator error handler
│
├── frontend/
│   └── src/
│       ├── App.jsx           ← all routes defined here
│       ├── api/index.js      ← axios instance + all API helpers
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── components/
│       │   ├── Layout/       ← Sidebar, Navbar, ProtectedRoute
│       │   ├── UI/           ← Modal, Badge, StatCard, SearchBar, ConfirmDialog, Pagination, CrudPage
│       │   └── Bill/         ← BillPreview, BillActions
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Inventory/    ← MedicineList, StockList
│           ├── Sales/        ← NewOrder (POS), OrderList, OrderDetail
│           ├── Customers/
│           ├── Suppliers/
│           ├── Doctors/
│           ├── Employees/
│           ├── Prescriptions/
│           ├── Payments/
│           └── Reports/      ← 4-tab report page with chart + CSV export
│
└── database/
    ├── schema.sql            ← 12 tables + 2 auxiliary tables
    ├── sample_data.sql       ← Pakistani context sample data
    ├── triggers.sql          ← 4 triggers
    ├── stored_procedures.sql ← 4 procedures
    ├── views.sql             ← 7 views
    └── indexes.sql           ← performance indexes
```

---

## 🌐 API Endpoints

### Auth

| Method | Endpoint             | Description    |
| ------ | -------------------- | -------------- |
| POST   | `/api/v1/auth/login` | Login, get JWT |
| GET    | `/api/v1/auth/me`    | Current user   |

### Resources (all support GET / GET /:id / POST / PUT /:id / DELETE /:id)

`/api/v1/categories`, `/api/v1/manufacturers`, `/api/v1/suppliers`,
`/api/v1/medicines`, `/api/v1/doctors`, `/api/v1/customers`,
`/api/v1/employees`, `/api/v1/prescriptions`, `/api/v1/payments`

### Stock

| Method | Endpoint                | Description        |
| ------ | ----------------------- | ------------------ |
| GET    | `/api/v1/stock`         | All stock records  |
| POST   | `/api/v1/stock/restock` | Restock a medicine |

### Orders

| Method | Endpoint                      | Description                       |
| ------ | ----------------------------- | --------------------------------- |
| GET    | `/api/v1/orders`              | List orders (paginated)           |
| POST   | `/api/v1/orders`              | Place order + optional payment    |
| GET    | `/api/v1/orders/:id`          | Order detail with items           |
| GET    | `/api/v1/orders/:id/bill`     | Full bill (calls GenerateBill SP) |
| POST   | `/api/v1/orders/:id/complete` | Complete payment                  |
| PUT    | `/api/v1/orders/:id/cancel`   | Cancel pending order              |

### Reports

| Method | Endpoint                               | Description            |
| ------ | -------------------------------------- | ---------------------- |
| GET    | `/api/v1/reports/dashboard-stats`      | 6 dashboard KPIs       |
| GET    | `/api/v1/reports/low-stock`            | vw_LowStockAlert       |
| GET    | `/api/v1/reports/expiring-soon`        | vw_ExpiringSoon        |
| GET    | `/api/v1/reports/sales-summary`        | vw_SalesSummary        |
| GET    | `/api/v1/reports/top-medicines`        | vw_TopSellingMedicines |
| GET    | `/api/v1/reports/employee-performance` | vw_EmployeePerformance |

---

## 🗄 Database Schema (12 Tables)

| Table           | Primary Key       | Purpose                                   |
| --------------- | ----------------- | ----------------------------------------- |
| `categories`    | `category_id`     | Medicine classifications                  |
| `manufacturers` | `manufacturer_id` | Pharma companies                          |
| `suppliers`     | `supplier_id`     | Stock suppliers with ratings              |
| `medicines`     | `medicine_id`     | Core medicine catalog                     |
| `stock`         | `stock_id`        | Quantity, batch, expiry per medicine      |
| `doctors`       | `doctor_id`       | Licensed doctors for prescriptions        |
| `customers`     | `customer_id`     | Customer profiles                         |
| `employees`     | `employee_id`     | Staff with roles and credentials          |
| `prescriptions` | `prescription_id` | Doctor → Customer prescriptions           |
| `orders`        | `order_id`        | Master order with discount/tax            |
| `order_items`   | `item_id`         | Line items (subtotal is GENERATED column) |
| `payments`      | `payment_id`      | Payment method and status per order       |

---

## 📸 Screenshots

> _(Add screenshots here after first run)_

- `screenshots/login.png`
- `screenshots/dashboard.png`
- `screenshots/pos.png`
- `screenshots/bill-preview.png`
- `screenshots/reports.png`

---

## 👤 Author

**Moavia Amir**
Student ID: 2k24_BSAI_72
BS Artificial Intelligence — 4th Semester
Database Lab | Instructor: Sir Ahsan Ahmed
