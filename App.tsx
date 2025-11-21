
import React, { useState, useMemo } from 'react';
import type { Subject, Question, UserAnswer, QuizAttempt, Chapter } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Sidebar } from './components/Sidebar';
import { CreateQuizForm } from './components/CreateQuizForm';
import { QuizTaker } from './components/QuizTaker';
import { QuizResults } from './components/QuizResults';

export type View = 'create' | 'take' | 'results';

interface QuizSession {
    questions: Question[];
    userAnswers: UserAnswer;
    currentIndex: number;
    startTime: number;
}

const Welcome: React.FC<{onStart: () => void, hasQuestions: boolean}> = ({onStart, hasQuestions}) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h2 className="text-4xl font-bold mb-4">Chào mừng đến với QuizMe</h2>
        {hasQuestions ? (
            <>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                    Chọn "Làm bài" từ thanh bên để bắt đầu, hoặc "Tạo câu hỏi" để thêm nội dung mới.
                </p>
                <button onClick={onStart} className="px-8 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                    Bắt đầu làm bài
                </button>
            </>
        ) : (
             <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                Bạn chưa có câu hỏi nào. Hãy bắt đầu bằng cách chọn "Tạo câu hỏi" từ thanh bên!
            </p>
        )}
    </div>
);


const QuizSetup: React.FC<{subjects: Subject[], startQuiz: (questions: Question[]) => void, activeSession: QuizSession | null, resumeQuiz: () => void}> = ({ subjects, startQuiz, activeSession, resumeQuiz }) => {
    
    const allQuestions = useMemo(() => subjects.flatMap(s => s.chapters.flatMap(c => c.questions)), [subjects]);

    const handleStartRandom = () => {
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const quizSize = Math.min(shuffled.length, 20); // Max 20 questions for random quiz
        startQuiz(shuffled.slice(0, quizSize));
    };

    const handleStartSet = (questions: Question[]) => {
        if (questions.length > 0) {
            startQuiz(questions);
        }
    };
    
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">Luyện tập</h2>
            
            {activeSession && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 rounded-xl shadow-lg mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div>
                        <h3 className="text-xl font-semibold mb-1 text-green-800 dark:text-green-200">Tiếp tục làm bài</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                            Bạn đang dừng tại câu {activeSession.currentIndex + 1}/{activeSession.questions.length}.
                        </p>
                     </div>
                     <button onClick={resumeQuiz} className="px-6 py-2 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 shadow-md whitespace-nowrap">
                         Vào làm ngay
                     </button>
                </div>
            )}

            <div className="mb-10">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold mb-1">Bài tập ngẫu nhiên</h3>
                        <p className="text-blue-100 opacity-90">Hệ thống sẽ chọn ngẫu nhiên 20 câu hỏi từ tất cả các bộ câu hỏi của bạn.</p>
                    </div>
                    <button 
                        onClick={handleStartRandom} 
                        className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition shadow-md whitespace-nowrap"
                    >
                        Luyện tập ngay
                    </button>
                </div>
            </div>

            <h3 className="text-2xl font-bold mb-6 text-slate-700 dark:text-slate-300 border-b dark:border-slate-700 pb-2">Thư viện bộ câu hỏi của bạn</h3>
            
            <div className="space-y-8">
                {subjects.length === 0 && (
                    <p className="text-slate-500 italic">Chưa có bộ câu hỏi nào. Hãy vào mục "Tạo câu hỏi" để thêm mới.</p>
                )}
                
                {subjects.map(subject => (
                    <div key={subject.id} className="animate-fade-in">
                        <h4 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-4 flex items-center">
                            <span className="w-2 h-8 bg-blue-500 rounded-full mr-3"></span>
                            {subject.name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subject.chapters.map(chapter => {
                                const qCount = chapter.questions.length;
                                return (
                                    <button
                                        key={chapter.id}
                                        onClick={() => handleStartSet(chapter.questions)}
                                        disabled={qCount === 0}
                                        className="flex flex-col text-left bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex justify-between items-start w-full mb-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-300">
                                                {qCount} câu
                                            </span>
                                        </div>
                                        <h5 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {chapter.name}
                                        </h5>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-auto pt-2">
                                            {qCount > 0 ? 'Bấm để bắt đầu làm bài' : 'Chưa có câu hỏi'}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function App() {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('quizme-subjects', []);
  const [attempts, setAttempts] = useLocalStorage<QuizAttempt[]>('quizme-attempts', []);
  // Use local storage for the active session to persist data across reloads
  const [activeSession, setActiveSession] = useLocalStorage<QuizSession | null>('quizme-active-session', null);
  
  const [view, setView] = useState<View>('create');
  // We use a separate state for "taking quiz mode" to allow navigation away without losing the session, 
  // but specifically triggering the QuizTaker view.
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);

  const hasQuestions = useMemo(() => subjects.some(s => s.chapters.some(c => c.questions.length > 0)), [subjects]);
  const latestAttempt = useMemo(() => attempts.length > 0 ? attempts[attempts.length - 1] : null, [attempts]);

  // On initial load, if there is an active session, we don't auto-switch, but we know it exists.
  // If the user was taking a quiz, they will see the "Resume" option in 'take' view.

  const addQuestions = (subjectName: string, chapterName: string, newQuestionsData: Omit<Question, 'id'>[]) => {
    setSubjects(prevSubjects => {
        // Clone array to ensure immutability for the top level
        const newSubjects = [...prevSubjects];
        
        let subjectIndex = newSubjects.findIndex(s => s.name === subjectName);
        if (subjectIndex === -1) {
            newSubjects.push({ id: Date.now().toString(), name: subjectName, chapters: [] });
            subjectIndex = newSubjects.length - 1;
        }
        
        // Clone subject before mutation
        const subject = { ...newSubjects[subjectIndex] };
        newSubjects[subjectIndex] = subject;
        
        // Clone chapters array
        subject.chapters = [...subject.chapters];

        let chapterIndex = subject.chapters.findIndex(c => c.name === chapterName);
        if (chapterIndex === -1) {
             subject.chapters.push({ id: `${subject.id}-${Date.now()}`, name: chapterName, questions: [] });
             chapterIndex = subject.chapters.length - 1;
        }
        
        // Clone chapter
        const chapter = { ...subject.chapters[chapterIndex] };
        subject.chapters[chapterIndex] = chapter;
        
        // Clone questions and add new ones
        const newQuestionsWithIds = newQuestionsData.map((q, idx) => ({
            ...q,
            id: `${chapter.id}-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 9)}`
        }));
        
        chapter.questions = [...chapter.questions, ...newQuestionsWithIds];

        return newSubjects;
    });
  };

  const startQuiz = (questions: Question[]) => {
      const newSession: QuizSession = {
          questions,
          userAnswers: {},
          currentIndex: 0,
          startTime: Date.now(),
      };
      setActiveSession(newSession);
      setIsTakingQuiz(true);
      setView('take');
  };
  
  const resumeQuiz = () => {
      if (activeSession) {
          setIsTakingQuiz(true);
      }
  };

  const handleQuizProgress = (answers: UserAnswer, currentIndex: number) => {
      if (activeSession) {
          setActiveSession({
              ...activeSession,
              userAnswers: answers,
              currentIndex: currentIndex
          });
      }
  };
  
  const handleQuizSubmit = (userAnswers: UserAnswer) => {
      if(!activeSession) return;
      
      let score = 0;
      activeSession.questions.forEach(q => {
          if(userAnswers[q.id]?.trim().toLowerCase() === q.answer.trim().toLowerCase()){
              score++;
          }
      });
      
      const newAttempt: QuizAttempt = {
          questions: activeSession.questions,
          userAnswers,
          score,
          total: activeSession.questions.length,
          timestamp: Date.now(),
      };
      
      setAttempts(prev => [...prev, newAttempt]);
      setActiveSession(null);
      setIsTakingQuiz(false);
      setView('results');
  };
  
  const renderContent = () => {
    if (isTakingQuiz && activeSession) {
        return (
            <QuizTaker 
                key={activeSession.startTime}
                questions={activeSession.questions} 
                initialAnswers={activeSession.userAnswers}
                initialIndex={activeSession.currentIndex}
                onProgressUpdate={handleQuizProgress}
                onSubmit={handleQuizSubmit} 
            />
        );
    }
    
    switch (view) {
      case 'create':
        return <CreateQuizForm subjects={subjects} addQuestions={addQuestions} />;
      case 'take':
        return <QuizSetup subjects={subjects} startQuiz={startQuiz} activeSession={activeSession} resumeQuiz={resumeQuiz} />;
      case 'results':
        return latestAttempt ? <QuizResults attempt={latestAttempt} /> : <div className="text-center p-8">Chưa có kết quả nào.</div>;
      default:
        return <Welcome onStart={() => setView('take')} hasQuestions={hasQuestions} />;
    }
  };

  const handleViewChange = (v: View) => {
      // If user navigates away while taking a quiz, we keep the session but exit the "Taking" mode UI
      setIsTakingQuiz(false);
      setView(v);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
      <Sidebar 
        currentView={view} 
        onViewChange={handleViewChange}
        hasQuestions={hasQuestions}
        hasAttempts={attempts.length > 0}
      />
      <main className="flex-grow overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}
