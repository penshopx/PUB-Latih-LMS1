
import React, { useState, useEffect, useRef } from 'react';
import { Course, CourseModule, Comment, Certificate } from '../types';
import { 
  ChevronLeft, CheckCircle, FileText, 
  Brain, ChevronDown, ChevronRight, Video, AlertCircle, Radio, Calendar,
  MessageCircle, ThumbsUp, Send, Lock, Award, Sparkles, X,
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Share2, Check, Download,
  ArrowRight
} from './ui/Icons';
import QuizInterface from './QuizInterface';
import LiveClassroom from './LiveClassroom';
import { useLms } from '../context/LmsContext';
import { explainConcept, generateTranscriptSummary } from '../services/aiService';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  onViewCertificate?: (cert: Certificate) => void;
}

// Custom Video Player Component
const VideoPlayer: React.FC<{ module: CourseModule, onComplete: () => void }> = ({ module, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const controlsTimeoutRef = useRef<any>(null);

  // Fallback to a sample video if the URL is a YouTube embed or mock, for demonstration purposes
  const videoSrc = module.videoUrl?.includes('youtube') || module.videoUrl?.includes('mock') 
    ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' 
    : module.videoUrl;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
      if (newMuted) setVolume(0);
      else setVolume(1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    setProgress((val / duration) * 100);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
    }
  };

  useEffect(() => {
     const handleFullscreenChange = () => {
       setIsFullscreen(!!document.fullscreenElement);
     };
     document.addEventListener('fullscreenchange', handleFullscreenChange);
     return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
     <div 
        ref={containerRef} 
        className="relative group bg-black aspect-video flex items-center justify-center overflow-hidden cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
     >
        <video
           ref={videoRef}
           src={videoSrc}
           className="w-full h-full object-contain"
           onTimeUpdate={() => {
              if(videoRef.current && !isDragging) {
                 setCurrentTime(videoRef.current.currentTime);
                 setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
              }
           }}
           onLoadedMetadata={() => {
              if(videoRef.current) setDuration(videoRef.current.duration);
           }}
           onEnded={() => {
             setIsPlaying(false);
             onComplete();
           }}
           onClick={togglePlay}
        />
        
        {/* Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
           
           {/* Progress Bar */}
           <div className="relative w-full h-1.5 bg-white/30 rounded-full mb-4 cursor-pointer group/progress hover:h-2 transition-all">
              <div 
                 className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full relative" 
                 style={{ width: `${progress}%` }}
              >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 shadow-sm transform scale-0 group-hover/progress:scale-100 transition-transform" />
              </div>
              <input 
                 type="range" 
                 min="0" 
                 max={duration || 100} 
                 value={currentTime} 
                 onChange={handleSeek}
                 onMouseDown={() => setIsDragging(true)}
                 onMouseUp={() => setIsDragging(false)}
                 onTouchStart={() => setIsDragging(true)}
                 onTouchEnd={() => setIsDragging(false)}
                 onClick={(e) => e.stopPropagation()}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
           </div>

           <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4">
                 <button onClick={togglePlay} className="hover:text-indigo-400 transition-colors">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                 </button>
                 
                 <div className="flex items-center gap-2 group/volume relative">
                    <button onClick={toggleMute} className="hover:text-indigo-400">
                       {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    {/* Volume Slider - appearing on hover */}
                    <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300 flex items-center">
                        <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={isMuted ? 0 : volume} 
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-110 ml-2"
                        />
                    </div>
                 </div>

                 <div className="text-xs font-medium font-mono select-none">
                    {formatTime(currentTime)} / {formatTime(duration)}
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <button onClick={toggleFullscreen} className="hover:text-indigo-400 transition-colors">
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                 </button>
              </div>
           </div>
        </div>

        {/* Big Play Button Overlay */}
        {!isPlaying && (
           <button 
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group/play"
           >
              <div className="p-5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl group-hover/play:scale-110 transition-transform">
                 <Play className="w-12 h-12 text-white fill-white ml-1" />
              </div>
           </button>
        )}
     </div>
  );
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack, onViewCertificate }) => {
  const { markModuleCompleted, getStudentProgress, currentUser, comments, addComment, certificates } = useLms();
  
  // Get current user progress to determine start module
  const userProgress = getStudentProgress(currentUser.id, course.id);
  const completedIds = userProgress?.completedModuleIds || [];
  
  // Find first uncompleted module or default to first
  const initialModule = course.modules.length > 0 
    ? (course.modules.find(m => !completedIds.includes(m.id)) || course.modules[0])
    : null;

  const [activeModule, setActiveModule] = useState<CourseModule | null>(initialModule);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'discussion'>('transcript');
  const [newComment, setNewComment] = useState('');
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // AI Explain State
  const [explanation, setExplanation] = useState<{term: string, text: string} | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    setAiSummary(null);
    setExplanation(null);
  }, [activeModule?.id]);

  // Filter comments for this course/module
  const courseComments = comments.filter(c => c.courseId === course.id);

  if (!activeModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Konten Tidak Tersedia</h2>
        <p className="text-slate-500 mb-6 text-center">Kursus ini belum memiliki modul.</p>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Kembali ke Dasbor
        </button>
      </div>
    );
  }

  const handleModuleComplete = (score?: number) => {
    markModuleCompleted(currentUser.id, course.id, activeModule.id, score);
    const updatedCompletedIds = new Set([...completedIds, activeModule.id]);
    const isNowFullyComplete = course.modules.every(m => updatedCompletedIds.has(m.id));

    if (isNowFullyComplete) {
       setIsCourseCompleted(true);
    } else {
       const currentIndex = course.modules.findIndex(m => m.id === activeModule.id);
       if (currentIndex < course.modules.length - 1) {
          setActiveModule(course.modules[currentIndex + 1]);
       } else {
          const firstIncomplete = course.modules.find(m => !updatedCompletedIds.has(m.id));
          if (firstIncomplete) {
             setActiveModule(firstIncomplete);
          }
       }
    }
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      courseId: course.id,
      moduleId: activeModule.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: newComment,
      timestamp: new Date(),
      likes: 0
    };
    addComment(comment);
    setNewComment('');
  };

  const handleExplain = async () => {
    // Basic implementation: take first 5 words of title or selected text if we could access selection
    const term = activeModule.title;
    setIsExplaining(true);
    const text = await explainConcept(term);
    setExplanation({ term, text });
    setIsExplaining(false);
  };

  const handleGenerateSummary = async () => {
    if (!activeModule.transcript) return;
    setIsGeneratingSummary(true);
    const summary = await generateTranscriptSummary(activeModule.transcript);
    setAiSummary(summary);
    setIsGeneratingSummary(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: `Sertifikat Penyelesaian: ${course.title}`,
      text: `Saya telah menyelesaikan kursus ${course.title} di PUB-Latih AI! 🎓`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`Saya telah menyelesaikan kursus ${course.title} di PUB-Latih AI!`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const isModuleCompleted = (id: string) => completedIds.includes(id);

  const isModuleLocked = (index: number) => {
    if (index === 0) return false;
    const prevModuleId = course.modules[index - 1].id;
    return !completedIds.includes(prevModuleId);
  };

  if (isCourseCompleted) {
    return (
      <div className="fixed inset-0 bg-slate-900 z-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Award className="w-12 h-12 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat!</h2>
          <p className="text-slate-600 mb-8">
            Anda telah berhasil menyelesaikan <strong>{course.title}</strong>. Sertifikat Anda telah dibuat.
          </p>
          <div className="flex flex-col gap-3">
             <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                      const cert = certificates.find(c => c.courseTitle === course.title && c.studentName === currentUser.name);
                      if (cert && onViewCertificate) {
                        onViewCertificate(cert);
                      } else {
                        onBack();
                      }
                  }}
                  className="py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                >
                   <Download className="w-5 h-5" />
                   Lihat Sertifikat
                </button>
                <button
                  onClick={handleShare}
                  className="py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                   {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                   {copied ? 'Disalin' : 'Bagikan'}
                </button>
             </div>
            <button 
              onClick={onBack}
              className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Kembali ke Dasbor
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    if (activeModule.type === 'quiz' && activeModule.quizData) {
      return (
        <QuizInterface 
          key={activeModule.id} 
          quiz={activeModule.quizData}
          moduleId={activeModule.id}
          onComplete={(score) => {
            if (score >= 60) { 
               handleModuleComplete(score);
            } else {
              alert(`Skor Anda ${score}%. Anda membutuhkan 60% untuk lulus kuis ini.`);
            }
          }} 
        />
      );
    }

    if (activeModule.type === 'live') {
      return (
        <LiveClassroom 
          title={activeModule.title} 
          currentUser={currentUser}
          onLeave={() => handleModuleComplete()}
        />
      );
    }

    if (activeModule.type === 'text') {
       return (
         <div className="max-w-3xl mx-auto py-10 px-6 relative">
           {/* AI Explain Tooltip */}
           {explanation && (
             <div className="fixed bottom-24 right-8 w-80 bg-white p-4 rounded-xl shadow-2xl border border-indigo-100 animate-in slide-in-from-bottom-5 z-20">
               <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                   <Sparkles className="w-4 h-4" />
                   Penjelasan AI
                 </div>
                 <button onClick={() => setExplanation(null)} className="text-slate-400 hover:text-slate-600">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               <p className="text-sm text-slate-700 leading-relaxed">{explanation.text}</p>
             </div>
           )}

           <div className="prose prose-indigo max-w-none">
             <div className="flex justify-between items-center bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8 rounded-r-lg">
                <h3 className="text-indigo-900 font-semibold m-0 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Materi Bacaan
                </h3>
                <button 
                  onClick={handleExplain}
                  disabled={isExplaining}
                  className="flex items-center gap-1 text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-full shadow-sm hover:bg-indigo-50 border border-indigo-100 transition-colors"
                >
                  {isExplaining ? 'Berpikir...' : <><Brain className="w-3 h-3" /> Jelaskan dengan AI</>}
                </button>
             </div>
             <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
               {activeModule.textContent}
             </div>
           </div>
           <div className="mt-12 flex justify-center">
             <button 
               onClick={() => handleModuleComplete()}
               className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
             >
               <CheckCircle className="w-5 h-5" />
               Tandai Dibaca & Lanjut
             </button>
           </div>
         </div>
       );
    }

    // Video Player
    return (
      <div className="flex flex-col h-full">
        <VideoPlayer 
           key={activeModule.id} 
           module={activeModule} 
           onComplete={() => handleModuleComplete()} 
        />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
             <div>
               <h1 className="text-2xl font-bold text-slate-900 mb-2">{activeModule.title}</h1>
               <p className="text-slate-500 text-sm">{course.title} • {activeModule.duration}</p>
             </div>
             <button 
                onClick={() => handleModuleComplete()}
                className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
             >
               Tandai Selesai & Lanjut
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-slate-900 text-white flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="font-semibold text-sm md:text-base line-clamp-1">{course.title}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${userProgress?.progress || 0}%` }}></div>
              </div>
              <span>{userProgress?.progress || 0}% Selesai</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
           >
             <Video className="w-4 h-4" />
             <span>Modul</span>
           </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Content Area */}
        <main className={`flex-1 overflow-y-auto bg-white relative ${activeModule.type === 'live' ? 'p-0' : ''}`}>
           {renderMainContent()}
        </main>

        {/* Right Sidebar (Tabs) - Hide for Live */}
        {activeModule.type !== 'live' && (
        <aside className="hidden lg:flex w-80 border-l border-slate-200 flex-col bg-slate-50">
          <div className="flex border-b border-slate-200 bg-white">
            <button 
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'transcript' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Transkrip
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'notes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Catatan
            </button>
            <button 
              onClick={() => setActiveTab('discussion')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'discussion' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Diskusi
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto relative">
            {activeTab === 'transcript' && (
              <div className="p-4 space-y-4">
                {/* AI Summary Section in Transcript */}
                 <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2 text-indigo-700">
                       <Brain className="w-5 h-5" />
                       <span className="font-bold text-sm">Ringkasan AI</span>
                     </div>
                     {!aiSummary && !isGeneratingSummary && activeModule.transcript && (
                        <button 
                            onClick={handleGenerateSummary}
                            className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 flex items-center gap-1 shadow-sm font-medium transition-colors"
                        >
                            <Sparkles className="w-3 h-3" />
                            Buat Ringkasan
                        </button>
                     )}
                   </div>
                   
                   {isGeneratingSummary ? (
                       <div className="flex items-center gap-2 text-sm text-slate-500 py-2 animate-pulse">
                           <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                           Sedang menganalisis transkrip...
                       </div>
                   ) : aiSummary ? (
                       <div className="animate-in fade-in slide-in-from-bottom-2">
                           <div className="prose prose-sm prose-indigo max-w-none bg-white p-3 rounded-lg border border-indigo-100 mb-2">
                               <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                   {aiSummary}
                               </p>
                           </div>
                           <button 
                                onClick={() => {
                                    setActiveTab('notes');
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 ml-auto"
                            >
                                Buka di Tab Catatan <ArrowRight className="w-3 h-3" />
                            </button>
                       </div>
                   ) : (
                       <p className="text-xs text-slate-500 leading-relaxed">
                           {activeModule.transcript 
                             ? "Gunakan AI untuk membuat ringkasan poin-poin kunci dari materi video ini secara instan." 
                             : "Transkrip tidak tersedia untuk diringkas."}
                       </p>
                   )}
                </div>

                {activeModule.transcript ? (
                  <div className="relative">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teks Transkrip</h3>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-mono bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {activeModule.transcript}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Transkrip tidak tersedia untuk modul ini.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="p-4 space-y-3">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                   <div className="flex items-center justify-between mb-2">
                     <div className="flex items-center gap-2 text-indigo-700">
                       <Brain className="w-4 h-4" />
                       <span className="text-xs font-bold uppercase">Ringkasan AI</span>
                     </div>
                     {!aiSummary && !isGeneratingSummary && activeModule.transcript && (
                        <button 
                            onClick={handleGenerateSummary}
                            className="text-xs bg-white text-indigo-600 px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-50 flex items-center gap-1 shadow-sm"
                        >
                            <Sparkles className="w-3 h-3" />
                            Buat Ringkasan
                        </button>
                     )}
                   </div>
                   
                   {isGeneratingSummary ? (
                       <div className="flex items-center gap-2 text-xs text-slate-500 py-2 animate-pulse">
                           <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                           Sedang menganalisis transkrip...
                       </div>
                   ) : aiSummary ? (
                       <div className="prose prose-sm prose-indigo max-w-none">
                           <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                               {aiSummary}
                           </p>
                       </div>
                   ) : (
                       <p className="text-xs text-slate-500 italic">
                           {activeModule.transcript ? "Klik tombol di atas untuk membuat ringkasan otomatis dari materi ini." : "Transkrip tidak tersedia untuk diringkas."}
                       </p>
                   )}
                </div>
                <textarea 
                  placeholder="Buat catatan Anda di sini..." 
                  className="w-full h-64 p-3 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            )}

            {activeTab === 'discussion' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {courseComments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                      <img src={comment.userAvatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900">{comment.userName}</span>
                          <span className="text-[10px] text-slate-400">
                            {comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2 bg-slate-100 p-2 rounded-lg rounded-tl-none">
                          {comment.text}
                        </p>
                        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600">
                          <ThumbsUp className="w-3 h-3" />
                          {comment.likes} Suka
                        </button>
                      </div>
                    </div>
                  ))}
                  {courseComments.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Belum ada diskusi. Jadilah yang pertama!</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-slate-200 bg-white sticky bottom-0">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                      placeholder="Ajukan pertanyaan..." 
                      className="w-full pl-4 pr-10 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button 
                      onClick={handlePostComment}
                      className="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
        )}

        {/* Left Sidebar (Navigation) - Hide for Live */}
        {sidebarOpen && activeModule.type !== 'live' && (
          <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 absolute md:static inset-y-0 left-0 z-10">
            <div className="p-4 border-b border-slate-200 bg-white">
               <h3 className="font-bold text-slate-900">Konten Kursus</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {course.modules.map((module, index) => {
                 const isActive = module.id === activeModule.id;
                 const isCompleted = isModuleCompleted(module.id);
                 const locked = isModuleLocked(index) && !isCompleted;
                 
                 const Icon = module.type === 'video' ? Video : 
                              module.type === 'quiz' ? Brain : 
                              module.type === 'live' ? Radio : FileText;
                 
                 return (
                   <button
                     key={module.id}
                     onClick={() => !locked && setActiveModule(module)}
                     disabled={locked}
                     className={`w-full flex items-start gap-3 p-4 text-left border-b border-slate-100 transition-colors ${
                       isActive ? 'bg-indigo-50' : locked ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-100'
                     }`}
                   >
                     <div className={`mt-0.5 ${
                       isCompleted ? 'text-green-500' : 
                       locked ? 'text-slate-400' :
                       module.type === 'live' ? 'text-red-500 animate-pulse' :
                       isActive ? 'text-indigo-600' : 'text-slate-400'
                     }`}>
                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : 
                         locked ? <Lock className="w-5 h-5" /> :
                         <Icon className="w-5 h-5" />}
                     </div>
                     <div>
                       <h4 className={`text-sm font-medium mb-1 ${isActive ? 'text-indigo-900' : 'text-slate-700'}`}>
                         {index + 1}. {module.title}
                       </h4>
                       <div className="flex items-center gap-2 text-xs text-slate-500">
                         <span>
                           {module.type === 'video' ? 'Video' : 
                            module.type === 'quiz' ? 'Kuis' : 
                            module.type === 'live' ? 'Sesi Langsung' : 'Bacaan'}
                         </span>
                         <span>•</span>
                         <span>{module.duration}</span>
                       </div>
                     </div>
                   </button>
                 );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursePlayer;
