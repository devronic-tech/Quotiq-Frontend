import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

type BadgeColor = 'gray' | 'purple' | 'yellow' | 'blue' | 'green' | 'cyan' | 'emerald' | 'red' | 'indigo' | 'slate' | 'orange';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  dot?: boolean;
  pulse?: boolean;
}

const colorStyles: Record<BadgeColor, string> = {
  gray: 'bg-slate-800/80 text-slate-300 border-slate-700/50',
  purple: 'bg-purple-950/40 text-purple-300 border-purple-800/30',
  yellow: 'bg-amber-950/40 text-amber-300 border-amber-800/30',
  blue: 'bg-blue-950/40 text-blue-300 border-blue-800/30',
  green: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/30',
  cyan: 'bg-cyan-950/40 text-cyan-300 border-cyan-800/30',
  emerald: 'bg-emerald-950/60 text-emerald-200 border-emerald-800/40',
  red: 'bg-red-950/40 text-red-300 border-red-800/30',
  indigo: 'bg-indigo-950/40 text-indigo-300 border-indigo-800/30',
  slate: 'bg-slate-900/60 text-slate-400 border-slate-800/50',
  orange: 'bg-orange-950/40 text-orange-300 border-orange-800/30',
};

const dotColors: Record<BadgeColor, string> = {
  gray: 'bg-slate-400',
  purple: 'bg-purple-400',
  yellow: 'bg-amber-400',
  blue: 'bg-blue-400',
  green: 'bg-emerald-400',
  cyan: 'bg-cyan-400',
  emerald: 'bg-emerald-300',
  red: 'bg-red-400',
  indigo: 'bg-indigo-400',
  slate: 'bg-slate-500',
  orange: 'bg-orange-400',
};

export default function Badge({ color = 'gray', dot = false, pulse = false, children, className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full border',
        colorStyles[color],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotColors[color],
            pulse && 'animate-pulse'
          )}
        />
      )}
      {children}
    </span>
  );
}
