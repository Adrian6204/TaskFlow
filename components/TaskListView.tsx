
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const getTaskStats = (employeeId: string) => {
    const employeeTasks = tasks.filter(t => t.assigneeId === employeeId);
    return {
      total: employeeTasks.length,
      completed: employeeTasks.filter(t => t.status === TaskStatus.DONE).length,
      inProgress: employeeTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      todo: employeeTasks.filter(t => t.status === TaskStatus.TODO).length,
    };
  };

  // Get today's tasks (tasks due today or overdue)
  const getTodaysTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return (dueDate <= tomorrow && t.status !== TaskStatus.DONE);
    });
  };

  const todaysTasks = getTodaysTasks();

  // Filter tasks based on selected employee
  const filteredTasks = selectedEmployeeId 
    ? tasks.filter(t => t.assigneeId === selectedEmployeeId)
    : tasks;

  return (
    <div className="pb-10 space-y-6">
      {/* Today's Tasks Section */}
      {todaysTasks.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Today's Tasks
            </h3>
            <span className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white text-xs font-bold rounded-full">
              {todaysTasks.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {todaysTasks.slice(0, 6).map(task => {
              const assignee = employees.find(e => e.id === task.assigneeId);
              return (
                <div
                  key={task.id}
                  onClick={() => onViewTask(task)}
                  className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm rounded-lg p-3 border border-neutral-200/50 dark:border-neutral-800/50 hover:shadow-md transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {assignee && (
                      <img src={assignee.avatarUrl} className="w-6 h-6 rounded-full border border-neutral-200 dark:border-neutral-700" alt="" />
                    )}
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {task.title}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
          {todaysTasks.length > 6 && (
            <p className="text-xs text-center text-neutral-500 dark:text-neutral-400 mt-3">
              + {todaysTasks.length - 6} more tasks
            </p>
          )}
        </div>
      )}

      {/* Team Members Section */}
      {employees.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Team Members <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">({employees.length} members in this space)</span>
            </h3>
            {selectedEmployeeId && (
              <button
                onClick={() => setSelectedEmployeeId(null)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Show All Tasks
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee, index) => {
              const stats = getTaskStats(employee.id);
              const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              const isSelected = selectedEmployeeId === employee.id;

              return (
                <div 
                  key={employee.id}
                  onClick={() => setSelectedEmployeeId(isSelected ? null : employee.id)}
                  className={`bg-white dark:bg-neutral-900 rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer hover:shadow-xl ${
                    isSelected 
                      ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20' 
                      : 'border-neutral-200/50 dark:border-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center text-xl font-bold text-neutral-700 dark:text-neutral-200 uppercase">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                          {employee.name}
                        </h4>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {stats.total} tasks assigned
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Task Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Task Progress</span>
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">{completionRate}%</span>
                    </div>
                    <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                      <p className="text-2xl font-bold text-neutral-900 dark:text-white">{stats.todo}</p>
                      <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">To Do</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
                      <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">Active</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-500/10 rounded-xl">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                      <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-1">Done</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 text-center">
                        Showing {stats.total} tasks below ↓
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      <div>
        {selectedEmployeeId && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Showing tasks for: <span className="font-bold">{employees.find(e => e.id === selectedEmployeeId)?.name}</span>
            </p>
            <button
              onClick={() => setSelectedEmployeeId(null)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear Filter
            </button>
          </div>
        )}
        {TASK_STATUSES.map(status => (
          <TaskGroup
            key={status}
            status={status}
            tasks={filteredTasks.filter(t => t.status === status)}
            employees={employees}
            onEditTask={onEditTask}
            onViewTask={onViewTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
            onToggleTimer={onToggleTimer}
          />
        ))}
        {filteredTasks.length === 0 && (
            <div className="text-center py-20 text-slate-500">
                <p>No tasks found {selectedEmployeeId ? 'for this team member' : 'in this view'}.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskListView;
