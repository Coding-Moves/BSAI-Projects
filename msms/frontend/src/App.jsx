// src/App.jsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';

// Pages
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import MedicineList   from './pages/Inventory/MedicineList';
import StockList      from './pages/Inventory/StockList';
import NewOrder       from './pages/Sales/NewOrder';
import OrderList      from './pages/Sales/OrderList';
import OrderDetail    from './pages/Sales/OrderDetail';
import CustomerList   from './pages/Customers/CustomerList';
import SupplierList   from './pages/Suppliers/SupplierList';
import DoctorList     from './pages/Doctors/DoctorList';
import EmployeeList   from './pages/Employees/EmployeeList';
import PrescriptionList from './pages/Prescriptions/PrescriptionList';
import PaymentList    from './pages/Payments/PaymentList';
import Reports        from './pages/Reports/Reports';

const PAGE_TITLES = {
  '/':              'Dashboard',
  '/medicines':     'Medicines',
  '/stock':         'Stock',
  '/orders/new':    'New Sale',
  '/orders':        'Orders',
  '/customers':     'Customers',
  '/suppliers':     'Suppliers',
  '/doctors':       'Doctors',
  '/employees':     'Employees',
  '/prescriptions': 'Prescriptions',
  '/payments':      'Payments',
  '/reports':       'Reports',
};

function AppLayout({ children }) {
  const { pathname } = useLocation();
  const title = Object.entries(PAGE_TITLES)
    .reverse()
    .find(([path]) => pathname.startsWith(path))?.[1] || 'MSMS';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '10px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '13px' },
            success: { iconTheme: { primary: '#0f766e', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/medicines" element={
            <ProtectedRoute><AppLayout><MedicineList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/stock" element={
            <ProtectedRoute><AppLayout><StockList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/orders/new" element={
            <ProtectedRoute><AppLayout><NewOrder /></AppLayout></ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute><AppLayout><OrderDetail /></AppLayout></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><AppLayout><OrderList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute><AppLayout><CustomerList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/suppliers" element={
            <ProtectedRoute><AppLayout><SupplierList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/doctors" element={
            <ProtectedRoute><AppLayout><DoctorList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute roles={['Admin', 'Manager']}><AppLayout><EmployeeList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/prescriptions" element={
            <ProtectedRoute><AppLayout><PrescriptionList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute><AppLayout><PaymentList /></AppLayout></ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
