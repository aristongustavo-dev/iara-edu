import React from 'react';
import { cn } from '@/lib/utils';

const tones = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  destructive: 'bg-destructive/10 text-destructive',
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-sky-100 text-sky-700',
};

export const Badge = React.forwardRef(({ className, tone = 'primary', ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
      tones[tone],
      className,
    )}
    {...props}
  />
));
Badge.displayName = 'Badge';