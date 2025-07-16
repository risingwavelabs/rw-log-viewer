import React from 'react';
import { ErrorToast, type ErrorType } from '../components/ErrorToast';

// Error Toast Manager Hook
export const useErrorToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    type: ErrorType;
    title: string;
    message: string;
    autoClose?: boolean;
    duration?: number;
  }>>([]);

  const showToast = React.useCallback((
    type: ErrorType,
    title: string,
    message: string,
    options?: { autoClose?: boolean; duration?: number }
  ) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, message, ...options }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showError = React.useCallback((title: string, message: string) => {
    showToast('error', title, message, { autoClose: false });
  }, [showToast]);

  const showWarning = React.useCallback((title: string, message: string) => {
    showToast('warning', title, message);
  }, [showToast]);

  const showInfo = React.useCallback((title: string, message: string) => {
    showToast('info', title, message);
  }, [showToast]);

  const ToastContainer = React.useMemo(() => {
    return () => (
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ErrorToast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
            autoClose={toast.autoClose}
            duration={toast.duration}
          />
        ))}
      </div>
    );
  }, [toasts, removeToast]);

  return {
    showError,
    showWarning,
    showInfo,
    showToast,
    ToastContainer,
  };
};