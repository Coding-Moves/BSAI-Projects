// src/pages/Inventory/MedicineList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { medicinesAPI, categoriesAPI, manufacturersAPI } from '../../api';
import Modal from '../../components/UI/Modal';
import SearchBar from '../../components/UI/SearchBar';
import { StockBadge } from '../../components/UI/Badge';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import Pagination from '../../components/UI/Pagination';

const DOSAGE_FORMS = ['Tablet','Capsule','Syrup','Injection','Cream','Drop','Inhaler','Powder','Patch'];

const schema = z.object({
  name:                   z.string().min(2, 'Min 2 characters'),
  generic_name:           z.string().optional(),
  category_id:            z.coerce.number().optional(),
  manufacturer_id:        z.coerce.number().optional(),
  dosage_form:            z.enum(DOSAGE_FORMS),
  strength:               z.string().optional(),
  unit_price:             z.coerce.number().gt(0, 'Price must be > 0'),
  requires_prescription:  z.boolean().optional(),
  description:            z.string().optional(),
});

export default function MedicineList() {
  const [medicines, setMedicines]   = useState([]);
  const [total,     setTotal]       = useState(0);
  const [page,      setPage]        = useState(1);
  const [search,    setSearch]      = useState('');
  const [loading,   setLoading]     = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editing,   setEditing]     = useState(null);
  const [deleteId,  setDeleteId]    = useState(null);
  const [categories, setCategories] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const LIMIT = 10;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { requires_prescription: false },
  });

  const fetchMedicines = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await medicinesAPI.getAll({ search, page, limit: LIMIT });
      setMedicines(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load medicines'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  useEffect(() => {
    categoriesAPI.getAll({ limit: 100 }).then(r => setCategories(r.data.data || [])).catch(() => {});
    manufacturersAPI.getAll({ limit: 100 }).then(r => setManufacturers(r.data.data || [])).catch(() => {});
  }, []);

  const openAdd = () => {
    setEditing(null);
    reset({ dosage_form: 'Tablet', requires_prescription: false });
    setModalOpen(true);
  };

  const openEdit = (med) => {
    setEditing(med);
    reset({
      name: med.name, generic_name: med.generic_name || '',
      category_id: med.category_id || '', manufacturer_id: med.manufacturer_id || '',
      dosage_form: med.dosage_form, strength: med.strength || '',
      unit_price: med.unit_price, requires_prescription: !!med.requires_prescription,
      description: med.description || '',
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await medicinesAPI.update(editing.medicine_id, data);
        toast.success('Medicine updated');
      } else {
        await medicinesAPI.create(data);
        toast.success('Medicine added');
      }
      setModalOpen(false);
      fetchMedicines();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await medicinesAPI.remove(deleteId);
      toast.success('Medicine deactivated');
      fetchMedicines();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search medicines…" />
        <button onClick={openAdd} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Category</th>
                <th className="table-th">Form</th>
                <th className="table-th">Strength</th>
                <th className="table-th">Price (PKR)</th>
                <th className="table-th">Stock</th>
                <th className="table-th">Expiry</th>
                <th className="table-th">Rx</th>
                <th className="table-th">Status</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={10} className="table-td text-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : medicines.length === 0 ? (
                <tr><td colSpan={10} className="table-td text-center py-10 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />No medicines found
                </td></tr>
              ) : medicines.map(m => (
                <tr key={m.medicine_id} className="table-row">
                  <td className="table-td">
                    <p className="font-semibold text-gray-900 dark:text-white">{m.name}</p>
                    {m.generic_name && <p className="text-xs text-gray-400">{m.generic_name}</p>}
                  </td>
                  <td className="table-td text-gray-500">{m.category_name || '—'}</td>
                  <td className="table-td">{m.dosage_form}</td>
                  <td className="table-td">{m.strength || '—'}</td>
                  <td className="table-td font-medium">{parseFloat(m.unit_price).toFixed(2)}</td>
                  <td className="table-td">
                    <span className="font-medium">{m.stock_qty ?? '—'}</span>
                    {m.stock_qty !== null && <StockBadge status={m.stock_status} />}
                  </td>
                  <td className="table-td text-gray-500">
                    {m.expiry_date ? new Date(m.expiry_date).toLocaleDateString('en-PK', { year:'2-digit', month:'short' }) : '—'}
                  </td>
                  <td className="table-td">
                    {m.requires_prescription ? <span className="text-xs font-semibold text-red-600">Yes</span> : <span className="text-xs text-gray-400">No</span>}
                  </td>
                  <td className="table-td">
                    {m.is_active ? <span className="text-xs font-semibold text-green-600">Active</span> : <span className="text-xs text-gray-400">Inactive</span>}
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(m)} className="text-gray-400 hover:text-teal-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(m.medicine_id)} className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={LIMIT} total={total} onPage={setPage} />
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Medicine' : 'Add Medicine'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Medicine Name *</label>
              <input {...register('name')} className={`input ${errors.name ? 'border-red-500' : ''}`} placeholder="e.g. Panadol Extra" />
              {errors.name && <p className="error-msg">{errors.name.message}</p>}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label">Generic Name</label>
              <input {...register('generic_name')} className="input" placeholder="e.g. Paracetamol" />
            </div>
            <div>
              <label className="label">Category</label>
              <select {...register('category_id')} className="input">
                <option value="">— Select —</option>
                {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Manufacturer</label>
              <select {...register('manufacturer_id')} className="input">
                <option value="">— Select —</option>
                {manufacturers.map(m => <option key={m.manufacturer_id} value={m.manufacturer_id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Dosage Form *</label>
              <select {...register('dosage_form')} className={`input ${errors.dosage_form ? 'border-red-500' : ''}`}>
                {DOSAGE_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.dosage_form && <p className="error-msg">{errors.dosage_form.message}</p>}
            </div>
            <div>
              <label className="label">Strength</label>
              <input {...register('strength')} className="input" placeholder="e.g. 500mg" />
            </div>
            <div>
              <label className="label">Unit Price (PKR) *</label>
              <input {...register('unit_price')} type="number" step="0.01" className={`input ${errors.unit_price ? 'border-red-500' : ''}`} placeholder="0.00" />
              {errors.unit_price && <p className="error-msg">{errors.unit_price.message}</p>}
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('requires_prescription')} type="checkbox" className="w-4 h-4 rounded text-teal-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Requires Prescription (Rx)</span>
              </label>
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <textarea {...register('description')} className="input" rows={2} placeholder="Optional notes…" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Saving…' : editing ? 'Update Medicine' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Deactivate Medicine"
        message="This medicine will be hidden from the inventory. Stock records are preserved."
        confirmLabel="Deactivate"
      />
    </div>
  );
}
