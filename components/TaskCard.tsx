
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

const priorityConfig = {
    [Priority.URGENT]: 'border-l-4 border-l-red-500',
    [Priority.HIGH]: 'border-l-4 border-l-orange-500',
    [Priority.MEDIUM]: 'border-l-4 border-l-indigo-500',
    [Priority.LOW]: 'border-l-4 border-l-slate-500',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, allTasks, employee, onEditTask, onDeleteTask, onUpdateTaskStatus, onViewTask, onToggleTimer }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
  const [isDragging, setIsDragging] = useState(false);
  const isBlocked = !!task.blockedById;
  const completedSubtasks = (task.subtasks || []).filter(st => st.isCompleted).length;
  const totalSubtasks = (task.subtasks || []).length;
  const isTracking = !!task.timerStartTime;
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isBlocked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    setTimeout(() => setIsDragging(true), 0);
  };

  const handleDragEnd = () => setIsDragging(false);

  return (
    <div 
        onClick={() => onViewTask(task)}
        draggable={!isBlocked}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`
            bg-slate-800/60 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/5 
            group relative transition-all duration-200
            ${priorityConfig[task.priority]}
            ${isDragging ? 'opacity-50 scale-95' : 'hover:-translate-y-1 hover:shadow-xl hover:bg-slate-800/80'}
            ${isBlocked ? 'cursor-not-allowed opacity-70 grayscale' : 'cursor-grab active:cursor-grabbing'}
        `}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <h3 className="font-semibold text-sm text-slate-200 leading-snug line-clamp-2">{task.title}</h3>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-slate-900/80 rounded-lg p-1 absolute top-2 right-2 backdrop-blur">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleTimer(task.id); }}
            className={`p-1 rounded hover:bg-white/10 ${isTracking ? 'text-red-400' : 'text-slate-400'}`}
          >
             {isTracking ? <StopIcon className="w-3 h-3" /> : <PlayIcon className="w-3 h-3" />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEditTask(task); }} className="p-1 text-slate-400 hover:text-amber-400 hover:bg-white/10 rounded">
            <PencilIcon className="w-3 h-3" />
          </button>
          {onDeleteTask && (
            <button onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }} className="p-1 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded">
              <TrashIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.map(tag => (
                <TagPill key={tag} text={tag} />
            ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          {employee ? (
            <img src={employee.avatarUrl} alt={employee.name} className="w-6 h-6 rounded-full border border-white/10" title={employee.name} />
          ) : (
            <div className="w-6 h-6 rounded-full border border-white/10 bg-slate-700"></div>
          )}
          <span className={`text-[10px] font-medium ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
            {isTracking && <ClockIcon className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />}
            {isBlocked && <LockClosedIcon className="w-3.5 h-3.5 text-amber-500" />}
            
            {totalSubtasks > 0 && (
                <div className="flex items-center text-slate-500 gap-1">
                    <ListBulletIcon className="w-3.5 h-3.5"/>
                    <span className="text-[10px] font-bold">{completedSubtasks}/{totalSubtasks}</span>
                </div>
            )}
            {task.comments.length > 0 && (
                <div className="flex items-center text-slate-500 gap-1">
                    <ChatBubbleIcon className="w-3.5 h-3.5"/>
                    <span className="text-[10px] font-bold">{task.comments.length}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
