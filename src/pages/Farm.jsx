import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { CROPS, FARM_ANIMALS, farmLevelFor, energyMaxFor } from '@/api/integrations';
import { getOrCreateFarm, plantCrop, harvestCrop, getActiveEvents, advanceFarmDay } from '@/api/farm';
import { PageHeader } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { ProgressBar } from '@/components/ui/metrics';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { Coins, Gem, Zap, MapPin, Plus } from 'lucide-react';

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

const Farm = () => {
  const { user, refreshUser } = useAuth();
  const [farm, setFarm] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [selectedCrop, setSelectedCrop] = useState('milho');
  const [events, setEvents] = useState([]);
  const [reward, setReward] = useState(null);

  const reload = useCallback(() => {
    if (!user) return;
    let f = getOrCreateFarm(user);
    // avançar dia se necessário
    if (f && f.mission_date !== new Date().toISOString().slice(0,10)) f = advanceFarmDay(f);
    setFarm(f);
    setEvents(getActiveEvents());
  }, [user]);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!reward) return;
    const t = setTimeout(() => setReward(null), 2600);
    return () => clearTimeout(t);
  }, [reward]);

  if (!farm) return null;

  const level = farmLevelFor(farm.xp || 0);
  const xpMax = energyMaxFor(farm.xp || 0);
  const xpStart = [0,100,250,500,800,1200,1700,2300,3000][level-1] || 0;
  const xpEnd   = [0,100,250,500,800,1200,1700,2300,3000][level] || xpMax;
  const xpProgress = Math.min(100, ((farm.xp - xpStart) / Math.max(1, xpEnd - xpStart)) * 100);
  const themedEvent = events.length > 0 ? events[0] : null;

  const handlePlant = (cropId) => {
    const res = plantCrop(farm, cropId);
    if (res.ok) { toast.success('Plantado!', res.msg); setFarm(res.farm || farm); reload(); }
    else toast.error('Ops!', res.msg);
  };

  const handleHarvest = async (rowId) => {
    const res = await harvestCrop(farm, rowId);
    if (res.ok) { setReward(res.earned || null); toast.success('Colheita!', res.msg); setFarm(res.farm || farm); refreshUser(); reload(); }
    else toast.error('Erro', res.msg);
  };

  const inventory = farm.inventories?.sementes || {};

  return (
    <div className="space-y-6">
      <FloatingReward reward={reward} />
      <PageHeader
        title={themedEvent ? `${themedEvent.emoji} ${themedEvent.title}` : '🏡 A Fazendinha'}
        subtitle={themedEvent ? `Evento ativo — ganho de XP bônus!` : 'Cultive, construa e cresça estudando!'}
        icon="🏡"
        actions={
          <div className="flex gap-2">
            <Link to="/FarmShop"><Button variant="secondary" size="sm"><Plus size={16}/> Loja</Button></Link>
            <Link to="/FarmMissions"><Button variant="secondary" size="sm"><Zap size={16}/> Missões</Button></Link>
            <Link to="/FarmRanking"><Button variant="secondary" size="sm">🏆 Ranking</Button></Link>
          </div>
        }
      />

      {/* Wallet + Level */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card-playful p-4 flex items-center gap-3">
          <Coins className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <p className="text-xl font-display font-bold text-amber-600">{farm.milhos || 0}</p>
            <p className="text-xs text-muted-foreground">Milhos 🌽</p>
          </div>
        </div>
        <div className="card-playful p-4 flex items-center gap-3">
          <Gem className="w-6 h-6 text-indigo-400 shrink-0" />
          <div>
            <p className="text-xl font-display font-bold text-indigo-500">{farm.gemas || 0}</p>
            <p className="text-xs text-muted-foreground">Gemas 💎</p>
          </div>
        </div>
        <div className="card-playful p-4 flex items-center gap-3">
          <Zap className="w-6 h-6 text-emerald-500 shrink-0" />
          <div>
            <p className="text-xl font-display font-bold text-emerald-600">{farm.energy ?? 100}/{farm.energy_max ?? 100}</p>
            <p className="text-xs text-muted-foreground">Energia ⚡</p>
          </div>
        </div>
        <div className="card-playful p-4 flex items-center gap-3">
          <MapPin className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <p className="text-xl font-display font-bold text-rose-500">Nv {level}</p>
            <p className="text-xs text-muted-foreground">Fazenda 🏡</p>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="card-playful p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading font-bold text-sm">Fazenda Nível {level}</span>
          <span className="text-xs text-muted-foreground">{farm.xp || 0} XP</span>
        </div>
        <ProgressBar value={xpProgress} />
      </div>

      {/* Planting */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">🌱 Plantar</h2>
        <div className="card-playful p-5 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-bold mb-1.5 block">Escolha a semente:</label>
              <div className="flex gap-2 flex-wrap">
                {CROPS.filter((c) => level >= (c.level || 1)).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCrop(c.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-all',
                      selectedCrop === c.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40',
                    )}
                  >
                    {c.emoji} {c.name}
                    <span className="text-xs text-muted-foreground">
                      +{c.xp}XP
                      {inventory[c.id] ? ` (${inventory[c.id]})` : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => handlePlant(selectedCrop)}
              disabled={(inventory[selectedCrop] || 0) < 1}
            >
              🌱 Plantar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(farm.crops || []).length === 0 && (
            <div className="col-span-full card-playful p-6 text-center text-muted-foreground">
              Ainda não há plantações. Escolha uma semente e plante! 🚜
            </div>
          )}
          {(farm.crops || []).slice(0, 12).map((row) => {
            const crop = CROPS.find((c) => c.id === row.cropId);
            if (!crop) return null;
            const elapsed = now - row.plantedAt;
            const grown = elapsed >= crop.time * 1000;
            const prog = Math.min(100, (elapsed / (crop.time * 1000)) * 100);
            const remaining = Math.max(0, Math.ceil((crop.time * 1000 - elapsed) / 1000));
            return (
              <div key={row.id} className={cn('card-playful p-5 text-center space-y-2', grown && 'border-2 border-emerald-300')}>
                <span className="text-5xl block animate-bounce-soft">{grown ? crop.emoji : '🌱'}</span>
                <p className="font-heading font-bold text-sm">{crop.name}</p>
                {grown ? (
                  <Button size="sm" variant="success" onClick={() => handleHarvest(row.id)}>
                    🧺 Colher +{crop.xp} XP e +{crop.xp} 🌽
                  </Button>
                ) : (
                  <>
                    <ProgressBar value={prog} />
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(remaining/60)}:{String(remaining%60).padStart(2,'0')}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Animals */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">🐄 Animais</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(farm.animals || []).length === 0 && (
            <div className="col-span-full card-playful p-6 text-center text-muted-foreground">
              Compre animais na <Link to="/FarmShop" className="text-primary underline">Loja</Link> 🐾
            </div>
          )}
          {(farm.animals || []).map((a, i) => {
            const def = FARM_ANIMALS.find((x) => x.id === a.id);
            return (
              <div key={i} className="card-playful p-4 text-center space-y-1">
                <span className="text-4xl block animate-bounce-soft">{def?.emoji || '🐾'}</span>
                <p className="font-heading font-bold text-sm">{a.name}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Buildings */}
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">🏗️ Construções</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {(farm.buildings || []).length === 0 && (
            <div className="col-span-full card-playful p-6 text-center text-muted-foreground">
              Construa na <Link to="/FarmShop" className="text-primary underline">Loja</Link> 🏠
            </div>
          )}
          {(farm.buildings || []).map((b, i) => (
            <div key={i} className="card-playful p-4 text-center space-y-1">
              <span className="text-4xl block">{b.emoji}</span>
              <p className="font-heading font-bold text-sm">{b.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Decorations */}
      {(farm.decorations || []).length > 0 && (
        <section>
          <h2 className="font-heading font-bold text-xl mb-4">🌸 Decorações</h2>
          <div className="flex flex-wrap gap-3">
            {(farm.decorations || []).map((d, i) => (
              <span key={i} className="text-3xl" title={d.name}>{d.emoji}</span>
            ))}
          </div>
        </section>
      )}

      {/* Stats footer */}
      <div className="card-playful p-5 mt-4">
        <h3 className="font-heading font-bold mb-2">📊 Sua Estatística</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xl font-display font-bold text-amber-600">{farm.harvest_total || 0}</p>
            <p className="text-xs text-muted-foreground">Colheitas totais</p>
          </div>
          <div>
            <p className="text-xl font-display font-bold text-emerald-600">{farm.atividades_concluidas || 0}</p>
            <p className="text-xs text-muted-foreground">Atividades feitas</p>
          </div>
          <div>
            <p className="text-xl font-display font-bold text-primary">{farm.total_questoes || 0}</p>
            <p className="text-xs text-muted-foreground">Questões respondidas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Farm;