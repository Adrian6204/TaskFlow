
import React, { useState } from 'react';
import { Task, Employee, TaskStatus, ActivityLog } from '../types';
import TaskStatusPieChart from './charts/TaskStatusPieChart';
import TasksPerEmployeeBarChart from './charts/TasksPerEmployeeBarChart';
import TaskPriorityBarChart from './charts/TaskPriorityBarChart';
import CompletionHistoryChart from './charts/CompletionHistoryChart';
import { generateWeeklySummary } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { FlagIcon } from './icons/FlagIcon';

interface AdminDashboardProps {
  tasks: Task[];
  employees: Employee[];
  activityLogs: ActivityLog[];
}

// Reusable Dashboard Card Component
const DashboardCard: React.FC<{ title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }> = ({ title, children, className = '', action }) => (
  <div className={`bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 flex flex-col shadow-sm dark:shadow-none ${className}`}>
    <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{title}</h3>
        {action}
    </div>
    <div className="flex-1 min-h-0">
        {children}
    </div>
  </div>
);

// Metric Component
const MetricItem: React.FC<{ label: string; value: string | number; trend?: string; icon?: React.ReactNode; color?: string }> = ({ label, value, trend, icon, color }) => {
    // Determine default color based on context if not provided
    const valueColor = color || 'text-slate-900 dark:text-white';
    
    return (
        <div className="p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm dark:shadow-none">
            <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-black ${valueColor}`}>{value}</span>
                    {trend && <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400">{trend}</span>}
                </div>
            </div>
            {icon && <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-lg text-slate-400 group-hover:text-primary-600 dark:group-hover:text-white transition-colors">{icon}</div>}
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
    return `${Math.floor(diffInHours / 24)}d ago`;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ tasks, employees, activityLogs }) => {
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.DONE);
  const completionRate = totalTasks ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  
  const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.DONE);
  
  // Calculate average completion time (mock calculation for demo)
  const avgCompletionTime = "2.5 Days"; 

  const handleGenerateSummary = async () => {
    setIsSummaryLoading(true);
    try {
        const result = await generateWeeklySummary(tasks, employees);
        setSummary(result);
    } catch (err) {
        console.error(err);
    } finally {
        setIsSummaryLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Executive Dashboard</h2>
            <p className="text-slate-500 dark:text-slate-400">Real-time insights into project velocity and team performance.</p>
          </div>
          <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Date</p>
              <p className="text-slate-700 dark:text-white font-mono">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricItem 
            label="Total Tasks" 
            value={totalTasks} 
            icon={<FlagIcon className="w-6 h-6"/>}
        />
        <MetricItem 
            label="Completion Rate" 
            value={`${completionRate}%`} 
            icon={<CheckCircleIcon className="w-6 h-6"/>}
            color={completionRate > 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary-600 dark:text-primary-400'}
        />
        <MetricItem 
            label="Overdue" 
            value={overdueTasks.length} 
            icon={<ClockIcon className="w-6 h-6"/>}
            color={overdueTasks.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-200'}
        />
        <MetricItem 
            label="Avg Turnaround" 
            value={avgCompletionTime} 
            icon={<SparklesIcon className="w-6 h-6"/>}
        />
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Charts) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard title="Status Distribution" className="h-80">
                    <TaskStatusPieChart tasks={tasks} />
                </DashboardCard>
                <DashboardCard title="Priority Breakdown" className="h-80">
                    <TaskPriorityBarChart tasks={tasks} />
                </DashboardCard>
            </div>

            <DashboardCard title="Completion Velocity (Last 7 Days)">
                <CompletionHistoryChart tasks={tasks} />
            </DashboardCard>

            {/* AI Summary Section */}
            <div className="bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/40 dark:to-slate-900/40 border border-primary-200 dark:border-primary-500/20 rounded-2xl p-6 relative overflow-hidden group shadow-sm dark:shadow-none">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <SparklesIcon className="w-32 h-32 text-primary-400" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-lg">
                            <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Executive Summary</h3>
                    </div>
                    
                    {!summary ? (
                         <div className="text-center py-8">
                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-sm">Generate a comprehensive natural-language report of this week's progress.</p>
                            <button 
                                onClick={handleGenerateSummary}
                                disabled={isSummaryLoading}
                                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSummaryLoading ? 'Analyzing Data...' : 'Generate Report'}
                            </button>
                        </div>
                    ) : (
                        <div className="prose prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                {summary}
                            </div>
                            <button 
                                onClick={() => setSummary('')} 
                                className="mt-4 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-white font-bold uppercase tracking-wider"
                            >
                                Clear Summary
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column (Team & Activity) */}
        <div className="space-y-6 flex flex-col">
            <DashboardCard title="Team Workload" className="min-h-[300px]">
                <TasksPerEmployeeBarChart tasks={tasks} employees={employees} />
            </DashboardCard>

            <DashboardCard title="Recent Activity" className="flex-1 min-h-[400px]">
                <div className="space-y-4 overflow-y-auto pr-2 max-h-[400px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
                    {activityLogs.slice(0, 15).map((log) => (
                        <div key={log.id} className="flex gap-3 items-start group">
                            <img src={log.user.avatarUrl} alt="" className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 mt-1" />
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{log.user.name}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{getRelativeTime(log.timestamp)}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                                    {log.message}
                                </p>
                            </div>
                        </div>
                    ))}
                    {activityLogs.length === 0 && (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-600 italic text-sm">No activity recorded yet.</div>
                    )}
                </div>
            </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
