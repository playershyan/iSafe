'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    error: <X className="h-5 w-5 text-red-600" />,
    info: null,
    warning: null,
  };

  return (
    <div
      className={clsx(
        'fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300 transform translate-y-0 opacity-100',
        styles[type]
      )}
      role="alert"
      style={{
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      {icons[type] && <div className="flex-shrink-0">{icons[type]}</div>}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

