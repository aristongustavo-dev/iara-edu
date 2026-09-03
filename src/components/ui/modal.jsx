import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Modal = ({ open, onClose, title, children, className, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col animate-pop-in',
        className,
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="font-heading font-bold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border shrink-0 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};