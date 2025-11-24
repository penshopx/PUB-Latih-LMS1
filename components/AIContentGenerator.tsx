
import React, { useState } from 'react';
import { Brain, Video, FileText, Check, Copy, Sparkles, Layers, List, BookOpen, Printer, ArrowRight, Trash, Plus, X, ChevronLeft } from './ui/Icons';
import { generateCourseStructure, generateVideoScript, generateQuizQuestions, generateStrategicQuestions, generateDeepReport } from '../services/aiService';
import { CourseModule } from '../types';

type ContentType = 'structure' | 'script' | 'quiz' | 'summary';

interface AIContentGeneratorProps {
  onCreateCourse?: (data: { title: string, description: string, modules: CourseModule[] }) => void;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({ onCreateCourse }) => {
  const [activeType, setActiveType] = useState<ContentType>('structure');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState(''); // Used for audience or additional context
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  // Specific state for Summary Workflow
  const [summaryStep, setSummaryStep] = useState<1 | 2 | 3>(1); // 1: Input, 2: Questions Review, 3: Final Doc
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [reportFormat, setReportFormat] = useState('Laporan Eksekutif');

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    setResult(null);

    try {
      if (activeType === 'structure') {
        const data = await generateCourseStructure(topic);
        setResult(data);
      } else if (activeType === 'script') {
        const audience = context || 'Mahasiswa Teknik Sipil / Profesional Konstruksi';
        const script = await generateVideoScript(topic, audience);
        setResult(script);
      } else if (activeType === 'quiz') {
        const questions = await generateQuizQuestions(topic, context);
        setResult(questions);
      } else if (activeType === 'summary') {
         // Step 1: Generate Strategic Questions Guide
         const questions = await generateStrategicQuestions(topic, context);
         setGeneratedQuestions(questions);
         setSummaryStep(2);
      }
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFinalReport = async () => {
      setIsGenerating(true);
      try {
          const report = await generateDeepReport(topic, context, generatedQuestions, reportFormat);
          setResult(report);
          setSummaryStep(3);
      } catch (error) {
          console.error(error);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCopy = () => {
    if (!result) return;
    
    let textToCopy = "";
    if (typeof result === 'string') {
      textToCopy = result;
    } else {
      textToCopy = JSON.stringify(result, null, 2);
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetSummary = () => {
      setSummaryStep(1);
      setResult(null);
      setGeneratedQuestions([]);
      setReportFormat('Laporan Eksekutif');
  };

  const handleBackToInput = () => {
      setSummaryStep(1);
  };

  // Question Management Functions
  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...generatedQuestions];
    newQuestions[index] = value;
    setGeneratedQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = generatedQuestions.filter((_, i) => i !== index);
    setGeneratedQuestions(newQuestions);
  };

  const addQuestion = () => {
    setGeneratedQuestions([...generatedQuestions, ""]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
          <Brain className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Studio Konten AI</h1>
          <p className="text-slate-500">Buat silabus, skrip video, kuis, dan dokumen profesional secara instan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Type Selection */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Pilih Tipe Konten</label>
             <div className="space-y-2">
               <button 
                 onClick={() => { setActiveType('structure'); setResult(null); }}
                 className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${activeType === 'structure' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
               >
                 <Layers className="w-5 h-5" />
                 Struktur Kursus
               </button>
               <button 
                 onClick={() => { setActiveType('script'); setResult(null); }}
                 className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${activeType === 'script' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
               >
                 <Video className="w-5 h-5" />
                 Skrip Video
               </button>
               <button 
                 onClick={() => { setActiveType('quiz'); setResult(null); }}
                 className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${activeType === 'quiz' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
               >
                 <List className="w-5 h-5" />
                 Kuis Evaluasi
               </button>
               <button 
                 onClick={() => { setActiveType('summary'); resetSummary(); }}
                 className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${activeType === 'summary' ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
               >
                 <BookOpen className="w-5 h-5" />
                 Executive AI
               </button>
             </div>
          </div>

          {/* Form Inputs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            {activeType === 'summary' && summaryStep > 1 ? (
                <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                        <Check className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">Panduan Pertanyaan Dibuat</p>
                    <button 
                        onClick={resetSummary} 
                        className="text-xs text-indigo-600 hover:underline mt-2"
                    >
                        Mulai Ulang
                    </button>
                </div>
            ) : (
                <>
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {activeType === 'summary' ? 'Judul Materi / Topik Pembahasan' : 'Topik Utama'}
                    </label>
                    <input 
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={activeType === 'quiz' ? "Misal: K3 Listrik" : activeType === 'summary' ? "Judul Video / Topik Live Streaming" : "Misal: Manajemen Proyek"}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {activeType === 'script' ? 'Target Audiens' : activeType === 'summary' ? 'Sumber Materi (Konteks)' : 'Konteks Tambahan'}
                    </label>
                    <textarea 
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder={activeType === 'summary' ? "Tempel Transkrip Video Pembelajaran, Catatan Live Streaming, atau Ringkasan Tatap Muka di sini..." : "Tambahkan detail..."}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                        {activeType === 'summary' && "Mendukung input dari: Video Pembelajaran, Live Streaming, & Tatap Muka."}
                    </p>
                    </div>

                    <button 
                    onClick={handleGenerate}
                    disabled={!topic || isGenerating}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                    >
                    {isGenerating ? (
                        <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sedang Memproses...
                        </>
                    ) : (
                        <>
                        <Sparkles className="w-4 h-4" />
                        {activeType === 'summary' ? 'Analisis Materi' : 'Buat Konten'}
                        </>
                    )}
                    </button>
                </>
            )}
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full min-h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                {activeType === 'summary' ? <BookOpen className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {activeType === 'summary' ? 'Research & Reporting' : 'Hasil Generasi'}
              </h3>
              {result && activeType !== 'summary' && (
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-100 text-slate-600"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Disalin' : 'Salin Hasil'}
                </button>
              )}
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto max-h-[800px] bg-slate-50/30">
              {!result && !isGenerating && summaryStep === 1 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="max-w-xs text-center">
                    {activeType === 'summary' 
                        ? "Masukkan topik dan materi (Video/Live/Tatap Muka) untuk mulai menyusun berbagai dokumen profesional." 
                        : "Hasil konten akan muncul di sini."}
                  </p>
                </div>
              )}

              {isGenerating && (
                 <div className="flex flex-col items-center justify-center h-64 space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-indigo-600 font-medium animate-pulse">
                        {activeType === 'summary' && summaryStep === 2 
                            ? `Sedang Menulis ${reportFormat}... Mohon tunggu.` 
                            : "Sedang Menganalisis..."}
                    </p>
                 </div>
              )}

              {/* Summary Workflow: Step 2 - Review Questions */}
              {activeType === 'summary' && summaryStep === 2 && !isGenerating && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                              <List className="w-5 h-5" />
                              Fase 1: Tinjau Pertanyaan Strategis
                          </h4>
                          <p className="text-sm text-blue-800">
                              AI telah menyusun pertanyaan untuk memandu pembuatan dokumen. 
                              Silakan <strong>edit</strong>, <strong>tambah</strong>, atau <strong>hapus</strong> pertanyaan di bawah ini agar sesuai dengan kebutuhan laporan Anda.
                          </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-4">
                          <label className="block text-sm font-bold text-slate-700 mb-2">Pilih Format Dokumen Akhir</label>
                          <div className="relative">
                            <select 
                                    value={reportFormat}
                                    onChange={(e) => setReportFormat(e.target.value)}
                                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                >
                                    <option value="Laporan Eksekutif">Laporan Eksekutif (Bisnis)</option>
                                    <option value="Paper Ilmiah">Paper Ilmiah (Jurnal/Akademik)</option>
                                    <option value="Laporan Proyek Lapangan">Laporan Proyek Lapangan (Teknis)</option>
                                    <option value="Modul Pembelajaran">Modul Pembelajaran (Edukasi)</option>
                                    <option value="Skrip Presentasi">Skrip Presentasi (PowerPoint)</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <ArrowRight className="w-4 h-4 rotate-90" />
                            </div>
                          </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                             <span className="text-xs font-bold text-slate-500 uppercase">Daftar Pertanyaan ({generatedQuestions.length})</span>
                             <button
                                onClick={() => {
                                    const text = generatedQuestions.map((q, i) => `${i+1}. ${q}\nJawaban:\n\n`).join('');
                                    navigator.clipboard.writeText(text);
                                    alert("Template form disalin ke clipboard!");
                                }}
                                className="text-xs text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
                             >
                                <Copy className="w-3 h-3" /> Salin Template Form
                             </button>
                          </div>
                          
                          <div className="divide-y divide-slate-100">
                              {generatedQuestions.map((q, i) => (
                                  <div key={i} className="p-3 flex gap-3 items-start hover:bg-slate-50 transition-colors group">
                                      <span className="font-bold text-indigo-500 mt-2 text-sm">{i + 1}.</span>
                                      <div className="flex-1">
                                          <input 
                                            type="text"
                                            value={q}
                                            onChange={(e) => updateQuestion(i, e.target.value)}
                                            className="w-full p-2 text-sm text-slate-700 bg-transparent border-b border-transparent focus:border-indigo-300 focus:bg-white outline-none rounded transition-all"
                                            placeholder="Tulis pertanyaan..."
                                          />
                                      </div>
                                      <button 
                                        onClick={() => removeQuestion(i)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Hapus Pertanyaan"
                                      >
                                        <Trash className="w-4 h-4" />
                                      </button>
                                  </div>
                              ))}
                          </div>
                          <div className="p-3 bg-slate-50 border-t border-slate-200">
                              <button 
                                onClick={addQuestion}
                                className="w-full py-2 border border-dashed border-indigo-300 rounded-lg text-indigo-600 text-sm font-medium hover:bg-indigo-50 flex items-center justify-center gap-2 transition-colors"
                              >
                                <Plus className="w-4 h-4" /> Tambah Pertanyaan Manual
                              </button>
                          </div>
                      </div>

                      <div className="flex justify-between pt-4 border-t border-slate-200">
                          <button 
                              onClick={handleBackToInput}
                              className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
                          >
                              <ChevronLeft className="w-4 h-4" />
                              Kembali
                          </button>
                          <button 
                              onClick={handleGenerateFinalReport}
                              disabled={generatedQuestions.filter(q => q.trim()).length === 0}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                          >
                              <FileText className="w-5 h-5" />
                              Generate {reportFormat}
                              <ArrowRight className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
              )}

              {/* Summary Workflow: Step 3 - Final Document */}
              {activeType === 'summary' && summaryStep === 3 && result && (
                  <div className="animate-in fade-in">
                      <div className="flex justify-end gap-3 mb-6">
                           <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50">
                               <Printer className="w-4 h-4" /> Cetak / PDF
                           </button>
                           <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">
                               <Copy className="w-4 h-4" /> Salin Teks
                           </button>
                      </div>
                      
                      <div className="bg-white shadow-2xl border border-slate-200 p-8 md:p-12 min-h-[1000px] mx-auto max-w-4xl">
                           <div className="prose prose-slate max-w-none prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:leading-loose text-justify">
                               {/* Simulate Document Header */}
                               <div className="text-center border-b-4 border-double border-slate-800 pb-8 mb-12">
                                   <h1 className="text-4xl font-serif text-slate-900 uppercase tracking-widest mb-4">{topic}</h1>
                                   <p className="text-lg text-slate-600 font-serif italic">{reportFormat}</p>
                                   <p className="text-sm text-slate-400 mt-4">Dibuat secara otomatis oleh PUB-Latih AI System</p>
                                   <div className="mt-4 inline-block px-3 py-1 bg-slate-100 rounded text-xs text-slate-500">
                                      Sumber: Video / Live / Tatap Muka
                                   </div>
                               </div>
                               
                               {/* Markdown Content */}
                               <div dangerouslySetInnerHTML={{ 
                                   __html: result
                                     .replace(/^# (.*$)/gim, '') // Remove H1 as we rendered it manually
                                     .replace(/\n/g, '<br/>')
                                     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                     .replace(/## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 text-indigo-900 border-b border-slate-200 pb-2">$1</h2>')
                                     .replace(/### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-3 text-slate-800">$1</h3>')
                                     .replace(/- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>') 
                               }} />
                           </div>
                      </div>
                  </div>
              )}

              {/* Standard Results (Structure, Script, Quiz) */}
              {result && activeType === 'structure' && (
                <div className="space-y-6">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <h4 className="font-bold text-indigo-900 mb-2">Deskripsi Kursus</h4>
                    <p className="text-sm text-indigo-800">{result.description}</p>
                  </div>
                  <div className="space-y-3">
                    {result.modules.map((m: any, i: number) => (
                      <div key={i} className="p-4 border border-slate-200 rounded-lg flex items-start gap-3 bg-white">
                        <div className="mt-1 text-slate-400">
                          {m.type === 'video' ? <Video className="w-5 h-5" /> : m.type === 'quiz' ? <List className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-900">{m.title}</h5>
                          <p className="text-xs text-slate-500 uppercase mt-1">{m.type} • {m.duration}</p>
                          {m.textContent && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{m.textContent}</p>}
                          {m.transcript && <p className="text-sm text-slate-500 italic mt-2 line-clamp-2">"{m.transcript.substring(0, 100)}..."</p>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {onCreateCourse && (
                    <button 
                      onClick={() => onCreateCourse({
                        title: topic,
                        description: result.description,
                        modules: result.modules
                      })}
                      className="w-full mt-4 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                      <Layers className="w-5 h-5" />
                      Buat Kursus dari Silabus Ini
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {result && activeType === 'script' && (
                <div className="prose prose-indigo max-w-none bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                    {result}
                  </pre>
                </div>
              )}

              {result && activeType === 'quiz' && (
                <div className="space-y-4">
                  {result.map((q: any, i: number) => (
                    <div key={i} className="p-4 border border-slate-200 rounded-lg bg-white">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="font-bold text-indigo-600">Q{i + 1}.</span>
                        <p className="font-medium text-slate-900">{q.text}</p>
                      </div>
                      <div className="pl-8 space-y-2">
                        {q.options.map((opt: string, optIdx: number) => (
                          <div key={optIdx} className={`flex items-center gap-2 text-sm ${optIdx === q.correctAnswer ? 'text-green-600 font-bold' : 'text-slate-600'}`}>
                             <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${optIdx === q.correctAnswer ? 'border-green-600 bg-green-100' : 'border-slate-300'}`}>
                               {optIdx === q.correctAnswer && <div className="w-2 h-2 bg-green-600 rounded-full"></div>}
                             </div>
                             {opt}
                             {optIdx === q.correctAnswer && <Check className="w-4 h-4" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentGenerator;
