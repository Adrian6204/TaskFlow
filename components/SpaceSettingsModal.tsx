
import React, { useState, useEffect } from 'react';
import { Space, Employee } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

interface SpaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  space: Space;
  members: Employee[];
}

const SpaceSettingsModal: React.FC<SpaceSettingsModalProps> = ({ isOpen, onClose, space, members }) => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(space.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[60] flex justify-center items-center p-4 transition-all duration-300 ${show ? 'visible' : 'invisible'}`}>
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 transition-all duration-300 transform ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Space Settings</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <XMarkIcon className="w-6 h-6" />
            </button>
        </div>
        
        <div className="p-6">
            <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Invite New Members</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">Share this code with your team. They can enter it after clicking "Join Space".</p>
                
                <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
                    <code className="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400 tracking-widest">{space.joinCode}</code>
                    <button 
                        onClick={handleCopy}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                </div>
            </div>

            <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Active Members ({members.length})</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <img src={member.avatarUrl} alt="" className="w-8 h-8 rounded-lg" />
                                <span className="font-medium text-slate-800 dark:text-slate-200">{member.name}</span>
                            </div>
                            {member.id === space.ownerId && (
                                <span className="px-2 py-1 text-[10px] font-bold uppercase bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded">Owner</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceSettingsModal;
