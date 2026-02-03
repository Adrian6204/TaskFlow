
import React from 'react';
import { User, Employee } from '../types';
import { ViewColumnsIcon } from './icons/ViewColumnsIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface SidebarProps {
  isOpen: boolean;
  activeSpace: string;
  onSelectSpace: (space: string) => void;
  onToggle: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  currentUserEmployee?: Employee;
  user: User;
}

const SPACES = ['Everything', 'Engineering', 'Design', 'Marketing', 'Operations'];

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  activeSpace, 
  onSelectSpace, 
  onToggle,
  onOpenProfile,
  onLogout,
  currentUserEmployee,
  user
}) => {
  return (
    <aside 
      className={`${isOpen ? 'w-64' : 'w-20'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 relative z-50`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-3 text-indigo-500 cursor-pointer" onClick={onToggle}>
          <SparklesIcon className="w-8 h-8" />
          {isOpen && <span className="text-slate-900 dark:text-white font-black text-xl tracking-tight uppercase">TaskFlow</span>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className={`px-3 mb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ${!isOpen && 'text-center'}`}>
          {isOpen ? 'Spaces' : '...'}
        </div>
        
        {SPACES.map((space) => (
          <button
            key={space}
            onClick={() => onSelectSpace(space)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative
              ${activeSpace === space 
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-600/10 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
          >
             {activeSpace === space && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"></div>
             )}
            <div className={`w-2 h-2 rounded-full ${activeSpace === space ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400 dark:group-hover:bg-slate-500'}`} />
            
            {isOpen && <span>{space}</span>}
            
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                {space}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 flex items-center gap-2">
        <button 
          onClick={onOpenProfile}
          className={`flex items-center gap-3 flex-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${!isOpen && 'justify-center'}`}
        >
           <div className="relative flex-shrink-0">
                <img 
                    src={currentUserEmployee?.avatarUrl} 
                    alt="" 
                    className="w-9 h-9 rounded-lg object-cover border border-slate-200 dark:border-white/10"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            {isOpen && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{currentUserEmployee?.name || user.username}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">{user.role}</p>
              </div>
            )}
        </button>
        
        {isOpen && (
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
            title="Log Out"
          >
            <LogoutIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
