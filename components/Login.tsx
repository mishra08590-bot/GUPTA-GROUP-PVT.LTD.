
import React, { useState, useEffect } from 'react';
import { Worker, QCCategory } from '../types';
import { Lock, User, ShieldCheck, ArrowLeft, Users, Zap, Smartphone, ArrowRight, RefreshCw, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface LoginProps {
  workers: Worker[];
  onLogin: (user: Worker) => void;
}

type LoginStage = 'choice' | 'identity' | 'otp' | 'admin_pass';

const Login: React.FC<LoginProps> = ({ workers, onLogin }) => {
  const [stage, setStage] = useState<LoginStage>('choice');
  const [targetRole, setTargetRole] = useState<'admin' | 'worker'>('worker');
  const [mobileOrId, setMobileOrId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [foundUser, setFoundUser] = useState<Worker | null>(null);
  const [showSmsMock, setShowSmsMock] = useState(false);

  useEffect(() => {
    let interval: any;
    if (stage === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [stage, timer]);

  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

  const sendSmsLogic = async (number: string, code: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setShowSmsMock(true);
        setTimeout(() => setShowSmsMock(false), 8000);
        resolve(true);
      }, 1200);
    });
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(async () => {
      if (targetRole === 'admin') {
        if (mobileOrId.toLowerCase() === 'punit') {
          setStage('admin_pass');
        } else {
          setError('ADMIN ID NOT RECOGNIZED');
        }
      } else {
        const user = workers.find(w => w.mobileNumber === mobileOrId || w.employeeCode === mobileOrId);
        if (user) {
          const newCode = generateNewOtp();
          setFoundUser(user);
          await sendSmsLogic(user.mobileNumber, newCode);
          setStage('otp');
          setTimer(60);
        } else {
          setError('MOBILE NUMBER NOT REGISTERED');
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const verifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    setIsLoading(true);
    
    setTimeout(() => {
      if (fullOtp === generatedOtp) {
        if (foundUser) onLogin(foundUser);
      } else {
        setError('INVALID OTP');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'SAG@123') {
      onLogin({
        id: 'admin-punit',
        name: 'Punit (Admin)',
        mobileNumber: 'MASTER',
        employeeCode: 'ADM-GGC-001',
        department: 'Management',
        joinDate: '2025-01-01',
        status: 'active',
        role: 'admin',
        permissions: Object.values(QCCategory) as QCCategory[],
        canViewHistory: true
      });
    } else {
      setError('SECURITY KEY MISMATCH');
    }
  };

  return (
    <div className="relative w-full">
      {showSmsMock && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[3000] w-[85%] max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 animate-fadeIn ring-1 ring-slate-200 cursor-pointer" onClick={() => setShowSmsMock(false)}>
          <div className="flex items-start gap-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white">
              <MessageSquare size={18} />
            </div>
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Now</span>
                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
              </div>
              <p className="text-[11px] font-black text-slate-900 uppercase">GGC Security</p>
              <p className="text-[12px] font-medium text-slate-600 mt-1">
                OTP: <span className="font-black text-indigo-600 text-lg bg-indigo-50 px-2 rounded-lg">{generatedOtp}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-white rounded-[3rem] shadow-2xl p-10 animate-fadeIn border border-slate-50 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2.5 ${targetRole === 'admin' ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
        
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => { setStage('choice'); setError(''); setMobileOrId(''); setOtp(['','','','','','']); }}
            className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
          >
            <ArrowLeft size={16} />
          </button>
          <BrandLogo size="sm" showText={false} />
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500" />
            <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">{error}</p>
          </div>
        )}

        {stage === 'choice' && (
          <div className="animate-fadeIn">
            <div className="text-center mb-10">
              <BrandLogo size="md" className="mb-6" />
              <h1 className="text-xl font-black uppercase tracking-widest text-slate-950 mt-4 leading-none italic">Gateway</h1>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mt-4">Select Protocol</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => { setTargetRole('admin'); setStage('identity'); }}
                className="group flex flex-col items-center p-8 bg-slate-950 rounded-3xl border border-transparent hover:border-amber-500 transition-all shadow-xl"
              >
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all">
                   <ShieldCheck size={28} />
                </div>
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Admin</span>
              </button>

              <button 
                onClick={() => { setTargetRole('worker'); setStage('identity'); }}
                className="group flex flex-col items-center p-8 bg-white border border-slate-100 rounded-3xl hover:border-indigo-600 transition-all shadow-lg"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   <Smartphone size={28} />
                </div>
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Workforce</span>
              </button>
            </div>
          </div>
        )}

        {(stage === 'identity' || stage === 'admin_pass') && (
          <form onSubmit={stage === 'identity' ? handleIdentitySubmit : handleAdminLogin} className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">{stage === 'identity' ? 'Identity' : 'Authorization'}</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                {stage === 'identity' ? (targetRole === 'admin' ? 'Manager ID' : 'Registered Mobile') : 'Master Key Required'}
              </p>
            </div>

            <div className="relative group mb-8">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                {stage === 'identity' ? (targetRole === 'admin' ? <ShieldCheck size={20} /> : <Smartphone size={20} />) : <Lock size={20} />}
              </div>
              <input 
                type={stage === 'admin_pass' ? 'password' : 'text'}
                autoFocus
                value={stage === 'identity' ? mobileOrId : password}
                onChange={e => stage === 'identity' ? setMobileOrId(e.target.value) : setPassword(e.target.value)}
                placeholder={stage === 'identity' ? (targetRole === 'admin' ? 'Ex: PUNIT' : 'Ex: 9876543210') : 'Password'}
                className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-transparent rounded-2xl outline-none focus:border-indigo-600 focus:bg-white transition-all font-black text-slate-950 uppercase text-md shadow-inner"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-6 bg-indigo-600 hover:bg-slate-950 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={18} /> : (
                <>
                  Verify Protocol <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {stage === 'otp' && (
          <form onSubmit={verifyOtp} className="animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-lg font-black uppercase tracking-tight text-slate-950">Confirm OTP</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Mobile: +91 {mobileOrId}</p>
            </div>

            <div className="flex justify-between gap-2.5 mb-8">
              {otp.map((digit, idx) => (
                <input 
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  className="w-12 h-16 bg-slate-50 border border-slate-100 focus:border-indigo-600 rounded-xl text-center font-black text-xl outline-none transition-all"
                />
              ))}
            </div>

            <button 
              type="submit" 
              disabled={isLoading || otp.includes('')}
              className="w-full py-6 bg-indigo-600 disabled:bg-slate-200 hover:bg-slate-950 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] transition-all shadow-xl"
            >
              {isLoading ? <RefreshCw className="animate-spin" size={18} /> : 'Finalize Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
