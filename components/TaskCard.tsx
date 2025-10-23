import React from 'react';
import { Task, Employee, TaskStatus, Priority } from '../types';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { FlagIcon } from './icons/FlagIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';

interface TaskCardProps {
  task: Task;
  employee?: Employee;
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: TaskStatus) => void;
  onViewTask: (task: Task) => void;
}

const priorityConfig = {
    [Priority.URGENT]: 'text-red-500',
    [Priority.HIGH]: 'text-amber-500',
    [Priority.MEDIUM]: 'text-sky-500',
    [Priority.LOW]: 'text-slate-400',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, employee, onEditTask, onDeleteTask, onUpdateTaskStatus, onViewTask }) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation(); // Prevent card click event
    onUpdateTaskStatus(task.id, e.target.value as TaskStatus);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTask(task);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask?.(task.id);
  };

  return (
    <div 
        onClick={() => onViewTask(task)}
        className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{task.title}</h3>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleEditClick} className="p-1 text-slate-500 hover:text-amber-500 dark:text-slate-400 dark:hover:text-amber-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <PencilIcon className="w-5 h-5" />
          </button>
          {onDeleteTask && (
            <button onClick={handleDeleteClick} className="p-1 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">{task.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {employee && (
            <img src={employee.avatarUrl} alt={employee.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-700" title={employee.name} />
          )}
          <span className={`text-sm font-medium ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
            {task.comments.length > 0 && (
                <div className="flex items-center text-slate-500 dark:text-slate-400">
                    <ChatBubbleIcon className="w-4 h-4 mr-1"/>
                    <span className="text-sm font-medium">{task.comments.length}</span>
                </div>
            )}
            <div title={task.priority} className="flex items-center">
                <FlagIcon className={`w-5 h-5 ${priorityConfig[task.priority]}`}/>
            </div>
          <select 
            value={task.status}
            onChange={handleStatusChange}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-100 dark:bg-slate-700 border-none rounded-md text-sm px-2 py-1 focus:ring-2 focus:ring-sky-500 dark:text-slate-200"
            aria-label={`Current status: ${task.status}. Change status.`}
          >
            {Object.values(TaskStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;