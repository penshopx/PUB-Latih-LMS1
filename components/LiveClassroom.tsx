import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, 
  Users, Share2, MoreVertical, Sparkles, Brain, Send, Maximize2
} from './ui/Icons';
import { User } from '../types';
import { generateLiveSummary } from '../services/aiService';

interface LiveClassroomProps {
  title: string;
  currentUser: User;
  onLeave: () => void;
}

const LiveClassroom: React.FC<LiveClassroomProps> = ({ title, currentUser, onLeave }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [messages, setMessages] = useState<{user: string, text: string, time: string}[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Simulated Transcript for AI
  const [transcript, setTranscript] = useState<string[]>([]);

  // Mock participants
  const participants = [
    { name: currentUser.name, avatar: currentUser.avatar, isMe: true },
    { name: 'Dr. Eng. Ratna Sari', avatar: 'https://picsum.photos/100/100?random=9', isHost: true },
    { name: 'Budi Santoso', avatar: 'https://picsum.photos/100/100?random=2' },
    { name: 'Siti Engineer', avatar: 'https://picsum.photos/100/100?random=7' },
  ];

  // Effect to simulate incoming transcript/chat
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const phrases = [
          "Hari ini kita membahas Beton Mutu Tinggi.",
          "Mohon periksa rasio mix design.",
          "Apakah ada pertanyaan tentang kapasitas beban?",
          "Ingat, utamakan keselamatan di lapangan."
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setTranscript(prev => [...prev.slice(-4), `Instruktur: ${randomPhrase}`]);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    setMessages([...messages, { 
      user: 'Saya', 
      text: inputMsg, 
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }]);
    setInputMsg('');
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    // Simulate a fuller transcript for the AI
    const fullTranscript = "Instruktur: Selamat datang semuanya di sesi Beton Lanjutan. Hari ini kita membahas Beton Mutu Tinggi (HSC). Poin utama: Gunakan silica fume untuk kepadatan yang lebih baik. Jaga rasio air-semen tetap rendah (di bawah 0,3). Tindakan selanjutnya: Tinjau SNI 2847:2019 untuk persyaratan detailing.";
    
    const summary = await generateLiveSummary(fullTranscript);
    setAiSummary(summary);
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden relative">
      
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 bg-slate-800/50 backdrop-blur-md border-b border-white/10 z-10">
        <div className="flex items-center gap-2">
            <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">LIVE</span>
            <h2 className="font-semibold text-sm md:text-base">{title}</h2>
            <span className="text-slate-400 text-xs hidden md:inline">| {participants.length} Peserta</span>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-full text-slate-300">
                <Maximize2 className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Stage */}
        <div className="flex-1 p-4 flex items-center justify-center bg-black relative">
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full max-w-5xl h-full max-h-[80vh]">
                {participants.map((p, idx) => (
                    <div key={idx} className="relative bg-slate-800 rounded-xl overflow-hidden border border-white/10 shadow-lg group">
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Status overlays */}
                        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-medium flex items-center gap-2">
                            {p.isMe && !isMuted && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                            {p.name} {p.isMe && '(Anda)'}
                        </div>
                        {p.isHost && (
                            <div className="absolute top-3 right-3 bg-indigo-600 px-2 py-1 rounded text-[10px] font-bold">HOST</div>
                        )}
                        {/* Audio Wave Sim */}
                        {!p.isMe && (
                             <div className="absolute bottom-3 right-3 flex gap-0.5 items-end h-4">
                                <div className="w-1 bg-white animate-bounce" style={{animationDelay: '0ms'}}></div>
                                <div className="w-1 bg-white animate-bounce" style={{animationDelay: '100ms'}}></div>
                                <div className="w-1 bg-white animate-bounce" style={{animationDelay: '200ms'}}></div>
                             </div>
                        )}
                    </div>
                ))}
            </div>

            {/* AI Caption Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl text-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-sm text-slate-200 text-sm md:text-lg px-6 py-3 rounded-2xl transition-all">
                    {transcript.length > 0 ? transcript[transcript.length - 1] : "Mendengarkan..."}
                </div>
            </div>
        </div>

        {/* Right Sidebar (Chat/AI) */}
        {(showChat || showParticipants) && (
            <div className="w-80 bg-slate-800 border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex border-b border-white/10">
                    <button 
                        onClick={() => { setShowChat(true); setShowParticipants(false); }}
                        className={`flex-1 py-3 text-sm font-medium ${showChat ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}
                    >
                        Obrolan
                    </button>
                    <button 
                         onClick={() => { setShowChat(false); setShowParticipants(true); }}
                         className={`flex-1 py-3 text-sm font-medium ${showParticipants ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}
                    >
                        Catatan AI
                    </button>
                </div>

                {showChat && (
                    <div className="flex-1 flex flex-col">
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {messages.map((m, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs text-slate-300">{m.user}</span>
                                        <span className="text-[10px] text-slate-500">{m.time}</span>
                                    </div>
                                    <div className="bg-slate-700/50 p-2 rounded-lg text-sm text-slate-200">{m.text}</div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 border-t border-white/10">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={inputMsg}
                                    onChange={(e) => setInputMsg(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ketik pesan..."
                                    className="w-full bg-slate-700 text-white rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                                <button onClick={handleSendMessage} className="absolute right-1 top-1 p-1.5 bg-indigo-600 rounded-full hover:bg-indigo-700">
                                    <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showParticipants && (
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="mb-4">
                            <button 
                                onClick={handleGenerateSummary}
                                disabled={isGenerating}
                                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg hover:shadow-indigo-500/25 transition-all"
                            >
                                {isGenerating ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Sparkles className="w-4 h-4" />}
                                Buat Ringkasan Rapat
                            </button>
                        </div>

                        {aiSummary ? (
                            <div className="bg-slate-700/50 rounded-xl p-4 border border-indigo-500/30">
                                <div className="flex items-center gap-2 text-indigo-300 mb-2">
                                    <Brain className="w-4 h-4" />
                                    <h3 className="font-bold text-sm">Catatan AI</h3>
                                </div>
                                <div className="prose prose-invert prose-sm">
                                    <p className="whitespace-pre-wrap text-slate-300 leading-relaxed text-xs">
                                        {aiSummary}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-500 mt-10">
                                <Brain className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Klik di atas untuk membuat catatan real-time dari percakapan.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-20 bg-slate-800 border-t border-white/10 flex items-center justify-center gap-4 md:gap-8 px-4 relative z-20">
         <button 
           onClick={() => setIsMuted(!isMuted)}
           className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
         >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
         </button>
         
         <button 
           onClick={() => setIsVideoOff(!isVideoOff)}
           className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
         >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
         </button>

         <button className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 hidden md:block">
            <Share2 className="w-6 h-6" />
         </button>

         <button 
            onClick={onLeave}
            className="px-8 py-3 rounded-full bg-red-600 hover:bg-red-700 font-bold text-sm flex items-center gap-2"
         >
            <PhoneOff className="w-5 h-5" />
            <span className="hidden md:inline">Akhiri Panggilan</span>
         </button>

         <div className="w-px h-10 bg-white/10 mx-2 hidden md:block"></div>

         <button 
            onClick={() => { setShowChat(!showChat); setShowParticipants(false); }}
            className={`p-4 rounded-full transition-all relative ${showChat ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`}
         >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-800"></span>
         </button>
         
         <button 
            onClick={() => { setShowParticipants(!showParticipants); setShowChat(false); }}
            className={`p-4 rounded-full transition-all ${showParticipants ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`}
         >
            <Brain className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};

export default LiveClassroom;