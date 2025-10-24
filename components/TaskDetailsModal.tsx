import React, { useState, useEffect } from 'react';
import { Task, Employee, Priority } from '../types';
import { useAuth } from '../auth/AuthContext';
import { XMarkIcon } from './icons/XMarkIcon';
import { FlagIcon } from './icons/FlagIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { getTaskAdviceFromAI } from '../services/geminiService';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  employees: Employee[];
  onAddComment: (taskId: number, content: string) => void;
}

const priorityConfig = {
    [Priority.URGENT]: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' },
    [Priority.HIGH]: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/50' },
    [Priority.MEDIUM]: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
    [Priority.LOW]: { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700' },
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task, employees, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const assignee = employees.find(e => e.id === task.assigneeId);
  const currentUser = employees.find(e => e.id === user?.employeeId);

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Use a timeout to allow the component to mount before adding the 'open' class
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      // Reset AI state when modal opens
      setAiQuestion('');
      setAiResponse('');
      setAiError(null);
    }
  }, [isOpen])


  if (!isOpen) return null;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(task.id, newComment);
      setNewComment('');
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    setIsAiLoading(true);
    setAiResponse('');
    setAiError(null);
    try {
      const response = await getTaskAdviceFromAI(task.title, task.description, aiQuestion);
      setAiResponse(response);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsAiLoading(false);
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
    <div className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-all duration-300 ${show ? 'bg-black bg-opacity-60' : 'bg-black bg-opacity-0'}`}>
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <header className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{task.title}</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full">
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
          
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">AI Assistant</h3>
            </div>
             <form onSubmit={handleAskAI} className="mb-4">
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask AI for help with this task..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-y"
              />
              <button type="submit" className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 w-full sm:w-auto" disabled={!aiQuestion.trim() || isAiLoading}>
                {isAiLoading ? 'Thinking...' : 'Ask AI'}
              </button>
            </form>
            {isAiLoading && <div className="text-center p-4 text-slate-500 dark:text-slate-400">Loading response...</div>}
            {aiError && <p className="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-900/30 rounded-md">{aiError}</p>}
            {aiResponse && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                {aiResponse}
              </div>
            )}
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

        <footer className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
                {currentUser && <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full"/>}
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={1}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50" disabled={!newComment.trim()}>
                    Send
                </button>
            </form>
        </footer>
      </div>
    </div>
  );
};

export default TaskDetailsModal;