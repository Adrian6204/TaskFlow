
import React from 'react';
import { Task, Employee, TaskStatus, Priority, Space } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { FlagIcon } from './icons/FlagIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface HomeViewProps {
  tasks: Task[];
  employees: Employee[];
  currentSpace?: Space;
  user: { username: string; employeeId: string };
}

const HomeView: React.FC<HomeViewProps> = ({ tasks, employees, currentSpace, user }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Get user's tasks
  const myTasks = tasks.filter(t => t.assigneeId === user.employeeId);
  const todayTasks = myTasks.filter(t => t.dueDate === today);
  const overdueTasks = myTasks.filter(t => t.dueDate < today && t.status !== TaskStatus.DONE);
  const completedToday = myTasks.filter(t => 
    t.completedAt && t.completedAt.split('T')[0] === today
  );

  // Stats
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(t => t.status === TaskStatus.DONE).length;
  const inProgressTasks = myTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.URGENT: return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400';
      case Priority.HIGH: return 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400';
      case Priority.MEDIUM: return 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      default: return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 rounded-3xl p-8 text-white dark:text-neutral-900">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {user.username}!
        </h1>
        <p className="text-neutral-300 dark:text-neutral-600 text-lg">
          {todayTasks.length > 0 
            ? `You have ${todayTasks.length} task${todayTasks.length > 1 ? 's' : ''} due today`
            : 'No tasks due today. Great job staying ahead!'
          }
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 dark:bg-neutral-900/10 rounded-2xl p-4">
            <p className="text-3xl font-bold">{totalTasks}</p>
            <p className="text-sm text-neutral-300 dark:text-neutral-600">Total Tasks</p>
          </div>
          <div className="bg-white/10 dark:bg-neutral-900/10 rounded-2xl p-4">
            <p className="text-3xl font-bold">{inProgressTasks}</p>
            <p className="text-sm text-neutral-300 dark:text-neutral-600">In Progress</p>
          </div>
          <div className="bg-white/10 dark:bg-neutral-900/10 rounded-2xl p-4">
            <p className="text-3xl font-bold">{completedTasks}</p>
            <p className="text-sm text-neutral-300 dark:text-neutral-600">Completed</p>
          </div>
          <div className="bg-white/10 dark:bg-neutral-900/10 rounded-2xl p-4">
            <p className="text-3xl font-bold text-red-400 dark:text-red-500">{overdueTasks.length}</p>
            <p className="text-sm text-neutral-300 dark:text-neutral-600">Overdue</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
              <CalendarIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Today's Tasks</h2>
              <p className="text-sm text-neutral-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400 text-center py-8">No tasks due today</p>
            ) : (
              todayTasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${task.status === TaskStatus.DONE ? 'bg-green-500' : task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500' : 'bg-neutral-400'}`} />
                  <span className={`flex-1 text-sm font-medium ${task.status === TaskStatus.DONE ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'}`}>
                    {task.title}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl">
              <ClockIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Overdue Tasks</h2>
              <p className="text-sm text-neutral-500">{overdueTasks.length} task{overdueTasks.length !== 1 ? 's' : ''} need attention</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {overdueTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-neutral-500 dark:text-neutral-400">All caught up!</p>
              </div>
            ) : (
              overdueTasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200/50 dark:border-red-500/20"
                >
                  <FlagIcon className="w-4 h-4 text-red-500" />
                  <span className="flex-1 text-sm font-medium text-neutral-900 dark:text-white">
                    {task.title}
                  </span>
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                    Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Activity */}
      <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">Team Members</h2>
        <div className="flex items-center gap-4 flex-wrap">
          {employees.slice(0, 8).map((employee) => (
            <div key={employee.id} className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl px-4 py-2">
              <img 
                src={employee.avatarUrl}
                alt={employee.name}
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-sm font-medium text-neutral-900 dark:text-white">{employee.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeView;
