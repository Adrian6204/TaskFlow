
import React, { useState, useEffect, useMemo } from 'react';
import { Task, Employee, Priority, Subtask } from '../types';
import { PRIORITIES } from '../constants';
import { suggestTaskPriority } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import TagPill from './TagPill';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'status' | 'comments' | 'createdAt' | 'subtasks' | 'tags'> & { subtasks?: Subtask[], tags?: string[] }, id: number | null) => void;
  employees: Employee[];
  taskToEdit: Task | null;
  allTasks: Task[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSave, employees, taskToEdit, allTasks }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [blockedById, setBlockedById] = useState<number | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [show, setShow] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

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
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setAssigneeId(taskToEdit.assigneeId);
      setDueDate(taskToEdit.dueDate);
      setPriority(taskToEdit.priority);
      setBlockedById(taskToEdit.blockedById || null);
      setSubtasks(taskToEdit.subtasks || []);
      setTags(taskToEdit.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setAssigneeId(employees.length > 0 ? employees[0].id : '');
      setDueDate(new Date().toISOString().split('T')[0]);
      setPriority(Priority.MEDIUM);
      setBlockedById(null);
      setSubtasks([]);
      setTags([]);
    }
  }, [taskToEdit, employees, isOpen]);

  // Calculate unique existing tags from all tasks
  const existingTags = useMemo(() => {
    const allTags = new Set(allTasks.flatMap(task => task.tags || []));
    return Array.from(allTags).sort();
  }, [allTasks]);

  // Filter suggestions based on input and already selected tags
  const suggestedTags = useMemo(() => {
    return existingTags.filter(tag => 
      !tags.includes(tag) && 
      tag.toLowerCase().includes(newTag.toLowerCase())
    );
  }, [existingTags, tags, newTag]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description, assigneeId, dueDate, priority, blockedById, subtasks, tags }, taskToEdit ? taskToEdit.id : null);
  };
  
  const handleSuggestPriority = async () => {
    if (!title.trim() && !description.trim()) return;
    setIsAiLoading(true);
    try {
      const suggestedPriority = await suggestTaskPriority(title, description);
      setPriority(suggestedPriority);
    } catch (error) {
      console.error("Failed to suggest priority:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newTag.trim()) {
          e.preventDefault();
          if (!tags.includes(newTag.trim())) {
              setTags([...tags, newTag.trim()]);
          }
          setNewTag('');
          setShowTagSuggestions(false);
      }
  };

  const selectTag = (tag: string) => {
      if (!tags.includes(tag)) {
          setTags([...tags, tag]);
      }
      setNewTag('');
      setShowTagSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const potentialBlockingTasks = allTasks.filter(t => t.id !== taskToEdit?.id);

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
      
      <div 
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl p-6 transition-all duration-300 flex flex-col max-h-[90vh] relative z-10 transform ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-white flex-shrink-0">
          {taskToEdit ? 'Edit Task' : 'Add New Task'}
        </h2>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto px-1">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <div className="mb-4">
              <label htmlFor="tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                      <TagPill key={tag} text={tag} onRemove={() => removeTag(tag)} />
                  ))}
              </div>
              <div className="relative">
                <input
                    type="text"
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={handleAddTag}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                    placeholder="Type tag and press Enter"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    autoComplete="off"
                />
                {showTagSuggestions && suggestedTags.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {suggestedTags.map(tag => (
                      <li
                        key={tag}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          selectTag(tag);
                        }}
                        className="px-3 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 text-sm text-slate-700 dark:text-slate-200"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assignee</label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    required
                />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                <div className="flex items-center gap-2">
                    <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        {PRIORITIES.map(p => (
                        <option key={p} value={p}>{p}</option>
                        ))}
                    </select>
                    <button type="button" onClick={handleSuggestPriority} disabled={isAiLoading} className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900" title="Suggest Priority with AI">
                        <SparklesIcon className={`w-5 h-5 text-indigo-600 dark:text-indigo-400 ${isAiLoading ? 'animate-pulse' : ''}`}/>
                    </button>
                </div>
            </div>
            <div>
              <label htmlFor="blockedBy" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Blocked By</label>
              <select
                id="blockedBy"
                value={blockedById || ''}
                onChange={(e) => setBlockedById(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              >
                <option value="">None</option>
                {potentialBlockingTasks.map(task => (
                  <option key={task.id} value={task.id}>{task.title}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              {taskToEdit ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
