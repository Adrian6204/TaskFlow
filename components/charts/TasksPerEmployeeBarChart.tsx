
import React from 'react';
import { Task, Employee } from '../../types';

interface TasksPerEmployeeBarChartProps {
  tasks: Task[];
  employees: Employee[];
}

const TasksPerEmployeeBarChart: React.FC<TasksPerEmployeeBarChartProps> = ({ tasks, employees }) => {
  const employeeTaskCounts = employees.map(employee => ({
    ...employee,
    taskCount: tasks.filter(task => task.assigneeId === employee.id).length,
  }));

  const maxTasks = Math.max(...employeeTaskCounts.map(e => e.taskCount), 1);

  return (
    <div className="w-full space-y-3">
      {employeeTaskCounts.map(emp => (
        <div key={emp.id} className="flex items-center gap-3">
          <img src={emp.avatarUrl} alt={emp.name} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 flex-shrink-0" title={emp.name} />
          <div className="flex-grow bg-slate-100 dark:bg-slate-800 rounded-full h-6 overflow-hidden">
            <div
              className="bg-primary-500 h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500"
              style={{ width: `${(emp.taskCount / maxTasks) * 100}%` }}
            >
              <span className="text-xs font-bold text-white">{emp.taskCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TasksPerEmployeeBarChart;
