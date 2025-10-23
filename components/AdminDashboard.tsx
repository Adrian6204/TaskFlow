import React from 'react';
import { Task, Employee, TaskStatus } from '../types';

interface AdminDashboardProps {
  tasks: Task[];
  employees: Employee[];
}

const StatCard: React.FC<{ title: string; value: number | string; color?: 'amber' | 'sky' | 'emerald' | 'slate' }> = ({ title, value, color = 'slate' }) => {
  const colorClasses = {
    slate: 'bg-slate-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-5 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-2">
        <span className={`w-3 h-3 rounded-full ${colorClasses[color]} mr-3`}></span>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{title}</p>
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ tasks, employees }) => {
  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === TaskStatus.TODO).length;
  const inProgressCount = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const doneCount = tasks.filter(t => t.status === TaskStatus.DONE).length;

  const employeeTasks = employees.map(employee => {
    const assignedTasks = tasks.filter(task => task.assigneeId === employee.id);
    return {
      ...employee,
      taskCount: assignedTasks.length,
      tasksToDo: assignedTasks.filter(t => t.status === TaskStatus.TODO).length,
    };
  }).sort((a, b) => b.taskCount - a.taskCount);

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Tasks" value={totalTasks} color="slate" />
        <StatCard title="To Do" value={todoCount} color="amber" />
        <StatCard title="In Progress" value={inProgressCount} color="sky" />
        <StatCard title="Done" value={doneCount} color="emerald" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Team Workload</h3>
        <div className="space-y-4">
          {employeeTasks.map(emp => (
            <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <div className="flex items-center">
                <img src={emp.avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full mr-4 border-2 border-white dark:border-slate-600" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">{emp.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{emp.taskCount} total tasks</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-800 dark:text-slate-100">{emp.tasksToDo}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">tasks to do</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;