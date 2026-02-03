
import React from 'react';
import { Task, TaskStatus } from '../../types';

interface TaskStatusPieChartProps {
  tasks: Task[];
}

const statusConfig = {
  [TaskStatus.TODO]: { color: '#fb923c', name: 'To Do' },
  [TaskStatus.IN_PROGRESS]: { color: '#6366f1', name: 'In Progress' },
  [TaskStatus.DONE]: { color: '#10b981', name: 'Done' },
};

const TaskStatusPieChart: React.FC<TaskStatusPieChartProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  
  const counts = {
    [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
    [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE).length,
  };

  if (totalTasks === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs">
            <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800 mb-2 opacity-50"></div>
            No task data available
        </div>
    );
  }

  let cumulativePercentage = 0;
  const segments = (Object.keys(statusConfig) as TaskStatus[]).map(status => {
    const percentage = (counts[status] / totalTasks) * 100;
    // Don't render empty segments to avoid SVG errors
    if (percentage === 0) return null;

    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += percentage;
    const endAngle = (cumulativePercentage / 100) * 360;

    const startX = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
    const startY = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
    const endX = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
    const endY = 50 + 40 * Math.sin(endAngle * Math.PI / 180);
    const largeArcFlag = percentage > 50 ? 1 : 0;

    // If 100%, draw a full circle
    const pathData = percentage === 100 
        ? `M 50, 50 m -40, 0 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0` 
        : `M 50,50 L ${startX},${startY} A 40,40 0 ${largeArcFlag},1 ${endX},${endY} Z`;

    return {
      path: pathData,
      color: statusConfig[status].color,
      status: status,
      percentage: percentage.toFixed(0),
      count: counts[status]
    };
  }).filter(Boolean);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-40 h-40 mb-6 drop-shadow-2xl">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {segments.map((segment: any) => (
            <path 
                key={segment.status} 
                d={segment.path} 
                fill={segment.color} 
                className="hover:opacity-80 transition-opacity cursor-pointer stroke-slate-50 dark:stroke-slate-900 stroke-2"
            />
          ))}
        </svg>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-800 dark:text-white">{totalTasks}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Tasks</span>
        </div>
      </div>

      <div className="w-full space-y-2 px-2">
        {segments.map((segment: any) => (
          <div key={segment.status} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: segment.color }}></span>
                <span className="text-slate-600 dark:text-slate-300 font-medium">{statusConfig[segment.status as TaskStatus].name}</span>
            </div>
            <div className="flex gap-3">
                <span className="text-slate-500">{segment.percentage}%</span>
                <span className="text-slate-800 dark:text-white font-bold w-4 text-right">{segment.count}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusPieChart;
