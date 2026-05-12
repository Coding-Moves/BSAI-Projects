// src/pages/Prescriptions/PrescriptionList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { prescriptionsAPI, customersAPI, doctorsAPI } from '../../api';
import Modal from '../../components/UI/Modal';
import SearchBar from '../../components/UI/SearchBar';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import Pagination from '../../components/UI/Pagination';
import Badge from '../../components/UI/Badge';

const schema = z.object({
  customer_id:       z.coerce.number().gt(0, 'Select a customer'),
  doctor_id:         z.coerce.number().gt(0, 'Select a doctor'),
  prescription_date: z.string().min(1, 'Date required'),
  valid_until:       z.string().optional(),
  notes:             z.string().optional(),
});

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [search,        setSearch]        = useState('');
  const [loading,       setLoading]       = useState(true);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editing,       setEditing]       = useState(null);
  const [deleteId,      setDeleteId]      = useState(null);
  const [customers,     setCustomers]     = useState([]);
  const [doctors,       setDoctors]       = useState([]);
  const LIMIT = 10;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await prescriptionsAPI.getAll({ search, page, limit: LIMIT });
      setPrescriptions(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load prescriptions'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    customersAPI.getAll({ limit: 200 }).then(r => setCustomers(r.data.data || [])).catch(() => {});
    doctorsAPI.getAll({ limit: 200 }).then(r => setDoctors(r.data.data || [])).catch(() => {});
  }, []);

  const openAdd = () => {
    setEditing(null);
    reset({ prescription_date: new Date().toISOString().slice(0,10) });
    setModalOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    reset({ customer_id: p.customer_id, doctor_id: p.doctor_id, prescription_date: p.prescription_date?.slice(0,10)||'', valid_until: p.valid_until?.slice(0,10)||'', notes: p.notes||'' });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) { await prescriptionsAPI.update(editing.prescription_id, data); toast.success('Updated'); }
      else { await prescriptionsAPI.create(data); toast.success('Prescription created'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by customer or doctor…" />
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Prescription</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Rx #</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Doctor</th>
                <th className="table-th">Date</th>
                <th className="table-th">Valid Until</th>
                <th className="table-th">Status</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="table-td text-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : prescriptions.length === 0 ? (
                <tr><td colSpan={7} className="table-td text-center py-10 text-gray-400">No prescriptions</td></tr>
              ) : prescriptions.map(p => (
                <tr key={p.prescription_id} className="table-row">
                  <td className="table-td font-mono font-bold text-teal-700 dark:text-teal-400">RX-{String(p.prescription_id).padStart(3,'0')}</td>
                  <td className="table-td"><p className="font-medium dark:text-white">{p.customer_name}</p><p className="text-xs text-gray-400">{p.customer_phone}</p></td>
                  <td className="table-td"><p className="dark:text-white">{p.doctor_name}</p><p className="text-xs text-gray-400">{p.specialization}</p></td>
                  <td className="table-td text-gray-500">{p.prescription_date?.slice(0,10)}</td>
                  <td className="table-td text-gray-500">{p.valid_until?.slice(0,10) || '—'}</td>
                  <td className="table-td">
                    {p.is_used
                      ? <Badge variant="gray">Used</Badge>
                      : p.valid_until && new Date(p.valid_until) < new Date()
                        ? <Badge variant="red">Expired</Badge>
                        : <Badge variant="green">Valid</Badge>}
                  </td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-teal-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(p.prescription_id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={LIMIT} total={total} onPage={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Prescription' : 'New Prescription'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Customer *</label>
              <select {...register('customer_id')} className={`input ${errors.customer_id?'border-red-500':''}`}>
                <option value="">— Select —</option>
                {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} ({c.phone})</option>)}
              </select>
              {errors.customer_id && <p className="error-msg">{errors.customer_id.message}</p>}
            </div>
            <div>
              <label className="label">Doctor *</label>
              <select {...register('doctor_id')} className={`input ${errors.doctor_id?'border-red-500':''}`}>
                <option value="">— Select —</option>
                {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.name} — {d.specialization}</option>)}
              </select>
              {errors.doctor_id && <p className="error-msg">{errors.doctor_id.message}</p>}
            </div>
            <div>
              <label className="label">Prescription Date *</label>
              <input {...register('prescription_date')} type="date" className={`input ${errors.prescription_date?'border-red-500':''}`} />
            </div>
            <div>
              <label className="label">Valid Until</label>
              <input {...register('valid_until')} type="date" className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <textarea {...register('notes')} className="input" rows={2} placeholder="Diagnosis or medicine notes…" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={async () => { try { await prescriptionsAPI.remove(deleteId); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); } }} title="Delete Prescription" message="Are you sure you want to delete this prescription?" confirmLabel="Delete" />
    </div>
  );
}
