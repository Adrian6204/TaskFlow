
import React from 'react';
import { Employee, Task, TaskStatus } from '../types';

interface MembersViewProps {
  employees: Employee[];
  tasks: Task[];
}

const MembersView: React.FC<MembersViewProps> = ({ employees, tasks }) => {
  const getTaskStats = (employeeId: string) => {
    const employeeTasks = tasks.filter(t => t.assigneeId === employeeId);
    return {
      total: employeeTasks.length,
      completed: employeeTasks.filter(t => t.status === TaskStatus.DONE).length,
      inProgress: employeeTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
      todo: employeeTasks.filter(t => t.status === TaskStatus.TODO).length,
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Team Members</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {employees.length} members in this space
        </p>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee, index) => {
          const stats = getTaskStats(employee.id);
          const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

          return (
            <div 
              key={employee.id}
              className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 p-6 hover:shadow-lg transition-all duration-300 stagger-children"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img 
                    src={employee.avatarUrl} 
                    alt={employee.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-neutral-200/50 dark:border-neutral-700/50"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white truncate">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {stats.total} tasks assigned
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Task Progress</span>
                  <span className="text-xs font-semibold text-neutral-900 dark:text-white">{completionRate}%</span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-neutral-400 to-neutral-600 dark:from-neutral-500 dark:to-neutral-300 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <p className="text-lg font-bold text-neutral-900 dark:text-white">{stats.todo}</p>
                  <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">To Do</p>
                </div>
                <div className="text-center p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
                  <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Active</p>
                </div>
                <div className="text-center p-2 bg-green-50 dark:bg-green-500/10 rounded-xl">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
                  <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Done</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400">No members in this space yet</p>
        </div>
      )}
    </div>
  );
};

export default MembersView;
