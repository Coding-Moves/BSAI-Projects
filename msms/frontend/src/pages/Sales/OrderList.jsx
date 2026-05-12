// src/pages/Sales/OrderList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Plus } from 'lucide-react';
import { ordersAPI } from '../../api';
import SearchBar from '../../components/UI/SearchBar';
import { OrderStatusBadge, PaymentBadge } from '../../components/UI/Badge';
import Pagination from '../../components/UI/Pagination';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['', 'Pending', 'Completed', 'Cancelled', 'Refunded'];

export default function OrderList() {
  const [orders,  setOrders]  = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('');
  const [loading, setLoading] = useState(true);
  const LIMIT = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await ordersAPI.getAll({ search, page, limit: LIMIT, status });
      setOrders(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [search, page, status]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3 flex-wrap">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search orders…" />
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input w-40">
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
        </div>
        <Link to="/orders/new" className="btn-primary"><Plus className="w-4 h-4" /> New Sale</Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Invoice</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Date & Time</th>
                <th className="table-th">Items</th>
                <th className="table-th">Total</th>
                <th className="table-th">Status</th>
                <th className="table-th">Cashier</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={8} className="table-td text-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8} className="table-td text-center py-10 text-gray-400">No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o.order_id} className="table-row">
                  <td className="table-td font-mono font-semibold text-teal-700 dark:text-teal-400">{o.invoice_number}</td>
                  <td className="table-td">
                    <p className="font-medium dark:text-white">{o.customer_name}</p>
                    {o.customer_phone && <p className="text-xs text-gray-400">{o.customer_phone}</p>}
                  </td>
                  <td className="table-td text-gray-500">
                    {o.order_date ? format(new Date(o.order_date), 'dd MMM yyyy, HH:mm') : '—'}
                  </td>
                  <td className="table-td text-center">{o.item_count}</td>
                  <td className="table-td font-bold">PKR {parseFloat(o.total_amount).toLocaleString()}</td>
                  <td className="table-td"><OrderStatusBadge status={o.status} /></td>
                  <td className="table-td text-gray-500">{o.employee_name}</td>
                  <td className="table-td">
                    <Link to={`/orders/${o.order_id}`} className="text-teal-600 hover:text-teal-800 transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={LIMIT} total={total} onPage={setPage} />
      </div>
    </div>
  );
}
