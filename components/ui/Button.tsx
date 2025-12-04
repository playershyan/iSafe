import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', fullWidth = false, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            // Variants
            'bg-primary text-white hover:bg-primary-dark focus:ring-primary': variant === 'primary',
            'border-2 border-primary text-primary bg-white hover:bg-primary-light focus:ring-primary':
              variant === 'secondary',
            'bg-danger text-white hover:bg-red-700 focus:ring-danger': variant === 'danger',

            // Sizes
            'px-3 py-1.5 text-sm min-h-[36px]': size === 'small',
            'px-4 py-2 text-base min-h-touch': size === 'medium',
            'px-6 py-3 text-lg min-h-[56px]': size === 'large',

            // Full width
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
