import React from 'react';
import { Course } from '../types';
import { 
  ArrowLeft, PlayCircle, Clock, Star, Users, 
  CheckCircle, Lock, FileText, Video, Brain 
} from './ui/Icons';
import { useLms } from '../context/LmsContext';

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEnroll: () => void;
  isEnrolled?: boolean;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ course, onBack, onEnroll, isEnrolled = false }) => {
  const { getStudentProgress, currentUser } = useLms();
  const progress = getStudentProgress(currentUser.id, course.id);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in slide-in-from-bottom-10 duration-500">
      
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white h-[400px]">
        <div className="absolute inset-0 overflow-hidden">
           <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-30 blur-sm" />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 h-full flex flex-col justify-center">
          <button onClick={onBack} className="absolute top-6 left-6 p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold text-sm uppercase tracking-wider">
            <span className="px-2 py-1 bg-white/10 rounded">{course.category}</span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current" /> {course.rating}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight max-w-3xl">
            {course.title}
          </h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
            {course.description}
          </p>
          
          <div className="flex items-center gap-6 text-sm font-medium text-slate-300">
            <div className="flex items-center gap-2">
              <img src={`https://picsum.photos/seed/${course.instructor}/100`} alt="inst" className="w-8 h-8 rounded-full border-2 border-indigo-500" />
              <span>{course.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>~4 Minggu</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>{course.studentsEnrolled.toLocaleString()} Siswa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-10 -mt-20 relative z-10">
        
        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Apa yang akan Anda pelajari</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2,3,4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm">Pemahaman komprehensif tentang konsep inti dan teknik lanjutan.</p>
                </div>
              ))}
            </div>
          </div>

          {/* Syllabus */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Silabus Kursus</h2>
            <div className="space-y-4">
              {course.modules.length > 0 ? course.modules.map((module, idx) => {
                 const isCompleted = progress?.completedModuleIds.includes(module.id);
                 return (
                  <div key={module.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg shadow-sm ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400'}`}>
                         {isCompleted ? <CheckCircle className="w-5 h-5" /> :
                          module.type === 'video' ? <Video className="w-5 h-5" /> : 
                          module.type === 'quiz' ? <Brain className="w-5 h-5" /> : 
                          <FileText className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className={`font-medium ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>Modul {idx + 1}: {module.title}</h4>
                        <p className="text-xs text-slate-500">{module.type.toUpperCase()} • {module.duration}</p>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {isCompleted ? 'Selesai' : 'Terbuka'}
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                 );
              }) : (
                <p className="text-slate-500 italic">Modul kursus sedang diperbarui.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: CTA */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 sticky top-24">
             <div className="text-3xl font-bold text-slate-900 mb-2">Gratis</div>
             <p className="text-slate-500 text-sm mb-6">Akses penuh ke semua materi kursus.</p>
             
             <button 
               onClick={onEnroll}
               className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 mb-4"
             >
               {isEnrolled ? 'Masuk Kelas' : 'Daftar Sekarang'}
             </button>

             <div className="space-y-4 text-sm text-slate-600">
               <div className="flex items-center gap-3">
                 <PlayCircle className="w-5 h-5 text-slate-400" />
                 <span>Video on-demand</span>
               </div>
               <div className="flex items-center gap-3">
                 <FileText className="w-5 h-5 text-slate-400" />
                 <span>Akses di ponsel dan TV</span>
               </div>
               <div className="flex items-center gap-3">
                 <Brain className="w-5 h-5 text-slate-400" />
                 <span>Sertifikat penyelesaian</span>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseDetail;