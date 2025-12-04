import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
}

const icons = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={clsx(
          'rounded-lg border-l-4 p-4',
          {
            'border-info bg-info-light text-cyan-900': variant === 'info',
            'border-success bg-success-light text-green-900': variant === 'success',
            'border-warning bg-warning-light text-yellow-900': variant === 'warning',
            'border-danger bg-danger-light text-red-900': variant === 'error',
          },
          className
        )}
        {...props}
      >
        <div className="flex">
          <div className="flex-shrink-0 text-xl" aria-hidden="true">
            {icons[variant]}
          </div>
          <div className="ml-3 flex-1">
            {title && <h3 className="text-sm font-bold">{title}</h3>}
            <div className={clsx('text-sm', { 'mt-1': title })}>{children}</div>
          </div>
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
