import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import ThemeToggle from './ThemeToggle';
import { SearchIcon } from './icons/SearchIcon';
import { Employee } from '../types';

interface HeaderProps {
  onAddTask: () => void;
  onGenerateTasks: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenProfile: () => void;
  currentUserEmployee?: Employee;
}

const Header: React.FC<HeaderProps> = ({ onAddTask, onGenerateTasks, searchTerm, onSearchChange, onOpenProfile, currentUserEmployee }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-700/80 shadow-sm p-4 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
          TaskFlow
        </h1>
        <div className="relative hidden lg:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input 
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 sm:text-sm"
            />
        </div>
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
        
        {/* Profile Section */}
        <div 
            onClick={onOpenProfile}
            className="flex items-center space-x-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 rounded-lg transition-colors group"
            title="Edit Profile"
        >
            {currentUserEmployee ? (
                <img 
                    src={currentUserEmployee.avatarUrl} 
                    alt={currentUserEmployee.name} 
                    className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 transition-colors"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                    {user?.username.charAt(0).toUpperCase()}
                </div>
            )}
            <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {currentUserEmployee?.name || user?.username}
            </span>
        </div>

        <button
          onClick={logout}
          className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-2 rounded-lg"
          aria-label="Log out"
          title="Log out"
        >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;