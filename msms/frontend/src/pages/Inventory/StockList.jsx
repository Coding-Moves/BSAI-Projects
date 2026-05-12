// src/pages/Inventory/StockList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { stockAPI, suppliersAPI } from '../../api';
import Modal from '../../components/UI/Modal';
import SearchBar from '../../components/UI/SearchBar';
import { StockBadge } from '../../components/UI/Badge';
import Pagination from '../../components/UI/Pagination';
import { format } from 'date-fns';

const schema = z.object({
  medicine_id:  z.coerce.number().gt(0),
  quantity:     z.coerce.number().int().gt(0, 'Qty must be > 0'),
  supplier_id:  z.coerce.number().optional(),
  expiry_date:  z.string().min(1, 'Expiry date required'),
  batch_number: z.string().optional(),
});

export default function StockList() {
  const [stocks,    setStocks]    = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const LIMIT = 10;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await stockAPI.getAll({ search, page, limit: LIMIT });
      setStocks(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load stock'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchStock(); }, [fetchStock]);
  useEffect(() => {
    suppliersAPI.getAll({ limit: 100 }).then(r => setSuppliers(r.data.data || [])).catch(() => {});
  }, []);

  const openRestock = (item) => {
    setSelected(item);
    reset({ medicine_id: item.medicine_id, quantity: '', supplier_id: item.supplier_id || '', expiry_date: '', batch_number: '' });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      await stockAPI.restock(data);
      toast.success('Stock updated successfully');
      setModalOpen(false);
      fetchStock();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Restock failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by medicine name…" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Medicine</th>
                <th className="table-th">Qty</th>
                <th className="table-th">Reorder Level</th>
                <th className="table-th">Status</th>
                <th className="table-th">Batch</th>
                <th className="table-th">Expiry</th>
                <th className="table-th">Supplier</th>
                <th className="table-th">Last Restocked</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={9} className="table-td text-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : stocks.map(s => (
                <tr key={s.stock_id} className="table-row">
                  <td className="table-td">
                    <p className="font-medium dark:text-white">{s.medicine_name}</p>
                    <p className="text-xs text-gray-400">{s.dosage_form} {s.strength}</p>
                  </td>
                  <td className="table-td font-bold text-lg">{s.quantity}</td>
                  <td className="table-td text-gray-500">{s.reorder_level}</td>
                  <td className="table-td"><StockBadge status={s.stock_status} /></td>
                  <td className="table-td text-xs text-gray-500">{s.batch_number || '—'}</td>
                  <td className="table-td">
                    {s.expiry_date ? (
                      <span className={new Date(s.expiry_date) < new Date(Date.now() + 30*24*60*60*1000) ? 'text-red-600 font-semibold' : ''}>
                        {format(new Date(s.expiry_date), 'MMM yyyy')}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="table-td text-gray-500">{s.supplier_name || '—'}</td>
                  <td className="table-td text-gray-500 text-xs">
                    {s.last_restocked ? format(new Date(s.last_restocked), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="table-td">
                    <button onClick={() => openRestock(s)} className="btn-secondary py-1 px-2 text-xs">
                      <RefreshCw className="w-3 h-3" /> Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={LIMIT} total={total} onPage={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Restock: ${selected?.medicine_name}`} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register('medicine_id')} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity to Add *</label>
              <input {...register('quantity')} type="number" className={`input ${errors.quantity ? 'border-red-500' : ''}`} placeholder="e.g. 100" />
              {errors.quantity && <p className="error-msg">{errors.quantity.message}</p>}
            </div>
            <div>
              <label className="label">Expiry Date *</label>
              <input {...register('expiry_date')} type="date" className={`input ${errors.expiry_date ? 'border-red-500' : ''}`} />
              {errors.expiry_date && <p className="error-msg">{errors.expiry_date.message}</p>}
            </div>
            <div>
              <label className="label">Batch Number</label>
              <input {...register('batch_number')} className="input" placeholder="e.g. BATCH-2026-001" />
            </div>
            <div>
              <label className="label">Supplier</label>
              <select {...register('supplier_id')} className="input">
                <option value="">— Select —</option>
                {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Restocking…' : 'Confirm Restock'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
