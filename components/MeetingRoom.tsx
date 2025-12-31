
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Monitor, Users, MessageSquare, Shield, Settings, Maximize2 } from 'lucide-react';
import { Worker } from '../types';

interface MeetingRoomProps {
  onEnd: () => void;
  workers: Worker[];
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ onEnd, workers }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [status, setStatus] = useState('Initializing Meeting Room...');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [participants, setParticipants] = useState([
    { id: 'me', name: 'You (Manager)', role: 'Host', isLocal: true, avatar: 'M' },
    { id: 'p1', name: 'Rajesh Kumar', role: 'Production Head', isLocal: false, avatar: 'RK' },
    { id: 'p2', name: 'Sunil Verma', role: 'QC Lead', isLocal: false, avatar: 'SV' },
    { id: 'p3', name: 'Anita Singh', role: 'Admin', isLocal: false, avatar: 'AS' },
  ]);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: true 
        });
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        setStatus('Meeting In Progress');
      } catch (err) {
        setStatus('Media Permission Error');
        console.error(err);
      }
    };
    startMedia();
    return () => {
      if (localVideoRef.current?.srcObject) {
        (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-fadeIn font-sans">
      {/* Top Bar */}
      <div className="p-4 bg-slate-900/50 backdrop-blur-xl border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <Users className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-white font-black text-sm uppercase tracking-widest">RQC Business Meeting</h2>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{status} • {participants.length} Participants</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <Shield size={14} className="text-green-400" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">End-to-End Encrypted</span>
           </div>
           <button className="p-2 text-slate-400 hover:text-white"><Maximize2 size={18} /></button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-grow p-6 overflow-hidden">
        <div className={`grid gap-4 h-full w-full ${
          participants.length <= 1 ? 'grid-cols-1' : 
          participants.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 
          participants.length <= 4 ? 'grid-cols-2' : 
          'grid-cols-2 md:grid-cols-3'
        }`}>
          {participants.map((p) => (
            <div key={p.id} className="relative bg-slate-900 rounded-[2.5rem] border border-white/5 overflow-hidden group shadow-2xl">
              {p.isLocal ? (
                isVideoOn ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-950/30">
                    <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-2xl">
                      {p.avatar}
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800/50">
                   <div className="text-center">
                      <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center text-3xl font-black text-slate-400 mx-auto mb-4 border-4 border-slate-600">
                        {p.avatar}
                      </div>
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Connected via Remote</span>
                   </div>
                </div>
              )}

              {/* Participant Label */}
              <div className="absolute bottom-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{p.name}</span>
                <span className="text-[8px] bg-indigo-600/50 text-indigo-200 px-2 py-0.5 rounded-full font-bold">{p.role}</span>
              </div>

              {/* Mute Indicator */}
              {!p.isLocal && (
                <div className="absolute top-6 right-6 p-2 bg-black/40 rounded-full text-slate-400">
                  <MicOff size={14} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-8 bg-slate-950/80 backdrop-blur-2xl border-t border-white/5 flex justify-center items-center gap-4 relative">
        <div className="absolute left-8 hidden lg:flex items-center gap-6">
           <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-all group">
             <Users size={20} className="group-hover:scale-110 transition-transform" />
             <span className="text-[8px] font-black uppercase tracking-widest">Participants</span>
           </button>
           <button className="flex flex-col items-center gap-2 text-slate-400 hover:text-white transition-all group">
             <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
             <span className="text-[8px] font-black uppercase tracking-widest">Chat</span>
           </button>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-5 rounded-full border transition-all ${
              isMuted ? 'bg-red-500 border-red-400 text-white' : 'bg-slate-800 border-white/10 text-white hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-5 rounded-full border transition-all ${
              !isVideoOn ? 'bg-red-500 border-red-400 text-white' : 'bg-slate-800 border-white/10 text-white hover:bg-slate-700'
            }`}
          >
            {isVideoOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
          </button>

          <button 
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-5 rounded-full border transition-all ${
              isScreenSharing ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-800 border-white/10 text-white hover:bg-slate-700'
            }`}
            title="Share Screen"
          >
            <Monitor size={24} />
          </button>

          <button 
            onClick={onEnd}
            className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] transition-all shadow-2xl shadow-red-500/30 hover:scale-105 active:scale-95 flex items-center gap-3 px-8"
          >
            <PhoneOff size={24} />
            <span className="font-black text-xs uppercase tracking-widest">Leave Meeting</span>
          </button>
        </div>

        <div className="absolute right-8 hidden lg:block">
           <button className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-700 hover:text-white border border-white/5 transition-all">
             <Settings size={20} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default MeetingRoom;
