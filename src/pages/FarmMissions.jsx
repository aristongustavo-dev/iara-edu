import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { getOrCreateFarm, getDailyMissions, claimMission } from '@/api/farm';
import { PageHeader } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/metrics';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle, Gift } from 'lucide-react';

const FarmMissions = () => {
  const { user, refreshUser } = useAuth();
  const [farm, setFarm] = useState(null);
  const [missions, setMissions] = useState([]);

  const reload = useCallback(() => {
    if (!user) return;
    const f = getOrCreateFarm(user);
    setFarm(f);
    setMissions(getDailyMissions(f));
  }, [user]);

  useEffect(() => { reload(); }, [reload]);

  if (!farm) return null;

  const completedCount = missions.filter((m) => m.done).length;
  const totalMissions = missions.length;
  const allClaimed = missions.every((m) => m.collected);

  const handleClaim = (missionId) => {
    const res = claimMission(farm, missionId);
    if (res.ok) { toast.success('Recompensa!', res.msg); setFarm(res.farm || farm); refreshUser(); reload(); }
    else toast.error('Não disponível', res.msg);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Missões Diárias"
        subtitle={`${completedCount}/${totalMissions} concluídas hoje${allClaimed ? ' — todas coletadas! 🎉' : ''}`}
        icon="📋"
        actions={
          <Link to="/Farm">
            <Button variant="ghost" size="sm"><ArrowLeft size={16}/> Voltar</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {missions.map((m) => (
          <div
            key={m.id}
            className={cn(
              'card-playful p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all',
              m.collected && 'opacity-70',
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-bold text-sm">{m.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {Math.min(m.current, m.target)}/{m.target}
                {m.reward.milhos > 0 && ` — 🌽 ${m.reward.milhos}`}
                {m.reward.xp > 0 && ` + ${m.reward.xp} XP`}
              </p>
              <ProgressBar value={Math.min(100, (m.current / m.target) * 100)} className="mt-2" />
            </div>
            <div className="shrink-0">
              {m.collected ? (
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                  <CheckCircle size={16}/> Coletada
                </div>
              ) : m.done ? (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleClaim(m.id)}
                >
                  <Gift size={14}/> Coletar
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground font-bold">
                  {Math.ceil((m.target - m.current) / Math.max(1, m.target) * 100)}% restante
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card-playful p-5 text-center text-sm text-muted-foreground">
        As missões são geradas todo dia. Complete atividades na escola para avançar! 📚
      </div>
    </div>
  );
};

export default FarmMissions;