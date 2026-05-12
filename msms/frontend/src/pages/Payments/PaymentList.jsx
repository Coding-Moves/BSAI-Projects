// src/pages/Payments/PaymentList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { paymentsAPI } from '../../api';
import SearchBar from '../../components/UI/SearchBar';
import { PaymentBadge } from '../../components/UI/Badge';
import Badge from '../../components/UI/Badge';
import Pagination from '../../components/UI/Pagination';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [method,   setMethod]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const LIMIT = 10;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await paymentsAPI.getAll({ search, page, limit: LIMIT, method });
      setPayments(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  }, [search, page, method]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalRevenue = payments.reduce((s, p) => s + parseFloat(p.amount_paid || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3 flex-wrap">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search payments…" />
          <select value={method} onChange={e => { setMethod(e.target.value); setPage(1); }} className="input w-36">
            <option value="">All Methods</option>
            {['Cash','Card','Online','Insurance'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="card px-4 py-2 text-sm">
          <span className="text-gray-500">Shown Total: </span>
          <span className="font-bold text-teal-700 dark:text-teal-300">PKR {totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Invoice</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Amount Paid</th>
                <th className="table-th">Method</th>
                <th className="table-th">Status</th>
                <th className="table-th">Transaction Ref</th>
                <th className="table-th">Paid At</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={8} className="table-td text-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="table-td text-center py-10 text-gray-400">No payments found</td></tr>
              ) : payments.map(p => (
                <tr key={p.payment_id} className="table-row">
                  <td className="table-td font-mono font-semibold text-teal-700 dark:text-teal-400">{p.invoice_number}</td>
                  <td className="table-td dark:text-white">{p.customer_name}</td>
                  <td className="table-td font-bold text-green-700 dark:text-green-400">PKR {parseFloat(p.amount_paid).toLocaleString()}</td>
                  <td className="table-td"><PaymentBadge method={p.payment_method} /></td>
                  <td className="table-td">
                    <Badge variant={p.payment_status === 'Paid' ? 'green' : p.payment_status === 'Failed' ? 'red' : 'yellow'}>
                      {p.payment_status}
                    </Badge>
                  </td>
                  <td className="table-td text-xs text-gray-500 font-mono">{p.transaction_ref || '—'}</td>
                  <td className="table-td text-gray-500">
                    {p.paid_at ? format(new Date(p.paid_at), 'dd MMM yyyy, HH:mm') : '—'}
                  </td>
                  <td className="table-td">
                    <Link to={`/orders/${p.order_id}`} className="text-teal-600 hover:text-teal-800 transition-colors">
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
