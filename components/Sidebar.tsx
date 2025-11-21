
import React from 'react';
import type { View } from '../App';
import { PlusIcon } from './icons/PlusIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  hasQuestions: boolean;
  hasAttempts: boolean;
}

const NavButton: React.FC<{
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ isActive, onClick, disabled, children }) => {
  const baseClasses = 'w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200';
  const activeClasses = 'bg-blue-600 text-white';
  const inactiveClasses = 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700';
  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`}
    >
      {children}
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, hasQuestions, hasAttempts }) => {
  return (
    <aside className="w-64 bg-white dark:bg-slate-800 p-4 flex flex-col space-y-4 shadow-lg h-screen sticky top-0">
      <div className="flex items-center space-x-2 p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">QuizMe</h1>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          <li>
            <NavButton isActive={currentView === 'create'} onClick={() => onViewChange('create')}>
              <PlusIcon className="w-6 h-6" />
              <span>Tạo câu hỏi</span>
            </NavButton>
          </li>
          <li>
            <NavButton isActive={currentView === 'take'} onClick={() => onViewChange('take')} disabled={!hasQuestions}>
              <BookOpenIcon className="w-6 h-6" />
              <span>Làm bài</span>
            </NavButton>
          </li>
          <li>
            <NavButton isActive={currentView === 'results'} onClick={() => onViewChange('results')} disabled={!hasAttempts}>
              <ChartBarIcon className="w-6 h-6" />
              <span>Kết quả & Ôn tập</span>
            </NavButton>
          </li>
        </ul>
      </nav>
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 p-2">
        <p>Phiên bản 1.0.0</p>
        <p>Được tạo với React & Gemini</p>
      </div>
    </aside>
  );
};
