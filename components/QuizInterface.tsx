import React, { useState, useEffect } from 'react';
import { Quiz, Question } from '../types';
import { CheckCircle, AlertCircle, Brain, Check, X } from './ui/Icons';

interface QuizInterfaceProps {
  quiz: Quiz;
  moduleId: string;
  onComplete: (score: number) => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ quiz, moduleId, onComplete }) => {
  const STORAGE_KEY = `pub_latih_quiz_${moduleId}_${quiz.id}`;
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Initialize state from local storage to restore progress if available
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  
  const [showResults, setShowResults] = useState(false);

  // Auto-save answers whenever they change
  useEffect(() => {
    // Only save if we are not in results view (to avoid saving empty state if cleared, though we don't clear)
    if (Object.keys(selectedAnswers).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedAnswers));
      } catch (error) {
        console.error("Failed to save quiz progress:", error);
      }
    }
  }, [selectedAnswers, STORAGE_KEY]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleOptionSelect = (optionIndex: number) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    // Note: We keep the answers in storage so the user can review them or if they reload the page.
    // Answers will be overwritten if they take the quiz again and select new options.
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
    const correctCount = quiz.questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length;
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Quiz Completed!</h2>
          <p className="text-slate-500 mb-8">Here is your AI-analyzed performance summary.</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100 w-32">
              <div className="text-sm text-green-600 font-medium mb-1">Score</div>
              <div className="text-3xl font-bold text-green-700">{percentage}%</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 w-32">
              <div className="text-sm text-blue-600 font-medium mb-1">Correct</div>
              <div className="text-3xl font-bold text-blue-700">{correctCount}/{quiz.questions.length}</div>
            </div>
          </div>

          <div className="text-left space-y-4 mb-8">
            <h3 className="font-semibold text-slate-900">Review Answers:</h3>
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-sm font-medium text-slate-400">Q{idx + 1}</span>
                  <p className="text-sm font-medium text-slate-800">{q.text}</p>
                </div>
                <div className="pl-8 text-sm space-y-1">
                   {q.options?.map((opt, optIdx) => {
                     const isSelected = selectedAnswers[q.id] === optIdx;
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
              </div>
            ))}
          </div>

          <button 
            onClick={() => onComplete(percentage)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors w-full sm:w-auto"
          >
            Back to Course
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
          <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Completed</span>
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
           <h3 className="text-xl font-semibold text-slate-900">
             {currentQuestion.text}
           </h3>
           {Object.keys(selectedAnswers).length > 0 && (
             <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full flex items-center gap-1">
               <CheckCircle className="w-3 h-3" />
               Saved
             </span>
           )}
        </div>

        <div className="space-y-3 mb-8">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedAnswers[currentQuestion.id] === index
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedAnswers[currentQuestion.id] === index ? 'border-indigo-600' : 'border-slate-300'
                }`}>
                  {selectedAnswers[currentQuestion.id] === index && (
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  )}
                </div>
                {option}
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-100">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(selectedAnswers).length !== quiz.questions.length}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;