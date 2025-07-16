import React from 'react';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

export type ErrorType = 'error' | 'warning' | 'info';

interface ErrorToastProps {
  type: ErrorType;
  title: string;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const iconMap = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export const ErrorToast: React.FC<ErrorToastProps> = ({
  type,
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const Icon = iconMap[type];

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div className={clsx(
        'rounded-lg border shadow-lg p-4 transition-all duration-300 ease-in-out',
        colorMap[type]
      )}>
        <div className="flex items-start">
          <Icon className={clsx('h-5 w-5 mt-0.5 mr-3 flex-shrink-0', iconColorMap[type])} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium mb-1">{title}</h3>
            <p className="text-sm opacity-90 whitespace-pre-wrap">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

