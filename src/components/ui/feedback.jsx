import React from 'react';
import { cn } from '@/lib/utils';

export const Spinner = ({ className }) => (
  <div className={cn('w-6 h-6 border-[3px] border-slate-200 border-t-slate-800 rounded-full animate-spin', className)} />
);

export const EmptyState = ({ icon = '🐣', title, description, children }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
    <span className="text-5xl mb-1">{icon}</span>
    <h3 className="font-heading font-bold text-lg text-foreground">{title}</h3>
    {description && <p className="text-muted-foreground text-sm max-w-sm">{description}</p>}
    {children}
  </div>
);

export const PageHeader = ({ title, subtitle, icon, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div className="flex items-center gap-3">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground leading-tight">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);