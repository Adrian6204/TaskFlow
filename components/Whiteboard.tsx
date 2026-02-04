
import React, { useState, useEffect } from 'react';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface DailyTask {
  id: string;
  name: string;
  text: string;
  completed: boolean;
}

const Whiteboard: React.FC = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [newTaskText, setNewTaskText] = useState<string>('');

  // Load saved tasks from localStorage or use mock data
  useEffect(() => {
    const saved = localStorage.getItem('todayTasks');
    let loadedTasks: DailyTask[] = [];
    
    if (saved) {
      try {
        loadedTasks = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load daily tasks', e);
      }
    }
    
    // If no saved tasks or empty array, load mock data
    if (!saved || loadedTasks.length === 0) {
      const mockTasks: DailyTask[] = [
        {
          id: '1',
          name: 'Christian',
          text: 'DMRCE Development (NRCK LM MCP)',
          completed: false
        },
        {
          id: '2',
          name: 'Sage',
          text: 'Lifetime usernormal & Admin Cupdates',
          completed: false
        },
        {
          id: '3',
          name: 'Christian',
          text: 'QA Interview Responses (Email)',
          completed: false
        },
        {
          id: '4',
          name: 'Mark',
          text: 'Pearl 27 - AI Interview (Admin)',
          completed: false
        },
        {
          id: '5',
          name: 'Angelo',
          text: 'Pearl 27 - Assist to Projects & QA Grading System',
          completed: false
        }
      ];
      setTasks(mockTasks);
      localStorage.setItem('todayTasks', JSON.stringify(mockTasks));
    } else {
      setTasks(loadedTasks);
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('todayTasks', JSON.stringify(tasks));
    } else {
      localStorage.removeItem('todayTasks');
    }
  }, [tasks]);

  const addTask = () => {
    const taskName = newTaskName.trim();
    const taskText = newTaskText.trim();
    if (!taskName || !taskText) return;

    const newTask: DailyTask = {
      id: Date.now().toString(),
      name: taskName,
      text: taskText,
      completed: false
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskName('');
    setNewTaskText('');
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const clearAllTasks = () => {
    if (confirm('Are you sure you want to clear all tasks?')) {
      setTasks([]);
      localStorage.removeItem('todayTasks');
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-US', options);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Task of Today</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{getTodayDate()}</p>
          </div>
          <button
            onClick={clearAllTasks}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200"
          >
            <TrashIcon className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* Add Task Input */}
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Name..."
            className="w-48 px-4 py-3 text-base border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-neutral-800 dark:text-white transition-all duration-200"
          />
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type task description and press Enter..."
            className="flex-1 px-4 py-3 text-base border border-neutral-300 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-neutral-800 dark:text-white transition-all duration-200"
          />
          <button
            onClick={addTask}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-neutral-400 dark:text-neutral-500 text-lg">No tasks yet</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-600 mt-2">Add your first task above!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl mx-auto">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-start gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl group hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
              >
                {/* Number */}
                <span className="text-lg font-bold text-neutral-400 dark:text-neutral-500 min-w-[2rem]">
                  {index + 1}.
                </span>
                
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="mt-1 w-5 h-5 rounded border-2 border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                
                {/* Task Text */}
                <span className={`flex-1 text-base leading-relaxed ${
                  task.completed 
                    ? 'line-through text-neutral-400 dark:text-neutral-500' 
                    : 'text-neutral-900 dark:text-white'
                }`}>
                  <span className="font-semibold">{task.name}</span> - {task.text}
                </span>
                
                {/* Delete Button */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  title="Delete task"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <p className="text-xs text-center text-neutral-400 dark:text-neutral-500">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} • Tasks are saved locally
        </p>
      </div>
    </div>
  );
};

export default Whiteboard;
