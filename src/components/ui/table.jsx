import React from 'react';
import { cn } from '@/lib/utils';

export const Table = ({ children, className }) => (
  <div className={cn('overflow-x-auto rounded-2xl border border-border bg-card', className)}>
    <table className="w-full text-sm">{children}</table>
  </div>
);

export const THead = ({ children, className }) => (
  <thead className={cn('bg-muted/60 text-left', className)}>
    <tr className="border-b border-border">{children}</tr>
  </thead>
);

export const TBody = ({ children }) => (
  <tbody className="divide-y divide-border">{children}</tbody>
);

export const TH = ({ children, className }) => (
  <th className={cn('px-4 py-3 font-bold text-foreground whitespace-nowrap', className)}>{children}</th>
);

export const TD = ({ children, className }) => (
  <td className={cn('px-4 py-3 text-muted-foreground', className)}>{children}</td>
);

export const TR = ({ children, className }) => (
  <tr className={cn('hover:bg-muted/40 transition-colors', className)}>{children}</tr>
);