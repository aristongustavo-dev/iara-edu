import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { CITIES, CROPS, levelBounds } from '@/api/integrations';
import { base44Client } from '@/api/base44Client';
import { PageHeader } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/metrics';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';

const cropKey = (charId) => `iara_crops_${charId}`;

const loadCrops = (charId) => {
  try {
    return JSON.parse(localStorage.getItem(cropKey(charId)) || '[]');
  } catch (e) {
    return [];
  }
};
const saveCrops = (charId, crops) => {
  try {
    localStorage.setItem(cropKey(charId), JSON.stringify(crops));
  } catch (e) {
    // ignore
  }
};

const GameMap = () => {
  const { user, character, refreshUser } = useAuth();
  const [crops, setCrops] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0].id);

  useEffect(() => {
    if (character) setCrops(loadCrops(character.id));
  }, [character?.id]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!character) return null;

  const xp = character.xp || 0;
  const { level, progress, xpToNext } = levelBounds(xp);

  const unlocked = character.unlocked_cities || ['fazenda'];

  const plant = () => {
    const crop = CROPS.find((c) => c.id === selectedCrop);
    const list = [...crops, { id: `${Date.now()}`, cropId: crop.id, plantedAt: Date.now() }];
    setCrops(list);
    saveCrops(character.id, list);
    toast.success(`${crop.emoji} Planta${crop.name === 'Milho' ? 'do' : 'da'} na terra!`, 'Agora é esperar crescer…');
  };

  const harvest = async (cropRow) => {
    const crop = CROPS.find((c) => c.id === cropRow.cropId);
    const list = crops.filter((c) => c.id !== cropRow.id);
    setCrops(list);
    saveCrops(character.id, list);
    const newXp = xp + crop.xp;
    const newCoins = (character.coins || 0) + crop.xp;
    await base44Client.put('characters', character.id, {
      xp: newXp, coins: newCoins, level: levelBounds(newXp).level,
    });
    refreshUser();
    toast.success(`Colheita! ${crop.emoji} +${crop.xp} XP e +${crop.xp} moedas`, 'Sua fazenda está rendendo!');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mundo Fazendinha" subtitle="Explore cidades, plante na fazenda e cresça com a Iara!" icon="🏡" />

      {/* Wallet */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-playful p-4 text-center">
          <p className="text-2xl font-display font-bold text-amber-600">{character.coins || 0}</p>
          <p className="text-xs text-muted-foreground">Moedas 🪙</p>
        </div>
        <div className="card-playful p-4 text-center">
          <p className="text-2xl font-display font-bold text-sky-600">{character.diamonds || 0}</p>
          <p className="text-xs text-muted-foreground">Diamantes 💎</p>
        </div>
        <div className="card-playful p-4 text-center">
          <p className="text-2xl font-display font-bold text-rose-500">{character.stars || 0}</p>
          <p className="text-xs text-muted-foreground">Estrelas ⭐</p>
        </div>
      </div>

      {/* Level progress */}
      <div className="card-playful p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading font-bold">Nível {level}</span>
          <span className="text-sm text-muted-foreground">{xp} XP</span>
        </div>
        <ProgressBar value={progress} />
        <p className="text-xs text-muted-foreground mt-2">
          Faltam {xpToNext} XP para o próximo nível
        </p>
      </div>

      {/* Cities */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">🗺️ Mapa das Cidades</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CITIES.map((city) => {
            const isUnlocked = unlocked.includes(city.id);
            return (
              <div
                key={city.id}
                className={cn(
                  'card-playful p-5 flex items-center gap-4 transition-all hover:-translate-y-1',
                  !isUnlocked && 'opacity-50 grayscale',
                )}
              >
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

      {/* Farm */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">🌱 Minha Fazenda</h2>

        <div className="card-playful p-5 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-bold mb-1.5 block">O que plantar?</label>
              <div className="flex gap-2 flex-wrap">
                {CROPS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCrop(c.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all',
                      selectedCrop === c.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40',
                    )}
                  >
                    {c.emoji} {c.name}
                    <span className="text-xs text-muted-foreground">+{c.xp}XP</span>
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={plant}>🌱 Plantar</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {crops.length === 0 && (
            <div className="col-span-full card-playful p-6 text-center text-muted-foreground">
              Ainda não há plantações. Escolha uma semente e plante! 🚜
            </div>
          )}
          {crops.map((row) => {
            const crop = CROPS.find((c) => c.id === row.cropId);
            const elapsed = now - row.plantedAt;
            const grown = elapsed >= crop.time * 1000;
            const progress = Math.min(100, (elapsed / (crop.time * 1000)) * 100);
            const remaining = Math.max(0, Math.ceil((crop.time * 1000 - elapsed) / 1000));
            return (
              <div key={row.id} className={cn('card-playful p-5 text-center space-y-2', grown && 'border-2 border-emerald-300')}>
                <span className="text-5xl block animate-bounce-soft">{grown ? crop.emoji : '🌱'}</span>
                <p className="font-heading font-bold">{crop.name}</p>
                {grown ? (
                  <Button size="sm" variant="success" onClick={() => harvest(row)}>
                    🧺 Colher (+{crop.xp} XP)
                  </Button>
                ) : (
                  <>
                    <ProgressBar value={progress} />
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')} restantes
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default GameMap;