import React, { useState } from 'react';
import { Task } from '../types';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface CalendarViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onViewTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(startOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  const endDate = new Date(endOfMonth);
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

  const days = [];
  let day = new Date(startDate);

  while (day <= endDate) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const tasksByDate: { [key: string]: Task[] } = {};
  tasks.forEach(task => {
    const dateKey = task.dueDate;
    if (!tasksByDate[dateKey]) {
      tasksByDate[dateKey] = [];
    }
    tasksByDate[dateKey].push(task);
  });

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="text-center font-semibold text-sm text-slate-500 dark:text-slate-400 py-2">
            {dayName}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 border-t border-l border-slate-200 dark:border-slate-700">
        {days.map(d => {
          const dateKey = d.toISOString().split('T')[0];
          const tasksForDay = tasksByDate[dateKey] || [];
          const isCurrentMonth = d.getMonth() === currentDate.getMonth();

          return (
            <div key={d.toString()} className={`p-2 h-32 overflow-y-auto ${isCurrentMonth ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
              <span className={`text-sm font-semibold ${isToday(d) ? 'bg-indigo-600 text-white rounded-full flex items-center justify-center w-6 h-6' : isCurrentMonth ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                {d.getDate()}
              </span>
              <div className="mt-1 space-y-1">
                {tasksForDay.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => onViewTask(task)}
                    className="text-xs p-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded truncate cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-900"
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;