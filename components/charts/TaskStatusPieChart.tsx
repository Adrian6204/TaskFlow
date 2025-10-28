import React from 'react';
import { Task, TaskStatus } from '../../types';

interface TaskStatusPieChartProps {
  tasks: Task[];
}

const statusConfig = {
  [TaskStatus.TODO]: { color: '#fb923c' /* orange-400 */, name: 'To Do' },
  [TaskStatus.IN_PROGRESS]: { color: '#6366f1' /* indigo-500 */, name: 'In Progress' },
  [TaskStatus.DONE]: { color: '#10b981' /* emerald-500 */, name: 'Done' },
};

const TaskStatusPieChart: React.FC<TaskStatusPieChartProps> = ({ tasks }) => {
  const totalTasks = tasks.length;
  if (totalTasks === 0) {
    return <div className="flex items-center justify-center h-48 text-slate-500">No task data for chart.</div>;
  }

  const counts = {
    [TaskStatus.TODO]: tasks.filter(t => t.status === TaskStatus.TODO).length,
    [TaskStatus.IN_PROGRESS]: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
    [TaskStatus.DONE]: tasks.filter(t => t.status === TaskStatus.DONE).length,
  };

  let cumulativePercentage = 0;
  const segments = (Object.keys(statusConfig) as TaskStatus[]).map(status => {
    const percentage = (counts[status] / totalTasks) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += percentage;
    const endAngle = (cumulativePercentage / 100) * 360;

    const startX = 50 + 40 * Math.cos(startAngle * Math.PI / 180);
    const startY = 50 + 40 * Math.sin(startAngle * Math.PI / 180);
    const endX = 50 + 40 * Math.cos(endAngle * Math.PI / 180);
    const endY = 50 + 40 * Math.sin(endAngle * Math.PI / 180);
    const largeArcFlag = percentage > 50 ? 1 : 0;

    const pathData = `M 50,50 L ${startX},${startY} A 40,40 0 ${largeArcFlag},1 ${endX},${endY} Z`;

    return {
      path: pathData,
      color: statusConfig[status].color,
      status: status,
      percentage: percentage.toFixed(0),
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100">
          {segments.map(segment => (
            <path key={segment.status} d={segment.path} fill={segment.color} />
          ))}
        </svg>
      </div>
      <div className="space-y-2">
        {segments.map(segment => (
          <div key={segment.status} className="flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: segment.color }}></span>
            <span className="text-slate-700 dark:text-slate-300 text-sm">
                {statusConfig[segment.status].name}: {counts[segment.status]} ({segment.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskStatusPieChart;