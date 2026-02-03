
import React from 'react';
import { User, Employee } from '../types';
import { ViewColumnsIcon } from './icons/ViewColumnsIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface SidebarProps {
  isOpen: boolean;
  activeSpace: string;
  onSelectSpace: (space: string) => void;
  onToggle: () => void;
  onOpenProfile: () => void;
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
  currentUserEmployee,
  user
}) => {
  return (
    <aside 
      className={`${isOpen ? 'w-64' : 'w-20'} bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 relative z-50`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3 text-indigo-500 cursor-pointer" onClick={onToggle}>
          <SparklesIcon className="w-8 h-8" />
          {isOpen && <span className="text-white font-black text-xl tracking-tight uppercase">TaskFlow</span>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className={`px-3 mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest ${!isOpen && 'text-center'}`}>
          {isOpen ? 'Spaces' : '...'}
        </div>
        
        {SPACES.map((space) => (
          <button
            key={space}
            onClick={() => onSelectSpace(space)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative
              ${activeSpace === space 
                ? 'bg-indigo-600/10 text-indigo-400' 
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
          >
             {activeSpace === space && (
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full"></div>
             )}
            <div className={`w-2 h-2 rounded-full ${activeSpace === space ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-600 group-hover:bg-slate-500'}`} />
            
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
      <div className="p-4 border-t border-white/5">
        <button 
          onClick={onOpenProfile}
          className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors ${!isOpen && 'justify-center'}`}
        >
           <div className="relative">
                <img 
                    src={currentUserEmployee?.avatarUrl} 
                    alt="" 
                    className="w-9 h-9 rounded-lg object-cover border border-white/10"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            {isOpen && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{currentUserEmployee?.name || user.username}</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">{user.role}</p>
              </div>
            )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
