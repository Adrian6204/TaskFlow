import React from 'react';
import { Task, Employee, TaskStatus } from '../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  employees: Employee[];
  onEditTask: (task: Task) => void;
  onDeleteTask?: (taskId: number) => void;
  onUpdateTaskStatus: (taskId: number, newStatus: TaskStatus) => void;
  onViewTask: (task: Task) => void;
}

const statusConfig = {
  [TaskStatus.TODO]: {
    color: 'bg-amber-500',
    textColor: 'text-amber-600 dark:text-amber-400',
    title: 'To Do',
  },
  [TaskStatus.IN_PROGRESS]: {
    color: 'bg-sky-500',
    textColor: 'text-sky-600 dark:text-sky-400',
    title: 'In Progress',
  },
  [TaskStatus.DONE]: {
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Done',
  },
};

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, employees, onEditTask, onDeleteTask, onUpdateTaskStatus, onViewTask }) => {
  const config = statusConfig[status];

  return (
    <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl p-4 flex flex-col">
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
            employee={employees.find(e => e.id === task.assigneeId)}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
            onViewTask={onViewTask}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;