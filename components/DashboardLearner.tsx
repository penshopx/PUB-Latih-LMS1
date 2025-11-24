
import React, { useEffect, useState } from 'react';
import { PlayCircle, Clock, Star, Award, BookOpen, Trophy, TrendingUp, TrendingDown, Target, Sparkles, ArrowRight } from './ui/Icons';
import { Course, Certificate } from '../types';
import { useLms } from '../context/LmsContext';
import { LEADERBOARD_DATA } from '../constants';
import { getLearningRecommendations } from '../services/aiService';
import AIContentGenerator from './AIContentGenerator';

interface DashboardLearnerProps {
  onNavigateToCourse: (course: Course) => void;
  onNavigateToDetail: (course: Course) => void;
  onViewCertificate: (cert: Certificate) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardLearner: React.FC<DashboardLearnerProps> = ({ 
  onNavigateToCourse, 
  onNavigateToDetail,
  onViewCertificate,
  activeTab,
  setActiveTab
}) => {
  const { courses, progressData, currentUser, certificates } = useLms();
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [isRecLoading, setIsRecLoading] = useState(false);

  // Normalize activeTab to local views
  const currentView = activeTab === 'achievements' ? 'achievements' : 'learning';

  // Handle auto-scrolling to browse section if 'browse' tab is active
  useEffect(() => {
    if (activeTab === 'browse') {
      const browseSection = document.getElementById('browse');
      if (browseSection) {
        browseSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  // Load AI Recommendations
  const loadRecs = async () => {
    if (courses.length === 0) return;
    setIsRecLoading(true);
    try {
        const myProgress = progressData.filter(p => p.studentId === currentUser.id);
        const rec = await getLearningRecommendations(myProgress, courses);
        setAiRecommendation(rec);
    } catch (e) {
        console.error("Failed to load recommendations", e);
    } finally {
        setIsRecLoading(false);
    }
  }

  // Load on mount if not exists
  useEffect(() => {
    if (!aiRecommendation && courses.length > 0) {
        loadRecs();
    }
  }, [currentUser.id, courses.length]);

  // Filter courses based on user progress (Enrollments)
  const myProgress = progressData.filter(p => p.studentId === currentUser.id);
  const enrolledCourses = courses.filter(c => myProgress.some(p => p.courseId === c.id));
  const activeCourseProgress = myProgress.find(p => p.status === 'Active');
  const activeCourse = activeCourseProgress ? courses.find(c => c.id === activeCourseProgress.courseId) : enrolledCourses[0];

  // Calculate actual percentage for active course
  const activePercentage = activeCourseProgress ? activeCourseProgress.progress : 0;

  const scrollToBrowse = () => {
    document.getElementById('browse')?.scrollIntoView({ behavior: 'smooth'});
  };

  return (
    <>
    {activeTab === 'ai-writer' ? (
        <AIContentGenerator />
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tabs */}
          <div className="flex gap-6 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('learning')}
              className={`pb-3 text-sm font-medium transition-colors relative ${currentView === 'learning' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pembelajaran Saya
              {currentView === 'learning' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('achievements')}
              className={`pb-3 text-sm font-medium transition-colors relative ${currentView === 'achievements' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pencapaian
              {currentView === 'achievements' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
          </div>

          {currentView === 'learning' ? (
            <>
              {/* Welcome Header with AI Recommendation */}
              <div className="bg-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-600/20">
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
                      <div>
                          <h1 className="text-3xl font-bold mb-2">Halo, {currentUser.name.split(' ')[0]}!</h1>
                          <p className="text-indigo-100">Siap meningkatkan kompetensi hari ini?</p>
                      </div>
                      
                      {/* AI Recommendation Widget */}
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 max-w-sm w-full sm:w-auto relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button 
                                onClick={loadRecs} 
                                disabled={isRecLoading} 
                                className="text-indigo-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                                title="Perbarui Rekomendasi"
                            >
                                <Sparkles className={`w-4 h-4 ${isRecLoading ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs mb-2">
                              <Sparkles className="w-4 h-4" />
                              AI Learning Path
                          </div>
                          <p className={`text-sm leading-relaxed text-indigo-50 font-medium ${isRecLoading ? 'animate-pulse' : ''}`}>
                              {isRecLoading ? "Sedang menganalisis profil belajar Anda..." : (aiRecommendation || "Menganalisis profil Anda...")}
                          </p>
                      </div>
                  </div>
                  
                  {activeCourse ? (
                    <button 
                      onClick={() => onNavigateToCourse(activeCourse)}
                      className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                    >
                      Lanjutkan: {activeCourse.title.substring(0, 20)}... <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={scrollToBrowse}
                      className="bg-white text-indigo-600 px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                    >
                      Lihat Katalog
                    </button>
                  )}
                </div>
                {/* Abstract Pattern */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 w-40 h-40 bg-indigo-400/20 rounded-full blur-2xl"></div>
              </div>

              {/* Continue Watching (Only if enrolled) */}
              {activeCourse && (
                <section>
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    Lanjutkan Belajar
                  </h2>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigateToCourse(activeCourse)}>
                    <div className="relative w-full md:w-64 h-36 flex-shrink-0 bg-slate-200 rounded-lg overflow-hidden group">
                      <img src={activeCourse.thumbnail} alt="thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                        <PlayCircle className="w-12 h-12 text-white opacity-90 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                        <div className="h-full bg-indigo-500" style={{ width: `${activePercentage}%` }}></div>
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{activeCourse.title}</h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Sedang Berjalan</span>
                      </div>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">{activeCourse.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden">
                            <img src={`https://picsum.photos/seed/${activeCourse.instructor}/200`} alt="inst" />
                          </div>
                          {activeCourse.instructor}
                        </span>
                        <span>•</span>
                        <span>{activePercentage}% Selesai</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Recommended (Show courses NOT enrolled) */}
              <section id="browse">
                <div className="flex justify-between items-end mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Katalog Kursus
                  </h2>
                  <button 
                    onClick={scrollToBrowse}
                    className="text-indigo-600 text-sm font-medium hover:underline"
                  >
                    Lihat Semua
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {courses.filter(c => !enrolledCourses.find(ec => ec.id === c.id)).map((course: Course) => (
                    <div 
                      key={course.id} 
                      onClick={() => onNavigateToDetail(course)}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="relative aspect-video bg-slate-100 rounded-lg mb-4 overflow-hidden">
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <h3 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{course.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{course.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-amber-500 text-sm font-medium">
                          <Star className="w-4 h-4 fill-current" />
                          {course.rating || 5.0}
                        </div>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">{course.category}</span>
                      </div>
                    </div>
                  ))}
                  {courses.filter(c => !enrolledCourses.find(ec => ec.id === c.id)).length === 0 && (
                      <div className="col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p>Anda telah mendaftar di semua kursus yang tersedia!</p>
                      </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {certificates.filter(c => c.studentName === currentUser.name).map((cert) => (
                <div key={cert.id} className="bg-white p-6 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                  <div className="h-16 w-16 bg-yellow-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-8 h-8 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{cert.courseTitle}</h3>
                    <p className="text-sm text-slate-500">Diterbitkan pada {new Date(cert.issueDate).toLocaleDateString()}</p>
                    <button 
                      onClick={() => onViewCertificate(cert)}
                      className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Lihat Sertifikat &rarr;
                    </button>
                  </div>
                </div>
              ))}
              {certificates.filter(c => c.studentName === currentUser.name).length === 0 && (
                <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center gap-2">
                  <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-slate-500 font-medium">Selesaikan kursus untuk mendapatkan sertifikat!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Daily Goal */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Target Harian
              </h3>
              <span className="text-xs font-bold text-slate-400">15/50 XP</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-red-500 w-[30%]"></div>
            </div>
            <p className="text-xs text-slate-500 text-center">Selesaikan 2 pelajaran lagi untuk mencapai target!</p>
          </div>

          {/* Leaderboard */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Papan Peringkat
              </h3>
              <button className="text-xs font-medium text-indigo-600 hover:underline">Lihat Semua</button>
            </div>
            <div className="space-y-4">
              {LEADERBOARD_DATA.map((user) => (
                <div key={user.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full 
                      ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                        user.rank === 2 ? 'bg-slate-200 text-slate-700' : 
                        user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}`}>
                      {user.rank}
                    </div>
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200" />
                    <span className={`text-sm font-medium ${user.rank === 2 ? 'text-indigo-600' : 'text-slate-700'}`}>
                      {user.name} {user.rank === 2 && '(Anda)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{user.points}</span>
                    {user.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {user.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Lencana Diperoleh
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3].map((i) => (
                <div key={i} className="aspect-square bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 border border-purple-100">
                  <Award className="w-6 h-6" />
                </div>
              ))}
              {[1,2,3,4,5].map((i) => (
                <div key={`l-${i}`} className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 border border-dashed border-slate-200">
                  <Award className="w-6 h-6" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    )}
    </>
  );
};

export default DashboardLearner;
