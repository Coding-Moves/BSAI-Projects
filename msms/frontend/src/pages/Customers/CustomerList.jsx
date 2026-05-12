// src/pages/Customers/CustomerList.jsx
import { z } from 'zod';
import CrudPage from '../../components/UI/CrudPage';
import { customersAPI } from '../../api';

const schema = z.object({
  name:          z.string().min(2, 'Min 2 chars'),
  phone:         z.string().min(11, 'Enter valid phone number'),
  email:         z.string().email().optional().or(z.literal('')),
  date_of_birth: z.string().optional(),
  gender:        z.enum(['Male','Female','Other','','']).optional(),
  address:       z.string().optional(),
});

export default function CustomerList() {
  return (
    <CrudPage
      title="Customer"
      api={customersAPI}
      schema={schema}
      defaultValues={{ name:'', phone:'', email:'', date_of_birth:'', gender:'', address:'' }}
      getId={c => c.customer_id}
      softDelete={false}
      searchPlaceholder="Search customers…"
      columns={[
        { key:'name',          label:'Name',         render: c => <div><p className="font-medium dark:text-white">{c.name}</p><p className="text-xs text-gray-400">{c.email || '—'}</p></div> },
        { key:'phone',         label:'Phone' },
        { key:'gender',        label:'Gender' },
        { key:'date_of_birth', label:'DOB',          render: c => c.date_of_birth ? new Date(c.date_of_birth).toLocaleDateString('en-PK') : '—' },
        { key:'total_orders',  label:'Orders',       render: c => c.total_orders || 0 },
        { key:'total_spent',   label:'Total Spent',  render: c => `PKR ${parseFloat(c.total_spent || 0).toLocaleString()}` },
      ]}
      formFields={[
        { name:'name',          label:'Full Name',     required:true,  placeholder:'Ahmed Ali' },
        { name:'phone',         label:'Phone',         required:true,  placeholder:'03XX-XXXXXXX' },
        { name:'email',         label:'Email',         type:'email',   placeholder:'email@example.com' },
        { name:'date_of_birth', label:'Date of Birth', type:'date' },
        { name:'gender',        label:'Gender',        type:'select',  options:[{value:'Male',label:'Male'},{value:'Female',label:'Female'},{value:'Other',label:'Other'}] },
        { name:'address',       label:'Address',       type:'textarea',placeholder:'Full address', fullWidth:true },
      ]}
    />
  );
}
