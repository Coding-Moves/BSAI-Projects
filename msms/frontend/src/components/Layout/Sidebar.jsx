// src/components/Layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Pill, ShoppingCart, FileText, Users, Truck,
  UserCog, CreditCard, BarChart3, LogOut, Moon, Sun, AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { reportsAPI } from '../../api';

const navItems = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/medicines',    icon: Pill,            label: 'Medicines' },
  { to: '/orders/new',   icon: ShoppingCart,    label: 'New Sale' },
  { to: '/orders',       icon: FileText,        label: 'Orders' },
  { to: '/prescriptions',icon: FileText,        label: 'Prescriptions' },
  { to: '/customers',    icon: Users,           label: 'Customers' },
  { to: '/suppliers',    icon: Truck,           label: 'Suppliers' },
  { to: '/employees',    icon: UserCog,         label: 'Employees',  roles: ['Admin','Manager'] },
  { to: '/payments',     icon: CreditCard,      label: 'Payments' },
  { to: '/reports',      icon: BarChart3,       label: 'Reports',    badge: true },
];

export default function Sidebar() {
  const { user, logout }    = useAuth();
  const navigate             = useNavigate();
  const [dark, setDark]      = useState(() => localStorage.getItem('dark') === 'true');
  const [expiryBadge, setExpiryBadge] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('dark', dark);
  }, [dark]);

  useEffect(() => {
    reportsAPI.expiringSoon().then(({ data }) => {
      setExpiryBadge(data.some(m => m.days_until_expiry <= 7));
    }).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar flex flex-col w-64 min-h-screen bg-teal-900 dark:bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-teal-800 dark:border-gray-700">
        <div className="w-9 h-9 rounded-lg bg-teal-400 flex items-center justify-center">
          <Pill className="w-5 h-5 text-teal-900" />
        </div>
        <div>
          <p className="font-bold text-base leading-tight">Cure Pharmacy</p>
          <p className="text-teal-300 text-xs">MSMS v1.0</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, roles, badge }) => {
          if (roles && !roles.includes(user?.role)) return null;
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-teal-700 dark:bg-teal-800 text-white'
                  : 'text-teal-100 hover:bg-teal-800 dark:hover:bg-gray-800'}`
              }
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4.5 h-4.5 w-[18px] h-[18px] flex-shrink-0" />
                {label}
              </span>
              {badge && expiryBadge && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-teal-800 dark:border-gray-700 p-4 space-y-3">
        <button
          onClick={() => setDark(d => !d)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-teal-200 hover:bg-teal-800 dark:hover:bg-gray-800 transition-colors"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-teal-300 truncate">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-teal-300 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
