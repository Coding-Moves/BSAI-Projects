// src/pages/Sales/OrderDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../api';
import BillPreview from '../../components/Bill/BillPreview';
import BillActions from '../../components/Bill/BillActions';
import { OrderStatusBadge, PaymentBadge } from '../../components/UI/Badge';

export default function OrderDetail() {
  const { id }    = useParams();
  const [bill,    setBill]    = useState(null);
  const [loading, setLoading] = useState(true);
  const billRef   = useRef(null);

  useEffect(() => {
    ordersAPI.getBill(id)
      .then(({ data }) => setBill(data))
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!bill) return <div className="text-center py-20 text-gray-400">Order not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <Link to="/orders" className="btn-secondary">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={bill.header.status} />
          <BillActions
            billRef={billRef}
            invoiceNumber={bill.header.invoice_number}
            orderDate={bill.header.order_date}
          />
        </div>
      </div>

      {/* Order summary cards */}
      <div className="grid grid-cols-3 gap-4 no-print">
        {[
          { label: 'Invoice', value: bill.header.invoice_number, mono: true },
          { label: 'Customer', value: bill.header.customer_name },
          { label: 'Cashier', value: bill.header.cashier_name },
          { label: 'Total', value: `PKR ${parseFloat(bill.header.total_amount).toLocaleString()}`, bold: true, color: 'text-teal-700 dark:text-teal-300' },
          { label: 'Payment', value: bill.header.payment_method || 'N/A' },
          { label: 'Items', value: bill.items?.length || 0 },
        ].map(({ label, value, mono, bold, color }) => (
          <div key={label} className="card px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`font-semibold mt-0.5 dark:text-white ${bold ? 'text-lg' : ''} ${color || ''} ${mono ? 'font-mono' : ''}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Bill Preview */}
      <div className="flex justify-center">
        <div className="card overflow-hidden">
          <BillPreview ref={billRef} bill={bill} />
        </div>
      </div>
    </div>
  );
}
