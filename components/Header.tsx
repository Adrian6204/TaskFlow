
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
    <header className="h-16 border-b border-neutral-200/50 dark:border-neutral-800/50 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-2xl flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-500">
      
      {/* Left: Breadcrumbs & Views */}
      <div className="flex items-center gap-6">
        <div className="flex items-center text-sm font-medium">
           <span className="text-neutral-400 dark:text-neutral-500">Spaces</span>
           <span className="mx-2 text-neutral-300 dark:text-neutral-700">/</span>
           <span className="text-neutral-900 dark:text-white font-semibold">{activeSpace}</span>
        </div>

        <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-800 mx-2 hidden md:block"></div>

        <nav className="flex items-center gap-1 bg-neutral-100/80 dark:bg-neutral-800/50 p-1 rounded-xl backdrop-blur-sm">
           {user.role === 'admin' && (
             <button
                onClick={() => onViewChange('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${currentView === 'dashboard' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'}`}
            >
                <div className="w-4 h-4"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></div>
                <span className="hidden sm:inline">Overview</span>
            </button>
           )}

            <button
                onClick={() => onViewChange('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${currentView === 'list' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'}`}
            >
                <ListBulletIcon className="w-4 h-4"/>
                <span className="hidden sm:inline">List</span>
            </button>
            <button
                onClick={() => onViewChange('board')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${currentView === 'board' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'}`}
            >
                <ViewColumnsIcon className="w-4 h-4"/>
                <span className="hidden sm:inline">Board</span>
            </button>
            <button
                onClick={() => onViewChange('calendar')}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-300 ${currentView === 'calendar' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'}`}
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
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-neutral-900 dark:group-focus-within:text-white" />
            <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-neutral-100/80 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 rounded-xl py-2 pl-10 pr-4 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-white/10 w-52 transition-all duration-300"
            />
        </div>

        {/* AI Action */}
        <button
          onClick={onGenerateTasks}
          className="p-2.5 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-300"
          title="AI Generate Tasks"
        >
          <SparklesIcon className="w-5 h-5" />
        </button>

        {/* Add Task */}
        <button
          onClick={onAddTask}
          className="flex items-center gap-2 bg-neutral-900 dark:bg-white hover:bg-neutral-800 dark:hover:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-neutral-900/20 dark:shadow-white/10 transition-all duration-300 active:scale-95"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
