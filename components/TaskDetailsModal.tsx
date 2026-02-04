
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Employee, Priority, Subtask } from '../types';
import { useAuth } from '../auth/AuthContext';
import { XMarkIcon } from './icons/XMarkIcon';
import { FlagIcon } from './icons/FlagIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { getTaskAdviceFromAI, generateSubtasks } from '../services/geminiService';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { ClockIcon } from './icons/ClockIcon';
import TagPill from './TagPill';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  employees: Employee[];
  allTasks: Task[];
  onAddComment: (taskId: number, content: string) => void;
  onUpdateTask: (task: Task) => void;
  onToggleTimer: (taskId: number) => void;
}

const priorityConfig = {
    [Priority.URGENT]: { text: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' },
    [Priority.HIGH]: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/50' },
    [Priority.MEDIUM]: { text: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-100 dark:bg-primary-900/50' },
    [Priority.LOW]: { text: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700' },
};

const formatDuration = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));
    
    return `${hours}h ${minutes}m ${seconds}s`;
};

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, task, employees, allTasks, onAddComment, onUpdateTask, onToggleTimer }) => {
  const [newComment, setNewComment] = useState('');
  const { user } = useAuth();
  const assignee = employees.find(e => e.id === task.assigneeId);
  const currentUser = employees.find(e => e.id === user?.employeeId);
  const blockingTask = task.blockedById ? allTasks.find(t => t.id === task.blockedById) : null;

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [show, setShow] = useState(false);
  
  // Subtasks State
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  // Tags State
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  
  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (isOpen) {
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
      setAiQuestion('');
      setAiResponse('');
      setAiError(null);
      setNewSubtaskTitle('');
      setNewTag('');
      setIsAddingTag(false);
      setShowTagSuggestions(false);
    }
  }, [isOpen])
  
  // Live Timer Update
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (task.timerStartTime) {
          interval = setInterval(() => {
              const start = new Date(task.timerStartTime!).getTime();
              setElapsedTime(Date.now() - start);
          }, 1000);
          // Initial calculation
          const start = new Date(task.timerStartTime).getTime();
          setElapsedTime(Date.now() - start);
      } else {
          setElapsedTime(0);
      }
      return () => clearInterval(interval);
  }, [task.timerStartTime]);


  // Calculate unique existing tags from all tasks
  const existingTags = useMemo(() => {
    const allTags = new Set(allTasks.flatMap(t => t.tags || []));
    return Array.from(allTags).sort();
  }, [allTasks]);

  // Filter suggestions based on input and already selected tags
  const suggestedTags = useMemo(() => {
    const currentTags = task.tags || [];
    return existingTags.filter(tag => 
      !currentTags.includes(tag) && 
      tag.toLowerCase().includes(newTag.toLowerCase())
    );
  }, [existingTags, task.tags, newTag]);


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
  
  // Subtask Handlers
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    
    const newSubtask: Subtask = {
        id: `manual-${Date.now()}`,
        title: newSubtaskTitle,
        isCompleted: false
    };
    
    onUpdateTask({
        ...task,
        subtasks: [...(task.subtasks || []), newSubtask]
    });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = (task.subtasks || []).map(st => 
        st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );
    onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
      const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);
      onUpdateTask({ ...task, subtasks: updatedSubtasks });
  };
  
  const handleGenerateSubtasks = async () => {
      setIsGeneratingSubtasks(true);
      try {
          const generatedTitles = await generateSubtasks(task.title, task.description);
          const newSubtasks: Subtask[] = generatedTitles.map((title, index) => ({
              id: `ai-${Date.now()}-${index}`,
              title,
              isCompleted: false
          }));
          
          onUpdateTask({
              ...task,
              subtasks: [...(task.subtasks || []), ...newSubtasks]
          });
      } catch (error) {
          console.error("Failed to generate subtasks", error);
      } finally {
          setIsGeneratingSubtasks(false);
      }
  };

  // Tag Handlers
  const handleAddTag = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTag.trim()) return;
      
      const currentTags = task.tags || [];
      if (!currentTags.includes(newTag.trim())) {
          onUpdateTask({
              ...task,
              tags: [...currentTags, newTag.trim()]
          });
      }
      setNewTag('');
      setIsAddingTag(false);
      setShowTagSuggestions(false);
  };

  const handleSelectTag = (tag: string) => {
      const currentTags = task.tags || [];
      if (!currentTags.includes(tag)) {
          onUpdateTask({
              ...task,
              tags: [...currentTags, tag]
          });
      }
      setNewTag('');
      setIsAddingTag(false);
      setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
      const currentTags = task.tags || [];
      onUpdateTask({
          ...task,
          tags: currentTags.filter(tag => tag !== tagToRemove)
      });
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
  
  const completedSubtasks = (task.subtasks || []).filter(st => st.isCompleted).length;
  const totalSubtasks = (task.subtasks || []).length;
  const progressPercentage = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);
  
  const totalLoggedTime = (task.timeLogs || []).reduce((acc, log) => acc + log.duration, 0);
  const totalTimeDisplay = formatDuration(totalLoggedTime + (task.timerStartTime ? elapsedTime : 0));

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
      
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-all duration-300 relative z-10 transform ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <header className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white truncate pr-4">{task.title}</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-full flex-shrink-0">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          {blockingTask && (
             <div className="bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700/50 rounded-lg p-3 flex items-center gap-3 mb-6">
                <LockClosedIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">This task is blocked by: <span className="font-semibold">"{blockingTask.title}"</span></p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center">
                {assignee && <img src={assignee.avatarUrl} alt={assignee.name} className="w-8 h-8 rounded-full mr-3 border-2 border-white dark:border-slate-700" />}
                <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Assignee</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{assignee?.name || 'Unassigned'}</p>
                </div>
            </div>
            <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Due Date</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Created On</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
             <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Priority</span>
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].text}`}>
                    <FlagIcon className="w-4 h-4" />
                    {task.priority}
                </div>
            </div>
          </div>
          
          {/* Tags Section */}
          <div className="mb-6">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-2">Tags</span>
              <div className="flex flex-wrap items-center gap-2">
                  {(task.tags || []).map(tag => (
                      <TagPill key={tag} text={tag} onRemove={() => handleRemoveTag(tag)} />
                  ))}
                  {isAddingTag ? (
                      <div className="relative">
                          <form onSubmit={handleAddTag} className="flex items-center">
                              <input
                                  type="text"
                                  autoFocus
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onFocus={() => setShowTagSuggestions(true)}
                                  onBlur={() => {
                                      // Delay blur to allow click on suggestion
                                      setTimeout(() => {
                                          if(!newTag) setIsAddingTag(false);
                                          setShowTagSuggestions(false);
                                      }, 200);
                                  }}
                                  className="px-2 py-0.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                  placeholder="New tag..."
                              />
                          </form>
                           {showTagSuggestions && suggestedTags.length > 0 && (
                                <ul className="absolute z-10 left-0 top-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md shadow-lg max-h-40 overflow-y-auto w-40">
                                    {suggestedTags.map(tag => (
                                    <li
                                        key={tag}
                                        onMouseDown={(e) => {
                                            e.preventDefault(); // Prevent input blur
                                            handleSelectTag(tag);
                                        }}
                                        className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 text-xs text-slate-700 dark:text-slate-200"
                                    >
                                        {tag}
                                    </li>
                                    ))}
                                </ul>
                            )}
                      </div>
                  ) : (
                    <button 
                        onClick={() => setIsAddingTag(true)}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors"
                    >
                        <PlusIcon className="w-3 h-3 mr-1" /> Add Tag
                    </button>
                  )}
              </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h3>
            <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
          </div>
          
          {/* Time Tracking Section */}
          <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                  <ClockIcon className={`w-6 h-6 ${task.timerStartTime ? 'text-blue-600 dark:text-blue-400 animate-pulse' : 'text-slate-400'}`} />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Time Tracking</h3>
              </div>
              
              {/* Big Timer Display */}
              <div className="text-center mb-6">
                  <div className={`text-6xl font-bold font-mono ${
                      task.timerStartTime 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-slate-700 dark:text-slate-300'
                  }`}>
                      {task.timerStartTime ? formatDuration(elapsedTime) : '0h 0m 0s'}
                  </div>
                  {task.timerStartTime && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 animate-pulse font-medium">
                          ⏱️ Timer Running...
                      </p>
                  )}
                  {!task.timerStartTime && totalLoggedTime > 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                          Total logged: {totalTimeDisplay}
                      </p>
                  )}
              </div>
              
              {/* Start/Stop Button */}
              <div className="flex justify-center">
                  <button
                    onClick={() => onToggleTimer(task.id)}
                    className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                        task.timerStartTime 
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-red-500/50' 
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/50'
                    }`}
                  >
                      {task.timerStartTime ? (
                          <>
                            <StopIcon className="w-6 h-6" /> Stop Timer
                          </>
                      ) : (
                          <>
                            <PlayIcon className="w-6 h-6" /> Start Timer
                          </>
                      )}
                  </button>
              </div>
              
              {task.timeLogs && task.timeLogs.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">Session History</p>
                      <ul className="space-y-1 max-h-32 overflow-y-auto">
                          {task.timeLogs.slice().reverse().map(log => (
                              <li key={log.id} className="text-xs text-slate-600 dark:text-slate-300 flex justify-between">
                                  <span>{new Date(log.startTime).toLocaleDateString()} {new Date(log.startTime).toLocaleTimeString()}</span>
                                  <span className="font-mono">{formatDuration(log.duration)}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              )}
          </div>
          
          {/* Subtasks Section */}
          <div className="mb-6 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">Subtasks ({completedSubtasks}/{totalSubtasks})</h3>
                <button 
                    onClick={handleGenerateSubtasks} 
                    disabled={isGeneratingSubtasks}
                    className="flex items-center text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 disabled:opacity-50"
                >
                    <SparklesIcon className={`w-4 h-4 mr-1 ${isGeneratingSubtasks ? 'animate-spin' : ''}`} />
                    {isGeneratingSubtasks ? 'Generating...' : 'Auto-Generate'}
                </button>
            </div>
            
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4">
                <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
            </div>

            <ul className="space-y-2 mb-3">
                {(task.subtasks || []).map(subtask => (
                    <li key={subtask.id} className="flex items-start group">
                        <input 
                            type="checkbox" 
                            checked={subtask.isCompleted} 
                            onChange={() => handleToggleSubtask(subtask.id)}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                        />
                        <span className={`ml-2 text-sm flex-grow ${subtask.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                            {subtask.title}
                        </span>
                        <button 
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="ml-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </li>
                ))}
            </ul>

            <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input 
                    type="text" 
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a new subtask..."
                    className="flex-grow text-sm px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
                <button type="submit" disabled={!newSubtaskTitle.trim()} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </form>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-500 dark:text-primary-400" />
                <h3 className="font-semibold text-slate-700 dark:text-slate-300">AI Assistant</h3>
            </div>
             <form onSubmit={handleAskAI} className="mb-4">
              <textarea
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask AI for help with this task..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-y"
              />
              <button type="submit" className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 w-full sm:w-auto" disabled={!aiQuestion.trim() || isAiLoading}>
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

        <footer className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 flex-shrink-0">
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
                {currentUser && <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-full"/>}
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={1}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
                />
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50" disabled={!newComment.trim()}>
                    Send
                </button>
            </form>
        </footer>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
