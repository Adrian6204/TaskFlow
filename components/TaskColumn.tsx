
import React, { useState } from 'react';
import { Task, Employee, TaskStatus } from '../types';
import TaskCard from './TaskCard';

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
  [TaskStatus.TODO]: {
    color: 'bg-orange-500',
    textColor: 'text-orange-600 dark:text-orange-400',
    title: 'To Do',
  },
  [TaskStatus.IN_PROGRESS]: {
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600 dark:text-indigo-400',
    title: 'In Progress',
  },
  [TaskStatus.DONE]: {
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Done',
  },
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
      className={`bg-slate-100/50 dark:bg-slate-800/60 rounded-xl p-4 flex flex-col border border-slate-200 dark:border-slate-700/50 ${isOver ? 'bg-slate-200 dark:bg-slate-700/80 border-indigo-500' : ''}`}
    >
      <div className="flex items-center mb-4">
        <span className={`w-3 h-3 rounded-full ${config.color} mr-3`}></span>
        <h2 className={`font-bold text-lg ${config.textColor}`}>{config.title}</h2>
        <span className="ml-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full px-2 py-0.5 text-sm font-semibold">{tasks.length}</span>
      </div>
      <div className="flex-grow space-y-4">
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
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks here.</p>
             {isOver && <p className="text-sm text-indigo-500 dark:text-indigo-400 mt-1">Drop to add task</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
