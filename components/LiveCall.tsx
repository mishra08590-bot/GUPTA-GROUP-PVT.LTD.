
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize, Settings as SettingsIcon } from 'lucide-react';

interface LiveCallProps {
  onEnd: () => void;
  isVideoButton: boolean;
}

const LiveCall: React.FC<LiveCallProps> = ({ onEnd, isVideoButton }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(isVideoButton);
  const [status, setStatus] = useState('Connecting to RQC Assistant...');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: isVideoOn ? { facingMode: 'user' } : false 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus('Live Call Active');
      } catch (err) {
        setStatus('Permission Denied');
        console.error(err);
      }
    };
    startMedia();
    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-4xl w-full aspect-video bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl border border-white/10">
        {/* Video Surface */}
        {isVideoOn ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center animate-pulse">
               <PhoneOff size={48} className="text-white rotate-[135deg]" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">AI Voice Assistant</h2>
              <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs mt-2">Listening for QC Queries...</p>
            </div>
          </div>
        )}

        {/* HUD */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="bg-red-500 h-2 w-2 rounded-full animate-ping" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            {status}
          </span>
        </div>

        {/* Small Preview for Video */}
        {isVideoOn && (
           <div className="absolute bottom-28 right-8 w-48 aspect-video bg-black rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl">
              <div className="w-full h-full flex items-center justify-center bg-indigo-950">
                 <div className="text-[10px] font-black text-indigo-400 uppercase">Assistant View</div>
              </div>
           </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 inset-x-0 flex justify-center items-center gap-6 px-8">
           <button 
             onClick={() => setIsMuted(!isMuted)}
             className={`p-5 rounded-full backdrop-blur-xl border border-white/10 transition-all ${isMuted ? 'bg-red-500/80 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
           >
             {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
           </button>

           <button 
             onClick={() => setIsVideoOn(!isVideoOn)}
             className={`p-5 rounded-full backdrop-blur-xl border border-white/10 transition-all ${!isVideoOn ? 'bg-red-500/80 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
           >
             {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
           </button>

           <button 
             onClick={onEnd}
             className="p-6 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-2xl shadow-red-500/40 hover:scale-110 active:scale-95"
           >
             <PhoneOff size={28} />
           </button>

           <div className="absolute right-8 flex items-center gap-4">
              <button className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20">
                <SettingsIcon size={20} />
              </button>
           </div>
        </div>
      </div>
      
      <p className="mt-8 text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">
        End-to-End Encrypted RQC Communication
      </p>
    </div>
  );
};

export default LiveCall;
