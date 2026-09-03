import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { getRankings } from '@/api/farm';
import { PageHeader } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ArrowLeft, Crown } from 'lucide-react';

const TABS = [
  { value: 'turma', label: '🏫 Turma' },
  { value: 'escola', label: '🎓 Escola' },
  { value: 'disciplina', label: '📝 Mais Milhos' },
  { value: 'mes', label: '⭐ Fazendeiro do Mês' },
];

const medalColor = (i) => {
  if (i === 0) return 'text-amber-500 bg-amber-50';
  if (i === 1) return 'text-gray-400 bg-gray-50';
  if (i === 2) return 'text-amber-700 bg-amber-50';
  return 'text-muted-foreground bg-muted';
};

const FarmRanking = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('turma');
  const [rankings, setRankings] = useState({ escola: [], turma: [], disciplina: [], mes: [] });

  useEffect(() => {
    if (user) setRankings(getRankings(user));
  }, [user]);

  const list = (rankings[tab] || []).slice(0, 20);

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏆 Ranking da Fazendinha"
        subtitle="Veja quem é o fazendeiro campeão!"
        icon="🏆"
        actions={
          <Link to="/Farm">
            <Button variant="ghost" size="sm"><ArrowLeft size={16}/> Voltar</Button>
          </Link>
        }
      />

      <Tabs items={TABS} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {list.length === 0 && (
          <div className="card-playful p-8 text-center text-muted-foreground">
            Nenhum dado disponível para este ranking ainda. 🌾
          </div>
        )}
        {list.map((f, i) => {
          const isMe = f.email === user?.email;
          return (
            <div
              key={f.email + i}
              className={cn(
                'card-playful p-4 flex items-center gap-4 transition-all hover:-translate-y-0.5',
                isMe && 'border-2 border-primary',
              )}
            >
              <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg', medalColor(i))}>
                {i < 3 ? <Crown size={20}/> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-sm truncate">
                  {f.name} {isMe && <span className="text-primary">(você)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  Nv {f.farmLevel} • {f.farmXp} XP fazenda
                </p>
              </div>
              <div className="text-right shrink-0">
                {tab === 'mes' && <p className="text-sm font-bold text-primary">{f.xp} XP total</p>}
                {tab === 'disciplina' && <p className="text-sm font-bold text-amber-600">🌽 {f.milhos}</p>}
                {tab !== 'mes' && tab !== 'disciplina' && <p className="text-sm font-bold text-emerald-600">{f.farmXp} XP</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FarmRanking;