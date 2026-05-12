// src/pages/Suppliers/SupplierList.jsx
import { z } from 'zod';
import CrudPage from '../../components/UI/CrudPage';
import { suppliersAPI } from '../../api';

const schema = z.object({
  name:           z.string().min(2, 'Min 2 chars'),
  contact_person: z.string().optional(),
  phone:          z.string().min(11, 'Enter valid phone'),
  email:          z.string().email().optional().or(z.literal('')),
  address:        z.string().optional(),
  rating:         z.coerce.number().min(1).max(5).optional().or(z.literal('')),
});

export default function SupplierList() {
  return (
    <CrudPage
      title="Supplier"
      api={suppliersAPI}
      schema={schema}
      defaultValues={{ name:'', contact_person:'', phone:'', email:'', address:'', rating:'' }}
      getId={s => s.supplier_id}
      softDelete={true}
      searchPlaceholder="Search suppliers…"
      columns={[
        { key:'name',           label:'Supplier Name', render: s => <div><p className="font-medium dark:text-white">{s.name}</p><p className="text-xs text-gray-400">{s.contact_person || '—'}</p></div> },
        { key:'phone',          label:'Phone' },
        { key:'email',          label:'Email',         render: s => s.email || '—' },
        { key:'rating',         label:'Rating',        render: s => s.rating ? <span className="font-bold text-amber-500">⭐ {s.rating}</span> : '—' },
        { key:'is_active',      label:'Status',        render: s => s.is_active ? <span className="text-xs font-semibold text-green-600">Active</span> : <span className="text-xs text-gray-400">Inactive</span> },
      ]}
      formFields={[
        { name:'name',           label:'Supplier Name',   required:true, placeholder:'Getz Pharma Direct' },
        { name:'contact_person', label:'Contact Person',  placeholder:'John Doe' },
        { name:'phone',          label:'Phone',           required:true, placeholder:'03XX-XXXXXXX' },
        { name:'email',          label:'Email',           type:'email', placeholder:'email@supplier.com' },
        { name:'rating',         label:'Rating (1-5)',    type:'number', placeholder:'4.5' },
        { name:'address',        label:'Address',         type:'textarea', placeholder:'Full address', fullWidth:true },
      ]}
    />
  );
}
