// src/pages/Sales/NewOrder.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { medicinesAPI, customersAPI, prescriptionsAPI, ordersAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { StockBadge } from '../../components/UI/Badge';

export default function NewOrder() {
  const { user }    = useAuth();
  const { cart, dispatch, subtotal, discountAmt, taxAmt, total } = useCart();
  const navigate    = useNavigate();

  const [medSearch,   setMedSearch]   = useState('');
  const [medResults,  setMedResults]  = useState([]);
  const [searchOpen,  setSearchOpen]  = useState(false);

  const [custPhone,   setCustPhone]   = useState('');
  const [customer,    setCustomer]    = useState(null);
  const [walkIn,      setWalkIn]      = useState(false);

  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionId, setPrescriptionId] = useState('');

  const [payMethod,   setPayMethod]   = useState('Cash');
  const [amountPaid,  setAmountPaid]  = useState('');
  const [placing,     setPlacing]     = useState(false);

  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Auto-fill amountPaid with total
  useEffect(() => {
    if (payMethod === 'Cash') setAmountPaid(total.toFixed(2));
  }, [total, payMethod]);

  // Medicine search
  const searchMedicines = async (q) => {
    setMedSearch(q);
    if (!q.trim()) { setMedResults([]); setSearchOpen(false); return; }
    try {
      const { data } = await medicinesAPI.getAll({ search: q, limit: 8, active: true });
      setMedResults(data.data || []);
      setSearchOpen(true);
    } catch {}
  };

  // Customer lookup by phone
  const lookupCustomer = async () => {
    if (!custPhone.trim()) return;
    try {
      const { data } = await customersAPI.searchByPhone(custPhone);
      if (data.length > 0) {
        setCustomer(data[0]);
        toast.success(`Customer: ${data[0].name}`);
        // Load their valid prescriptions
        const { data: pData } = await prescriptionsAPI.getAll({ customer_id: data[0].customer_id, limit: 50 });
        const valid = (pData.data || []).filter(p => !p.is_used && (!p.valid_until || new Date(p.valid_until) >= new Date()));
        setPrescriptions(valid);
      } else {
        toast.error('Customer not found');
        setCustomer(null);
      }
    } catch { toast.error('Lookup failed'); }
  };

  const addToCart = (med) => {
    if (med.stock_qty <= 0) { toast.error(`${med.name} is out of stock`); return; }
    dispatch({ type: 'ADD_ITEM', item: { medicine_id: med.medicine_id, name: med.name, unit_price: parseFloat(med.unit_price), stock_qty: med.stock_qty, requires_prescription: med.requires_prescription } });
    setMedSearch('');
    setMedResults([]);
    setSearchOpen(false);
    toast.success(`${med.name} added`);
  };

  const rxRequired = cart.items.some(i => i.requires_prescription);

  const placeOrder = async () => {
    if (cart.items.length === 0) { toast.error('Cart is empty'); return; }
    if (rxRequired && !prescriptionId) { toast.error('Prescription required for Rx medicines'); return; }
    if (!amountPaid || parseFloat(amountPaid) < total) { toast.error(`Amount paid must be ≥ PKR ${total.toFixed(2)}`); return; }

    setPlacing(true);
    try {
      const payload = {
        customer_id:      walkIn ? null : customer?.customer_id || null,
        employee_id:      user.id,
        prescription_id:  prescriptionId || null,
        discount_percent: cart.discount,
        tax_percent:      cart.tax,
        items:            cart.items.map(i => ({ medicine_id: i.medicine_id, quantity: i.quantity, unit_price: i.unit_price })),
        payment_method:   payMethod,
        amount_paid:      parseFloat(amountPaid),
      };
      const { data } = await ordersAPI.create(payload);
      dispatch({ type: 'CLEAR' });
      toast.success('Order placed!');
      navigate(`/orders/${data.order_id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Order failed');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-130px)]">
      {/* LEFT — Medicine Search + Cart */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search */}
        <div className="card p-4">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={medSearch}
              onChange={e => searchMedicines(e.target.value)}
              placeholder="Search and add medicines…"
              className="input pl-9 text-base"
            />
            {searchOpen && medResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl z-50 overflow-hidden">
                {medResults.map(m => (
                  <button
                    key={m.medicine_id}
                    onClick={() => addToCart(m)}
                    disabled={m.stock_status === 'Out of Stock'}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="text-left">
                      <p className="font-medium text-sm dark:text-white">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.dosage_form} {m.strength}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <StockBadge status={m.stock_status} />
                      <span className="font-bold text-teal-700 dark:text-teal-300 text-sm">PKR {parseFloat(m.unit_price).toFixed(2)}</span>
                      {m.requires_prescription && <span className="text-xs text-red-500 font-bold">Rx</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="card flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <ShoppingCart className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Cart is empty</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="table-head sticky top-0">
                <tr>
                  <th className="table-th">Medicine</th>
                  <th className="table-th text-center">Qty</th>
                  <th className="table-th text-right">Price</th>
                  <th className="table-th text-right">Subtotal</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {cart.items.map(item => (
                  <tr key={item.medicine_id}>
                    <td className="table-td">
                      <p className="font-medium dark:text-white">{item.name}</p>
                      {item.requires_prescription && <span className="text-xs text-red-500 font-semibold">Rx Required</span>}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => dispatch({ type: 'UPDATE_QTY', medicine_id: item.medicine_id, qty: item.quantity - 1 })}
                          className="w-7 h-7 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                        ><Minus className="w-3 h-3" /></button>
                        <span className="w-8 text-center font-semibold dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => {
                            if (item.quantity >= item.stock_qty) { toast.error('Insufficient stock'); return; }
                            dispatch({ type: 'UPDATE_QTY', medicine_id: item.medicine_id, qty: item.quantity + 1 });
                          }}
                          className="w-7 h-7 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                        ><Plus className="w-3 h-3" /></button>
                      </div>
                    </td>
                    <td className="table-td text-right">{item.unit_price.toFixed(2)}</td>
                    <td className="table-td text-right font-semibold dark:text-white">{(item.unit_price * item.quantity).toFixed(2)}</td>
                    <td className="table-td">
                      <button onClick={() => dispatch({ type: 'REMOVE_ITEM', medicine_id: item.medicine_id })} className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT — Customer + Payment Panel */}
      <div className="w-80 flex flex-col gap-4 overflow-y-auto">
        {/* Customer */}
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <User className="w-4 h-4" /> Customer
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={walkIn} onChange={e => { setWalkIn(e.target.checked); setCustomer(null); }} className="rounded text-teal-600" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Walk-in Customer</span>
          </label>
          {!walkIn && (
            <div className="flex gap-2">
              <input
                type="text" value={custPhone} onChange={e => setCustPhone(e.target.value)}
                placeholder="03XX-XXXXXXX" className="input flex-1 text-sm"
                onKeyDown={e => e.key === 'Enter' && lookupCustomer()}
              />
              <button onClick={lookupCustomer} className="btn-secondary px-3 py-1.5 text-xs">Find</button>
            </div>
          )}
          {customer && (
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-2.5 text-sm">
              <p className="font-semibold text-teal-800 dark:text-teal-300">{customer.name}</p>
              <p className="text-teal-600 dark:text-teal-400 text-xs">{customer.phone}</p>
            </div>
          )}
        </div>

        {/* Prescription */}
        {rxRequired && (
          <div className="card p-4 space-y-2 border-2 border-red-300 dark:border-red-700">
            <h3 className="font-semibold text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Prescription Required
            </h3>
            {!customer ? (
              <p className="text-xs text-gray-500">Please select a customer first.</p>
            ) : (
              <select value={prescriptionId} onChange={e => setPrescriptionId(e.target.value)} className="input text-sm">
                <option value="">— Select Prescription —</option>
                {prescriptions.map(p => (
                  <option key={p.prescription_id} value={p.prescription_id}>
                    RX-{String(p.prescription_id).padStart(3,'0')} | Dr. {p.doctor_name} | {p.prescription_date}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Discount & Tax */}
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Pricing</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label text-xs">Discount %</label>
              <input
                type="number" min="0" max="100" step="0.5"
                value={cart.discount}
                onChange={e => dispatch({ type: 'SET_DISCOUNT', value: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="label text-xs">Tax %</label>
              <input
                type="number" min="0" step="0.5"
                value={cart.tax}
                onChange={e => dispatch({ type: 'SET_TAX', value: parseFloat(e.target.value) || 0 })}
                className="input text-sm"
              />
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="card p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal</span><span>PKR {subtotal.toFixed(2)}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-amber-600 dark:text-amber-400">
              <span>Discount ({cart.discount}%)</span><span>-PKR {discountAmt.toFixed(2)}</span>
            </div>
          )}
          {cart.tax > 0 && (
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Tax ({cart.tax}%)</span><span>PKR {taxAmt.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 dark:border-gray-700 text-teal-700 dark:text-teal-300">
            <span>Total</span><span>PKR {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="card p-4 space-y-3">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Payment</h3>
          <div className="grid grid-cols-2 gap-2">
            {['Cash','Card','Online','Insurance'].map(m => (
              <button
                key={m}
                onClick={() => setPayMethod(m)}
                className={`py-2 rounded-lg text-sm font-medium border transition-colors ${payMethod === m ? 'bg-teal-700 text-white border-teal-700' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >{m}</button>
            ))}
          </div>
          <div>
            <label className="label text-xs">Amount Paid (PKR)</label>
            <input
              type="number" step="0.01" value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
              className="input text-sm font-bold"
            />
            {amountPaid && parseFloat(amountPaid) >= total && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                Change: PKR {(parseFloat(amountPaid) - total).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={placeOrder}
          disabled={placing || cart.items.length === 0}
          className="btn-primary w-full justify-center py-3 text-base"
        >
          {placing ? 'Processing…' : `Place Order · PKR ${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}
