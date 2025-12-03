import React, { useState, useEffect, useRef } from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel'
}) => {
  const [show, setShow] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation frame
      const timer = setTimeout(() => setShow(true), 10);
      
      // Accessibility: Focus the cancel button to prevent accidental confirmation via Enter key
      const focusTimer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);

      // Accessibility: Close on Escape key
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        clearTimeout(focusTimer);
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setShow(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-all duration-300 ${show ? 'visible' : 'invisible'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop with click handler */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${show ? 'opacity-60' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div 
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 relative z-10 transition-all duration-300 transform ${show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
      >
        <h2 id="modal-title" className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
          {title}
        </h2>
        <p id="modal-description" className="text-slate-600 dark:text-slate-300 mb-6">
          {message}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            ref={cancelButtonRef}
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;