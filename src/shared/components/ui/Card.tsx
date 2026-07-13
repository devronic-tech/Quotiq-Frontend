import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'default';
}

const variantStyles = {
  default: 'bg-surface-container-lowest border border-outline-variant',
  elevated: 'bg-surface-container-lowest border border-outline-variant shadow-md',
  bordered: 'bg-transparent border border-outline-variant',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4',
  default: 'p-6',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverEffect = false, padding = 'default', children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-xl transition-all duration-200 shadow-soft',
          variantStyles[variant],
          paddingStyles[padding],
          hoverEffect && 'hover:shadow-md hover:border-outline cursor-pointer',
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
export default Card;
