// src/components/Bill/BillPreview.jsx
import { forwardRef } from 'react';
import { format } from 'date-fns';

const BillPreview = forwardRef(({ bill }, ref) => {
  if (!bill) return null;
  const { header, items } = bill;
  const fmt = (n) => parseFloat(n || 0).toFixed(2);

  return (
    <div
      ref={ref}
      id="bill-preview"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '12px', color: '#111', background: '#fff', padding: '20px', width: '100%', maxWidth: '400px' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '14px', borderBottom: '2px solid #0f766e', paddingBottom: '12px' }}>
        <div style={{ width: '40px', height: '40px', background: '#0f766e', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
          <span style={{ color: '#fff', fontSize: '20px' }}>+</span>
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#0f766e', margin: 0 }}>CURE PHARMACY</h1>
        <p style={{ margin: '2px 0', color: '#555', fontSize: '11px' }}>123 Main Shahrah, Karachi, Sindh, Pakistan</p>
        <p style={{ margin: '2px 0', color: '#555', fontSize: '11px' }}>Ph: 021-35141000 | DRAP Lic: DRAP-KHI-2022</p>
      </div>

      {/* Invoice Meta */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginBottom: '12px', fontSize: '11px' }}>
        <div><strong>Invoice #:</strong> {header.invoice_number}</div>
        <div><strong>Date:</strong> {header.order_date ? format(new Date(header.order_date), 'dd-MMM-yyyy') : '—'}</div>
        <div><strong>Time:</strong> {header.order_date ? format(new Date(header.order_date), 'HH:mm') : '—'}</div>
        <div><strong>Cashier:</strong> {header.cashier_name}</div>
        <div style={{ gridColumn: '1/-1' }}><strong>Customer:</strong> {header.customer_name} | Ph: {header.customer_phone}</div>
        {header.prescription_number && header.prescription_number !== 'RX-000' && (
          <div style={{ gridColumn: '1/-1' }}><strong>Prescription #:</strong> {header.prescription_number}</div>
        )}
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '11px' }}>
        <thead>
          <tr style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', background: '#f9f9f9' }}>
            <th style={{ textAlign: 'left', padding: '5px 4px' }}>#</th>
            <th style={{ textAlign: 'left', padding: '5px 4px' }}>Medicine</th>
            <th style={{ textAlign: 'right', padding: '5px 4px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '5px 4px' }}>Price</th>
            <th style={{ textAlign: 'right', padding: '5px 4px' }}>Sub</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.item_id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '5px 4px' }}>{i + 1}</td>
              <td style={{ padding: '5px 4px' }}>
                {item.medicine_name}
                {item.strength ? <span style={{ color: '#777', fontSize: '10px' }}> {item.strength}</span> : null}
              </td>
              <td style={{ textAlign: 'right', padding: '5px 4px' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right', padding: '5px 4px' }}>{fmt(item.unit_price)}</td>
              <td style={{ textAlign: 'right', padding: '5px 4px' }}>{fmt(item.line_subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px', fontSize: '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span>Subtotal:</span><span>PKR {fmt(header.subtotal)}</span>
        </div>
        {parseFloat(header.discount_amount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#d97706' }}>
            <span>Discount ({header.discount_percent}%):</span>
            <span>-PKR {fmt(header.discount_amount)}</span>
          </div>
        )}
        {parseFloat(header.tax_amount) > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>Tax ({header.tax_percent}%):</span><span>PKR {fmt(header.tax_amount)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '2px solid #0f766e', marginTop: '4px', fontWeight: '800', fontSize: '14px', color: '#0f766e' }}>
          <span>GRAND TOTAL:</span><span>PKR {fmt(header.total_amount)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px' }}>
          <span><strong>Payment:</strong> {header.payment_method || 'N/A'}</span>
          <span style={{ color: header.payment_status === 'Paid' ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
            {header.payment_status?.toUpperCase() || 'PENDING'}
          </span>
        </div>
        {header.amount_paid && parseFloat(header.amount_paid) > parseFloat(header.total_amount) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>Cash Given:</span><span>PKR {fmt(header.amount_paid)}</span>
          </div>
        )}
        {header.amount_paid && parseFloat(header.amount_paid) > parseFloat(header.total_amount) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontWeight: '600' }}>
            <span>Change:</span><span>PKR {(parseFloat(header.amount_paid) - parseFloat(header.total_amount)).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed #ccc', fontSize: '10px', color: '#777' }}>
        <p style={{ margin: '2px 0', fontWeight: '600' }}>Thank you! Get well soon. 🌿</p>
        <p style={{ margin: '2px 0' }}>Return policy: 3 days with original receipt</p>
        <p style={{ margin: '2px 0' }}>For queries: 021-35141000</p>
      </div>
    </div>
  );
});

BillPreview.displayName = 'BillPreview';
export default BillPreview;
