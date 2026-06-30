import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'card' | 'table-row';
}

export default function Skeleton({ variant = 'text', className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'shimmer rounded',
        {
          'h-4 w-full': variant === 'text',
          'h-12 w-12 rounded-full': variant === 'circle',
          'h-48 w-full rounded-2xl border border-slate-800 bg-slate-900/40': variant === 'card',
          'h-12 w-full bg-slate-900/20': variant === 'table-row',
        },
        className
      )}
      {...props}
    />
  );
}
