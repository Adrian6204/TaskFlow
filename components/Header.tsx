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
    <header className="bg-slate-50/80 dark:bg-slate-900/80 shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">
          {user?.role === 'admin' ? 'Team Task Tracker' : 'My Task Tracker'}
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
          className="flex items-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          aria-label="Generate tasks with AI"
        >
          <SparklesIcon className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Generate with AI</span>
        </button>
        <button
          onClick={onAddTask}
          className="flex items-center bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          aria-label="Add a new task"
        >
          <PlusIcon className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
        <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
        <ThemeToggle />
        <button
          onClick={logout}
          className="flex items-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          aria-label="Log out"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;