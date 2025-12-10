import React, { useState, useEffect } from 'react';
import { User, Employee } from '../types';
import { UserIcon } from './icons/UserIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentUserEmployee: Employee | undefined;
  onSave: (name: string, avatarUrl: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, currentUserEmployee, onSave }) => {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (currentUserEmployee) {
        setName(currentUserEmployee.name);
        setAvatarUrl(currentUserEmployee.avatarUrl);
      } else {
        setName(user.username);
      }
      
      const timer = setTimeout(() => setShow(true), 10);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setShow(false);
    }
  }, [isOpen, onClose, user, currentUserEmployee]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name, avatarUrl);
      onClose();
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
      
      <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 relative z-10 transition-all duration-300 transform ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Profile</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-6">
            <div className="relative group">
                <img 
                    src={avatarUrl || 'https://via.placeholder.com/150'} 
                    alt="Profile Preview" 
                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-700 shadow-sm"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${name}&background=random`;
                    }}
                />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar URL</label>
            <input
              type="text"
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Paste a direct link to an image (e.g., from unsplash.com or gravatar).
            </p>
          </div>

          <div className="flex justify-end space-x-3">
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;