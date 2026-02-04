
import React, { useState } from 'react';
import { Space, Employee } from '../types';
import { Cog6ToothIcon } from './icons/Cog6ToothIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { UserIcon } from './icons/UserIcon';
import ConfirmationModal from './ConfirmationModal';

interface SpaceSettingsViewProps {
  space: Space;
  members: Employee[];
  allEmployees: Employee[];
  currentUserId?: string;
  onRemoveMember: (spaceId: string, memberId: string) => void;
  onAddMember: (spaceId: string, memberId: string) => void;
  onDeleteSpace: (spaceId: string) => void;
}

const SpaceSettingsView: React.FC<SpaceSettingsViewProps> = ({ 
  space, 
  members, 
  allEmployees,
  currentUserId,
  onRemoveMember, 
  onAddMember, 
  onDeleteSpace 
}) => {
  const [copied, setCopied] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedNewMember, setSelectedNewMember] = useState('');
  
  // Confirmation modals state
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Employee | null>(null);
  const [showDeleteSpaceModal, setShowDeleteSpaceModal] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(space.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = () => {
    if (selectedNewMember) {
      onAddMember(space.id, selectedNewMember);
      setSelectedNewMember('');
      setShowAddMember(false);
    }
  };

  const handleRemoveMemberClick = (member: Employee) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      onRemoveMember(space.id, memberToRemove.id);
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
    }
  };

  const handleDeleteSpaceClick = () => {
    setShowDeleteSpaceModal(true);
  };

  const confirmDeleteSpace = () => {
    onDeleteSpace(space.id);
    setShowDeleteSpaceModal(false);
  };

  // Get employees that are not already members
  const availableEmployees = allEmployees.filter(emp => 
    !members.some(member => member.id === emp.id)
  );

  const isOwner = currentUserId === space.ownerId;

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-200/50 dark:border-neutral-800/50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-900 dark:bg-white rounded-xl">
            <Cog6ToothIcon className="w-6 h-6 text-white dark:text-neutral-900" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">Workspace Settings</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{space.name}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Workspace Info */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-6 border border-neutral-200/50 dark:border-neutral-700/50">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4 uppercase tracking-wider">Workspace Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Name</label>
              <p className="text-base font-semibold text-neutral-900 dark:text-white mt-1">{space.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Description</label>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">{space.description || 'No description provided'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Created</label>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
                {new Date(space.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Invite Section */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-6 border border-neutral-200/50 dark:border-neutral-700/50">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 uppercase tracking-wider">Invite New Members</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">Share this code with your team. They can enter it after clicking "Join with Code" in the sidebar.</p>
          
          <div className="bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Join Code</p>
              <code className="text-3xl font-mono font-bold text-neutral-900 dark:text-white tracking-widest">{space.joinCode}</code>
            </div>
            <button 
              onClick={handleCopy}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-95'
              }`}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-6 border border-neutral-200/50 dark:border-neutral-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Active Members ({members.length})
            </h3>
            {isOwner && availableEmployees.length > 0 && (
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all duration-200"
              >
                <PlusIcon className="w-4 h-4" />
                Add Member
              </button>
            )}
          </div>

          {/* Add Member Form */}
          {showAddMember && isOwner && (
            <div className="mb-4 p-4 bg-white dark:bg-neutral-900 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
                Select Member to Add
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedNewMember}
                  onChange={(e) => setSelectedNewMember(e.target.value)}
                  className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:bg-neutral-800 dark:text-white transition-all duration-200"
                >
                  <option value="">Select a member...</option>
                  {availableEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddMember}
                  disabled={!selectedNewMember}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-neutral-400 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddMember(false);
                    setSelectedNewMember('');
                  }}
                  className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members.map(member => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-neutral-900/50 transition-all duration-200 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={member.avatarUrl} 
                    alt="" 
                    className="w-10 h-10 rounded-xl object-cover border border-neutral-200/50 dark:border-neutral-700/50" 
                  />
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white">{member.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.id === space.ownerId ? (
                    <span className="px-3 py-1 text-xs font-bold uppercase bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg">
                      Owner
                    </span>
                  ) : isOwner && (
                    <button
                      onClick={() => handleRemoveMemberClick(member)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone - Delete Workspace */}
        {isOwner && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900 dark:text-red-200 mb-2 uppercase tracking-wider">Danger Zone</h3>
                <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                  Deleting this workspace will permanently remove all tasks, time logs, and data. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteSpaceClick}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-200 active:scale-95"
                >
                  <TrashIcon className="w-5 h-5" />
                  Delete Workspace
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Remove Member Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveMemberModal}
        onClose={() => {
          setShowRemoveMemberModal(false);
          setMemberToRemove(null);
        }}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        message={memberToRemove ? `Are you sure you want to remove ${memberToRemove.name} from "${space.name}"? They will lose access to all tasks and data in this workspace.` : ''}
        confirmText="Remove Member"
        cancelText="Cancel"
      />

      {/* Delete Workspace Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteSpaceModal}
        onClose={() => setShowDeleteSpaceModal(false)}
        onConfirm={confirmDeleteSpace}
        title="Delete Workspace"
        message={`Are you sure you want to permanently delete "${space.name}"? This action cannot be undone and will delete all tasks, time logs, comments, and data in this workspace.`}
        confirmText="Delete Workspace"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SpaceSettingsView;
