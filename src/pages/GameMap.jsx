import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { CITIES, CROPS, levelBounds } from '@/api/integrations';
import { getOrCreateFarm, plantCrop, harvestCrop, advanceFarmDay } from '@/api/farm';
import { PageHeader } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/metrics';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Coins, Gem, Zap } from 'lucide-react';

// Cenário visual de colheita: mostra recompensa flutuando ao colher
const FloatingReward = ({ reward }) => {
  if (!reward) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="animate-reward-pop card-playful px-8 py-6 text-center space-y-1 shadow-2xl">
        <span className="text-6xl block animate-bounce-soft">{reward.emoji}</span>
        <p className="text-2xl font-display font-bold text-emerald-600 animate-reward-pop">+{reward.xp} XP</p>
        <p className="text-xl font-display font-bold text-amber-500">+{reward.milhos} 🌽 milhos</p>
        <p className="text-sm text-muted-foreground font-bold">Colheita realizada!</p>
      </div>
    </div>
  );
};

const GameMap = () => {
  const { user, character, refreshUser } = useAuth();
  const [farm, setFarm] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0].id);
  const [reward, setReward] = useState(null);

  const reload = useCallback(() => {
    if (!user) return;
    let f = getOrCreateFarm(user);
    if (f && f.mission_date !== new Date().toISOString().slice(0, 10)) f = advanceFarmDay(f);
    setFarm(f);
  }, [user]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!reward) return;
    const t = setTimeout(() => setReward(null), 2600);
    return () => clearTimeout(t);
  }, [reward]);

  if (!character) return null;

  const budget = levelBounds(character.xp || 0);
  const inventory = farm?.inventories?.sementes || {};

  const handlePlant = (cropId) => {
    const res = plantCrop(farm, cropId);
    if (res.ok) { toast.success('🌱 Plantado!', res.msg); reload(); }
    else toast.error('⚠️ Ops!', res.msg);
  };

  const handleHarvest = async (rowId) => {
    const res = await harvestCrop(farm, rowId);
    if (res.ok) {
      setReward(res.earned || null);
      toast.success(`🧺 ${res.msg}`);
      refreshUser();
      reload();
    } else {
      toast.error('⏳ Ainda não!', res.msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cenário de recompensa ao colher */}
      <FloatingReward reward={reward} />

      <PageHeader title="Mundo Fazendinha" subtitle="Plante, cresça e colha recompensas em um cenário vivo!" icon="🏡" />

      {/* Wallet (unificada com a Fazendinha) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-playful p-4 text-center">
          <Coins className="w-6 h-6 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-amber-600">{farm?.milhos || 0}</p>
          <p className="text-xs text-muted-foreground">Milhos 🌽</p>
        </div>
        <div className="card-playful p-4 text-center">
          <Gem className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-indigo-500">{farm?.gemas || 0}</p>
          <p className="text-xs text-muted-foreground">Gemas 💎</p>
        </div>
        <div className="card-playful p-4 text-center">
          <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-display font-bold text-emerald-600">{farm?.energy ?? 100}/{farm?.energy_max ?? 100}</p>
          <p className="text-xs text-muted-foreground">Energia ⚡</p>
        </div>
      </div>

      {/* Level progress do personagem */}
      <div className="card-playful p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading font-bold">Nível {budget.level}</span>
          <span className="text-sm text-muted-foreground">{character.xp || 0} XP</span>
        </div>
        <ProgressBar value={budget.progress} />
        <p className="text-xs text-muted-foreground mt-2">Faltam {budget.xpToNext} XP para o próximo nível 🚀</p>
      </div>

      {/* Cities */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">🗺️ Mapa das Cidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CITIES.map((city) => {
            const isUnlocked = (character.unlocked_cities || ['fazenda']).includes(city.id);
            return (
              <div key={city.id} className={cn('card-playful p-5 flex items-center gap-4 transition-all hover:-translate-y-1', !isUnlocked && 'opacity-50 grayscale')}>
                <span className="text-4xl">{isUnlocked ? city.emoji : '🔒'}</span>
                <div>
                  <h3 className="font-heading font-bold">{city.name}</h3>
                  <p className="text-xs text-muted-foreground">{city.desc}</p>
                  <span className={cn('text-xs font-bold mt-1 inline-block', isUnlocked ? 'text-emerald-600' : 'text-muted-foreground')}>
                    {isUnlocked ? '✅ Desbloqueada' : 'Ganhe XP para desbloquear'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cenário da Fazenda (unificado) */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">🌱 Cenário: Minha Fazenda</h2>

        <div className="card-playful bg-gradient-to-br from-emerald-50 to-lime-50 p-5 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-bold mb-1.5 block">🌾 O que plantar?</label>
              <div className="flex gap-2 flex-wrap">
                {CROPS.filter((c) => (farm ? levelBounds(farm.xp || 0).level : 1) >= (c.level || 1)).map((c) => {
                  const have = inventory[c.id] || 0;
                  const locked = have < 1;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCrop(c.id)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all',
                        selectedCrop === c.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40',
                        locked && 'opacity-40',
                      )}
                    >
                      {c.emoji} {c.name}
                      <span className="text-xs text-muted-foreground">+{c.xp}XP (x{have})</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button onClick={() => handlePlant(selectedCrop)} disabled={(inventory[selectedCrop] || 0) < 1}>
              🌱 Plantar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(farm?.crops || []).length === 0 && (
            <div className="col-span-full card-playful p-6 text-center text-muted-foreground">
              🌾 Ainda não há plantações. Escolha uma semente e plante para colher recompensas! 🚜
            </div>
          )}
          {(farm?.crops || []).slice(0, 12).map((row) => {
            const crop = CROPS.find((c) => c.id === row.cropId);
            if (!crop) return null;
            const elapsed = now - row.plantedAt;
            const grown = elapsed >= crop.time * 1000;
            const progress = Math.min(100, (elapsed / (crop.time * 1000)) * 100);
            const remaining = Math.max(0, Math.ceil((crop.time * 1000 - elapsed) / 1000));
            return (
              <div key={row.id} className={cn('card-playful p-5 text-center space-y-2 relative overflow-hidden', grown && 'border-2 border-emerald-400 shadow-lg shadow-emerald-200')}>
                {grown && <span className="absolute inset-0 bg-emerald-100/30 animate-pulse" />}
                <span className={cn('text-5xl block relative', grown ? 'animate-bounce-soft' : '')}>
                  {grown ? crop.emoji : '🌱'}
                </span>
                <p className="font-heading font-bold relative">{crop.name}</p>
                {grown ? (
                  <Button size="sm" variant="success" className="relative" onClick={() => handleHarvest(row.id)}>
                    🧺 Colher +{crop.xp} XP e +{crop.xp} 🌽
                  </Button>
                ) : (
                  <div className="relative">
                    <ProgressBar value={progress} />
                    <p className="text-xs text-muted-foreground">
                      {crop.emoji} {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card-playful p-5 mt-4">
          <h3 className="font-heading font-bold mb-2">📊 Sua colheita</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-display font-bold text-amber-600">{farm?.harvest_total || 0}</p>
              <p className="text-xs text-muted-foreground">Colheitas</p>
            </div>
            <div>
              <p className="text-xl font-display font-bold text-emerald-600">{farm?.atividades_concluidas || 0}</p>
              <p className="text-xs text-muted-foreground">Atividades</p>
            </div>
            <div>
              <p className="text-xl font-display font-bold text-primary">{farm?.total_questoes || 0}</p>
              <p className="text-xs text-muted-foreground">Questões</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GameMap;