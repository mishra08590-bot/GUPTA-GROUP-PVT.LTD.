
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QCCategory, Worker, QCRecord } from '../types';
import { ArrowLeft, Save, Camera, X, Box, AlertTriangle, FileText, Package, Truck } from 'lucide-react';

interface QCFormProps {
  workers: Worker[];
  onAddRecord: (record: QCRecord) => void;
}

const QCForm: React.FC<QCFormProps> = ({ workers, onAddRecord }) => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const decodedCategory = decodeURIComponent(category || '') as QCCategory;

  const [formData, setFormData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    partName: '',
    partNo: '',
    workerId: '',
    result: 'OK',
    remarks: '',
    customFields: {
      unit: 'Pcs',
      invoiceDate: new Date().toISOString().split('T')[0],
      mrrDate: new Date().toISOString().split('T')[0],
      totalQty: '',
      acceptedQty: '',
      rejectedQty: '',
      vendorName: '',
      invoiceNo: '',
      mrrNo: '',
      batchNo: ''
    }
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const updateField = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateCustom = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      customFields: { ...prev.customFields, [key]: value }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        updateCustom('evidenceImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for photo if NG (Kharab part)
    if (formData.result === 'NG' && !previewImage) {
      if (!window.confirm("Kharab part ki photo nahi li gayi hai. Kya aap bina photo ke save karna chahte hain?")) {
        return;
      }
    }

    const selectedWorker = workers.find(w => w.id === formData.workerId);
    const newRecord: QCRecord = {
      id: crypto.randomUUID(),
      category: decodedCategory,
      ...formData,
      workerName: selectedWorker?.name || 'Unknown',
      timestamp: Date.now()
    };

    onAddRecord(newRecord);
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn pb-16 px-4">
      <button onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition font-black text-xs uppercase tracking-widest">
        <ArrowLeft size={18} /> Exit Registry
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-10 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-4 bg-indigo-600 rounded-2xl">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter leading-tight">
                {decodedCategory.split('NOTEBOOK')[0]}
              </h1>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mt-1">Industrial Production Log System</p>
            </div>
          </div>
          <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/5 text-center">
            <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Status</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Excel Export Enabled</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          
          {/* Section 1: Inward & Invoice Details */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-2 text-xs font-black text-blue-600 uppercase tracking-widest border-l-4 border-blue-600 pl-4">
              <Truck size={18} /> Section A: Inward & Invoice Data
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <InputField label="VENDOR NAME" value={formData.customFields.vendorName} onChange={v => updateCustom('vendorName', v)} placeholder="Supplier ka naam" required />
              <InputField label="INVOICE NO." value={formData.customFields.invoiceNo} onChange={v => updateCustom('invoiceNo', v)} placeholder="Exp: 2025/104" required />
              <InputField label="INVOICE DATE" type="date" value={formData.customFields.invoiceDate} onChange={v => updateCustom('invoiceDate', v)} />
              <InputField label="MRR NO." value={formData.customFields.mrrNo} onChange={v => updateCustom('mrrNo', v)} placeholder="Material Receipt No" />
            </div>
          </div>

          {/* Section 2: Part Details */}
          <div className="space-y-6">
            <h2 className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest border-l-4 border-indigo-600 pl-4">
              <Package size={18} /> Section B: Part Technical Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <InputField label="PART NAME" value={formData.partName} onChange={v => updateField('partName', v)} placeholder="As per drawing name" required />
              <InputField label="PART NO. / DRG NO." value={formData.partNo} onChange={v => updateField('partNo', v)} placeholder="Ex: PT-442" />
              <InputField label="BATCH / HEAT NO." value={formData.customFields.batchNo} onChange={v => updateCustom('batchNo', v)} placeholder="Ex: BH-09" required />
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">OPERATOR / CHECKER</label>
                <select 
                  required 
                  value={formData.workerId} 
                  onChange={e => updateField('workerId', e.target.value)} 
                  className="form-input-custom text-sm font-bold text-gray-700 h-[52px]"
                >
                  <option value="">Select Staff</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.employeeCode})</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Quantity & QC Result */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-4">
            <div className="space-y-8">
              <h2 className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase tracking-widest border-l-4 border-slate-800 pl-4">
                Section C: Quantity & Result
              </h2>
              <div className="grid grid-cols-3 gap-6">
                <InputField label="INVOICE QTY" type="number" value={formData.customFields.totalQty} onChange={v => updateCustom('totalQty', v)} required />
                <InputField label="ACCEPTED QTY" type="number" value={formData.customFields.acceptedQty} onChange={v => updateCustom('acceptedQty', v)} />
                <InputField label="REJECTED QTY" type="number" value={formData.customFields.rejectedQty} onChange={v => updateCustom('rejectedQty', v)} />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">QC STATUS</label>
                <div className="flex gap-4">
                  <button type="button" onClick={() => updateField('result', 'OK')} className={`flex-1 py-8 rounded-3xl font-black text-sm uppercase tracking-widest transition-all border-2 ${formData.result === 'OK' ? 'bg-green-600 border-green-700 text-white shadow-xl shadow-green-100' : 'bg-white border-gray-100 text-gray-400 hover:border-green-200'}`}>
                    OK (Pass)
                  </button>
                  <button type="button" onClick={() => updateField('result', 'NG')} className={`flex-1 py-8 rounded-3xl font-black text-sm uppercase tracking-widest transition-all border-2 ${formData.result === 'NG' ? 'bg-red-600 border-red-700 text-white shadow-xl shadow-red-100' : 'bg-white border-gray-100 text-gray-400 hover:border-red-200'}`}>
                    NG (Kharab)
                  </button>
                </div>
              </div>
              
              <InputField label="REMARKS / DEFECT DETAIL" value={formData.remarks} onChange={v => updateField('remarks', v)} placeholder="Kharabi ka karan likhein..." />
            </div>

            <div className="space-y-6">
               <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${formData.result === 'NG' ? 'text-red-600' : 'text-gray-800'}`}>
                 <Camera size={20} /> {formData.result === 'NG' ? 'Kharab Part ki Photo (Jaruri)' : 'Evidence Photo'}
               </h3>
               <div 
                 className={`relative h-80 rounded-[2.5rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
                   formData.result === 'NG' ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200 hover:border-indigo-400'
                 }`}
                 onClick={() => fileInputRef.current?.click()}
               >
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                 {previewImage ? (
                   <>
                    <img src={previewImage} className="w-full h-full object-cover" />
                    <button type="button" onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }} className="absolute top-6 right-6 bg-red-500 text-white p-2 rounded-full shadow-lg"><X size={20}/></button>
                   </>
                 ) : (
                   <div className="text-center">
                     <Camera className={`mx-auto mb-4 ${formData.result === 'NG' ? 'text-red-600' : 'text-indigo-400'}`} size={48} />
                     <p className={`text-[10px] font-black uppercase tracking-widest ${formData.result === 'NG' ? 'text-red-500' : 'text-gray-400'}`}>
                        {formData.result === 'NG' ? 'Capture Defective Part' : 'Capture Sample Photo'}
                     </p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          <div className="pt-12">
            <button 
              type="submit" 
              className={`w-full py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] transition-all shadow-2xl ${
                formData.result === 'NG' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
              } text-white`}
            >
              <Save size={20} className="inline mr-3" /> Save Row To Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", required = false, placeholder = "" }: any) => (
  <div className="flex flex-col">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{label}</label>
    <input
      type={type}
      required={required}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || label}
      className="form-input-custom text-sm font-bold text-gray-700 h-[52px]"
    />
  </div>
);

export default QCForm;
