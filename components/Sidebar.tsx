
import React from 'react';
import { User, Employee, Space } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { PlusIcon } from './icons/PlusIcon';
import { UserIcon } from './icons/UserIcon';
import { HomeIcon } from './icons/HomeIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { UsersIcon } from './icons/UsersIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { GanttIcon } from './icons/GanttIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { ViewColumnsIcon } from './icons/ViewColumnsIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';

interface SidebarProps {
  isOpen: boolean;
  activeSpaceId: string;
  spaces: Space[];
  currentView: string;
  onSelectSpace: (spaceId: string) => void;
  onViewChange: (view: string) => void;
  onToggle: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  onCreateSpace: () => void;
  onJoinSpace: () => void;
  currentUserEmployee?: Employee;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  activeSpaceId, 
  spaces,
  currentView,
  onSelectSpace,
  onViewChange,
  onToggle,
  onOpenProfile,
  onLogout,
  onCreateSpace,
  onJoinSpace,
  currentUserEmployee,
  user
}) => {
  const [expandedSpaceId, setExpandedSpaceId] = React.useState<string | null>(activeSpaceId || null);

  // Sync expanded space with active space
  React.useEffect(() => {
    if (activeSpaceId) {
      setExpandedSpaceId(activeSpaceId);
    }
  }, [activeSpaceId]);

  const mainNavItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'whiteboard', label: 'Task of Today', icon: PencilSquareIcon },
  ];

  const workspaceViews = [
    { id: 'list', label: 'List', icon: ListBulletIcon },
    { id: 'board', label: 'Board', icon: ViewColumnsIcon },
    { id: 'gantt', label: 'Gantt', icon: GanttIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
  ];

  const handleSpaceClick = (spaceId: string) => {
    if (expandedSpaceId === spaceId) {
      // Already expanded, collapse it
      setExpandedSpaceId(null);
    } else {
      // Expand and select
      setExpandedSpaceId(spaceId);
      onSelectSpace(spaceId);
      onViewChange('list'); // Default to list view when selecting a space
    }
  };

  const handleViewClick = (spaceId: string, viewId: string) => {
    onSelectSpace(spaceId);
    onViewChange(viewId);
  };

  const isWorkspaceView = ['list', 'board', 'gantt', 'calendar', 'settings'].includes(currentView);

  return (
    <aside 
      className={`${isOpen ? 'w-72' : 'w-20'} bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-2xl border-r border-neutral-200/50 dark:border-neutral-800/50 flex flex-col transition-all duration-500 ease-out relative z-50`}
    >
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onToggle}>
          <div className="p-2 bg-neutral-900 dark:bg-white rounded-xl transition-transform duration-300 group-hover:scale-105">
            <SparklesIcon className="w-5 h-5 text-white dark:text-neutral-900" />
          </div>
          {isOpen && <span className="text-neutral-900 dark:text-white font-semibold text-lg tracking-tight">TaskFlow</span>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        {/* Main Navigation (Dashboard) */}
        <div className={`px-3 mb-3 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider ${!isOpen && 'text-center'}`}>
          {isOpen ? 'Menu' : ''}
        </div>
        <div className="space-y-1">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative
                ${currentView === item.id && !isWorkspaceView
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg shadow-neutral-900/20 dark:shadow-white/10' 
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                } ${!isOpen && 'justify-center'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
              {!isOpen && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none shadow-xl transition-opacity duration-200">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Spaces Section with Nested Views */}
        <div className="mt-6 pt-6 border-t border-neutral-200/50 dark:border-neutral-800/50">
          <div className={`px-3 mb-3 flex items-center justify-between ${!isOpen && 'justify-center'}`}>
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              {isOpen ? 'Workspaces' : ''}
            </span>
            {isOpen && (
              <button 
                onClick={onCreateSpace}
                className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all duration-200"
                title="Create Space"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-1">
            {spaces.map((space) => (
              <div key={space.id}>
                {/* Space Header */}
                <button
                  onClick={() => handleSpaceClick(space.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative
                    ${activeSpaceId === space.id && isWorkspaceView
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-lg shadow-neutral-900/20 dark:shadow-white/10' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                    } ${!isOpen && 'justify-center'}`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${activeSpaceId === space.id ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'}`} />
                  {isOpen && (
                    <>
                      <span className="flex-1 text-left truncate">{space.name}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${expandedSpaceId === space.id ? 'rotate-180' : ''}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                  {!isOpen && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none shadow-xl transition-opacity duration-200">
                      {space.name}
                    </div>
                  )}
                </button>

                {/* Nested Workspace Views */}
                {isOpen && expandedSpaceId === space.id && (
                  <div className="ml-4 mt-1 space-y-0.5 pl-3 border-l-2 border-neutral-200 dark:border-neutral-700 animate-fade-in">
                    {workspaceViews.map((view) => (
                      <button
                        key={view.id}
                        onClick={() => handleViewClick(space.id, view.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${activeSpaceId === space.id && currentView === view.id
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' 
                            : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-700 dark:hover:text-neutral-300'
                          }`}
                      >
                        <view.icon className="w-4 h-4" />
                        <span>{view.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Join/Create Space Actions */}
            {isOpen && (
              <div className="pt-2 space-y-1">
                <button
                  onClick={onJoinSpace}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all duration-300"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Join with Code</span>
                </button>
              </div>
            )}

            {spaces.length === 0 && isOpen && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-3">No workspaces yet</p>
                <button
                  onClick={onCreateSpace}
                  className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-300"
                >
                  Create First Space
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center gap-2">
        <button 
          onClick={onOpenProfile}
          className={`flex items-center gap-3 flex-1 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-all duration-300 ${!isOpen && 'justify-center'}`}
        >
           <div className="relative flex-shrink-0">
                <img 
                    src={currentUserEmployee?.avatarUrl} 
                    alt="" 
                    className="w-10 h-10 rounded-xl object-cover border border-neutral-200/50 dark:border-neutral-700/50 transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-neutral-50 dark:border-neutral-900 rounded-full"></div>
            </div>
            {isOpen && (
              <div className="text-left overflow-hidden">
                <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{currentUserEmployee?.name || user.username}</p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Active</p>
              </div>
            )}
        </button>
        
        {isOpen && (
          <button
            onClick={onLogout}
            className="p-2.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-300"
            title="Sign Out"
          >
            <LogoutIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
