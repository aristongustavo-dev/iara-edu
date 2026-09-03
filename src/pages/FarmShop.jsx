import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';
import { CROPS, FARM_ANIMALS, FARM_BUILDINGS, FARM_DECOR, farmLevelFor } from '@/api/integrations';
import { getOrCreateFarm, buyItem } from '@/api/farm';
import { PageHeader } from '@/components/ui/feedback';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ArrowLeft, Coins, Gem } from 'lucide-react';

const TABS = [
  { id: 'semente', label: '🌱 Sementes', items: CROPS },
  { id: 'animal',  label: '🐄 Animais', items: FARM_ANIMALS },
  { id: 'construcao', label: '🏗️ Construções', items: FARM_BUILDINGS },
  { id: 'decoracao',  label: '🌸 Decoração', items: FARM_DECOR },
];

const FarmShop = () => {
  const { user, refreshUser } = useAuth();
  const [farm, setFarm] = useState(null);
  const [tab, setTab] = useState('semente');

  const reload = useCallback(() => { if (user) setFarm(getOrCreateFarm(user)); }, [user]);
  useEffect(() => { reload(); }, [reload]);

  if (!farm) return null;

  const level = farmLevelFor(farm.xp || 0);
  const items = TABS.find((t) => t.id === tab)?.items || [];

  const handleBuy = (itemId) => {
    const res = buyItem(farm, tab, itemId);
    if (res.ok) { toast.success('Compra!', res.msg); setFarm(res.farm || farm); refreshUser(); }
    else toast.error('Não foi possível', res.msg);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loja da Fazendinha"
        subtitle="Compre sementes, animais, construções e decorações para sua fazenda."
        icon="🛒"
        actions={
          <Link to="/Farm">
            <Button variant="ghost" size="sm"><ArrowLeft size={16}/> Voltar</Button>
          </Link>
        }
      />

      {/* Wallet reminder */}
      <div className="flex gap-4">
        <div className="card-playful px-4 py-2 flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          <span className="font-bold">{farm.milhos || 0}</span>
          <span className="text-xs text-muted-foreground">Milhos</span>
        </div>
        <div className="card-playful px-4 py-2 flex items-center gap-2">
          <Gem className="w-5 h-5 text-indigo-400" />
          <span className="font-bold">{farm.gemas || 0}</span>
          <span className="text-xs text-muted-foreground">Gemas</span>
        </div>
        <div className="card-playful px-4 py-2 flex items-center gap-2">
          <span className="text-sm font-bold">Nv {level}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-4 py-2 rounded-xl font-bold text-sm transition-all',
              tab === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const locked = level < (item.level || 1);
          const canAfford = (farm.milhos || 0) >= (item.price || 0) && (farm.gemas || 0) >= (item.gems || 0);
          return (
            <div
              key={item.id}
              className={cn('card-playful p-5 space-y-3 transition-all', locked && 'opacity-50 grayscale')}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl">{item.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-heading font-bold">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc || `+${item.xp || 0} XP por uso`}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {item.price > 0 && (
                      <Badge tone={canAfford ? 'success' : 'warning'}>
                        🌽 {item.price}
                      </Badge>
                    )}
                    {item.gems > 0 && (
                      <Badge tone={(farm.gemas||0) >= item.gems ? 'success' : 'warning'}>
                        💎 {item.gems}
                      </Badge>
                    )}
                    {(item.level || 1) > 1 && (
                      <Badge tone={locked ? 'destructive' : 'neutral'}>
                        Nv {item.level}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                className="w-full"
                disabled={locked || !canAfford}
                onClick={() => handleBuy(item.id)}
              >
                {locked ? '🔒 Nível insuficiente' : !canAfford ? '💸 Saldo insuficiente' : '🛒 Comprar'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FarmShop;