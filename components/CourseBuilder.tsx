
import React, { useState, useEffect } from 'react';
import { Course, CourseModule, UserRole, Question } from '../types';
import { 
  Save, ArrowLeft, Sparkles, Plus, Trash, 
  GripVertical, Video, FileText, Brain, Calendar,
  Edit, Upload, Radio, Clock, CheckCircle, X
} from './ui/Icons';
import { generateCourseStructure, generateQuizQuestions } from '../services/aiService';
import { useLms } from '../context/LmsContext';

interface CourseBuilderProps {
  onBack: () => void;
  onSave: (course: Partial<Course>) => void;
  initialData?: Partial<Course> | null;
}

const CourseBuilder: React.FC<CourseBuilderProps> = ({ onBack, onSave, initialData }) => {
  const { addCourse, updateCourse, currentUser } = useLms();
  const [step, setStep] = useState<1 | 2>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingQuizId, setGeneratingQuizId] = useState<string | null>(null);
  
  const [courseData, setCourseData] = useState<Partial<Course>>({
    title: '',
    description: '',
    category: '',
    modules: [],
    thumbnail: 'https://picsum.photos/400/225?grayscale',
    instructor: currentUser.name,
    studentsEnrolled: 0,
    rating: 5.0,
    progress: 0
  });

  useEffect(() => {
    if (initialData) {
      setCourseData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleGenerateStructure = async () => {
    if (!courseData.title) return;
    setIsGenerating(true);
    try {
      const { modules, description } = await generateCourseStructure(courseData.title);
      setCourseData(prev => ({ 
        ...prev, 
        modules,
        description: description // Overwrite description with AI generated one
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuiz = async (moduleId: string, moduleTitle: string, context?: string) => {
    setGeneratingQuizId(moduleId);
    try {
      // Use the context/material if provided, otherwise fallback to title
      const questions = await generateQuizQuestions(moduleTitle || courseData.title || 'General Topic', context);
      setCourseData(prev => ({
        ...prev,
        modules: prev.modules?.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              quizData: {
                id: `quiz-${Date.now()}`,
                title: `${m.title} Assessment`,
                questions: questions
              }
            };
          }
          return m;
        })
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingQuizId(null);
    }
  };

  const handlePublish = () => {
    if (courseData.title && courseData.modules) {
      if (initialData && initialData.id) {
        // Edit mode (only if ID exists)
        updateCourse({
          ...initialData as Course, // Type cast safe because we check ID
          ...courseData as Course,
          modules: courseData.modules as CourseModule[]
        });
      } else {
        // New Course
        const newCourse: Course = {
          id: `c-${Date.now()}`,
          title: courseData.title,
          description: courseData.description || '',
          instructor: currentUser.name,
          thumbnail: courseData.thumbnail || '',
          progress: 0,
          category: courseData.category || 'General',
          modules: courseData.modules as CourseModule[],
          studentsEnrolled: 0,
          rating: 0
        };
        addCourse(newCourse);
      }
      onBack();
    }
  };

  const addModule = (type: CourseModule['type']) => {
    const newModule: CourseModule = {
      id: `new-${Date.now()}`,
      title: `Modul Baru (${type.toUpperCase()})`,
      type,
      duration: '10:00',
      isCompleted: false,
      liveDate: type === 'live' ? new Date() : undefined,
      videoUrl: ''
    };
    setCourseData(prev => ({
      ...prev,
      modules: [...(prev.modules || []), newModule]
    }));
  };

  const removeModule = (id: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.filter(m => m.id !== id)
    }));
  };

  const updateModule = (id: string, field: keyof CourseModule, value: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => m.id === id ? { ...m, [field]: value } : m)
    }));
  };

  const addQuestion = (moduleId: string) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: 0
    };

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId) {
          const currentQuestions = m.quizData?.questions || [];
          return {
            ...m,
            quizData: {
              id: m.quizData?.id || `quiz-${Date.now()}`,
              title: m.quizData?.title || `${m.title} Assessment`,
              questions: [...currentQuestions, newQuestion]
            }
          };
        }
        return m;
      })
    }));
  };

  const updateQuestion = (moduleId: string, questionId: string, field: keyof Question, value: any) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId && m.quizData) {
          return {
            ...m,
            quizData: {
              ...m.quizData,
              questions: m.quizData.questions.map(q => q.id === questionId ? { ...q, [field]: value } : q)
            }
          };
        }
        return m;
      })
    }));
  };

  const updateQuestionType = (moduleId: string, questionId: string, type: 'mcq' | 'essay') => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId && m.quizData) {
          return {
            ...m,
            quizData: {
              ...m.quizData,
              questions: m.quizData.questions.map(q => {
                if (q.id === questionId) {
                   return { 
                     ...q, 
                     type, 
                     // Reset options if switching to essay, or add defaults if switching to mcq
                     options: type === 'mcq' ? (q.options || ['', '', '', '']) : undefined,
                     correctAnswer: type === 'mcq' ? (q.correctAnswer || 0) : undefined 
                   };
                }
                return q;
              })
            }
          };
        }
        return m;
      })
    }));
  };

  const updateQuestionOption = (moduleId: string, questionId: string, optionIdx: number, value: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId && m.quizData) {
          return {
            ...m,
            quizData: {
              ...m.quizData,
              questions: m.quizData.questions.map(q => {
                if (q.id === questionId && q.options) {
                  const newOptions = [...q.options];
                  newOptions[optionIdx] = value;
                  return { ...q, options: newOptions };
                }
                return q;
              })
            }
          };
        }
        return m;
      })
    }));
  };

  const setCorrectAnswer = (moduleId: string, questionId: string, correctIndex: number) => {
    updateQuestion(moduleId, questionId, 'correctAnswer', correctIndex);
  };

  const removeQuestion = (moduleId: string, questionId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules?.map(m => {
        if (m.id === moduleId && m.quizData) {
          return {
            ...m,
            quizData: {
              ...m.quizData,
              questions: m.quizData.questions.filter(q => q.id !== questionId)
            }
          };
        }
        return m;
      })
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in slide-in-from-right-10 duration-300">
      {/* Builder Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{initialData?.id ? 'Edit Kursus' : 'Buat Kursus Baru'}</h1>
            <p className="text-xs text-slate-500">{step === 1 ? 'Informasi Dasar' : 'Desain Kurikulum'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <Save className="w-4 h-4" />
            Simpan Draf
          </button>
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)}
              disabled={!courseData.title}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Lanjut: Kurikulum
            </button>
          ) : (
            <button 
              onClick={handlePublish}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {initialData?.id ? 'Perbarui Kursus' : 'Terbitkan Kursus'}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in">
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Detail Kursus</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Judul Kursus</label>
                    <input 
                      type="text" 
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                      placeholder="Contoh: Keselamatan Konstruksi Tingkat Lanjut"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kategori</label>
                    <select 
                      value={courseData.category}
                      onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Pilih Kategori</option>
                      <option value="K3 & Keselamatan">K3 & Keselamatan</option>
                      <option value="Teknik Sipil">Teknik Sipil</option>
                      <option value="Manajemen Proyek">Manajemen Proyek</option>
                      <option value="Struktur">Struktur</option>
                      <option value="Arsitektur">Arsitektur</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Deskripsi</label>
                    <textarea 
                      value={courseData.description}
                      onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                      placeholder="Apa yang akan dipelajari siswa dalam kursus ini?"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail</label>
                    <div className="h-40 w-full bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors">
                      <Upload className="w-8 h-8 mb-2" />
                      <span>Klik untuk unggah gambar</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in">
              {/* AI Copilot Banner */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white flex items-center justify-between shadow-lg">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <h3 className="font-bold text-lg">Perancang Kurikulum AI</h3>
                  </div>
                  <p className="text-indigo-100 text-sm max-w-lg">
                    Tidak ingin mulai dari nol? Biarkan AI membuat struktur modul, deskripsi, kuis, dan tugas secara komprehensif berdasarkan judul Anda.
                  </p>
                </div>
                <button 
                  onClick={handleGenerateStructure}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 disabled:opacity-80 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                  {isGenerating ? 'Sedang Membuat...' : 'Buat Struktur'}
                </button>
              </div>

               {/* Generated Description Review */}
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Detail Kursus: Deskripsi (AI)
                 </h3>
                 <p className="text-xs text-slate-500 mb-3">Deskripsi ini dibuat otomatis dan akan muncul di detail kursus.</p>
                 <textarea 
                    value={courseData.description}
                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-24 text-sm resize-none"
                    placeholder="Deskripsi kursus akan muncul di sini..."
                 />
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Kurikulum</h2>
                <div className="flex gap-2">
                  <button onClick={() => addModule('video')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50">
                    <Video className="w-3 h-3" /> + Video
                  </button>
                  <button onClick={() => addModule('text')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50">
                    <FileText className="w-3 h-3" /> + Teks
                  </button>
                  <button onClick={() => addModule('quiz')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50">
                    <Brain className="w-3 h-3" /> + Kuis
                  </button>
                  <button onClick={() => addModule('live')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 text-red-600 border-red-100">
                    <Radio className="w-3 h-3" /> + Live
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {courseData.modules?.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
                    <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Belum ada modul. Tambahkan manual atau gunakan AI.</p>
                  </div>
                )}

                {courseData.modules?.map((module, index) => (
                  <div key={module.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="cursor-grab text-slate-300 hover:text-slate-500 mt-2">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className={`p-2 rounded-lg mt-1 ${
                        module.type === 'video' ? 'bg-blue-100 text-blue-600' :
                        module.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                        module.type === 'live' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {module.type === 'video' ? <Video className="w-5 h-5" /> :
                         module.type === 'quiz' ? <Brain className="w-5 h-5" /> :
                         module.type === 'live' ? <Radio className="w-5 h-5" /> :
                         <FileText className="w-5 h-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <input 
                          type="text"
                          value={module.title}
                          onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                          className="font-semibold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                        />
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span>Tipe: {module.type.toUpperCase()}</span>
                          <span className="flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             <input 
                                value={module.duration}
                                onChange={(e) => updateModule(module.id, 'duration', e.target.value)}
                                className="w-12 bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none text-center"
                             />
                          </span>
                          {module.type === 'live' && (
                            <span className="flex items-center gap-1 text-red-500">
                              <Calendar className="w-3 h-3" />
                              {module.liveDate ? new Date(module.liveDate).toLocaleDateString() : 'Atur Tanggal'}
                            </span>
                          )}
                        </div>

                        {/* Video Specific Inputs */}
                        {module.type === 'video' && (
                          <div className="mt-3 space-y-3 animate-in fade-in">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Sumber Video</label>
                                <input
                                  type="text"
                                  value={module.videoUrl || ''}
                                  onChange={(e) => updateModule(module.id, 'videoUrl', e.target.value)}
                                  placeholder="Masukkan URL Video (YouTube/MP4) atau unggah file di bawah"
                                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400"
                                />
                            </div>

                            {/* Video Preview */}
                            {module.videoUrl && (
                                <div className="mt-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pratinjau</label>
                                    <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                        {(module.videoUrl.includes('youtube') || module.videoUrl.includes('embed')) ? (
                                            <iframe 
                                                src={module.videoUrl} 
                                                title="Video Preview"
                                                className="w-full h-full"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <video 
                                                src={module.videoUrl} 
                                                controls 
                                                className="w-full h-full"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="file"
                                accept="video/*"
                                id={`video-upload-${module.id}`}
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    updateModule(module.id, 'videoUrl', url);
                                  }
                                }}
                              />
                              <label 
                                htmlFor={`video-upload-${module.id}`}
                                className="flex items-center gap-2 px-3 py-2 bg-white text-indigo-600 rounded-lg text-xs font-medium cursor-pointer border border-indigo-200 w-full justify-center border-dashed hover:bg-indigo-50 transition-colors"
                              >
                                <Upload className="w-3 h-3" />
                                {module.videoUrl && module.videoUrl.startsWith('blob:') ? 'Ganti Video' : 'Unggah Video (MP4/WebM)'}
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Quiz Specific Inputs */}
                        {module.type === 'quiz' && (
                          <div className="mt-3 space-y-3 animate-in fade-in">
                            {/* Text Content Input for Context */}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Konteks Materi (Opsional)</label>
                                <textarea
                                  value={module.textContent || ''}
                                  onChange={(e) => updateModule(module.id, 'textContent', e.target.value)}
                                  placeholder="Masukkan ringkasan materi atau topik spesifik untuk membantu AI membuat soal yang akurat..."
                                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-slate-400 h-16 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pertanyaan Kuis</label>
                              <div className="flex gap-2">
                                <button
                                    onClick={() => addQuestion(module.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    <Plus className="w-3 h-3" /> Manual
                                </button>
                                <button
                                    onClick={() => handleGenerateQuiz(module.id, module.title, module.textContent)}
                                    disabled={generatingQuizId === module.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                >
                                    {generatingQuizId === module.id ? (
                                    <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                    <Sparkles className="w-3 h-3" />
                                    )}
                                    Buat dengan AI
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {module.quizData?.questions?.map((q, qIdx) => (
                                <div key={q.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-slate-400">Q{qIdx + 1}.</span>
                                    <input 
                                      value={q.text}
                                      onChange={(e) => updateQuestion(module.id, q.id, 'text', e.target.value)}
                                      className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-300 focus:bg-white p-1 outline-none text-slate-700 font-medium transition-colors"
                                      placeholder="Pertanyaan"
                                    />
                                    <select 
                                        value={q.type}
                                        onChange={(e) => updateQuestionType(module.id, q.id, e.target.value as 'mcq' | 'essay')}
                                        className="bg-slate-200 border-none rounded px-2 py-1 text-[10px] font-bold text-slate-600 cursor-pointer outline-none focus:ring-1 focus:ring-indigo-500"
                                    >
                                        <option value="mcq">MCQ</option>
                                        <option value="essay">Esai</option>
                                    </select>
                                    <button 
                                      onClick={() => removeQuestion(module.id, q.id)}
                                      className="text-slate-400 hover:text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  
                                  {q.type === 'mcq' ? (
                                    <div className="pl-6 grid grid-cols-1 gap-2">
                                        {q.options?.map((opt, optIdx) => (
                                        <div key={optIdx} className="flex items-center gap-2">
                                            <button
                                            onClick={() => setCorrectAnswer(module.id, q.id, optIdx)}
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${optIdx === q.correctAnswer ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-indigo-400'}`}
                                            title="Set as correct answer"
                                            >
                                            {optIdx === q.correctAnswer && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                            </button>
                                            <input 
                                            value={opt}
                                            onChange={(e) => updateQuestionOption(module.id, q.id, optIdx, e.target.value)}
                                            className={`flex-1 bg-transparent border-b border-transparent focus:border-indigo-300 focus:bg-white p-1 outline-none text-xs ${optIdx === q.correctAnswer ? 'text-green-700 font-medium' : 'text-slate-600'}`}
                                            placeholder={`Opsi ${optIdx + 1}`}
                                            />
                                        </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="pl-6 pt-2">
                                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded text-slate-500 italic flex items-start gap-2">
                                            <Brain className="w-4 h-4 text-indigo-400 mt-0.5" />
                                            <div>
                                                <p>Pertanyaan Esai.</p>
                                                <p className="text-[10px] mt-1 text-indigo-600">Jawaban siswa akan dinilai secara otomatis oleh AI berdasarkan relevansi dan kebenaran konteks.</p>
                                            </div>
                                        </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {(!module.quizData?.questions || module.quizData.questions.length === 0) && (
                                <div className="text-center py-4 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                  <p className="text-xs">Belum ada pertanyaan. Gunakan AI untuk membuat atau tambah manual.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => removeModule(module.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;
