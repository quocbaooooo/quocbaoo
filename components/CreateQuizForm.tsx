
import React, { useState, useMemo, useEffect } from 'react';
import type { Subject, Question } from '../types';
import { QuestionType } from '../types';
import { generateQuestionsFromText } from '../services/geminiService';

interface CreateQuizFormProps {
  subjects: Subject[];
  addQuestions: (subjectName: string, chapterName: string, questions: Omit<Question, 'id'>[]) => void;
}

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className}`}
    />
));

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>((props, ref) => (
    <select
        ref={ref}
        {...props}
        className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className}`}
    >
        {props.children}
    </select>
));


const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
    <button
        {...props}
        className={`px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors ${props.className}`}
    >
        {children}
    </button>
);

type Mode = 'manual' | 'ai';

export const CreateQuizForm: React.FC<CreateQuizFormProps> = ({ subjects, addQuestions }) => {
  const [mode, setMode] = useState<Mode>('manual');
  
  // Shared State
  const [subjectName, setSubjectName] = useState('');
  const [chapterName, setChapterName] = useState('');

  // Manual State
  const [topic, setTopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>(QuestionType.MultipleChoice);
  const [options, setOptions] = useState(['', '', '', '']);
  const [answer, setAnswer] = useState('');

  // AI State
  const [sourceText, setSourceText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Omit<Question, 'id'>[]>([]);
  const [questionCount, setQuestionCount] = useState(5);

  // Editing AI Question State
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Omit<Question, 'id'> | null>(null);

  const subjectNames = useMemo(() => subjects.map(s => s.name), [subjects]);
  const chapterNames = useMemo(() => {
    const selectedSubject = subjects.find(s => s.name === subjectName);
    return selectedSubject ? selectedSubject.chapters.map(c => c.name) : [];
  }, [subjects, subjectName]);

  const resetManualForm = () => {
    setTopic('');
    setQuestionText('');
    setQuestionType(QuestionType.MultipleChoice);
    setOptions(['', '', '', '']);
    setAnswer('');
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName || !chapterName || !questionText || !answer) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    let questionData: Omit<Question, 'id'> = {
      text: questionText,
      type: questionType,
      answer: answer,
      topic: topic || 'Chung',
    };

    if (questionType === QuestionType.MultipleChoice) {
      if (options.some(opt => opt.trim() === '')) {
        alert('Vui lòng điền đầy đủ 4 lựa chọn.');
        return;
      }
      questionData.options = options;
    }
    
    if (questionType === QuestionType.TrueFalse && !['Đúng', 'Sai'].includes(answer)){
       alert('Đáp án cho câu hỏi Đúng/Sai phải là "Đúng" hoặc "Sai".');
       return;
    }

    addQuestions(subjectName, chapterName, [questionData]);
    resetManualForm();
    alert('Thêm câu hỏi thành công!');
  };

  const handleAiGenerate = async () => {
      if (!sourceText.trim()) {
          alert("Vui lòng nhập văn bản nguồn.");
          return;
      }
      setIsGenerating(true);
      try {
          const questions = await generateQuestionsFromText(sourceText, questionCount);
          setGeneratedQuestions(questions);
      } catch (error) {
          alert("Có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại.");
          console.error(error);
      } finally {
          setIsGenerating(false);
      }
  };

  const handleSaveGenerated = () => {
      if (!subjectName || !chapterName) {
          alert("Vui lòng chọn Danh mục và Bộ câu hỏi trước khi lưu.");
          return;
      }
      
      if (generatedQuestions.length === 0) return;

      addQuestions(subjectName, chapterName, generatedQuestions);
      
      setGeneratedQuestions([]);
      setSourceText('');
      alert(`Đã lưu ${generatedQuestions.length} câu hỏi vào bộ "${chapterName}"!`);
  };

  const removeGeneratedQuestion = (index: number) => {
      setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const startEditing = (index: number) => {
      setEditingIndex(index);
      setEditData({ ...generatedQuestions[index] });
  };

  const saveEditing = () => {
      if (editingIndex !== null && editData) {
          const updated = [...generatedQuestions];
          updated[editingIndex] = editData;
          setGeneratedQuestions(updated);
          setEditingIndex(null);
          setEditData(null);
      }
  };

  const cancelEditing = () => {
      setEditingIndex(null);
      setEditData(null);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const isManualFormValid = subjectName && chapterName && questionText && answer && (questionType !== QuestionType.MultipleChoice || options.every(opt => opt.trim() !== ''));

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Thêm câu hỏi mới</h2>
          <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-1 flex">
              <button 
                onClick={() => setMode('manual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}
              >
                  Thủ công
              </button>
              <button 
                onClick={() => setMode('ai')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'ai' ? 'bg-white dark:bg-slate-600 text-blue-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}
              >
                  Tự động (AI)
              </button>
          </div>
      </div>

      <div className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg relative">
        {/* Subject and Chapter - Common for both modes */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border border-blue-100 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3 uppercase tracking-wide">Lưu vào bộ câu hỏi</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="subject">Danh mục</label>
              <Input list="subject-list" id="subject" value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="VD: Tiếng Anh, Lịch sử, Marketing..." required />
              <datalist id="subject-list">
                {subjectNames.map(name => <option key={name} value={name} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="chapter">Tên bộ câu hỏi</label>
              <Input list="chapter-list" id="chapter" value={chapterName} onChange={e => setChapterName(e.target.value)} placeholder="VD: Đề thi giữa kỳ, Từ vựng bài 1..." required disabled={!subjectName} />
              <datalist id="chapter-list">
                {chapterNames.map(name => <option key={name} value={name} />)}
              </datalist>
            </div>
          </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700"/>

        {mode === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-6">
                {/* Topic */}
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="topic">Gắn thẻ chủ đề (Không bắt buộc)</label>
                    <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="VD: Thì hiện tại đơn, Chiến dịch Điện Biên Phủ..." />
                </div>

                {/* Question Details */}
                <div>
                <label className="block text-sm font-medium mb-1" htmlFor="questionText">Nội dung câu hỏi</label>
                <textarea
                    id="questionText"
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                    placeholder="Điền nội dung câu hỏi tại đây..."
                ></textarea>
                </div>

                <div>
                <label className="block text-sm font-medium mb-1" htmlFor="questionType">Loại câu hỏi</label>
                <Select id="questionType" value={questionType} onChange={e => {setQuestionType(e.target.value as QuestionType); setAnswer('');}}>
                    <option value={QuestionType.MultipleChoice}>Trắc nghiệm (4 lựa chọn)</option>
                    <option value={QuestionType.TrueFalse}>Đúng / Sai</option>
                    <option value={QuestionType.FillInTheBlank}>Điền vào chỗ trống</option>
                </Select>
                </div>

                {/* Dynamic Answer Fields */}
                {questionType === QuestionType.MultipleChoice && (
                <div className="space-y-4">
                    <label className="block text-sm font-medium">Các lựa chọn & Đáp án đúng</label>
                    <div className="grid md:grid-cols-2 gap-4">
                    {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <Input
                        type="text"
                        value={option}
                        onChange={e => handleOptionChange(index, e.target.value)}
                        placeholder={`Lựa chọn ${index + 1}`}
                        required
                        />
                        <input
                            type="radio"
                            name="mc-answer"
                            value={option}
                            checked={answer === option}
                            onChange={() => setAnswer(option)}
                            className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                            title="Chọn làm đáp án đúng"
                        />
                    </div>
                    ))}
                    </div>
                </div>
                )}

                {questionType === QuestionType.TrueFalse && (
                <div>
                    <label className="block text-sm font-medium mb-1">Đáp án đúng</label>
                    <Select value={answer} onChange={e => setAnswer(e.target.value)}>
                    <option value="">Chọn đáp án</option>
                    <option value="Đúng">Đúng</option>
                    <option value="Sai">Sai</option>
                    </Select>
                </div>
                )}

                {questionType === QuestionType.FillInTheBlank && (
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="fill-answer">Đáp án đúng</label>
                    <Input
                    id="fill-answer"
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Điền đáp án chính xác..."
                    required
                    />
                </div>
                )}
                
                <div className="flex justify-end">
                    <Button type="submit" disabled={!isManualFormValid}>Thêm câu hỏi</Button>
                </div>
            </form>
        ) : (
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="sourceText">Văn bản nguồn</label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Dán đoạn văn bản, tài liệu học tập hoặc ghi chú vào đây. AI sẽ tự động tạo câu hỏi dựa trên nội dung này.</p>
                    <textarea
                        id="sourceText"
                        value={sourceText}
                        onChange={e => setSourceText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        rows={10}
                        placeholder="Nội dung văn bản..."
                        disabled={generatedQuestions.length > 0}
                    ></textarea>
                </div>
                
                {generatedQuestions.length === 0 && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium">Số lượng câu hỏi:</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="20" 
                                value={questionCount} 
                                onChange={e => setQuestionCount(Number(e.target.value))}
                                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"
                            />
                        </div>
                        <Button onClick={handleAiGenerate} disabled={isGenerating || !sourceText}>
                            {isGenerating ? 'Đang phân tích & tạo...' : 'Tạo câu hỏi'}
                        </Button>
                    </div>
                )}

                {generatedQuestions.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Xem trước ({generatedQuestions.length} câu hỏi)</h3>
                            <div className="space-x-2">
                                <button 
                                    onClick={() => setGeneratedQuestions([])} 
                                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                    Hủy bỏ
                                </button>
                                <Button onClick={handleSaveGenerated} disabled={!subjectName || !chapterName}>
                                    Lưu tất cả vào kho
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {generatedQuestions.map((q, idx) => (
                                <div key={idx} className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 relative group">
                                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => startEditing(idx)}
                                            className="text-slate-400 hover:text-blue-500"
                                            title="Sửa câu hỏi"
                                        >
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button 
                                            onClick={() => removeGeneratedQuestion(idx)}
                                            className="text-slate-400 hover:text-red-500"
                                            title="Xóa câu hỏi"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="flex items-start gap-2 mb-2">
                                        <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded uppercase">
                                            {q.type === QuestionType.MultipleChoice ? 'Trắc nghiệm' : q.type === QuestionType.TrueFalse ? 'Đúng/Sai' : 'Điền từ'}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">{q.topic}</span>
                                    </div>
                                    <p className="font-medium mb-2">{q.text}</p>
                                    <div className="text-sm text-slate-600 dark:text-slate-300">
                                        {q.type === QuestionType.MultipleChoice && (
                                            <ul className="list-disc list-inside pl-2 mb-2">
                                                {q.options?.map((opt, i) => (
                                                    <li key={i} className={opt === q.answer ? 'text-green-600 dark:text-green-400 font-medium' : ''}>{opt}</li>
                                                ))}
                                            </ul>
                                        )}
                                        <p>Đáp án đúng: <span className="text-green-600 dark:text-green-400 font-medium">{q.answer}</span></p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* Editing Modal */}
        {editingIndex !== null && editData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                    <h3 className="text-xl font-bold mb-4">Chỉnh sửa câu hỏi</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Chủ đề</label>
                            <Input value={editData.topic} onChange={(e) => setEditData({...editData, topic: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nội dung câu hỏi</label>
                            <textarea 
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                value={editData.text}
                                onChange={(e) => setEditData({...editData, text: e.target.value})}
                            />
                        </div>

                        {editData.type === QuestionType.MultipleChoice && (
                            <div>
                                <label className="block text-sm font-medium mb-2">Lựa chọn (Chọn radio để đặt đáp án đúng)</label>
                                <div className="space-y-2">
                                    {editData.options?.map((opt, idx) => (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <input 
                                                type="radio" 
                                                name="edit-answer" 
                                                checked={editData.answer === opt} 
                                                onChange={() => setEditData({...editData, answer: opt})}
                                                className="flex-shrink-0"
                                            />
                                            <Input 
                                                value={opt} 
                                                onChange={(e) => {
                                                    const newOpts = [...(editData.options || [])];
                                                    newOpts[idx] = e.target.value;
                                                    // If this option was the answer, update answer too
                                                    const newAnswer = editData.answer === opt ? e.target.value : editData.answer;
                                                    setEditData({...editData, options: newOpts, answer: newAnswer});
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                         {editData.type === QuestionType.TrueFalse && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Đáp án đúng</label>
                                <Select value={editData.answer} onChange={(e) => setEditData({...editData, answer: e.target.value})}>
                                    <option value="Đúng">Đúng</option>
                                    <option value="Sai">Sai</option>
                                </Select>
                            </div>
                        )}

                        {editData.type === QuestionType.FillInTheBlank && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Đáp án đúng</label>
                                <Input value={editData.answer} onChange={(e) => setEditData({...editData, answer: e.target.value})} />
                            </div>
                        )}

                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button 
                            onClick={cancelEditing}
                            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                        >
                            Hủy
                        </button>
                        <Button onClick={saveEditing}>Lưu thay đổi</Button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
