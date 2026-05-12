// src/pages/Doctors/DoctorList.jsx
import { z } from 'zod';
import CrudPage from '../../components/UI/CrudPage';
import { doctorsAPI } from '../../api';

const schema = z.object({
  name:           z.string().min(2, 'Min 2 chars'),
  specialization: z.string().optional(),
  license_number: z.string().min(1, 'License required'),
  phone:          z.string().optional(),
  hospital:       z.string().optional(),
});

export default function DoctorList() {
  return (
    <CrudPage
      title="Doctor"
      api={doctorsAPI}
      schema={schema}
      defaultValues={{ name:'', specialization:'', license_number:'', phone:'', hospital:'' }}
      getId={d => d.doctor_id}
      softDelete={true}
      searchPlaceholder="Search doctors…"
      columns={[
        { key:'name',           label:'Name',           render: d => <div><p className="font-medium dark:text-white">{d.name}</p><p className="text-xs text-gray-400">{d.specialization || '—'}</p></div> },
        { key:'license_number', label:'License #' },
        { key:'phone',          label:'Phone',          render: d => d.phone || '—' },
        { key:'hospital',       label:'Hospital',       render: d => d.hospital || '—' },
        { key:'is_active',      label:'Status',         render: d => d.is_active ? <span className="text-xs font-semibold text-green-600">Active</span> : <span className="text-xs text-gray-400">Inactive</span> },
      ]}
      formFields={[
        { name:'name',           label:'Full Name',      required:true,  placeholder:'Dr. Ahmed Khan' },
        { name:'specialization', label:'Specialization', placeholder:'e.g. Cardiologist' },
        { name:'license_number', label:'PMDC License #', required:true,  placeholder:'PMDC-12345' },
        { name:'phone',          label:'Phone',          placeholder:'03XX-XXXXXXX' },
        { name:'hospital',       label:'Hospital',       placeholder:'City Hospital', fullWidth:true },
      ]}
    />
  );
}
