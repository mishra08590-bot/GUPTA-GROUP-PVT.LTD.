
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, Users, MessageSquare, Video, LogOut, ShieldCheck, LayoutDashboard, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import GridEditor from './components/GridEditor';
import ChatInterface from './components/ChatInterface';
import MeetingRoom from './components/MeetingRoom';
import Login from './components/Login';
import BrandLogo from './components/BrandLogo';
import { Worker, QCRecord, ChatMessage, QCCategory } from './types';

const DEFAULT_WORKER: Worker = {
  id: 'default-worker',
  name: 'WORKER',
  mobileNumber: '0000000000',
  employeeCode: 'GGC-WORKER',
  department: 'Production',
  joinDate: new Date().toISOString().split('T')[0],
  status: 'active',
  role: 'worker',
  permissions: [QCCategory.SEGREGATION_REWORK, QCCategory.COATING_ADHESION],
  canViewHistory: false
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Worker>(DEFAULT_WORKER);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [records, setRecords] = useState<QCRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const savedWorkers = localStorage.getItem('rqc_workers');
    const savedRecords = localStorage.getItem('rqc_records');
    const savedUser = localStorage.getItem('rqc_current_user');
    const savedMsgs = localStorage.getItem('rqc_chats');
    
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    if (savedMsgs) setMessages(JSON.parse(savedMsgs));
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => { localStorage.setItem('rqc_workers', JSON.stringify(workers)); }, [workers]);
  useEffect(() => { localStorage.setItem('rqc_records', JSON.stringify(records)); }, [records]);
  useEffect(() => { localStorage.setItem('rqc_chats', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { 
    if (currentUser.id !== 'default-worker') {
      localStorage.setItem('rqc_current_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const unreadCount = messages.filter(m => !m.isRead && m.receiverId === currentUser?.id).length;

  const handleLogin = (user: Worker) => {
    setCurrentUser(user);
    setShowLoginModal(false);
  };

  const deleteRecord = (id: string) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const addRecords = (newRecords: QCRecord[]) => {
    setRecords(prev => {
      const newIds = new Set(newRecords.map(r => r.id));
      const filtered = prev.filter(r => !newIds.has(r.id));
      return [...filtered, ...newRecords];
    });
  };

  const handleLogout = () => {
    setCurrentUser(DEFAULT_WORKER);
    localStorage.removeItem('rqc_current_user');
    window.location.hash = '/';
  };

  const NavContent = () => {
    const location = useLocation();
    return (
      <>
        <Link to="/" onClick={() => setShowChat(false)} className={`flex flex-col items-center gap-1 ${location.pathname === '/' && !showChat ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
        </Link>
        {currentUser.role === 'admin' && (
          <Link to="/admin" onClick={() => setShowChat(false)} className={`flex flex-col items-center gap-1 ${location.pathname === '/admin' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <Users size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Admin</span>
          </Link>
        )}
        <button onClick={() => setShowChat(!showChat)} className={`flex flex-col items-center gap-1 relative ${showChat ? 'text-indigo-600' : 'text-slate-400'}`}>
          <MessageSquare size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Chat</span>
          {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full text-[8px] flex items-center justify-center text-white font-bold">{unreadCount}</span>}
        </button>
        <button onClick={() => setShowMeeting(true)} className="flex flex-col items-center gap-1 text-slate-400">
          <Video size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Meet</span>
        </button>
      </>
    );
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans pb-20 md:pb-0">
        <nav className="bg-white border-b border-slate-100 px-4 md:px-8 h-20 md:h-24 sticky top-0 z-[100] flex items-center justify-between shadow-sm">
          <Link to="/" onClick={() => setShowChat(false)} className="flex items-center gap-3">
            <BrandLogo size="sm" showText={false} />
            <div className="flex flex-col">
              <span className="font-black text-sm md:text-xl tracking-tighter text-slate-950 leading-none">GUPTA GROUP</span>
              <span className="text-[7px] md:text-[9px] font-black text-indigo-600 uppercase tracking-widest">PVT. LTD.</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            {currentUser.id === 'default-worker' ? (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2.5 md:px-8 md:py-3.5 bg-indigo-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-3 md:gap-5">
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black uppercase text-slate-900 leading-none">{currentUser.name}</p>
                  <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-tighter">{currentUser.employeeCode}</span>
                </div>
                <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 h-20 z-[200] flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <NavContent />
        </div>

        {showLoginModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fadeIn">
            <div className="relative w-full max-w-md">
              <Login workers={workers} onLogin={handleLogin} />
              <button onClick={() => setShowLoginModal(false)} className="mt-6 mx-auto block text-white/50 text-[10px] font-black uppercase tracking-widest">Close</button>
            </div>
          </div>
        )}

        {showMeeting && <MeetingRoom onEnd={() => setShowMeeting(false)} workers={workers} />}
        
        <main className="flex-grow">
          <div className="container mx-auto py-6 md:py-12 px-4 md:px-6">
            {showChat ? (
              <ChatInterface workers={workers} currentUser={currentUser} messages={messages} setMessages={setMessages} />
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard records={records} workers={workers} currentUser={currentUser} onDeleteRecord={deleteRecord} />} />
                <Route path="/admin" element={currentUser.role === 'admin' ? <AdminPanel workers={workers} onAddWorker={w => setWorkers(prev => [...prev, w])} onDeleteWorker={id => setWorkers(prev => prev.filter(w => w.id !== id))} /> : <Navigate to="/" />} />
                <Route path="/qc-entry/:category" element={<GridEditor workers={workers} onAddRecords={addRecords} existingRecords={records} currentUser={currentUser} />} />
              </Routes>
            )}
          </div>
        </main>

        <footer className="hidden md:block bg-white border-t border-slate-100 py-12 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Gupta Group PVT. LTD. • 2025</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
