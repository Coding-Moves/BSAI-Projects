// src/pages/Reports/Reports.jsx
import { useState, useEffect } from 'react';
import { Download, AlertTriangle, Clock, TrendingUp, Star } from 'lucide-react';
import { reportsAPI } from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StockBadge } from '../../components/UI/Badge';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TABS = [
  { key: 'low-stock',    label: 'Low Stock',      icon: AlertTriangle },
  { key: 'expiring',     label: 'Expiring Soon',  icon: Clock },
  { key: 'sales',        label: 'Sales Summary',  icon: TrendingUp },
  { key: 'top-meds',     label: 'Top Medicines',  icon: Star },
];

function exportCSV(data, filename) {
  if (!data.length) { toast.error('No data to export'); return; }
  const keys = Object.keys(data[0]);
  const csv  = [keys.join(','), ...data.map(row => keys.map(k => `"${row[k] ?? ''}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success('CSV exported');
}

function LowStockTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { reportsAPI.lowStock().then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{data.length} medicine(s) below reorder level</p>
        <button onClick={() => exportCSV(data, 'low-stock-report.csv')} className="btn-secondary text-xs py-1.5"><Download className="w-3.5 h-3.5" />Export CSV</button>
      </div>
      <div className="overflow-x-auto card">
        <table className="w-full">
          <thead className="table-head"><tr>
            <th className="table-th">Medicine</th><th className="table-th">Category</th>
            <th className="table-th">Current Stock</th><th className="table-th">Reorder Level</th>
            <th className="table-th">Units Short</th><th className="table-th">Supplier</th><th className="table-th">Expiry</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.length === 0 ? <tr><td colSpan={7} className="table-td text-center py-8 text-gray-400">All stock levels are healthy ✓</td></tr>
            : data.map(r => (
              <tr key={r.medicine_id} className="table-row">
                <td className="table-td"><p className="font-medium dark:text-white">{r.medicine_name}</p><p className="text-xs text-gray-400">{r.dosage_form} {r.strength}</p></td>
                <td className="table-td text-gray-500">{r.category_name}</td>
                <td className="table-td"><span className="font-bold text-red-600">{r.current_stock}</span></td>
                <td className="table-td">{r.reorder_level}</td>
                <td className="table-td"><span className="font-bold text-orange-600">-{r.units_below_reorder}</span></td>
                <td className="table-td text-gray-500">{r.supplier_name || '—'}</td>
                <td className="table-td text-gray-500">{r.expiry_date ? format(new Date(r.expiry_date), 'MMM yyyy') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExpiryTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { reportsAPI.expiringSoon().then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">{data.length} medicine(s) expiring in the next 30 days</p>
        <button onClick={() => exportCSV(data, 'expiry-report.csv')} className="btn-secondary text-xs py-1.5"><Download className="w-3.5 h-3.5" />Export CSV</button>
      </div>
      <div className="overflow-x-auto card">
        <table className="w-full">
          <thead className="table-head"><tr>
            <th className="table-th">Medicine</th><th className="table-th">Category</th>
            <th className="table-th">Stock</th><th className="table-th">Batch</th>
            <th className="table-th">Expiry Date</th><th className="table-th">Days Left</th><th className="table-th">Supplier</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.length === 0 ? <tr><td colSpan={7} className="table-td text-center py-8 text-gray-400">No medicines expiring soon ✓</td></tr>
            : data.map(r => (
              <tr key={r.medicine_id} className="table-row">
                <td className="table-td"><p className="font-medium dark:text-white">{r.medicine_name}</p><p className="text-xs text-gray-400">{r.dosage_form} {r.strength}</p></td>
                <td className="table-td text-gray-500">{r.category_name}</td>
                <td className="table-td">{r.current_stock}</td>
                <td className="table-td text-xs font-mono text-gray-500">{r.batch_number || '—'}</td>
                <td className="table-td">{r.expiry_date ? format(new Date(r.expiry_date), 'dd MMM yyyy') : '—'}</td>
                <td className="table-td">
                  <span className={`font-bold ${r.days_until_expiry <= 7 ? 'text-red-600' : r.days_until_expiry <= 14 ? 'text-orange-600' : 'text-yellow-600'}`}>
                    {r.days_until_expiry} days
                  </span>
                </td>
                <td className="table-td text-gray-500">{r.supplier_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalesTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');

  const load = (f, t) => {
    setLoading(true);
    reportsAPI.salesSummary(f && t ? { from: f, to: t } : {})
      .then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  };

  useEffect(() => { load('', ''); }, []);

  const totalRev = data.reduce((s, r) => s + parseFloat(r.total_revenue || 0), 0);
  const totalOrd = data.reduce((s, r) => s + parseInt(r.total_orders || 0), 0);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input text-sm w-36" />
          <span className="text-gray-400">to</span>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input text-sm w-36" />
          <button onClick={() => load(from, to)} className="btn-primary py-1.5 px-3 text-xs">Apply</button>
          <button onClick={() => { setFrom(''); setTo(''); load('',''); }} className="btn-secondary py-1.5 px-3 text-xs">Reset</button>
        </div>
        <button onClick={() => exportCSV(data, 'sales-summary.csv')} className="btn-secondary text-xs py-1.5"><Download className="w-3.5 h-3.5" />Export CSV</button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `PKR ${totalRev.toLocaleString()}`, color: 'text-teal-700 dark:text-teal-300' },
          { label: 'Total Orders',  value: totalOrd },
          { label: 'Avg Order',     value: totalOrd > 0 ? `PKR ${(totalRev/totalOrd).toFixed(0)}` : '—' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color || 'dark:text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      {data.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Daily Revenue (PKR)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.slice().reverse()} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="sale_date" tick={{ fontSize: 11 }} tickFormatter={v => format(new Date(v), 'dd MMM')} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`PKR ${parseFloat(v).toLocaleString()}`, 'Revenue']} labelFormatter={l => format(new Date(l), 'dd MMM yyyy')} />
              <Bar dataKey="total_revenue" fill="#0f766e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto card">
        <table className="w-full">
          <thead className="table-head"><tr>
            <th className="table-th">Date</th><th className="table-th">Orders</th>
            <th className="table-th">Revenue</th><th className="table-th">Avg Order</th><th className="table-th">Customers</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.length === 0 ? <tr><td colSpan={5} className="table-td text-center py-8 text-gray-400">No sales data</td></tr>
            : data.map(r => (
              <tr key={r.sale_date} className="table-row">
                <td className="table-td font-medium dark:text-white">{format(new Date(r.sale_date), 'dd MMM yyyy')}</td>
                <td className="table-td">{r.total_orders}</td>
                <td className="table-td font-bold text-teal-700 dark:text-teal-300">PKR {parseFloat(r.total_revenue).toLocaleString()}</td>
                <td className="table-td">PKR {parseFloat(r.avg_order_value).toFixed(2)}</td>
                <td className="table-td">{r.unique_customers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TopMedsTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { reportsAPI.topMedicines().then(r => setData(r.data)).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, []);
  if (loading) return <Spinner />;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Top {data.length} best-selling medicines</p>
        <button onClick={() => exportCSV(data, 'top-medicines.csv')} className="btn-secondary text-xs py-1.5"><Download className="w-3.5 h-3.5" />Export CSV</button>
      </div>
      <div className="overflow-x-auto card">
        <table className="w-full">
          <thead className="table-head"><tr>
            <th className="table-th">#</th><th className="table-th">Medicine</th>
            <th className="table-th">Category</th><th className="table-th">Units Sold</th>
            <th className="table-th">Orders</th><th className="table-th">Revenue</th><th className="table-th">Price</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.length === 0 ? <tr><td colSpan={7} className="table-td text-center py-8 text-gray-400">No sales data yet</td></tr>
            : data.map((r, i) => (
              <tr key={r.medicine_id} className="table-row">
                <td className="table-td font-bold text-gray-400">#{i+1}</td>
                <td className="table-td"><p className="font-medium dark:text-white">{r.medicine_name}</p><p className="text-xs text-gray-400">{r.dosage_form} {r.strength}</p></td>
                <td className="table-td text-gray-500">{r.category_name}</td>
                <td className="table-td font-bold text-teal-700 dark:text-teal-300">{r.total_sold}</td>
                <td className="table-td">{r.order_count}</td>
                <td className="table-td font-semibold">PKR {parseFloat(r.total_revenue).toLocaleString()}</td>
                <td className="table-td">PKR {parseFloat(r.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>;
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('low-stock');

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white dark:bg-gray-900 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'low-stock'  && <LowStockTab />}
      {activeTab === 'expiring'   && <ExpiryTab />}
      {activeTab === 'sales'      && <SalesTab />}
      {activeTab === 'top-meds'   && <TopMedsTab />}
    </div>
  );
}
