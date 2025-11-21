
import React, { useState, useEffect } from 'react';
import type { Question, UserAnswer } from '../types';
import { QuestionType } from '../types';

interface QuizTakerProps {
  questions: Question[];
  initialAnswers?: UserAnswer;
  initialIndex?: number;
  onProgressUpdate?: (answers: UserAnswer, currentIndex: number) => void;
  onSubmit: (answers: UserAnswer) => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ questions, initialAnswers = {}, initialIndex = 0, onProgressUpdate, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialIndex);
  const [userAnswers, setUserAnswers] = useState<UserAnswer>(initialAnswers);
  
  const currentQuestion = questions[currentQuestionIndex];

  // Report progress to parent whenever state changes
  useEffect(() => {
      if (onProgressUpdate) {
          onProgressUpdate(userAnswers, currentQuestionIndex);
      }
  }, [userAnswers, currentQuestionIndex, onProgressUpdate]);
  
  const handleAnswerChange = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    // Removed window.confirm to prevent submission issues
    onSubmit(userAnswers);
  };

  if (!questions || questions.length === 0) {
    return <div className="text-center p-8">Không có câu hỏi nào để hiển thị.</div>;
  }
  
  const renderQuestionOptions = () => {
    const userAnswer = userAnswers[currentQuestion.id] || '';

    switch (currentQuestion.type) {
      case QuestionType.MultipleChoice:
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <label key={index} className={`flex items-center p-4 border dark:border-slate-600 rounded-lg cursor-pointer transition-colors ${userAnswer === option ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={userAnswer === option}
                  onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-4 text-lg">{option}</span>
              </label>
            ))}
          </div>
        );
      case QuestionType.TrueFalse:
        return (
          <div className="flex space-x-4">
            {['Đúng', 'Sai'].map(option => (
              <label key={option} className={`flex-1 text-center p-4 border dark:border-slate-600 rounded-lg cursor-pointer transition-colors ${userAnswer === option ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={userAnswer === option}
                  onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="sr-only"
                />
                <span className="text-lg font-semibold">{option}</span>
              </label>
            ))}
          </div>
        );
      case QuestionType.FillInTheBlank:
        return (
          <input
            type="text"
            value={userAnswer}
            onChange={e => handleAnswerChange(currentQuestion.id, e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            placeholder="Nhập câu trả lời của bạn..."
          />
        );
      default:
        return null;
    }
  };

  const answeredCount = Object.keys(userAnswers).length;
  const totalQuestions = questions.length;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-screen overflow-hidden">
      {/* Main Content - Question Area */}
      <div className="flex-grow flex flex-col overflow-y-auto p-4 sm:p-6 md:p-8 lg:w-3/4 order-1">
        <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col">
           
            {/* Header info */}
            <div className="mb-4 flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span className="font-medium">Câu hỏi {currentQuestionIndex + 1}</span>
                <span>Chủ đề: {currentQuestion.topic}</span>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-md flex-grow flex-col justify-center min-h-[300px] flex">
                <p className="text-xl md:text-2xl font-semibold mb-8 leading-relaxed">{currentQuestion.text}</p>
                <div className="flex-grow">
                     {renderQuestionOptions()}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex justify-between items-center">
                <button
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    ← Trước
                </button>
                
                <button
                    onClick={goToNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Tiếp →
                </button>
            </div>
        </div>
      </div>

      {/* Sidebar - Question Palette */}
      <div className="bg-white dark:bg-slate-800 lg:w-1/4 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 flex flex-col order-2 lg:h-full z-10 shadow-lg lg:shadow-none">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
             <h3 className="font-bold text-lg text-slate-800 dark:text-white">Bảng câu hỏi</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400">Đã làm: {answeredCount}/{totalQuestions}</p>
         </div>
         
         <div className="p-4 overflow-y-auto flex-grow custom-scrollbar">
             <div className="grid grid-cols-5 gap-2">
                 {questions.map((_, index) => {
                     const isAnswered = !!userAnswers[questions[index].id];
                     const isCurrent = currentQuestionIndex === index;
                     return (
                         <button
                            key={index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`
                                aspect-square rounded-md text-sm font-medium border transition-all
                                ${isCurrent 
                                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900 z-10' 
                                    : 'border-slate-200 dark:border-slate-600 hover:border-blue-400'
                                }
                                ${isAnswered
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                    : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }
                            `}
                         >
                             {index + 1}
                         </button>
                     )
                 })}
             </div>
         </div>
         
         <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
             <button
                onClick={handleSubmit}
                className="w-full py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors shadow-md"
             >
                 Nộp bài & Xem kết quả
             </button>
         </div>
      </div>
    </div>
  );
};
