'use client';

import { HTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'medium', className, children, ...props }, ref) => {
    const { isLowBandwidth } = useLowBandwidth();
    
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-lg border border-gray-200 bg-white',
          !isLowBandwidth && 'shadow-sm',
          {
            'p-0': padding === 'none',
            'p-4': padding === 'small',
            'p-5 md:p-6': padding === 'medium',
            'p-6 md:p-8': padding === 'large',
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
