// src/components/UI/CrudPage.jsx — Reusable CRUD list page
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import Modal from './Modal';
import SearchBar from './SearchBar';
import ConfirmDialog from './ConfirmDialog';
import Pagination from './Pagination';

export default function CrudPage({
  title,
  api,
  schema,
  defaultValues = {},
  columns,          // [{key, label, render}]
  formFields,       // [{name, label, type, options, required, placeholder}]
  searchPlaceholder,
  getId,            // item => id
  softDelete = false,
  onBuildPayload,   // (data) => payload
}) {
  const [items,     setItems]     = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const LIMIT = 10;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.getAll({ search, page, limit: LIMIT });
      setItems(data.data || data || []);
      setTotal(data.total || 0);
    } catch { toast.error(`Failed to load ${title}`); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const openAdd = () => { setEditing(null); reset(defaultValues); setModalOpen(true); };

  const openEdit = (item) => {
    setEditing(item);
    const vals = {};
    Object.keys(defaultValues).forEach(k => { vals[k] = item[k] ?? defaultValues[k]; });
    reset(vals);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = onBuildPayload ? onBuildPayload(data) : data;
    try {
      if (editing) {
        await api.update(getId(editing), payload);
        toast.success('Updated successfully');
      } else {
        await api.create(payload);
        toast.success('Created successfully');
      }
      setModalOpen(false);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await api.remove(deleteId);
      toast.success(softDelete ? 'Deactivated' : 'Deleted');
      fetchItems();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder={searchPlaceholder} />
        <button onClick={openAdd} className="btn-primary px-6 py-2.5 text-base"><Plus className="w-5 h-5" /> Add {title}</button>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                {columns.map(c => <th key={c.key} className="table-th text-base font-semibold">{c.label}</th>)}
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="table-td text-center py-12">
                  <div className="w-7 h-7 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="table-td text-center py-12 text-gray-400">No records found</td></tr>
              ) : items.map(item => (
                <tr key={getId(item)} className="table-row">
                  {columns.map(c => (
                    <td key={c.key} className="table-td text-base">
                      {c.render ? c.render(item) : (item[c.key] ?? '—')}
                    </td>
                  ))}
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(item)} className="text-gray-400 hover:text-teal-600 transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => setDeleteId(getId(item))} className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit ${title}` : `Add ${title}`} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {formFields.map(f => (
              <div key={f.name} className={f.fullWidth ? 'sm:col-span-2' : ''}>
                <label className="label text-base">{f.label}{f.required && ' *'}</label>
                {f.type === 'select' ? (
                  <select {...register(f.name)} className={`input ${errors[f.name] ? 'border-red-500' : ''}`}>
                    <option value="">— Select —</option>
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea {...register(f.name)} className="input" rows={2} placeholder={f.placeholder} />
                ) : f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input {...register(f.name)} type="checkbox" className="rounded text-teal-600" />
                    <span className="text-base text-gray-600 dark:text-gray-300">{f.checkLabel}</span>
                  </label>
                ) : (
                  <input {...register(f.name)} type={f.type || 'text'} placeholder={f.placeholder}
                    className={`input ${errors[f.name] ? 'border-red-500' : ''}`} />
                )}
                {errors[f.name] && <p className="error-msg">{errors[f.name].message}</p>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary px-5 py-2 text-base">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary px-6 py-2 text-base">
              {isSubmitting ? 'Saving…' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={`${softDelete ? 'Deactivate' : 'Delete'} ${title}`}
        message={`Are you sure you want to ${softDelete ? 'deactivate' : 'delete'} this record?`}
        confirmLabel={softDelete ? 'Deactivate' : 'Delete'}
      />
    </div>
  );
}
