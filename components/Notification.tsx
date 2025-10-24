import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const notificationConfig = {
  success: {
    icon: CheckCircleIcon,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/50',
    border: 'border-emerald-200 dark:border-emerald-700',
  },
  error: {
    icon: XMarkIcon, // Placeholder for a proper error icon
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/50',
    border: 'border-red-200 dark:border-red-700',
  },
};

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(false);
  const config = notificationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    // Animate in
    setVisible(true);

    const timer = setTimeout(() => {
      handleClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    // Wait for animation to finish before calling parent onClose
    setTimeout(onClose, 300);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-5 right-5 z-50 w-full max-w-sm rounded-lg shadow-lg border p-4 flex items-start transition-all duration-300 ease-in-out ${config.bg} ${config.border} ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className={`flex-shrink-0 ${config.color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{message}</p>
      </div>
      <div className="ml-4 flex-shrink-0">
        <button
          onClick={handleClose}
          className="inline-flex rounded-md p-1.5 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          aria-label="Dismiss notification"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Notification;