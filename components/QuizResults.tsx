
import React, { useState, useMemo } from 'react';
import type { QuizAttempt, Question } from '../types';
import { getExplanationForQuestion } from '../services/geminiService';

interface QuizResultsProps {
  attempt: QuizAttempt;
}

const Explanation: React.FC<{ question: Question, userAnswer: string }> = ({ question, userAnswer }) => {
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchExplanation = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await getExplanationForQuestion(question, userAnswer);
            setExplanation(result);
        } catch (err) {
            setError('Không thể tải giải thích. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (explanation) {
        return <div className="mt-2 p-3 bg-sky-50 dark:bg-sky-900/50 border-l-4 border-sky-500 text-sm whitespace-pre-wrap">{explanation}</div>
    }
    
    return (
      <div className="mt-2">
        <button onClick={fetchExplanation} disabled={isLoading} className="text-sm text-blue-600 hover:underline disabled:opacity-50">
            {isLoading ? 'Đang tải...' : '🤖 Xem giải thích từ AI'}
        </button>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
}

export const QuizResults: React.FC<QuizResultsProps> = ({ attempt }) => {
  const { questions, userAnswers, score, total } = attempt;

  const incorrectAnswers = useMemo(() => {
    return questions.filter(q => userAnswers[q.id]?.trim().toLowerCase() !== q.answer.trim().toLowerCase());
  }, [questions, userAnswers]);

  const reviewTopics = useMemo(() => {
    const topicCounts: { [topic: string]: number } = {};
    incorrectAnswers.forEach(q => {
      topicCounts[q.topic] = (topicCounts[q.topic] || 0) + 1;
    });
    return Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([topic, count]) => ({ topic, count }));
  }, [incorrectAnswers]);

  const scorePercentage = total > 0 ? (score / total) * 100 : 0;
  const scoreColor = scorePercentage >= 80 ? 'text-green-500' : scorePercentage >= 50 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white">Kết quả bài làm</h2>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Điểm số</h3>
            <p className={`text-5xl font-bold mt-2 ${scoreColor}`}>{score} / {total}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">Tỷ lệ đúng</h3>
            <p className={`text-5xl font-bold mt-2 ${scoreColor}`}>{scorePercentage.toFixed(0)}%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Gợi ý ôn tập</h3>
            {reviewTopics.length > 0 ? (
                <ul className="space-y-1 text-sm">
                    {reviewTopics.slice(0, 3).map(({ topic, count }) => (
                        <li key={topic} className="flex justify-between">
                            <span className="font-medium">{topic}</span>
                            <span className="text-red-500">{count} câu sai</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-green-600 dark:text-green-400">Chúc mừng! Bạn đã trả lời đúng tất cả các câu hỏi.</p>
            )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Xem lại chi tiết</h3>
        <div className="space-y-6">
            {questions.map((q, index) => {
                const userAnswer = userAnswers[q.id] || "Chưa trả lời";
                const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
                
                return (
                    <div key={q.id} className="border-b border-slate-200 dark:border-slate-700 pb-4">
                        <p className="font-semibold mb-2">{index + 1}. {q.text}</p>
                        <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
                           <p className="mb-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Câu trả lời của bạn: </span> 
                                <span className={isCorrect ? 'text-green-700 dark:text-green-400 font-bold' : 'text-red-700 dark:text-red-400 font-bold'}>{userAnswer}</span>
                           </p>
                           
                           <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                <p className="flex items-start">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 mr-2 shrink-0">Đáp án đúng: </span>
                                    <span className="text-green-700 dark:text-green-400 font-bold">{q.answer}</span>
                                </p>
                           </div>

                           {!isCorrect && <Explanation question={q} userAnswer={userAnswer} />}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
