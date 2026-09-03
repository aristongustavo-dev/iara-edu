import React from 'react';
import { cn } from '@/lib/utils';

export const ProgressBar = ({ value = 0, className, barClassName, showLabel }) => (
  <div className={cn('relative w-full h-3 rounded-full bg-muted overflow-hidden', className)}>
    <div
      className={cn('h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700', barClassName)}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
    {showLabel && (
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
        {Math.round(value)}%
      </span>
    )}
  </div>
);

export const StatCard = ({ label, value, icon, sub, tone = 'primary' }) => {
  const tones = {
    primary: 'from-primary to-indigo-500',
    success: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    info: 'from-sky-500 to-cyan-500',
    rose: 'from-rose-500 to-pink-500',
  };
  return (
    <div className="card-playful p-5 flex items-center gap-4">
      <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl text-white shadow-md', tones[tone])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-display font-bold text-foreground leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-1 truncate">{label}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
};