
import React, { useMemo, useState } from 'react';
import { Task, Employee, TaskStatus, Priority } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface GanttChartProps {
  tasks: Task[];
  employees: Employee[];
  onViewTask: (task: Task) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, employees, onViewTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get 14 days starting from current week
  const days = useMemo(() => {
    const result = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 14; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      result.push(day);
    }
    return result;
  }, [currentDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getTaskPosition = (task: Task) => {
    const dueDate = new Date(task.dueDate);
    const createdDate = task.createdAt ? new Date(task.createdAt) : new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000);
    
    const startIndex = days.findIndex(d => d.toDateString() === createdDate.toDateString());
    const endIndex = days.findIndex(d => d.toDateString() === dueDate.toDateString());
    
    if (startIndex === -1 && endIndex === -1) return null;
    
    const actualStart = Math.max(0, startIndex === -1 ? 0 : startIndex);
    const actualEnd = Math.min(days.length - 1, endIndex === -1 ? days.length - 1 : endIndex);
    
    return {
      start: actualStart,
      span: actualEnd - actualStart + 1
    };
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return 'bg-green-500 dark:bg-green-400';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-500 dark:bg-blue-400';
      default: return 'bg-neutral-400 dark:bg-neutral-500';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT: return 'bg-red-500 dark:bg-red-400';
      case Priority.HIGH: return 'bg-orange-500 dark:bg-orange-400';
      case Priority.MEDIUM: return 'bg-yellow-500 dark:bg-yellow-400';
      default: return 'bg-neutral-400 dark:bg-neutral-500';
    }
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.name || 'Unassigned';
  };

  // Group tasks by assignee
  const tasksByAssignee = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const key = task.assigneeId || 'unassigned';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(task);
    });
    return grouped;
  }, [tasks]);

  return (
    <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Gantt Chart</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {days[0]?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200"
            >
              <ChevronLeftIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 text-sm font-medium text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-all duration-200"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200"
            >
              <ChevronRightIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Days Header */}
          <div className="flex border-b border-neutral-200/50 dark:border-neutral-800/50">
            <div className="w-48 flex-shrink-0 p-3 bg-neutral-50/50 dark:bg-neutral-800/30 border-r border-neutral-200/50 dark:border-neutral-800/50">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Assignee</span>
            </div>
            <div className="flex-1 flex">
              {days.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex-1 p-3 text-center border-r border-neutral-100 dark:border-neutral-800/50 last:border-r-0 ${
                    isToday(day) ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-50/50 dark:bg-neutral-800/30'
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday(day) ? 'text-white dark:text-neutral-900' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {formatDate(day)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Rows */}
          {Object.entries(tasksByAssignee).map(([assigneeId, assigneeTasks]) => (
            <div key={assigneeId} className="border-b border-neutral-100 dark:border-neutral-800/50 last:border-b-0">
              {/* Assignee Row */}
              <div className="flex min-h-[60px]">
                <div className="w-48 flex-shrink-0 p-3 bg-neutral-50/30 dark:bg-neutral-800/20 border-r border-neutral-200/50 dark:border-neutral-800/50 flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                      {getEmployeeName(assigneeId).charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {getEmployeeName(assigneeId)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {days.map((day, idx) => (
                      <div
                        key={idx}
                        className={`flex-1 border-r border-neutral-100 dark:border-neutral-800/30 last:border-r-0 ${
                          isToday(day) ? 'bg-neutral-100/50 dark:bg-neutral-800/30' : ''
                        }`}
                      />
                    ))}
                  </div>
                  
                  {/* Task bars */}
                  <div className="relative p-2 space-y-1">
                    {assigneeTasks.map((task) => {
                      const position = getTaskPosition(task);
                      if (!position) return null;
                      
                      const widthPercent = (position.span / days.length) * 100;
                      const leftPercent = (position.start / days.length) * 100;
                      
                      return (
                        <div
                          key={task.id}
                          onClick={() => onViewTask(task)}
                          className={`absolute h-8 rounded-lg ${getStatusColor(task.status)} cursor-pointer hover:opacity-90 transition-all duration-200 flex items-center px-3 shadow-sm hover:shadow-md`}
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            minWidth: '80px'
                          }}
                        >
                          <span className="text-xs font-medium text-white truncate">
                            {task.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">No tasks to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-neutral-200/50 dark:border-neutral-800/50 flex items-center gap-6">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Status:</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-neutral-400 dark:bg-neutral-500"></div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">To Do</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500 dark:bg-blue-400"></div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500 dark:bg-green-400"></div>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Done</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
