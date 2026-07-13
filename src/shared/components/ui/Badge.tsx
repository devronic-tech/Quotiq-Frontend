import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

// ─── Semantic color palette — light theme ───────────────────────
type BadgeColor =
  | 'gray'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'cyan'
  | 'indigo';

// ─── Status shorthand mapped to BadgeColor ──────────────────────
type StatusValue =
  | 'draft'
  | 'sent'
  | 'pending'
  | 'accepted'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'paid'
  | 'unpaid'
  | 'overdue'
  | 'active'
  | 'completed'
  | 'discarded'
  | 'cancelled'
  | 'high'
  | 'medium'
  | 'low';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  status?: StatusValue;
  dot?: boolean;
  pulse?: boolean;
  size?: 'sm' | 'md';
}

// Light-theme color styles
const colorStyles: Record<BadgeColor, string> = {
  gray:   'bg-slate-100   text-slate-600  border-slate-200',
  blue:   'bg-blue-50     text-blue-700   border-blue-200',
  green:  'bg-emerald-50  text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-50    text-amber-700  border-amber-200',
  orange: 'bg-orange-50   text-orange-700 border-orange-200',
  red:    'bg-red-50      text-red-700    border-red-200',
  purple: 'bg-purple-50   text-purple-700 border-purple-200',
  cyan:   'bg-cyan-50     text-cyan-700   border-cyan-200',
  indigo: 'bg-indigo-50   text-indigo-700 border-indigo-200',
};

const dotColors: Record<BadgeColor, string> = {
  gray:   'bg-slate-400',
  blue:   'bg-blue-500',
  green:  'bg-emerald-500',
  yellow: 'bg-amber-500',
  orange: 'bg-orange-500',
  red:    'bg-red-500',
  purple: 'bg-purple-500',
  cyan:   'bg-cyan-500',
  indigo: 'bg-indigo-500',
};

// Status → color mapping
const statusColorMap: Record<StatusValue, BadgeColor> = {
  draft:      'gray',
  sent:       'blue',
  pending:    'yellow',
  accepted:   'green',
  approved:   'purple',
  rejected:   'red',
  expired:    'gray',
  paid:       'green',
  unpaid:     'orange',
  overdue:    'red',
  active:     'green',
  completed:  'blue',
  discarded:  'gray',
  cancelled:  'red',
  high:       'red',
  medium:     'yellow',
  low:        'gray',
};

// Status → display label mapping (capitalised)
const statusLabels: Partial<Record<StatusValue, string>> = {
  draft:     'Draft',
  sent:      'Sent',
  pending:   'Pending',
  accepted:  'Accepted',
  approved:  'Approved',
  rejected:  'Rejected',
  expired:   'Expired',
  paid:      'Paid',
  unpaid:    'Unpaid',
  overdue:   'Overdue',
  active:    'Active',
  completed: 'Completed',
  discarded: 'Discarded',
  cancelled: 'Cancelled',
  high:      'High',
  medium:    'Medium',
  low:       'Low',
};

export default function Badge({
  color,
  status,
  dot = false,
  pulse = false,
  size = 'sm',
  children,
  className,
  ...props
}: BadgeProps) {
  // Resolve which color to use: status prop takes precedence
  const resolvedColor: BadgeColor = status ? statusColorMap[status] : (color ?? 'gray');
  const resolvedLabel = status && !children ? statusLabels[status] : children;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border tracking-wide',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs',
        colorStyles[resolvedColor],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotColors[resolvedColor],
            pulse && 'animate-pulse'
          )}
        />
      )}
      {resolvedLabel}
    </span>
  );
}
