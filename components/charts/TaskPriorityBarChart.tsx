
import React from 'react';
import { Task, Priority, TaskStatus } from '../../types';

interface TaskPriorityBarChartProps {
  tasks: Task[];
}

const TaskPriorityBarChart: React.FC<TaskPriorityBarChartProps> = ({ tasks }) => {
  const activeTasks = tasks.filter(t => t.status !== TaskStatus.DONE);
  
  const counts = {
    [Priority.URGENT]: activeTasks.filter(t => t.priority === Priority.URGENT).length,
    [Priority.HIGH]: activeTasks.filter(t => t.priority === Priority.HIGH).length,
    [Priority.MEDIUM]: activeTasks.filter(t => t.priority === Priority.MEDIUM).length,
    [Priority.LOW]: activeTasks.filter(t => t.priority === Priority.LOW).length,
  };

  const maxCount = Math.max(...Object.values(counts), 1);

  const configs = [
    { label: Priority.URGENT, color: 'bg-red-500', count: counts[Priority.URGENT] },
    { label: Priority.HIGH, color: 'bg-orange-500', count: counts[Priority.HIGH] },
    { label: Priority.MEDIUM, color: 'bg-indigo-500', count: counts[Priority.MEDIUM] },
    { label: Priority.LOW, color: 'bg-slate-500', count: counts[Priority.LOW] },
  ];

  return (
    <div className="space-y-4">
      {configs.map((config) => (
        <div key={config.label}>
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
            <span>{config.label}</span>
            <span>{config.count}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
                className={`h-full rounded-full ${config.color} transition-all duration-500`} 
                style={{ width: `${(config.count / maxCount) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
      {activeTasks.length === 0 && (
          <p className="text-center text-xs text-slate-500 mt-4">No active tasks to analyze.</p>
      )}
    </div>
  );
};

export default TaskPriorityBarChart;
