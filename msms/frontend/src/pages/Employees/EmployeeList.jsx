// src/pages/Employees/EmployeeList.jsx
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { employeesAPI } from '../../api';
import Modal from '../../components/UI/Modal';
import SearchBar from '../../components/UI/SearchBar';
import ConfirmDialog from '../../components/UI/ConfirmDialog';
import Pagination from '../../components/UI/Pagination';

const ROLES = ['Admin','Manager','Pharmacist','Cashier'];

const addSchema = z.object({
  name:      z.string().min(2),
  role:      z.enum(ROLES),
  phone:     z.string().min(11),
  email:     z.string().email().optional().or(z.literal('')),
  salary:    z.coerce.number().gt(0).optional().or(z.literal('')),
  hire_date: z.string().min(1, 'Required'),
  username:  z.string().min(3),
  password:  z.string().min(6, 'Min 6 chars'),
});

const editSchema = addSchema.extend({ password: z.string().min(6).optional().or(z.literal('')) });

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const [showPass,  setShowPass]  = useState(false);
  const LIMIT = 10;

  const schema = editing ? editSchema : addSchema;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeesAPI.getAll({ search, page, limit: LIMIT });
      setEmployees(data.data || []);
      setTotal(data.total || 0);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openAdd = () => { setEditing(null); reset({ role: 'Cashier', hire_date: new Date().toISOString().slice(0,10) }); setModalOpen(true); };
  const openEdit = (emp) => {
    setEditing(emp);
    reset({ name: emp.name, role: emp.role, phone: emp.phone, email: emp.email || '', salary: emp.salary || '', hire_date: emp.hire_date?.slice(0,10) || '', username: emp.username, password: '' });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    const payload = { ...data };
    if (editing && !payload.password) delete payload.password;
    try {
      if (editing) {
        await employeesAPI.update(editing.employee_id, payload);
        toast.success('Employee updated');
      } else {
        await employeesAPI.create(payload);
        toast.success('Employee created');
      }
      setModalOpen(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed');
    }
  };

  const handleDelete = async () => {
    try { await employeesAPI.remove(deleteId); toast.success('Employee deactivated'); fetchEmployees(); }
    catch { toast.error('Failed'); }
  };

  const roleColor = { Admin:'text-purple-600', Manager:'text-blue-600', Pharmacist:'text-teal-600', Cashier:'text-gray-600' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search employees…" />
        <button onClick={openAdd} className="btn-primary"><Plus className="w-4 h-4" /> Add Employee</button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Role</th>
                <th className="table-th">Username</th>
                <th className="table-th">Phone</th>
                <th className="table-th">Salary</th>
                <th className="table-th">Hire Date</th>
                <th className="table-th"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={7} className="table-td text-center py-10">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : employees.map(e => (
                <tr key={e.employee_id} className="table-row">
                  <td className="table-td"><p className="font-medium dark:text-white">{e.name}</p><p className="text-xs text-gray-400">{e.email || '—'}</p></td>
                  <td className="table-td"><span className={`text-xs font-bold ${roleColor[e.role]}`}>{e.role}</span></td>
                  <td className="table-td font-mono text-sm">{e.username}</td>
                  <td className="table-td">{e.phone}</td>
                  <td className="table-td">PKR {parseFloat(e.salary || 0).toLocaleString()}</td>
                  <td className="table-td text-gray-500">{e.hire_date ? new Date(e.hire_date).toLocaleDateString('en-PK') : '—'}</td>
                  <td className="table-td">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(e)} className="text-gray-400 hover:text-teal-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(e.employee_id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} limit={LIMIT} total={total} onPage={setPage} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Full Name *</label><input {...register('name')} className={`input ${errors.name?'border-red-500':''}`} placeholder="Ahmed Ali" />{errors.name&&<p className="error-msg">{errors.name.message}</p>}</div>
            <div>
              <label className="label">Role *</label>
              <select {...register('role')} className={`input ${errors.role?'border-red-500':''}`}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div><label className="label">Phone *</label><input {...register('phone')} className={`input ${errors.phone?'border-red-500':''}`} placeholder="03XX-XXXXXXX" />{errors.phone&&<p className="error-msg">{errors.phone.message}</p>}</div>
            <div><label className="label">Email</label><input {...register('email')} type="email" className="input" placeholder="email@cure.pk" /></div>
            <div><label className="label">Salary (PKR)</label><input {...register('salary')} type="number" className="input" placeholder="50000" /></div>
            <div><label className="label">Hire Date *</label><input {...register('hire_date')} type="date" className={`input ${errors.hire_date?'border-red-500':''}`} />{errors.hire_date&&<p className="error-msg">{errors.hire_date.message}</p>}</div>
            <div><label className="label">Username *</label><input {...register('username')} className={`input ${errors.username?'border-red-500':''}`} placeholder="jdoe" />{errors.username&&<p className="error-msg">{errors.username.message}</p>}</div>
            <div>
              <label className="label">{editing ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <div className="relative">
                <input {...register('password')} type={showPass?'text':'password'} className={`input pr-9 ${errors.password?'border-red-500':''}`} placeholder="Min 6 chars" />
                <button type="button" onClick={() => setShowPass(s=>!s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password&&<p className="error-msg">{errors.password.message}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Deactivate Employee" message="Employee will be deactivated and cannot log in." confirmLabel="Deactivate" />
    </div>
  );
}
