
import React, { useState, useEffect } from 'react';
import { Task, Employee } from '../types';
import { generateTasksWithAI } from '../services/geminiService';

interface GenerateTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksGenerated: (tasks: Pick<Task, 'title' | 'description' | 'assigneeId' | 'dueDate'>[]) => void;
  employees: Employee[];
}

const GenerateTasksModal: React.FC<GenerateTasksModalProps> = ({ isOpen, onClose, onTasksGenerated, employees }) => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Use a timeout to allow the component to mount before adding the 'open' class
      const timer = setTimeout(() => setShow(true), 10);
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setShow(false);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setGoal('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const generatedTasks = await generateTasksWithAI(goal, employees);
      onTasksGenerated(generatedTasks);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
        className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-all duration-300 ${show ? 'visible' : 'invisible'}`}
        role="dialog"
        aria-modal="true"
    >
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${show ? 'opacity-60' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg p-6 transition-all duration-300 relative z-10 transform ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white">
          Generate Tasks with AI
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">Describe a high-level goal, and AI will break it down into smaller, actionable tasks.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="goal" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Goal or Objective
            </label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="e.g., 'Launch a new marketing campaign for our Q4 product release'"
              required
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 disabled:opacity-50 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Generating...' : 'Generate Tasks'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateTasksModal;
