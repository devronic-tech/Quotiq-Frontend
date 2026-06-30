import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered';
  hoverEffect?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverEffect = false, children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'glass rounded-2xl p-6 transition-all duration-200',
          {
            'bg-slate-900/60 border-slate-800/80': variant === 'default',
            'bg-slate-800/60 border-slate-700/80 shadow-2xl': variant === 'elevated',
            'bg-transparent border border-slate-850': variant === 'bordered',
            'hover:border-slate-700/80 hover:bg-slate-900/40 hover:shadow-glow-emerald': hoverEffect,
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
export default Card;
