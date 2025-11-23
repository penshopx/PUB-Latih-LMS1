import React, { useState, useEffect } from 'react';
import { Course, CourseModule, Comment } from '../types';
import { 
  ChevronLeft, PlayCircle, CheckCircle, FileText, 
  Brain, ChevronDown, ChevronRight, Video, AlertCircle, Radio, Calendar,
  MessageCircle, ThumbsUp, Send, Lock, Award
} from './ui/Icons';
import QuizInterface from './QuizInterface';
import { useLms } from '../context/LmsContext';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack }) => {
  const { markModuleCompleted, getStudentProgress, currentUser, comments, addComment } = useLms();
  
  // Get current user progress to determine start module
  const userProgress = getStudentProgress(currentUser.id, course.id);
  const completedIds = userProgress?.completedModuleIds || [];
  
  // Find first uncompleted module or default to first
  // Fallback safe for empty modules
  const initialModule = course.modules.length > 0 
    ? (course.modules.find(m => !completedIds.includes(m.id)) || course.modules[0])
    : null;

  const [activeModule, setActiveModule] = useState<CourseModule | null>(initialModule);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'notes' | 'discussion'>('transcript');
  const [newComment, setNewComment] = useState('');
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);

  // Filter comments for this course/module
  const courseComments = comments.filter(c => c.courseId === course.id);

  if (!activeModule) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Content Available</h2>
        <p className="text-slate-500 mb-6 text-center">This course doesn't have any modules yet.</p>
        <button 
          onClick={onBack}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const handleModuleComplete = (score?: number) => {
    // 1. Update Global State with optional score
    markModuleCompleted(currentUser.id, course.id, activeModule.id, score);

    // 2. Intelligent Navigation Logic
    // We calculate if the course is now fully complete including the module just finished.
    // We use a Set for O(1) lookups.
    const updatedCompletedIds = new Set([...completedIds, activeModule.id]);
    const isNowFullyComplete = course.modules.every(m => updatedCompletedIds.has(m.id));

    if (isNowFullyComplete) {
       setIsCourseCompleted(true);
    } else {
       // Find the next logical module
       const currentIndex = course.modules.findIndex(m => m.id === activeModule.id);
       
       if (currentIndex < course.modules.length - 1) {
          // Default: Go to next module
          setActiveModule(course.modules[currentIndex + 1]);
       } else {
          // We are at the last module, but course is not complete (user might have skipped modules)
          // Find the first incomplete module
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

  const isModuleCompleted = (id: string) => completedIds.includes(id);

  // Check if module is locked (previous module must be completed)
  const isModuleLocked = (index: number) => {
    if (index === 0) return false;
    // Previous module must be in completedIds
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
          
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Congratulations!</h2>
          <p className="text-slate-600 mb-8">
            You have successfully completed <strong>{course.title}</strong>. Your certificate has been generated and added to your profile.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onBack}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Back to Dashboard & View Certificate
            </button>
            <button 
              onClick={() => setIsCourseCompleted(false)}
              className="w-full py-3 text-slate-500 font-medium hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Stay here and review
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
          key={activeModule.id} // Ensures new instance created when module changes, forcing state reload from storage
          quiz={activeModule.quizData}
          moduleId={activeModule.id}
          onComplete={(score) => {
            // Require 60% passing score to complete module
            if (score >= 60) { 
               handleModuleComplete(score);
            } else {
              alert(`You scored ${score}%. You need 60% to pass this quiz. Please try again!`);
            }
          }} 
        />
      );
    }

    if (activeModule.type === 'live') {
      return (
        <div className="flex flex-col h-full items-center justify-center bg-slate-900 text-white p-8">
          <div className="max-w-2xl w-full text-center space-y-6">
            <div className="w-24 h-24 bg-red-600/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Radio className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold">{activeModule.title}</h2>
            <div className="flex justify-center gap-6 text-slate-400">
               <div className="flex items-center gap-2">
                 <Calendar className="w-5 h-5" />
                 <span>{activeModule.liveDate ? new Date(activeModule.liveDate).toLocaleDateString() : 'Scheduled Soon'}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span>Live Stream</span>
               </div>
            </div>
            <p className="text-slate-300 leading-relaxed">
              This is a live interactive session with your instructor. Please ensure your camera and microphone are ready if you plan to participate.
            </p>
            <button 
              onClick={() => handleModuleComplete()}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-red-600/30 hover:scale-105"
            >
              Mark as Attended
            </button>
          </div>
        </div>
      );
    }

    if (activeModule.type === 'text') {
       return (
         <div className="max-w-3xl mx-auto py-10 px-6">
           <div className="prose prose-indigo max-w-none">
             <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8">
                <h3 className="text-indigo-900 font-semibold m-0 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Reading Material
                </h3>
             </div>
             <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
               {activeModule.textContent}
             </div>
           </div>
           <div className="mt-12 flex justify-center">
             <button 
               onClick={() => handleModuleComplete()}
               className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
             >
               <CheckCircle className="w-5 h-5" />
               Mark as Read & Continue
             </button>
           </div>
         </div>
       );
    }

    // Default Video Player
    return (
      <div className="flex flex-col h-full">
        <div className="bg-black aspect-video w-full flex items-center justify-center relative">
          {/* Mock Video Embed */}
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
               <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
               <p className="text-lg font-medium">Video Player Placeholder</p>
               <p className="text-sm text-slate-400">Playing: {activeModule.title}</p>
            </div>
          </div>
          {/* Add controls to actually complete the video module for testing */}
          <button 
             onClick={() => handleModuleComplete()}
             className="absolute bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
             Finish Video
          </button>
        </div>
        
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
               Mark Complete & Next
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
              <span>{userProgress?.progress || 0}% Completed</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setSidebarOpen(!sidebarOpen)}
             className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
           >
             <Video className="w-4 h-4" />
             <span>Modules</span>
           </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-white relative">
           {renderMainContent()}
        </main>

        {/* Right Sidebar (Tabs) */}
        <aside className="hidden lg:flex w-80 border-l border-slate-200 flex-col bg-slate-50">
          <div className="flex border-b border-slate-200 bg-white">
            <button 
              onClick={() => setActiveTab('transcript')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'transcript' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Transcript
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'notes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Notes
            </button>
            <button 
              onClick={() => setActiveTab('discussion')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors ${activeTab === 'discussion' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Discuss
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto relative">
            {activeTab === 'transcript' && (
              <div className="p-4 space-y-4">
                {activeModule.transcript ? (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {activeModule.transcript}
                  </p>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No transcript available for this module.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="p-4 space-y-3">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                   <div className="flex items-center gap-2 text-indigo-700 mb-2">
                     <Brain className="w-4 h-4" />
                     <span className="text-xs font-bold uppercase">AI Summary</span>
                   </div>
                   <p className="text-xs text-slate-700">
                     This module covers the core concepts of {activeModule.title}. Remember to focus on the key terms.
                   </p>
                </div>
                <textarea 
                  placeholder="Take your own notes here..." 
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
                        {comment.moduleId && (
                          <div className="text-[10px] text-slate-400 mb-1">
                            Regarding: {course.modules.find(m => m.id === comment.moduleId)?.title || 'General'}
                          </div>
                        )}
                        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600">
                          <ThumbsUp className="w-3 h-3" />
                          {comment.likes} Likes
                        </button>
                      </div>
                    </div>
                  ))}
                  {courseComments.length === 0 && (
                    <div className="text-center text-slate-400 py-10">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No discussions yet. Be the first!</p>
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
                      placeholder="Ask a question..." 
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

        {/* Left Sidebar (Navigation) */}
        {sidebarOpen && (
          <div className="w-80 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0 absolute md:static inset-y-0 left-0 z-10">
            <div className="p-4 border-b border-slate-200 bg-white">
               <h3 className="font-bold text-slate-900">Course Content</h3>
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
                       module.type === 'live' ? 'text-red-500' :
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
                            module.type === 'quiz' ? 'Quiz' : 
                            module.type === 'live' ? 'Live' : 'Reading'}
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