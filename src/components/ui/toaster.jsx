import React, { useEffect, useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

let counter = 0;
const listeners = new Set();
const push = (data) => {
  const id = ++counter;
  listeners.forEach((fn) => fn(id, data));
  setTimeout(() => listeners.forEach((fn) => fn(id, null)), data.duration || 4000);
  return id;
};

export const toast = {
  success: (title, description) => push({ title, description, tone: 'success' }),
  error: (title, description) => push({ title, description, tone: 'error' }),
  info: (title, description) => push({ title, description, tone: 'info' }),
};

function useToastBus() {
  const [items, setItems] = useState({});
  useEffect(() => {
    const handler = (id, data) => {
      setItems((prev) => {
        const next = { ...prev };
        if (data === null) delete next[id];
        else next[id] = { id, ...data };
        return next;
      });
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);
  return Object.values(items);
}

const toneStyles = {
  success: { border: 'border-emerald-500/50', icon: <CheckCircle2 size={20} className="text-emerald-500 shrink-0" /> },
  error: { border: 'border-destructive/50', icon: <AlertCircle size={20} className="text-destructive shrink-0" /> },
  info: { border: 'border-primary/40', icon: <Info size={20} className="text-primary shrink-0" /> },
};

export const Toaster = () => {
  const items = useToastBus();
  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
      {items.map((item) => {
        const tone = toneStyles[item.tone] || toneStyles.info;
        return (
          <ToastPrimitive.Root
            key={item.id}
            className={cn(
              'grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-2xl bg-card border border-border p-4 shadow-xl shadow-black/5',
              tone.border,
            )}
          >
            {tone.icon}
            <div className="space-y-0.5">
              <ToastPrimitive.Title className="font-bold text-sm text-foreground">
                {item.title}
              </ToastPrimitive.Title>
              {item.description && (
                <ToastPrimitive.Description className="text-sm text-muted-foreground">
                  {item.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              <X size={16} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 w-full max-w-sm" />
    </ToastPrimitive.Provider>
  );
};