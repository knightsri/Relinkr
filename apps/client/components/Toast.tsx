import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);

    // Auto-remove after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(toast.id), 300); // Wait for fade out animation
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getToastStyles = (type: ToastType) => {
    const baseStyles = {
      padding: '12px 16px',
      marginBottom: '8px',
      borderRadius: '6px',
      color: 'white',
      fontWeight: '500',
      fontSize: '14px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease-in-out',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible ? 1 : 0,
      cursor: 'pointer',
    };

    const typeStyles = {
      success: { backgroundColor: '#10b981' },
      error: { backgroundColor: '#ef4444' },
      info: { backgroundColor: '#3b82f6' },
      warning: { backgroundColor: '#f59e0b' },
    };

    return { ...baseStyles, ...typeStyles[type] };
  };

  return (
    <div
      style={getToastStyles(toast.type)}
      onClick={() => {
        setIsVisible(false);
        setTimeout(() => onRemove(toast.id), 300);
      }}
    >
      {toast.message}
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        maxWidth: '400px',
      }}
    >
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => addToast(message, 'success', duration);
  const showError = (message: string, duration?: number) => addToast(message, 'error', duration);
  const showInfo = (message: string, duration?: number) => addToast(message, 'info', duration);
  const showWarning = (message: string, duration?: number) => addToast(message, 'warning', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
