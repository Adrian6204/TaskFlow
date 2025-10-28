import React, { useState } from 'react';
import { Task, Employee, TaskStatus, ActivityLog } from '../types';
import TaskStatusPieChart from './charts/TaskStatusPieChart';
import TasksPerEmployeeBarChart from './charts/TasksPerEmployeeBarChart';
import { generateWeeklySummary } from '../services/geminiService';

interface AdminDashboardProps {
  tasks: Task[];
  employees: Employee[];
  activityLogs: ActivityLog[];
}

const StatCard: React.FC<{ title: string; value: number | string; color?: 'orange' | 'indigo' | 'emerald' | 'slate' }> = ({ title, value, color = 'slate' }) => {
  const colorClasses = {
    slate: 'bg-slate-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-700/50 rounded-lg shadow-sm p-5 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center mb-2">
        <span className={`w-3 h-3 rounded-full ${colorClasses[color]} mr-3`}></span>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{title}</p>
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
};

const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const logDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - logDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ tasks, employees, activityLogs }) => {
  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === TaskStatus.TODO).length;
  const inProgressCount = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  const doneCount = tasks.filter(t => t.status === TaskStatus.DONE).length;

  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    setSummaryError(null);
    try {
        const result = await generateWeeklySummary(tasks, employees);
        setSummary(result);
    } catch (err) {
        setSummaryError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
        setIsSummaryLoading(false);
    }
  };


  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Tasks" value={totalTasks} color="slate" />
        <StatCard title="To Do" value={todoCount} color="orange" />
        <StatCard title="In Progress" value={inProgressCount} color="indigo" />
        <StatCard title="Done" value={doneCount} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
           <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Task Overview</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <TaskStatusPieChart tasks={tasks} />
                <TasksPerEmployeeBarChart tasks={tasks} employees={employees} />
           </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">Activity Feed</h3>
            <div className="space-y-3 h-80 overflow-y-auto pr-2">
                {activityLogs.length > 0 ? activityLogs.map(log => (
                    <div key={log.id} className="flex items-start">
                        <img src={log.user.avatarUrl} alt={log.user.name} className="w-8 h-8 rounded-full mr-3 mt-1" />
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{log.user.name}</span> {log.message}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{getRelativeTime(log.timestamp)}</p>
                        </div>
                    </div>
                )) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center pt-10">No recent activity.</p>}
            </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100">AI Weekly Summary</h3>
        <button onClick={handleGenerateSummary} disabled={isSummaryLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 mb-4">
            {isSummaryLoading ? 'Generating...' : 'Generate Summary'}
        </button>
        {summaryError && <p className="text-red-500">{summaryError}</p>}
        {summary && (
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                {summary}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;