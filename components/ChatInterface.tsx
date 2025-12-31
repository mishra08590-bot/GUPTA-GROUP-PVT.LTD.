
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Image as ImageIcon, FileText, Search, ShieldAlert, 
  ChevronRight, X, UserPlus, Trash2, Edit3, Download, Paperclip, 
  Lock
} from 'lucide-react';
import { ChatMessage, Worker, ChatFile } from '../types';

interface ChatInterfaceProps {
  workers: Worker[];
  currentUser: Worker;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ workers, currentUser, messages, setMessages }) => {
  const [activeChatId, setActiveChatId] = useState<string | 'group'>('group');
  const [searchTerm, setSearchTerm] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ChatFile | null>(null);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (activeChatId !== 'group') {
      const updated = messages.map(m => 
        (m.receiverId === currentUser.id && m.senderId === activeChatId) ? { ...m, isRead: true } : m
      );
      if (JSON.stringify(updated) !== JSON.stringify(messages)) {
        setMessages(updated);
      }
    }
  }, [messages, activeChatId]);

  const handleSendMessage = () => {
    if (!inputText.trim() && !selectedImage && !selectedFile) return;

    if (isEditing) {
      setMessages(messages.map(m => m.id === isEditing ? { ...m, text: inputText, isEdited: true } : m));
      setIsEditing(null);
      setInputText('');
      return;
    }

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: currentUser.id,
      receiverId: activeChatId,
      senderName: currentUser.name,
      text: inputText,
      image: selectedImage || undefined,
      file: selectedFile || undefined,
      timestamp: Date.now(),
      type: selectedFile ? 'file' : (selectedImage ? 'image' : 'text'),
      isRead: false
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setSelectedImage(null);
    setSelectedFile(null);
  };

  const deleteMessage = (id: string) => {
    if (window.confirm("Delete this message permanently?")) {
      setMessages(messages.map(m => m.id === id ? { 
        ...m, 
        isDeleted: true, 
        text: 'This message was deleted', 
        image: undefined, 
        file: undefined 
      } : m));
    }
  };

  const startEdit = (msg: ChatMessage) => {
    setIsEditing(msg.id);
    setInputText(msg.text);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          name: file.name,
          data: reader.result as string,
          type: file.type,
          size: file.size
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // STRICT PRIVACY FILTERING
  const filteredMessages = messages.filter(m => {
    // If it's a group chat, everyone sees it
    if (activeChatId === 'group') return m.receiverId === 'group';
    
    // For 1-on-1 chats, ONLY the sender and receiver can see it. 
    // No "Spy Mode" or Admin oversight allowed for private messages.
    return (m.senderId === currentUser.id && m.receiverId === activeChatId) ||
           (m.senderId === activeChatId && m.receiverId === currentUser.id);
  });

  const chatPartner = activeChatId === 'group' ? null : workers.find(w => w.id === activeChatId);
  
  const searchResults = searchTerm.trim().length < 1 ? [] : workers.filter(w => 
    w.id !== currentUser.id && 
    (w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     w.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeContacts = Array.from(new Set(
    messages
      .filter(m => m.receiverId === currentUser.id || m.senderId === currentUser.id)
      .filter(m => m.receiverId !== 'group')
      .map(m => m.senderId === currentUser.id ? m.receiverId : m.senderId)
  )).map(id => workers.find(w => w.id === id)).filter(Boolean) as Worker[];

  return (
    <div className="flex flex-col lg:flex-row h-[800px] bg-white rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar */}
      <div className="w-full lg:w-[380px] border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-8 bg-white border-b border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-6">Secured Messaging Hub</p>
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search Member..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl text-[12px] font-bold outline-none border-2 border-transparent focus:border-indigo-500 transition-all shadow-inner"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-72 overflow-y-auto p-2 animate-fadeIn z-50 absolute w-[calc(100%-4rem)] mt-4">
              <p className="text-[8px] font-black text-slate-300 uppercase p-4 tracking-widest border-b border-slate-50">Personnel Matches</p>
              {searchResults.map(w => (
                <button 
                  key={w.id} 
                  onClick={() => { setActiveChatId(w.id); setSearchTerm(''); }}
                  className="w-full p-4 flex items-center gap-4 hover:bg-indigo-50 rounded-2xl transition-all"
                >
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black">{w.name[0]}</div>
                  <div className="text-left">
                    <p className="text-[11px] font-black uppercase text-slate-800">{w.name}</p>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase">{w.employeeCode}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-3">
          <button 
            onClick={() => { setActiveChatId('group'); }}
            className={`w-full p-6 flex items-center gap-5 rounded-3xl transition-all ${activeChatId === 'group' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'hover:bg-white text-slate-700 shadow-sm border border-transparent hover:border-slate-200'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${activeChatId === 'group' ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-600'}`}>G</div>
            <div className="text-left">
              <h4 className="text-[11px] font-black uppercase tracking-widest">Main Workspace Group</h4>
              <p className={`text-[8px] font-bold uppercase opacity-60`}>Public Discussion</p>
            </div>
          </button>

          <div className="pt-4 pb-2 px-2 flex items-center justify-between">
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Private Threads</p>
            <Lock size={12} className="text-slate-200" />
          </div>

          {activeContacts.map(w => (
            <button 
              key={w.id}
              onClick={() => { setActiveChatId(w.id); }}
              className={`w-full p-5 flex items-center gap-4 rounded-3xl transition-all ${activeChatId === w.id ? 'bg-slate-900 text-white shadow-2xl' : 'hover:bg-white text-slate-600 border border-transparent hover:border-slate-100 shadow-sm'}`}
            >
              <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-black text-xs">{w.name[0]}</div>
              <div className="text-left">
                <h4 className="text-[10px] font-black uppercase tracking-widest">{w.name}</h4>
                <p className="text-[8px] font-bold opacity-40 uppercase">Secure 1:1 Link</p>
              </div>
            </button>
          ))}
          
          <div className="mt-auto p-4 bg-indigo-50/50 rounded-3xl border border-indigo-100">
             <div className="flex items-center gap-3 mb-2">
                <ShieldAlert size={14} className="text-indigo-600" />
                <span className="text-[8px] font-black text-indigo-900 uppercase tracking-widest">Privacy Protocol</span>
             </div>
             <p className="text-[8px] font-bold text-indigo-400 leading-relaxed uppercase">Individual chats are end-to-end private. Admin oversight is restricted to public groups only.</p>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col bg-white">
        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md">
           <div className="flex items-center gap-5">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">
                {activeChatId === 'group' ? 'G' : chatPartner?.name[0]}
             </div>
             <div>
               <div className="flex items-center gap-3">
                 <h3 className="text-sm font-black uppercase tracking-tighter leading-none">{activeChatId === 'group' ? 'General Staff Group' : chatPartner?.name}</h3>
                 {activeChatId !== 'group' && <Lock size={12} className="text-indigo-400" />}
               </div>
               <p className="text-[9px] font-black text-green-500 uppercase mt-2 flex items-center gap-2">
                 <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span> {activeChatId === 'group' ? 'Shared Workspace' : 'Encrypted Private Session'}
               </p>
             </div>
           </div>
        </div>

        {/* Message Stream */}
        <div className="flex-grow overflow-y-auto p-10 space-y-8 bg-slate-50/20">
          {filteredMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'} group/msg relative`}>
               <div className={`max-w-[70%] ${msg.senderId === currentUser.id ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                 <span className="text-[9px] font-black uppercase text-slate-400 px-3 tracking-widest">{msg.senderName}</span>
                 
                 <div className={`relative p-5 rounded-[2rem] shadow-sm ${msg.isDeleted ? 'bg-slate-100 text-slate-400 italic' : (msg.senderId === currentUser.id ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white border border-slate-100 text-slate-700 shadow-md')}`}>
                   {msg.image && <img src={msg.image} className="rounded-3xl mb-4 max-h-80 w-full object-cover shadow-xl" />}
                   
                   {msg.file && (
                     <div className="bg-black/5 p-4 rounded-2xl mb-3 flex items-center gap-4 border border-black/10">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><FileText size={20}/></div>
                        <div className="flex-grow overflow-hidden">
                           <p className="text-[10px] font-black uppercase truncate tracking-tight">{msg.file.name}</p>
                           <p className="text-[8px] font-black opacity-50 uppercase">{(msg.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <a href={msg.file.data} download={msg.file.name} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">
                          <Download size={16} />
                        </a>
                     </div>
                   )}

                   <p className="text-[12px] font-bold leading-relaxed">{msg.text}</p>
                   
                   <div className="flex items-center justify-end gap-3 mt-3">
                     {msg.isEdited && <span className="text-[7px] uppercase font-black opacity-30 tracking-widest">Edited</span>}
                     <span className="text-[7px] font-black uppercase opacity-30 tracking-widest">
                       {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     </span>
                   </div>

                   {/* Self-Edit/Delete Only */}
                   {msg.senderId === currentUser.id && !msg.isDeleted && (
                     <div className="absolute top-0 -left-14 flex flex-col gap-2 opacity-0 group-hover/msg:opacity-100 transition-opacity p-1">
                        <button onClick={() => startEdit(msg)} className="p-2 bg-amber-500 text-white rounded-full shadow-xl hover:scale-110 transition-all border border-white"><Edit3 size={12}/></button>
                        <button onClick={() => deleteMessage(msg.id)} className="p-2 bg-red-600 text-white rounded-full shadow-xl hover:scale-110 transition-all border border-white"><Trash2 size={12}/></button>
                     </div>
                   )}
                 </div>
               </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-8 bg-white border-t border-slate-100">
          {(selectedImage || selectedFile) && (
            <div className="mb-6 flex gap-4 animate-fadeIn">
              {selectedImage && (
                <div className="relative group">
                  <img src={selectedImage} className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-50 shadow-xl" />
                  <button onClick={() => setSelectedImage(null)} className="absolute -top-3 -right-3 bg-red-600 text-white p-2 rounded-full shadow-2xl hover:scale-110 transition-all"><X size={12}/></button>
                </div>
              )}
              {selectedFile && (
                <div className="relative bg-slate-50 p-6 rounded-3xl border-2 border-indigo-50 flex items-center gap-4 shadow-xl">
                  <FileText className="text-indigo-600" size={32} />
                  <p className="text-[10px] font-black uppercase max-w-[120px] truncate">{selectedFile.name}</p>
                  <button onClick={() => setSelectedFile(null)} className="absolute -top-3 -right-3 bg-red-600 text-white p-2 rounded-full shadow-2xl"><X size={12}/></button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button 
                onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.onchange = (e: any) => {
                  const reader = new FileReader(); reader.onload = () => setSelectedImage(reader.result as string); reader.readAsDataURL(e.target.files[0]);
                }; input.click(); }}
                className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"
                title="Send Photo"
              >
                <ImageIcon size={20} />
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 shadow-sm"
                title="Send File"
              >
                <Paperclip size={20} />
              </button>
            </div>

            <div className="flex-grow relative">
              <input 
                type="text" 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={isEditing ? "Modify your message..." : "Type your secure message..."} 
                className={`w-full ${isEditing ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-50'} px-8 py-5 rounded-3xl text-[12px] font-bold outline-none border-2 focus:border-indigo-500 transition-all shadow-inner`}
              />
              {isEditing && (
                <button onClick={() => { setIsEditing(null); setInputText(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500">
                  <X size={18} />
                </button>
              )}
            </div>

            <button 
              onClick={handleSendMessage} 
              className={`p-5 rounded-3xl shadow-xl transition-all hover:scale-105 active:scale-95 ${isEditing ? 'bg-amber-500 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'} text-white`}
            >
              <Send size={24} />
            </button>
          </div>
          
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
