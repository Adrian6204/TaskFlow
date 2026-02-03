
import React, { useState } from 'react';
import { Task, Employee, TaskStatus, Priority } from '../types';
import { TASK_STATUSES } from '../constants';
import TagPill from './TagPill';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ClockIcon } from './icons/ClockIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';

interface TaskListViewProps {
  tasks: Task[];
  employees: Employee[];
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: TaskStatus) => void;
  onToggleTimer: (taskId: number) => void;
}

const statusColors = {
  [TaskStatus.TODO]: 'bg-orange-500',
  [TaskStatus.IN_PROGRESS]: 'bg-indigo-500', // Keep semantic
  [TaskStatus.DONE]: 'bg-emerald-500',
};

const priorityColors = {
  [Priority.URGENT]: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10',
  [Priority.HIGH]: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-400/10',
  [Priority.MEDIUM]: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-400/10',
  [Priority.LOW]: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-400/10',
};

const TaskGroup: React.FC<{
  status: TaskStatus;
  tasks: Task[];
  employees: Employee[];
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: TaskStatus) => void;
  onToggleTimer: (taskId: number) => void;
}> = ({ status, tasks, employees, onViewTask, onToggleTimer }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div 
        className="flex items-center gap-2 mb-2 group cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className={`transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}>
             <ChevronRightIcon className="w-4 h-4 text-slate-500" />
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider text-white ${statusColors[status]}`}>
            {status}
        </span>
        <span className="text-slate-600 dark:text-slate-500 text-sm font-medium">{tasks.length}</span>
        <div className="h-px bg-slate-200 dark:bg-white/10 flex-grow ml-2 group-hover:bg-slate-300 dark:group-hover:bg-white/20 transition-colors"></div>
      </div>

      {!isCollapsed && (
        <div className="bg-white/50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl overflow-hidden backdrop-blur-sm shadow-sm dark:shadow-none">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_120px_120px_120px_100px] gap-4 px-4 py-2 border-b border-slate-200 dark:border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <div>Name</div>
                <div>Assignee</div>
                <div>Due Date</div>
                <div>Priority</div>
                <div className="text-right">Timer</div>
            </div>

            {/* Table Body */}
            <div>
                {tasks.map(task => {
                    const assignee = employees.find(e => e.id === task.assigneeId);
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;
                    const isTracking = !!task.timerStartTime;

                    return (
                        <div 
                            key={task.id}
                            onClick={() => onViewTask(task)}
                            className="grid grid-cols-[1fr_120px_120px_120px_100px] gap-4 px-4 py-3 border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group items-center"
                        >
                            {/* Title Column */}
                            <div className="min-w-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status]}`}></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {task.title}
                                    </span>
                                </div>
                                {task.tags && task.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 ml-4 mt-1">
                                        {task.tags.map(tag => (
                                            <TagPill key={tag} text={tag} />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Assignee */}
                            <div className="flex items-center">
                                {assignee ? (
                                    <div className="flex items-center gap-2" title={assignee.name}>
                                        <img src={assignee.avatarUrl} className="w-6 h-6 rounded-full border border-slate-200 dark:border-white/10" />
                                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{assignee.name.split(' ')[0]}</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 dark:text-slate-600 italic">Unassigned</span>
                                )}
                            </div>

                            {/* Due Date */}
                            <div className={`text-xs ${isOverdue ? 'text-red-500 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                                {new Date(task.dueDate).toLocaleDateString()}
                            </div>

                            {/* Priority */}
                            <div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                </span>
                            </div>
                            
                            {/* Timer */}
                            <div className="flex justify-end">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onToggleTimer(task.id); }}
                                    className={`p-1.5 rounded-md transition-all ${isTracking ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-200 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100'}`}
                                >
                                    {isTracking ? <StopIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}
    </div>
  );
};

const TaskListView: React.FC<TaskListViewProps> = ({ tasks, employees, onEditTask, onViewTask, onUpdateTaskStatus, onToggleTimer }) => {
  return (
    <div className="pb-10">
      {TASK_STATUSES.map(status => (
        <TaskGroup
          key={status}
          status={status}
          tasks={tasks.filter(t => t.status === status)}
          employees={employees}
          onEditTask={onEditTask}
          onViewTask={onViewTask}
          onUpdateTaskStatus={onUpdateTaskStatus}
          onToggleTimer={onToggleTimer}
        />
      ))}
      {tasks.length === 0 && (
          <div className="text-center py-20 text-slate-500">
              <p>No tasks found in this view.</p>
          </div>
      )}
    </div>
  );
};

export default TaskListView;
