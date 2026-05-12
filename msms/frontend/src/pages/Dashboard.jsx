// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pill, AlertTriangle, TrendingUp, Users, Clock, ShoppingCart, Plus, ArrowRight } from 'lucide-react';
import StatCard from '../components/UI/StatCard';
import { OrderStatusBadge } from '../components/UI/Badge';
import { reportsAPI, ordersAPI } from '../api';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportsAPI.dashboardStats(),
      ordersAPI.getAll({ limit: 10, page: 1 }),
    ]).then(([s, o]) => {
      setStats(s.data);
      setOrders(o.data.data || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10">
      {/* Low stock banner */}
      {stats?.low_stock_count > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <span className="font-semibold">{stats.low_stock_count} medicine{stats.low_stock_count > 1 ? 's' : ''}</span> are below reorder level.
          </p>
          <Link to="/reports" className="ml-auto text-sm font-semibold text-yellow-700 dark:text-yellow-400 hover:underline flex items-center gap-1">
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Medicines"  value={stats?.total_medicines}   icon={Pill}          color="teal"   />
        <StatCard label="Low Stock Items"  value={stats?.low_stock_count}   icon={AlertTriangle} color="yellow" />
        <StatCard label="Today's Sales"    value={`PKR ${parseFloat(stats?.today_sales || 0).toLocaleString()}`} icon={TrendingUp} color="green" />
        <StatCard label="Total Customers"  value={stats?.total_customers}   icon={Users}         color="blue"   />
        <StatCard label="Expiring Soon"    value={stats?.expiring_soon_count} icon={Clock}       color="red"    sub="Within 30 days" />
        <StatCard label="Pending Orders"   value={stats?.pending_orders}    icon={ShoppingCart}  color="purple" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/orders/new',    label: 'New Sale',       icon: ShoppingCart, color: 'bg-teal-700' },
          { to: '/medicines',     label: 'Add Medicine',   icon: Pill,         color: 'bg-blue-600' },
          { to: '/customers',     label: 'Add Customer',   icon: Users,        color: 'bg-purple-600' },
          { to: '/reports',       label: 'View Reports',   icon: TrendingUp,   color: 'bg-green-600' },
        ].map(({ to, label, icon: Icon, color }) => (
          <Link
            key={to}
            to={to}
            className={`${color} hover:opacity-90 transition-opacity rounded-xl p-4 text-white flex flex-col items-center gap-2 text-sm font-semibold shadow-sm`}
          >
            <Icon className="w-6 h-6" />
            {label}
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-0">
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/orders" className="text-base text-teal-700 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Invoice</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Date</th>
                <th className="table-th">Items</th>
                <th className="table-th">Total</th>
                <th className="table-th">Status</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="table-td text-center py-10 text-gray-400">No orders yet</td></tr>
              ) : orders.map(order => (
                <tr key={order.order_id} className="table-row">
                  <td className="table-td font-mono font-medium text-teal-700 dark:text-teal-400">{order.invoice_number}</td>
                  <td className="table-td">{order.customer_name}</td>
                  <td className="table-td text-gray-500">{order.order_date ? format(new Date(order.order_date), 'dd MMM, HH:mm') : '—'}</td>
                  <td className="table-td">{order.item_count}</td>
                  <td className="table-td font-semibold">PKR {parseFloat(order.total_amount).toLocaleString()}</td>
                  <td className="table-td"><OrderStatusBadge status={order.status} /></td>
                  <td className="table-td">
                    <Link to={`/orders/${order.order_id}`} className="text-teal-600 hover:text-teal-800 text-sm font-semibold">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
