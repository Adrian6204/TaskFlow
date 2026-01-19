
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
    <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 group cursor-pointer">
          <SparklesIcon className="w-8 h-8 text-indigo-500 group-hover:rotate-12 transition-transform" />
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
            TaskFlow
          </h1>
        </div>
        
        <div className="relative hidden lg:block w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input 
                type="text"
                placeholder="Search tasks or tags..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
            />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={onGenerateTasks}
          className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          <SparklesIcon className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">AI Generate</span>
        </button>
        <button
          onClick={onAddTask}
          className="flex items-center bg-white/10 hover:bg-white/20 text-white font-black py-2.5 px-6 rounded-2xl border border-white/10 transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Task</span>
        </button>
        
        <div className="h-6 w-px bg-white/10 mx-2"></div>
        
        <div 
            onClick={onOpenProfile}
            className="flex items-center gap-3 cursor-pointer group hover:bg-white/5 p-1.5 rounded-2xl transition-all"
        >
            <div className="relative">
                <img 
                    src={currentUserEmployee?.avatarUrl} 
                    alt="" 
                    className="w-9 h-9 rounded-xl border border-white/20 group-hover:border-indigo-500 transition-all object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
            </div>
            <div className="hidden sm:block">
                <p className="text-xs font-black text-white uppercase tracking-wider">{currentUserEmployee?.name || user?.username}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter leading-none mt-1">{user?.role}</p>
            </div>
        </div>

        <button
          onClick={logout}
          className="text-slate-500 hover:text-red-400 p-2 transition-colors"
          title="Sign out"
        >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
