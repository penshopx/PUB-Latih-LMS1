import React, { useState, useEffect } from 'react';
import { Course, CourseModule, UserRole } from '../types';
import { 
  Save, ArrowLeft, Sparkles, Plus, Trash, 
  GripVertical, Video, FileText, Brain, Calendar,
  Edit, Upload, Radio, Clock
} from './ui/Icons';
import { generateCourseStructure } from '../services/aiService';
import { useLms } from '../context/LmsContext';

interface CourseBuilderProps {
  onBack: () => void;
  onSave: (course: Partial<Course>) => void;
  initialData?: Course | null;
}

const CourseBuilder: React.FC<CourseBuilderProps> = ({ onBack, onSave, initialData }) => {
  const { addCourse, updateCourse, currentUser } = useLms();
  const [step, setStep] = useState<1 | 2>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
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
      setCourseData(initialData);
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
        description: prev.description ? prev.description : description
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = () => {
    if (courseData.title && courseData.modules) {
      if (initialData) {
        // Edit mode
        updateCourse({
          ...initialData,
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
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Module`,
      type,
      duration: '10:00',
      isCompleted: false,
      liveDate: type === 'live' ? new Date() : undefined
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in slide-in-from-right-10 duration-300">
      {/* Builder Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{initialData ? 'Edit Course' : 'Create New Course'}</h1>
            <p className="text-xs text-slate-500">{step === 1 ? 'Basic Information' : 'Curriculum Design'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)}
              disabled={!courseData.title}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Next: Curriculum
            </button>
          ) : (
            <button 
              onClick={handlePublish}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {initialData ? 'Update Course' : 'Publish Course'}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in">
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Course Details</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Course Title</label>
                    <input 
                      type="text" 
                      value={courseData.title}
                      onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                      placeholder="e.g., Advanced Artificial Intelligence"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <select 
                      value={courseData.category}
                      onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">Select Category</option>
                      <option value="AI">Artificial Intelligence</option>
                      <option value="Development">Development</option>
                      <option value="Business">Business</option>
                      <option value="Design">Design</option>
                      <option value="Marketing">Marketing</option>
                      <option value="General">General</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea 
                      value={courseData.description}
                      onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                      placeholder="What will students learn in this course?"
                      className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Thumbnail</label>
                    <div className="h-40 w-full bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors">
                      <Upload className="w-8 h-8 mb-2" />
                      <span>Click to upload image</span>
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
                    <h3 className="font-bold text-lg">AI Curriculum Designer</h3>
                  </div>
                  <p className="text-indigo-100 text-sm max-w-lg">
                    Don't want to start from scratch? Let PUB-Latih AI generate a comprehensive module structure, course description, quizzes, and assignments based on your title.
                  </p>
                </div>
                <button 
                  onClick={handleGenerateStructure}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-bold text-sm hover:bg-indigo-50 disabled:opacity-80 disabled:cursor-not-allowed transition-all shadow-xl"
                >
                  {isGenerating ? 'Generating...' : 'Generate Structure'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Curriculum</h2>
                <div className="flex gap-2">
                  <button onClick={() => addModule('video')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50">
                    <Video className="w-3 h-3" /> + Video
                  </button>
                  <button onClick={() => addModule('text')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50">
                    <FileText className="w-3 h-3" /> + Text
                  </button>
                  <button onClick={() => addModule('quiz')} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50">
                    <Brain className="w-3 h-3" /> + Quiz
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
                    <p>No modules yet. Add manually or use AI.</p>
                  </div>
                )}

                {courseData.modules?.map((module, index) => (
                  <div key={module.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-indigo-300 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="cursor-grab text-slate-300 hover:text-slate-500">
                        <GripVertical className="w-5 h-5" />
                      </div>
                      <div className={`p-2 rounded-lg ${
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
                          <span>Type: {module.type.toUpperCase()}</span>
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
                              {module.liveDate ? new Date(module.liveDate).toLocaleDateString() : 'Set Date'}
                            </span>
                          )}
                        </div>
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