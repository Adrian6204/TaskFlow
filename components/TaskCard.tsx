
import React, { useState } from 'react';
import { Task, Employee, TaskStatus, Priority } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { ClockIcon } from './icons/ClockIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import TagPill from './TagPill';

interface TaskCardProps {
  task: Task;
  allTasks: Task[];
  employee?: Employee;
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: TaskStatus) => void;
  onViewTask: (task: Task) => void;
  onToggleTimer: (taskId: number) => void;
}

const priorityPillConfig = {
    [Priority.URGENT]: { text: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/50' },
    [Priority.HIGH]: { text: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/50' },
    [Priority.MEDIUM]: { text: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
    [Priority.LOW]: { text: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-200 dark:bg-slate-700' },
};

const TaskCard: React.FC<TaskCardProps> = ({ task, allTasks, employee, onEditTask, onDeleteTask, onUpdateTaskStatus, onViewTask, onToggleTimer }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
  const [isDragging, setIsDragging] = useState(false);

  const isBlocked = !!task.blockedById;
  const blockingTask = isBlocked ? allTasks.find(t => t.id === task.blockedById) : null;
  
  const completedSubtasks = (task.subtasks || []).filter(st => st.isCompleted).length;
  const totalSubtasks = (task.subtasks || []).length;
  
  const isTracking = !!task.timerStartTime;
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isBlocked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    setTimeout(() => {
        setIsDragging(true);
    }, 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTask(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask?.(task.id);
  };
  
  const handleTimerClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleTimer(task.id);
  };

  return (
    <div 
        onClick={() => onViewTask(task)}
        draggable={!isBlocked}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 group ${isDragging ? 'opacity-50' : ''} ${isBlocked ? 'cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`font-bold text-lg text-slate-800 dark:text-slate-100 ${!isBlocked && 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>{task.title}</h3>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Timer Button */}
          <button 
            onClick={handleTimerClick}
            className={`p-1 rounded-full transition-colors ${isTracking ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-slate-700'}`}
            title={isTracking ? "Stop Timer" : "Start Timer"}
          >
              {isTracking ? <StopIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
          </button>
          
          <button onClick={handleEditClick} className="p-1 text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
            <PencilIcon className="w-5 h-5" />
          </button>
          {onDeleteTask && (
            <button onClick={handleDeleteClick} className="p-1 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{task.description}</p>
      
      {/* Tags Section */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
            {task.tags.map(tag => (
                <TagPill key={tag} text={tag} />
            ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center space-x-3">
          {employee && (
            <img src={employee.avatarUrl} alt={employee.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700" title={employee.name} />
          )}
          <span className={`text-sm font-medium ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
            {isTracking && (
                <div className="text-indigo-600 dark:text-indigo-400 animate-pulse" title="Timer Running">
                    <ClockIcon className="w-5 h-5" />
                </div>
            )}
            
            {isBlocked && (
              <div className="relative group/tooltip">
                <LockClosedIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <div className="absolute bottom-full mb-2 w-max max-w-xs bg-slate-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none">
                  Blocked by: "{blockingTask?.title || 'Unknown Task'}"
                </div>
              </div>
            )}
            
            {totalSubtasks > 0 && (
                <div className="flex items-center text-slate-500 dark:text-slate-400" title={`${completedSubtasks}/${totalSubtasks} subtasks completed`}>
                    <ListBulletIcon className="w-4 h-4 mr-1"/>
                    <span className="text-sm font-medium">{completedSubtasks}/{totalSubtasks}</span>
                </div>
            )}

            {task.comments.length > 0 && (
                <div className="flex items-center text-slate-500 dark:text-slate-400">
                    <ChatBubbleIcon className="w-4 h-4 mr-1"/>
                    <span className="text-sm font-medium">{task.comments.length}</span>
                </div>
            )}
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityPillConfig[task.priority].bg} ${priorityPillConfig[task.priority].text}`}>
                {task.priority}
            </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
