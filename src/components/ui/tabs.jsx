import React from 'react';
import { cn } from '@/lib/utils';

export const Tabs = ({ items, active, onChange, className }) => (
  <div className={cn('inline-flex flex-wrap gap-1.5 bg-muted/70 rounded-2xl p-1.5', className)}>
    {items.map((item) => (
      <button
        key={item.value}
        onClick={() => onChange(item.value)}
        className={cn(
          'px-4 py-2 rounded-xl text-sm font-bold transition-colors',
          active === item.value
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        {item.label}
      </button>
    ))}
  </div>
);