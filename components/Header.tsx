
import React from 'react';
import { User } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ViewColumnsIcon } from './icons/ViewColumnsIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeaderProps {
  activeSpace: string;
  currentView: 'list' | 'board' | 'calendar' | 'dashboard';
  onViewChange: (view: 'list' | 'board' | 'calendar' | 'dashboard') => void;
  onAddTask: () => void;
  onGenerateTasks: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  user: User;
}

const Header: React.FC<HeaderProps> = ({ 
  activeSpace, 
  currentView, 
  onViewChange, 
  onAddTask, 
  onGenerateTasks, 
  searchTerm, 
  onSearchChange,
  user
}) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300">
      
      {/* Left: Breadcrumbs & Views */}
      <div className="flex items-center gap-6">
        <div className="flex items-center text-sm font-medium text-slate-400">
           <span className="text-slate-500">Spaces</span>
           <span className="mx-2 text-slate-400 dark:text-slate-600">/</span>
           <span className="text-slate-900 dark:text-white font-bold">{activeSpace}</span>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden md:block"></div>

        <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
           {user.role === 'admin' && (
             <button
                onClick={() => onViewChange('dashboard')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'dashboard' ? 'bg-white dark:bg-primary-500 text-primary-600 dark:text-white shadow-sm dark:shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
            >
                <div className="w-4 h-4"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></div>
                <span className="hidden sm:inline">Overview</span>
            </button>
           )}

            <button
                onClick={() => onViewChange('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'list' ? 'bg-white dark:bg-primary-500 text-primary-600 dark:text-white shadow-sm dark:shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
            >
                <ListBulletIcon className="w-4 h-4"/>
                <span className="hidden sm:inline">List</span>
            </button>
            <button
                onClick={() => onViewChange('board')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'board' ? 'bg-white dark:bg-primary-500 text-primary-600 dark:text-white shadow-sm dark:shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
            >
                <ViewColumnsIcon className="w-4 h-4"/>
                <span className="hidden sm:inline">Board</span>
            </button>
            <button
                onClick={() => onViewChange('calendar')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${currentView === 'calendar' ? 'bg-white dark:bg-primary-500 text-primary-600 dark:text-white shadow-sm dark:shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
            >
                <CalendarIcon className="w-4 h-4"/>
                <span className="hidden sm:inline">Calendar</span>
            </button>
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative group hidden md:block">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400" />
            <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 w-48 transition-all"
            />
        </div>

        {/* AI Action */}
        <button
          onClick={onGenerateTasks}
          className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/20 rounded-lg transition-all"
          title="AI Generate Tasks"
        >
          <SparklesIcon className="w-5 h-5" />
        </button>

        {/* Add Task */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-lg shadow-primary-600/20 transition-all active:scale-95"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline uppercase tracking-wider">New Task</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
