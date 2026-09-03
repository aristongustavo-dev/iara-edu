import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { MEDALS } from '@/api/integrations';
import { PageHeader } from '@/components/ui/feedback';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

const Medals = () => {
  const { user } = useAuth();
  const earned = user?.badges || [];

  const earnedMap = Object.fromEntries(earned.map((b) => [b.name, b]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conquistas"
        subtitle={`Você desbloqueou ${earned.length} de ${MEDALS.length} medalhas. Continue coletando!`}
        icon="🏅"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {MEDALS.map((medal) => {
          const alreadyEarned = earnedMap[medal.name];
          const locked = !alreadyEarned;
          return (
            <div
              key={medal.id}
              className={cn(
                'card-playful p-5 text-center space-y-2 transition-all hover:-translate-y-1',
                locked && 'opacity-50 grayscale',
              )}
            >
              <div className={cn(
                'w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl',
                alreadyEarned ? 'bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300' : 'bg-muted',
              )}>
                {locked ? '🔒' : medal.icon}
              </div>
              <h3 className="font-heading font-bold text-sm leading-tight">{medal.name}</h3>
              <p className="text-xs text-muted-foreground">{medal.desc}</p>
              {alreadyEarned ? (
                <p className="text-xs text-amber-600 font-bold">Obtida em {formatDate(alreadyEarned.earned_date)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Ainda não obtida</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Medals;