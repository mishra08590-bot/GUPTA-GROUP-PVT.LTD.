
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QCCategory, Worker, QCRecord } from '../types';
import { ArrowLeft, Save, Camera, Plus, Trash2, Image as ImageIcon, ChevronRight, Clock } from 'lucide-react';

interface GridEditorProps {
  workers: Worker[];
  onAddRecords: (records: QCRecord[]) => void;
  existingRecords: QCRecord[];
  currentUser: Worker;
}

const GridEditor: React.FC<GridEditorProps> = ({ workers, onAddRecords, existingRecords, currentUser }) => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const decodedCategory = decodeURIComponent(category || '') as QCCategory;
  
  const isStaff = currentUser.role === 'staff';
  const isAdmin = currentUser.role === 'admin';
  const canModify = isAdmin || (!isStaff && currentUser.id !== 'default-worker');

  const [rows, setRows] = useState<any[]>([]);
  const [activePhotoRow, setActivePhotoRow] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser.role !== 'admin' && currentUser.id !== 'default-worker' && !currentUser.permissions.includes(decodedCategory)) {
      alert("Unauthorized Access. Please login with valid credentials."); 
      navigate('/'); 
      return;
    }
    
    // Privacy Logic: 
    // - Admin and Staff can see and EDIT history directly in this grid.
    // - Workers only see an empty form to fill fresh entries (cannot see previous work).
    const history = (isAdmin || isStaff) 
      ? existingRecords.filter(r => r.category === decodedCategory).map(r => ({ ...r.customFields, id: r.id }))
      : [];
      
    setRows(history.length > 0 ? history : (canModify ? [createEmptyRow()] : []));
  }, [decodedCategory, currentUser, existingRecords]);

  // Logic: Calculate hours difference between HH:mm strings
  function calculateHours(start: string, end: string) {
    if (!start || !end) return '0.0';
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diffMinutes = (eH * 60 + eM) - (sH * 60 + sM);
    if (diffMinutes < 0) diffMinutes += 1440; // Handles night shifts crossing 00:00
    return (diffMinutes / 60).toFixed(1);
  }

  function createEmptyRow() {
    return {
      id: crypto.randomUUID(), 
      invoiceDate: new Date().toISOString().split('T')[0], 
      mrNo: '', 
      partName: '', 
      partNo: '', 
      invoiceQty: '', 
      supplierName: '', 
      reasonOfSegregation: '', 
      segregationArea: 'BOP', 
      startTime: '', 
      endTime: '', 
      duration: '0.0', 
      okQty: '', 
      reworkQty: '', 
      reworkHrs: '', 
      ngQty: '0', // Default to 0 as requested
      checkedBy: 'BOP', 
      checkerId: currentUser.id === 'default-worker' ? '' : currentUser.id, 
      remarks: '', 
      evidenceImage: null
    };
  }

  const addRow = () => { if (canModify) setRows([...rows, createEmptyRow()]); };
  const removeRow = (index: number) => { if (isAdmin && window.confirm("Delete this entry permanently?")) setRows(rows.filter((_, i) => i !== index)); };
  
  const updateRow = (index: number, field: string, value: any) => { 
    if (canModify) { 
      const newRows = [...rows]; 
      newRows[index][field] = value; 
      
      // Auto-calculate duration if times change
      if (field === 'startTime' || field === 'endTime') {
        newRows[index].duration = calculateHours(newRows[index].startTime, newRows[index].endTime);
      }
      
      setRows(newRows); 
    } 
  };

  const handleSave = () => {
    if (!canModify) return;
    
    // Filter out rows that haven't been touched
    const populatedRows = rows.filter(r => r.partName || r.partNo || r.invoiceQty);
    if (populatedRows.length === 0) {
      alert("Please fill at least one row before saving.");
      return;
    }

    const newRecords: QCRecord[] = rows.map(row => ({
      id: row.id, 
      category: decodedCategory, 
      date: row.invoiceDate, 
      partName: row.partName || 'UNNAMED PART', 
      partNo: row.partNo, 
      workerId: row.checkerId,
      workerName: workers.find(w => w.id === row.checkerId)?.name || currentUser.name, 
      result: parseInt(row.ngQty || '0') > 0 ? 'NG' : 'OK',
      remarks: row.remarks, 
      timestamp: Date.now(), 
      customFields: { ...row }
    }));
    
    onAddRecords(newRecords);
    alert("Registry Synchronized Successfully.");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-100 md:p-4 font-sans flex flex-col">
      <div className="flex-grow bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        {/* Registry Top Bar */}
        <div className="bg-[#1e40af] text-white p-4 md:p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/10 rounded-xl transition-all"><ArrowLeft size={18} /></button>
            <div>
               <h1 className="font-black text-[10px] md:text-xs uppercase tracking-widest">{decodedCategory}</h1>
               <span className="text-[8px] font-black uppercase opacity-60 italic">
                 {isAdmin ? 'ADMIN DATA CONSOLE' : 'WORKER PRODUCTION ENTRY'}
               </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-white text-[#1e40af] px-4 md:px-8 py-2 md:py-3 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              Save Records
            </button>
          </div>
        </div>

        {/* Swipe Hint for Mobile */}
        <div className="md:hidden bg-indigo-50 px-4 py-2 flex items-center justify-between border-b border-indigo-100">
           <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Swipe left to enter Qty & Time</span>
           <ChevronRight size={14} className="text-indigo-600 animate-pulse" />
        </div>

        {/* Spreadsheet Body */}
        <div className="flex-grow overflow-auto relative">
          <table className="w-full border-collapse text-[10px] min-w-[1700px]">
            <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm">
              <tr className="font-black uppercase text-slate-400">
                <th className="border-b border-r border-slate-200 p-3 w-12 text-center">Sr</th>
                <th className="border-b border-r border-slate-200 p-3 w-32">Entry Date</th>
                <th className="border-b border-r border-slate-200 p-3 w-40">Part Name</th>
                <th className="border-b border-r border-slate-200 p-3 w-28">Part No</th>
                <th className="border-b border-r border-slate-200 p-3 w-28">Start Time</th>
                <th className="border-b border-r border-slate-200 p-3 w-28">End Time</th>
                <th className="border-b border-r border-slate-200 p-3 w-20 text-center bg-indigo-50 text-indigo-600"><Clock size={12} className="inline mr-1"/>Hours</th>
                <th className="border-b border-r border-slate-200 p-3 w-20 text-center text-slate-900">Total Qty</th>
                <th className="border-b border-r border-slate-200 p-3 w-20 text-center text-green-600">OK Qty</th>
                <th className="border-b border-r border-slate-200 p-3 w-20 text-center text-red-600">NG Qty</th>
                <th className="border-b border-r border-slate-200 p-3 w-48">Remarks / Notes</th>
                <th className="border-b border-r border-slate-200 p-3 w-16 text-center">Photo</th>
                <th className="border-b border-slate-200 p-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="border-r border-slate-100 p-3 text-center bg-slate-50/50 font-black text-slate-400">{idx + 1}</td>
                  <td className="border-r border-slate-100 p-0"><input type="date" value={row.invoiceDate} onChange={e => updateRow(idx, 'invoiceDate', e.target.value)} className="grid-input" disabled={!canModify} /></td>
                  <td className="border-r border-slate-100 p-0"><input type="text" value={row.partName} onChange={e => updateRow(idx, 'partName', e.target.value)} className="grid-input font-black uppercase" disabled={!canModify} placeholder="Part Description..." /></td>
                  <td className="border-r border-slate-100 p-0"><input type="text" value={row.partNo} onChange={e => updateRow(idx, 'partNo', e.target.value)} className="grid-input" disabled={!canModify} /></td>
                  <td className="border-r border-slate-100 p-0"><input type="time" value={row.startTime} onChange={e => updateRow(idx, 'startTime', e.target.value)} className="grid-input" disabled={!canModify} /></td>
                  <td className="border-r border-slate-100 p-0"><input type="time" value={row.endTime} onChange={e => updateRow(idx, 'endTime', e.target.value)} className="grid-input" disabled={!canModify} /></td>
                  <td className="border-r border-slate-100 p-0 bg-indigo-50/40 text-center font-black text-indigo-700">{row.duration}</td>
                  <td className="border-r border-slate-100 p-0"><input type="number" value={row.invoiceQty} onChange={e => updateRow(idx, 'invoiceQty', e.target.value)} className="grid-input text-center font-black" disabled={!canModify} /></td>
                  <td className="border-r border-slate-100 p-0"><input type="number" value={row.okQty} onChange={e => updateRow(idx, 'okQty', e.target.value)} className="grid-input text-center text-green-600 font-black" disabled={!canModify} /></td>
                  <td className="border-r border-slate-100 p-0"><input type="number" value={row.ngQty} onChange={e => updateRow(idx, 'ngQty', e.target.value)} className={`grid-input text-center font-black ${parseInt(row.ngQty || '0') > 0 ? 'bg-red-50 text-red-600' : ''}`} disabled={!canModify} /></td>
                  <td className="border-r border-slate-100 p-0"><input type="text" value={row.remarks} onChange={e => updateRow(idx, 'remarks', e.target.value)} className="grid-input" disabled={!canModify} /></td>
                  <td className="border-r border-slate-100 p-2 text-center">
                    <button onClick={() => { setActivePhotoRow(idx); fileInputRef.current?.click(); }} disabled={!canModify} className={`p-2 rounded-lg ${row.evidenceImage ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {row.evidenceImage ? <ImageIcon size={14} /> : <Camera size={14} />}
                    </button>
                  </td>
                  <td className="p-2 text-center">{isAdmin && <button onClick={() => removeRow(idx)} className="text-red-300 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions Bar */}
        <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 flex items-center shrink-0">
          <button onClick={addRow} className="bg-white border border-slate-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-95">
            <Plus size={16} /> Add New Row
          </button>
        </div>
      </div>

      {/* Hidden File Input for Capture */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activePhotoRow !== null) {
            const reader = new FileReader();
            reader.onloadend = () => { updateRow(activePhotoRow, 'evidenceImage', reader.result as string); setActivePhotoRow(null); };
            reader.readAsDataURL(file);
          }
      }} />

      <style>{`
        .grid-input { width: 100%; height: 100%; border: none; padding: 12px 10px; font-size: 11px; font-weight: 600; outline: none; background: transparent; }
        .grid-input:focus { background: white; box-shadow: inset 0 0 0 2px #1e40af; }
        .grid-input:disabled { cursor: not-allowed; opacity: 0.6; }
      `}</style>
    </div>
  );
};

export default GridEditor;
