
import React, { useMemo } from 'react';
import { Task, TaskStatus } from '../../types';

interface CompletionHistoryChartProps {
  tasks: Task[];
}

const CompletionHistoryChart: React.FC<CompletionHistoryChartProps> = ({ tasks }) => {
  const data = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const count = tasks.filter(t => 
        t.status === TaskStatus.DONE && 
        t.completedAt && 
        t.completedAt.startsWith(dateStr)
      ).length;
      return { date: date.toLocaleDateString('en-US', { weekday: 'short' }), count };
    });
  }, [tasks]);

  const maxVal = Math.max(...data.map(d => d.count), 5); // Minimum scale of 5
  
  // Calculate points for SVG path
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.count / maxVal) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-48 flex flex-col justify-end">
      <div className="relative h-40 w-full">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 0.5, 1].map((tick) => (
             <div key={tick} className="border-b border-slate-200 dark:border-white/5 w-full h-px"></div>
          ))}
        </div>

        {/* Chart */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Gradient Area */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              {/* Use CSS variables for stops, but SVG gradient stops don't support var() in 'stop-color' well in all contexts, 
                  but filling with 'currentColor' and setting color on parent usually works better or using direct variables if supported.
                  For robust dynamic colors in SVG without direct React state access to the hex, we can use the 'current' color class utility. */}
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" className="text-primary-400" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary-400" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,100 ${points.split(' ').map((p, i) => `L ${p}`).join(' ')} L 100,100 Z`}
            fill="url(#chartGradient)"
            className="text-primary-400"
          />
          {/* Line */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
            vectorEffect="non-scaling-stroke"
            className="text-primary-500"
          />
          {/* Dots */}
          {data.map((d, i) => (
             <circle
                key={i}
                cx={`${(i / (data.length - 1)) * 100}%`}
                cy={`${100 - (d.count / maxVal) * 100}%`}
                r="3"
                className="fill-primary-500 stroke-white dark:stroke-slate-900 stroke-2"
             />
          ))}
        </svg>
      </div>
      
      {/* X-Axis Labels */}
      <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
        {data.map((d) => (
          <span key={d.date}>{d.date}</span>
        ))}
      </div>
    </div>
  );
};

export default CompletionHistoryChart;
