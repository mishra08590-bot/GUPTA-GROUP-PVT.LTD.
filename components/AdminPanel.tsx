
import React, { useState } from 'react';
import { Worker, UserRole, QCCategory } from '../types';
import { 
  UserPlus, Trash2, ShieldCheck, Users as UsersIcon, 
  CheckSquare, Square, UserCircle, 
  ArrowRightCircle, Smartphone
} from 'lucide-react';

interface AdminPanelProps {
  workers: Worker[];
  onAddWorker: (worker: Worker) => void;
  onDeleteWorker: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ workers, onAddWorker, onDeleteWorker }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [selectedPerms, setSelectedPerms] = useState<QCCategory[]>([]);

  const togglePerm = (cat: QCCategory) => {
    setSelectedPerms(prev => prev.includes(cat) ? prev.filter(p => p !== cat) : [...prev, cat]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) { alert("Invalid Mobile Number"); return; }
    
    const newWorker: Worker = {
      id: crypto.randomUUID(),
      name,
      mobileNumber: mobile,
      employeeCode: code,
      department: 'Operations',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
      role: role,
      password: password || undefined,
      permissions: selectedPerms,
      canViewHistory: role === 'staff'
    };
    onAddWorker(newWorker);
    setName(''); setCode(''); setMobile(''); setPassword(''); setSelectedPerms([]);
    alert("New Personnel Enrolled Successfully");
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-fadeIn max-w-[1400px] mx-auto pb-10">
      <div className="bg-slate-950 p-6 md:p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-indigo-600 rounded-2xl">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">Admin Control Hub</h1>
        </div>
        <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/5">
          <span className="text-sm font-black tracking-widest">{workers.length} Members Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-8">
               <UserPlus className="text-indigo-600" />
               <h2 className="text-lg font-black uppercase tracking-tight">Add Personnel</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField label="Full Name" value={name} onChange={setName} icon={<UserCircle size={18}/>} />
              <InputField label="Mobile No" value={mobile} onChange={setMobile} type="tel" icon={<Smartphone size={18}/>} />
              <InputField label="Employee Code" value={code} onChange={setCode} icon={<ShieldCheck size={18}/>} />
              
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Role Type</label>
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] uppercase outline-none focus:border-indigo-600">
                  <option value="worker">Worker</option>
                  <option value="staff">Staff/Admin</option>
                </select>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Register Access</p>
                <div className="grid grid-cols-1 gap-2">
                  {Object.values(QCCategory).map(cat => (
                    <button key={cat} type="button" onClick={() => togglePerm(cat)} className={`flex items-center justify-between p-4 rounded-xl border text-[9px] font-black uppercase transition-all ${selectedPerms.includes(cat) ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {cat}
                      {selectedPerms.includes(cat) ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-[12px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                Enroll New Member <ArrowRightCircle size={18} />
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center gap-4">
               <UsersIcon className="text-indigo-600" />
               <h2 className="text-lg font-black uppercase tracking-tight">Staff Registry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Personnel</th>
                    <th className="px-8 py-5">Role</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-all">
                      <td className="px-8 py-5">
                         <div className="font-black text-[13px] text-slate-950 uppercase">{w.name}</div>
                         <div className="text-[9px] font-black text-indigo-500 uppercase">{w.mobileNumber}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${w.role === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>{w.role}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <button onClick={() => onDeleteWorker(w.id)} className="p-3 text-red-600 bg-red-50 rounded-xl"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", icon }: any) => (
  <div className="space-y-2">
    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] outline-none focus:border-indigo-600" required />
    </div>
  </div>
);

export default AdminPanel;
