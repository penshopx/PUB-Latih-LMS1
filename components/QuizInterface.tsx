
import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { CheckCircle, AlertCircle, Brain, Check, X, FileText, Sparkles } from './ui/Icons';
import { gradeEssay } from '../services/aiService';

interface QuizInterfaceProps {
  quiz: Quiz;
  moduleId: string;
  onComplete: (score: number) => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quiz, moduleId, onComplete }) => {
  const STORAGE_KEY = `pub_latih_quiz_${moduleId}_${quiz.id}`;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Initialize state from local storage to restore progress
  // For MCQs: value is index (number). For Essay: value is text (string).
  const [answers, setAnswers] = useState<Record<string, any>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Store essay grades: { questionId: { score: number, feedback: string } }
  const [essayGrades, setEssayGrades] = useState<Record<string, { score: number, feedback: string }>>({});
  const [isGrading, setIsGrading] = useState(false);
  
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
      } catch (error) {
        console.error("Failed to save quiz progress:", error);
      }
    }
  }, [answers, STORAGE_KEY]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleOptionSelect = (optionIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleEssayChange = (text: string) => {
    if (showResults) return;
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: text
    }));
  }

  const handleSubmit = async () => {
    setIsGrading(true);
    
    // Process Essay Grading first
    const essayQuestions = quiz.questions.filter(q => q.type === 'essay');
    const newGrades: Record<string, { score: number, feedback: string }> = {};

    // Use Promise.all for parallel grading to improve speed
    const gradingPromises = essayQuestions.map(async (q) => {
        const studentAnswer = answers[q.id] || "";
        if (studentAnswer.trim()) {
            const gradingResult = await gradeEssay(q.text, studentAnswer);
            return { id: q.id, result: gradingResult };
        } else {
            return { id: q.id, result: { score: 0, feedback: "Tidak ada jawaban." } };
        }
    });

    const results = await Promise.all(gradingPromises);
    results.forEach(item => {
        newGrades[item.id] = item.result;
    });

    setEssayGrades(newGrades);
    setIsGrading(false);
    setShowResults(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  if (showResults) {
    let totalScore = 0;
    let maxScore = 0;

    quiz.questions.forEach(q => {
        maxScore += 100;
        if (q.type === 'mcq') {
            if (answers[q.id] === q.correctAnswer) totalScore += 100;
        } else if (q.type === 'essay') {
            if (essayGrades[q.id]) {
                totalScore += essayGrades[q.id].score;
            }
        }
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const correctCount = quiz.questions.filter(q => 
        (q.type === 'mcq' && answers[q.id] === q.correctAnswer) || 
        (q.type === 'essay' && (essayGrades[q.id]?.score || 0) >= 60)
    ).length;

    return (
      <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Kuis Selesai!</h2>
          <p className="text-slate-500 mb-8">Berikut ringkasan performa yang dianalisis AI.</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 w-32">
              <div className="text-sm text-green-600 font-medium mb-1">Skor</div>
              <div className="text-3xl font-bold text-green-700">{percentage}%</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 w-32">
              <div className="text-sm text-blue-600 font-medium mb-1">Lulus</div>
              <div className="text-3xl font-bold text-blue-700">{correctCount}/{quiz.questions.length}</div>
            </div>
          </div>

          <div className="text-left space-y-4 mb-8">
            <h3 className="font-semibold text-slate-900">Tinjau Jawaban:</h3>
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-sm font-medium text-slate-400">Q{idx + 1}</span>
                  <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 mb-2">{q.text}</p>
                      {q.type === 'mcq' ? (
                          <div className="text-sm space-y-1">
                            {q.options?.map((opt, optIdx) => {
                                const isSelected = answers[q.id] === optIdx;
                                const isCorrect = q.correctAnswer === optIdx;
                                
                                let colorClass = "text-slate-500";
                                let icon = null;
                                
                                if (isCorrect) {
                                colorClass = "text-green-600 font-medium";
                                icon = <Check className="w-4 h-4" />;
                                } else if (isSelected && !isCorrect) {
                                colorClass = "text-red-600";
                                icon = <X className="w-4 h-4" />;
                                }

                                return (
                                <div key={optIdx} className={`flex items-center gap-2 ${colorClass}`}>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected || isCorrect ? 'border-current' : 'border-slate-300'}`}>
                                    {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                                    </div>
                                    {opt} {icon}
                                </div>
                                );
                            })}
                          </div>
                      ) : (
                          <div className="mt-2">
                              <div className="bg-white p-3 rounded border border-slate-200 text-sm text-slate-700 italic mb-3">
                                  "{answers[q.id]}"
                              </div>
                              <div className="bg-indigo-50 p-3 rounded border border-indigo-100">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1 text-indigo-700 font-bold text-xs">
                                        <Sparkles className="w-3 h-3" />
                                        Penilaian AI
                                    </div>
                                    <span className={`text-xs font-bold ${essayGrades[q.id]?.score >= 60 ? 'text-green-600' : 'text-red-500'}`}>
                                        Skor: {essayGrades[q.id]?.score}/100
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600">{essayGrades[q.id]?.feedback}</p>
                              </div>
                          </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onComplete(percentage)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors w-full sm:w-auto"
          >
            Kembali ke Kursus
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
          <span>Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Selesai</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
           <div className="flex-1">
                <span className="inline-block px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded mb-2">
                    {currentQuestion.type === 'essay' ? 'Pertanyaan Esai' : 'Pilihan Ganda'}
                </span>
                <h3 className="text-xl font-semibold text-slate-900">
                    {currentQuestion.text}
                </h3>
           </div>
        </div>

        <div className="space-y-3 mb-8">
          {currentQuestion.type === 'mcq' ? (
             currentQuestion.options?.map((option, index) => (
                <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion.id] === index
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
                >
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    answers[currentQuestion.id] === index ? 'border-indigo-600' : 'border-slate-300'
                    }`}>
                    {answers[currentQuestion.id] === index && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    )}
                    </div>
                    {option}
                </div>
                </button>
            ))
          ) : (
              <div className="space-y-2">
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleEssayChange(e.target.value)}
                    placeholder="Ketik jawaban Anda di sini (minimal 1 kalimat)..."
                    className="w-full h-40 p-4 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-700 text-sm resize-none"
                  />
                  <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded">
                      <Sparkles className="w-3 h-3" />
                      Jawaban ini akan dinilai secara otomatis oleh AI.
                  </div>
              </div>
          )}
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-100">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0 || isGrading}
            className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={isGrading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isGrading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menilai...
                  </>
              ) : (
                  'Kirim Kuis'
              )}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Selanjutnya
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
