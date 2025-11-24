
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Brain, Sparkles, Zap, Mic, Square, Upload, AlertCircle } from './ui/Icons';
import { ChatMessage, UserRole } from '../types';
import { chatWithAI } from '../services/aiService';

interface AIChatbotProps {
  userRole: UserRole;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Selamat datang di PUB-Latih AI! 🏗️\nSaya dapat membantu Anda dengan konsep kursus, regulasi K3, atau analisis foto lapangan.`,
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const initialInputRef = useRef('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on stop
        }
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (!isSupported) {
      alert('Maaf, browser Anda tidak mendukung fitur ini.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    initialInputRef.current = input;
    
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        const separator = initialInputRef.current && transcript ? ' ' : '';
        setInput(initialInputRef.current + separator + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
             alert("Akses mikrofon ditolak. Silakan izinkan akses di pengaturan browser Anda.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Failed to start recording:", e);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    if (isRecording) {
        handleStopRecording();
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      image: selectedImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = selectedImage;
    setSelectedImage(null); // Clear preview immediately
    setIsTyping(true);

    try {
      const aiResponseText = await chatWithAI(userMsg.text || (imageToSend ? "Analisis gambar ini" : ""), userRole, imageToSend || undefined);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Maaf, saya sedang mengalami gangguan. Silakan coba lagi nanti.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-4 w-[90vw] max-w-[360px] bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ring-1 ring-slate-900/5">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-4 flex items-center justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Brain className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Asisten PUB-Latih</h3>
                <span className="text-[10px] text-indigo-100 flex items-center gap-1 opacity-90">
                  <Zap className="w-3 h-3 fill-current" />
                  Vision & Voice AI
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors relative z-10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-slate-50/50 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="w-3 h-3 text-indigo-600" />
                    </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                  }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="w-full h-32 object-cover rounded-lg mb-2" />
                  )}
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start gap-2">
                 <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Brain className="w-3 h-3 text-indigo-600" />
                 </div>
                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-10">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview Area */}
          {selectedImage && (
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded bg-white border border-slate-200 overflow-hidden">
                        <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-slate-500">Gambar terpilih</span>
                </div>
                <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-red-500">
                    <X className="w-4 h-4" />
                </button>
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
            <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-indigo-600 transition-all"
                title="Upload Gambar"
                disabled={isRecording}
            >
                <Upload className="w-4 h-4" />
            </button>
            <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
            />

            <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`p-2.5 rounded-xl transition-all shadow-sm flex-shrink-0 flex items-center justify-center ${
                    !isSupported
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : isRecording 
                        ? 'bg-red-500 text-white shadow-red-200 animate-pulse ring-2 ring-red-200' 
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-indigo-600'
                }`}
                title={!isSupported ? "Browser tidak mendukung suara" : isRecording ? "Berhenti Merekam" : "Mulai Suara"}
            >
                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Mendengarkan..." : "Tanya / Upload Foto..."}
              disabled={isRecording}
              className={`flex-1 bg-slate-100 border-0 rounded-xl px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-400 transition-all ${isRecording ? 'placeholder:text-red-500 ring-2 ring-red-100 bg-red-50' : ''}`}
            />
            <button
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isTyping}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group h-14 w-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 relative"
      >
        {isOpen ? (
            <X className="w-6 h-6 transition-transform rotate-90" />
        ) : (
            <>
                <MessageSquare className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
            </>
        )}
      </button>
    </div>
  );
};

export default AIChatbot;
