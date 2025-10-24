import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onAddTask: () => void;
  onGenerateTasks: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTask, onGenerateTasks }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          TaskFlow
        </h1>
        {user && (
          <span className="hidden sm:inline-block bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-3 py-1 text-sm font-semibold">
            Logged in as {user.username}
          </span>
        )}
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onGenerateTasks}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm"
          aria-label="Generate tasks with AI"
        >
          <SparklesIcon className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Generate with AI</span>
        </button>
        <button
          onClick={onAddTask}
          className="flex items-center bg-white dark:bg-slate-800 hover:bg-slate-100/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-bold py-2 px-4 rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm"
          aria-label="Add a new task"
        >
          <PlusIcon className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
        <ThemeToggle />
        <button
          onClick={logout}
          className="flex items-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold py-2 px-2 sm:px-4 rounded-lg"
          aria-label="Log out"
        >
           <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;