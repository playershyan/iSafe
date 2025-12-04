import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'medium', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-lg border border-gray-300 bg-white',
          {
            'p-0': padding === 'none',
            'p-3': padding === 'small',
            'p-4': padding === 'medium',
            'p-6': padding === 'large',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
