
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QCCategory, QCRecord, Worker } from '../types';
import * as XLSX from 'xlsx';
import { 
  FileText, ArrowRight, Activity, Globe, Monitor, 
  Box, Truck, UserCheck, ShieldCheck, 
  CheckCircle2, XCircle, UserPlus, 
  Zap, Search, Trash2, Edit3,
  MessageCircle, FileSpreadsheet,
  Layers, Database, Clock
} from 'lucide-react';
import BrandLogo from './BrandLogo';

interface DashboardProps {
  records: QCRecord[];
  workers: Worker[];
  currentUser: Worker;
  onDeleteRecord: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ records, currentUser, onDeleteRecord, workers }) => {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');

  const allCategories = [
    { id: QCCategory.COATING_ADHESION, label: "RQC-BOP-Inco (Coating Adhesion)", icon: <Activity size={20} />, bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { id: QCCategory.SEGREGATION_REWORK, label: "Segregation / Rework Monitoring", icon: <Layers size={20} />, bgColor: "bg-orange-50", textColor: "text-orange-600" },
    { id: QCCategory.WITHOUT_INVOICE, label: "Without Invoice Register", icon: <Truck size={20} />, bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { id: QCCategory.SAMPLING_PART, label: "Sampling Part Notebook", icon: <Box size={20} />, bgColor: "bg-green-50", textColor: "text-green-600" },
    { id: QCCategory.EXPORT_ONLY, label: "Export Only Data Register", icon: <Globe size={20} />, bgColor: "bg-teal-50", textColor: "text-teal-600" }
  ];

  const visibleCategories = currentUser.role === 'admin' 
    ? allCategories 
    : allCategories.filter(cat => currentUser.permissions.includes(cat.id));

  // Access Control: Only Admin or Staff see the historical ledger
  const showHistory = currentUser.role === 'admin' || currentUser.role === 'staff' || currentUser.canViewHistory;
  const isAdmin = currentUser.role === 'admin';

  const filteredRecords = records.filter(rec => {
    const searchLower = globalSearch.toLowerCase();
    return rec.partName?.toLowerCase().includes(searchLower) || 
           rec.category?.toLowerCase().includes(searchLower) || 
           rec.workerName?.toLowerCase().includes(searchLower) ||
           rec.partNo?.toLowerCase().includes(searchLower);
  }).sort((a, b) => b.timestamp - a.timestamp);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(records.map(r => ({
      Date: r.date,
      Category: r.category,
      Operator: r.workerName,
      'Part Name': r.partName,
      'Part No': r.partNo,
      'Total Qty': r.customFields?.invoiceQty || 0,
      'OK Qty': r.customFields?.okQty || 0,
      'NG Qty': r.customFields?.ngQty || 0,
      'Hours': r.customFields?.duration || 0,
      Result: r.result,
      Remarks: r.remarks
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "QC_Ledger");
    XLSX.writeFile(wb, "Gupta_Group_QC_Data.xlsx");
  };

  return (
    <div className="space-y-6 md:space-y-12 animate-fadeIn max-w-[1600px] mx-auto">
      
      {/* Quick Stats & Welcome */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="md:col-span-2 bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 md:gap-10 shadow-sm">
          <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center text-white shadow-xl ${isAdmin ? 'bg-amber-500' : 'bg-indigo-600'}`}>
             <UserCheck size={32} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter">{currentUser.name}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
              {currentUser.role === 'admin' ? 'MASTER ADMINISTRATOR' : (currentUser.id === 'default-worker' ? 'FACTORY WORKER' : currentUser.role)} • {currentUser.employeeCode}
            </p>
          </div>
        </div>
        
        <div className="bg-slate-900 p-6 md:p-10 rounded-[2.5rem] text-white flex flex-col justify-center shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Global Data Entry</p>
              <h3 className="text-3xl font-black">{records.length} Records</h3>
            </div>
            <Database className="text-white/20" size={40} />
          </div>
        </div>
      </div>

      {/* Main Grid - Registry Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-8">
        {visibleCategories.map((cat) => (
          <button 
            key={cat.id} 
            onClick={() => navigate(`/qc-entry/${encodeURIComponent(cat.id)}`)}
            className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 hover:border-indigo-600 hover:shadow-xl transition-all group text-left"
          >
            <div className={`w-14 h-14 ${cat.bgColor} ${cat.textColor} rounded-2xl flex items-center justify-center mb-8 border border-white shadow-sm group-hover:scale-110 transition-transform`}>
              {cat.icon}
            </div>
            <h3 className="text-[13px] md:text-[14px] font-black text-slate-950 uppercase tracking-tight leading-tight min-h-[40px]">{cat.label}</h3>
            <div className="mt-8 flex items-center justify-between text-indigo-600">
               <span className="text-[10px] font-black uppercase tracking-widest">Start Registry</span>
               <ArrowRight size={18} />
            </div>
          </button>
        ))}
      </div>

      {/* Ledger - Restricted to Admin/Staff */}
      {showHistory && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden mt-10">
          <div className="p-6 md:p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl md:text-2xl font-black text-slate-950 uppercase tracking-tight">Master Ledger</h2>
              {isAdmin && (
                <button onClick={exportToExcel} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center gap-2">
                  <FileSpreadsheet size={18} />
                  <span className="text-[10px] font-black uppercase">Export</span>
                </button>
              )}
            </div>
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                placeholder="Search by Part, Worker or ID..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl border border-transparent focus:border-indigo-600 outline-none font-black text-[11px] uppercase shadow-inner"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
              <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <tr>
                  <th className="px-10 py-6">Timestamp / Date</th>
                  <th className="px-10 py-6">Personnel</th>
                  <th className="px-10 py-6">Part Description</th>
                  <th className="px-10 py-6 text-center">Total Qty</th>
                  <th className="px-10 py-6 text-center text-green-600">OK</th>
                  <th className="px-10 py-6 text-center text-red-600">NG</th>
                  <th className="px-10 py-6 text-center"><Clock size={12} className="inline mr-1"/>Hours</th>
                  <th className="px-10 py-6 text-center">Result</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-10 py-6">
                      <div className="text-[11px] font-black text-slate-950">{rec.date}</div>
                      <div className="text-[9px] text-slate-400 font-bold">{new Date(rec.timestamp).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="text-[12px] font-black text-slate-900 uppercase">{rec.workerName}</div>
                      <div className="text-[9px] text-indigo-500 font-black">{rec.category.split('(')[0]}</div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="text-[12px] font-black uppercase text-slate-950">{rec.partName}</div>
                      <div className="text-[10px] font-bold text-slate-400">{rec.partNo || 'N/A'}</div>
                    </td>
                    <td className="px-10 py-6 text-center font-black text-slate-600">{rec.customFields?.invoiceQty || '0'}</td>
                    <td className="px-10 py-6 text-center font-black text-green-600">{rec.customFields?.okQty || '0'}</td>
                    <td className="px-10 py-6 text-center font-black text-red-600">{rec.customFields?.ngQty || '0'}</td>
                    <td className="px-10 py-6 text-center font-black text-indigo-600 bg-indigo-50/20">{rec.customFields?.duration || '0.0'}</td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black ${rec.result === 'OK' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {rec.result}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex justify-end gap-2">
                          {isAdmin && (
                            <button 
                              onClick={() => navigate(`/qc-entry/${encodeURIComponent(rec.category)}`)}
                              className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Edit Registry"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('GUPTA GROUP QC REPORT: ' + rec.partName + ' checked by ' + rec.workerName + ' | Total: ' + rec.customFields?.invoiceQty + ' | OK: ' + rec.customFields?.okQty + ' | NG: ' + rec.customFields?.ngQty + ' | Result: ' + rec.result)}`)} 
                            className="p-2.5 text-green-600 bg-green-50 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                          >
                            <MessageCircle size={16} />
                          </button>
                          {isAdmin && (
                            <button 
                              onClick={() => onDeleteRecord(rec.id)} 
                              className="p-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRecords.length === 0 && (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <Search size={48} className="text-slate-200" />
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching records found in database</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
