import React, { useState } from 'react';
import { Task, Employee, Priority } from '../types';
import { useAuth } from '../auth/AuthContext';
import { XMarkIcon } from './icons/XMarkIcon';
import { FlagIcon } from './icons/FlagIcon';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  employees: Employee[];
  onAddComment: (taskId: number, content: string) => void;
}

const priorityConfig = {
    [Priority.URGENT]: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' },
    [Priority.HIGH]: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/50' },
    [Priority.MEDIUM]: { text: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-100 dark:bg-sky-900/50' },
    [Priority.LOW]: { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700' },
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task, employees, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const assignee = employees.find(e => e.id === task.assigneeId);
  const currentUser = employees.find(e => e.id === user?.employeeId);

  if (!isOpen) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(task.id, newComment);
      setNewComment('');
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{task.title}</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="flex items-center">
                {assignee && <img src={assignee.avatarUrl} alt={assignee.name} className="w-8 h-8 rounded-full mr-3 border-2 border-white dark:border-slate-700" />}
                <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Assignee</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{assignee?.name || 'Unassigned'}</p>
                </div>
            </div>
            <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Due Date</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
             <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Priority</span>
                <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-sm font-semibold ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].text}`}>
                    <FlagIcon className="w-4 h-4" />
                    {task.priority}
                </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h3>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Activity</h3>
            <div className="space-y-4">
              {task.comments.map(comment => {
                const author = employees.find(e => e.id === comment.authorId);
                return (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <img src={author?.avatarUrl} alt={author?.name} className="w-8 h-8 rounded-full mt-1"/>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                        <div className="flex items-baseline space-x-2">
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{author?.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{getRelativeTime(comment.timestamp)}</p>
                        </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                    </div>
                  </div>
                );
              })}
               {task.comments.length === 0 && <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">No comments yet.</p>}
            </div>
          </div>
        </main>

        <footer className="p-4 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
                {currentUser && <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full"/>}
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={1}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                />
                <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 disabled:opacity-50" disabled={!newComment.trim()}>
                    Send
                </button>
            </form>
        </footer>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
