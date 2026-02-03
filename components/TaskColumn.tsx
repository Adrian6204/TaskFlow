
import React, { useState } from 'react';
import { Task, Employee, TaskStatus } from '../types';
import TaskCard from './TaskCard';
import { PlusIcon } from './icons/PlusIcon';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  allTasks: Task[];
  employees: Employee[];
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: TaskStatus) => void;
  onViewTask: (task: Task) => void;
  onToggleTimer: (taskId: number) => void;
}

const statusConfig = {
  [TaskStatus.TODO]: { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-500/10' },
  [TaskStatus.IN_PROGRESS]: { border: 'border-indigo-500/50', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  [TaskStatus.DONE]: { border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, allTasks, employees, onEditTask, onDeleteTask, onUpdateTaskStatus, onViewTask, onToggleTimer }) => {
  const config = statusConfig[status];
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    try {
      const droppedTask: Task = JSON.parse(e.dataTransfer.getData('application/json'));
      if (droppedTask && droppedTask.status !== status) {
        onUpdateTaskStatus(droppedTask.id, status);
      }
    } catch (error) {
      console.error("Failed to parse dropped task data", error);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col h-full rounded-2xl transition-colors ${isOver ? 'bg-white/5 ring-2 ring-indigo-500/50' : 'bg-transparent'}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-3 mb-2 rounded-xl border border-white/5 bg-slate-900/40 backdrop-blur-sm`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>{status}</span>
            <span className="bg-white/10 text-slate-300 rounded px-1.5 py-0.5 text-xs font-mono">{tasks.length}</span>
          </div>
          <div className="flex gap-1">
              <button className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors">
                  <PlusIcon className="w-4 h-4" />
              </button>
          </div>
      </div>
      
      {/* Cards Area */}
      <div className="flex-1 space-y-3 min-h-[150px]">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            allTasks={allTasks}
            employee={employees.find(e => e.id === task.assigneeId)}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
            onViewTask={onViewTask}
            onToggleTimer={onToggleTimer}
          />
        ))}
        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-slate-600 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
