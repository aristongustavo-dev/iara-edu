import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { WORLD_ZONES, getUnlockedZones, getNextUnlock, processDailyLogin } from '@/lib/gamification';
import IaraAssistant from '@/components/IaraAssistant';
import { toast } from '@/components/ui/toaster';

const ZONE_SIZE = 72;

const WorldMap = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [introPlayed, setIntroPlayed] = useState(false);
  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const unlocked = getUnlockedZones(level);
  const nextUnlock = getNextUnlock(level);
  const unlockedIds = new Set(unlocked.map((z) => z.id));

  useEffect(() => {
    if (!introPlayed) {
      const seen = localStorage.getItem('iara_world_tour_seen');
      if (!seen) {
        setShowAssistant(true);
        localStorage.setItem('iara_world_tour_seen', '1');
      }
      setIntroPlayed(true);
    }
    // Process daily login reward
    if (user?.email) {
      const result = processDailyLogin(user.email);
      if (result && !result.alreadyLoggedIn && result.reward) {
        if (result.streak > 1) {
          toast({ title: `🔥 Sequência de ${result.streak} dias!`, description: `+${result.reward.xpGain} XP e +${result.reward.coinGain} moedas!`, variant: 'default' });
        } else {
          toast({ title: 'Bom ter você de volta!', description: `+${result.reward.xpGain} XP e +${result.reward.coinGain} moedas!`, variant: 'default' });
        }
      }
    }
  }, [introPlayed, user?.email]);

  const handleZoneClick = (zone) => {
    if (!unlockedIds.has(zone.id)) {
      toast({ title: `${zone.name} bloqueada!`, description: `Alcance o nível ${zone.unlockLevel} para desbloquear.`, variant: 'destructive' });
      return;
    }
    navigate(zone.route);
  };

  const viewportW = 1000;
  const viewportH = 600;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Fazenda do Conhecimento</h1>
          <p className="text-sm text-muted-foreground">Toque em um local para explorar</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Nível {level}</p>
            <p className="text-xs font-bold text-primary">{xp} XP</p>
          </div>
          <button
            onClick={() => setShowAssistant(true)}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center text-xl shadow-lg hover:scale-110 transition-transform"
            title="Falar com a IARA"
          >
            🧜‍♀️
          </button>
        </div>
      </div>

      {/* XP Progress */}
      <div className="bg-card rounded-2xl border border-border p-3 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-foreground">Nível {level}</span>
            <span className="text-muted-foreground">{xp} / {level * level * 10} XP</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, ((xp - (level - 1) * (level - 1) * 10) / (level * level * 10 - (level - 1) * (level - 1) * 10)) * 100)}%` }}
            />
          </div>
        </div>
        {nextUnlock && (
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Próximo: <span className="font-bold text-primary">{nextUnlock.icon} {nextUnlock.name}</span> (Nv.{nextUnlock.unlockLevel})
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <div className="relative bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
        <svg
          viewBox={`0 0 ${viewportW} ${viewportH}`}
          className="w-full h-auto"
          style={{ minHeight: 360, maxHeight: 520 }}
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#87CEEB" />
              <stop offset="60%" stopColor="#B0E0FF" />
              <stop offset="100%" stopColor="#D4F0FF" />
            </linearGradient>
            <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7BC67E" />
              <stop offset="100%" stopColor="#5DA65F" />
            </linearGradient>
            <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8BA888" />
              <stop offset="100%" stopColor="#6B8E6B" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Sky */}
          <rect width={viewportW} height={viewportH} fill="url(#skyGrad)" />

          {/* Sun */}
          <circle cx="850" cy="80" r="40" fill="#FFD93D" opacity="0.9" />
          <circle cx="850" cy="80" r="50" fill="#FFD93D" opacity="0.2" />

          {/* Clouds */}
          <g opacity="0.6">
            <ellipse cx="150" cy="70" rx="60" ry="20" fill="white" />
            <ellipse cx="180" cy="60" rx="50" ry="18" fill="white" />
            <ellipse cx="500" cy="50" rx="55" ry="18" fill="white" />
            <ellipse cx="530" cy="42" rx="45" ry="15" fill="white" />
            <ellipse cx="700" cy="90" rx="48" ry="16" fill="white" />
          </g>

          {/* Mountains */}
          <polygon points="0,280 80,160 180,280" fill="url(#mountainGrad)" />
          <polygon points="120,280 220,140 340,280" fill="#7DA67A" />
          <polygon points="660,280 780,130 900,280" fill="url(#mountainGrad)" />
          <polygon points="800,280 920,160 1000,280" fill="#7DA67A" />

          {/* Snow caps */}
          <polygon points="210,150 220,140 230,150" fill="white" opacity="0.8" />
          <polygon points="770,140 780,130 790,140" fill="white" opacity="0.8" />

          {/* Grass field */}
          <rect y="270" width={viewportW} height="330" fill="url(#grassGrad)" />

          {/* Winding road */}
          <path
            d="M 50,350 Q 150,320 250,370 Q 350,420 450,380 Q 550,340 650,390 Q 750,440 850,400 Q 920,370 980,390"
            fill="none"
            stroke="#C4A265"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M 50,350 Q 150,320 250,370 Q 350,420 450,380 Q 550,340 650,390 Q 750,440 850,400 Q 920,370 980,390"
            fill="none"
            stroke="#D4B87A"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="12 8"
            opacity="0.5"
          />

          {/* Vertical roads */}
          <path d="M 300,370 Q 310,300 320,260" fill="none" stroke="#C4A265" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
          <path d="M 520,380 Q 530,310 540,260" fill="none" stroke="#C4A265" strokeWidth="12" strokeLinecap="round" opacity="0.5" />
          <path d="M 720,400 Q 730,340 740,280" fill="none" stroke="#C4A265" strokeWidth="12" strokeLinecap="round" opacity="0.5" />

          {/* Decorative trees */}
          {[
            { x: 20, y: 310, s: 0.8 },
            { x: 130, y: 290, s: 1 },
            { x: 430, y: 310, s: 0.9 },
            { x: 580, y: 300, s: 1.1 },
            { x: 920, y: 320, s: 0.85 },
            { x: 380, y: 440, s: 0.7 },
            { x: 620, y: 450, s: 0.9 },
            { x: 160, y: 430, s: 0.75 },
          ].map((t, i) => (
            <g key={`tree-${i}`} transform={`translate(${t.x},${t.y}) scale(${t.s})`}>
              <rect x="-3" y="-10" width="6" height="20" rx="2" fill="#6B4226" />
              <ellipse cx="0" cy="-18" rx="14" ry="16" fill="#3D8B37" />
              <ellipse cx="-5" cy="-22" rx="10" ry="12" fill="#4CAF50" />
            </g>
          ))}

          {/* Water / Lake */}
          <ellipse cx="900" cy="500" rx="70" ry="35" fill="#4FC3F7" opacity="0.6" />
          <ellipse cx="900" cy="500" rx="50" ry="25" fill="#81D4FA" opacity="0.4" />

          {/* Decorative fence near farm */}
          {[200, 220, 240, 260, 280].map((fx) => (
            <g key={`fence-${fx}`}>
              <rect x={fx} y="420" width="2" height="12" fill="#8B6914" />
              <rect x={fx - 4} y="422" width="10" height="1.5" fill="#A07818" />
              <rect x={fx - 4} y="427" width="10" height="1.5" fill="#A07818" />
            </g>
          ))}

          {/* ─── ZONES ──────────────────────────────── */}
          {WORLD_ZONES.map((zone) => {
            const isUnlocked = unlockedIds.has(zone.id);
            const isHovered = hovered === zone.id;
            const cx = (zone.x / 100) * viewportW;
            const cy = (zone.y / 100) * viewportH;

            return (
              <g
                key={zone.id}
                transform={`translate(${cx - ZONE_SIZE / 2}, ${cy - ZONE_SIZE / 2})`}
                onClick={() => handleZoneClick(zone)}
                onMouseEnter={() => setHovered(zone.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: isUnlocked ? 'pointer' : 'not-allowed' }}
                className="transition-transform"
              >
                {/* Zone platform */}
                <rect
                  x="0" y="0" width={ZONE_SIZE} height={ZONE_SIZE}
                  rx="16"
                  fill={isUnlocked ? zone.color : '#9CA3AF'}
                  opacity={isUnlocked ? (isHovered ? 1 : 0.85) : 0.4}
                  filter={isHovered && isUnlocked ? 'url(#glow)' : 'url(#shadow)'}
                  className="transition-all duration-200"
                />

                {/* Hover ring */}
                {isHovered && isUnlocked && (
                  <rect
                    x="-3" y="-3" width={ZONE_SIZE + 6} height={ZONE_SIZE + 6}
                    rx="18"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    opacity="0.8"
                    className="animate-pulse"
                  />
                )}

                {/* Lock overlay */}
                {!isUnlocked && (
                  <g opacity="0.7">
                    <rect x="0" y="0" width={ZONE_SIZE} height={ZONE_SIZE} rx="16" fill="rgba(0,0,0,0.3)" />
                    <text x={ZONE_SIZE / 2} y={ZONE_SIZE / 2 - 2} textAnchor="middle" fontSize="20" dominantBaseline="middle">🔒</text>
                    <text x={ZONE_SIZE / 2} y={ZONE_SIZE / 2 + 18} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">Nv.{zone.unlockLevel}</text>
                  </g>
                )}

                {/* Icon */}
                {isUnlocked && (
                  <text
                    x={ZONE_SIZE / 2}
                    y={ZONE_SIZE / 2 - 4}
                    textAnchor="middle"
                    fontSize="28"
                    dominantBaseline="middle"
                    className="select-none"
                  >
                    {zone.icon}
                  </text>
                )}

                {/* Label */}
                <text
                  x={ZONE_SIZE / 2}
                  y={ZONE_SIZE + 12}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={isUnlocked ? '#1F2937' : '#9CA3AF'}
                  className="select-none"
                >
                  {zone.name}
                </text>

                {/* Hover tooltip */}
                {isHovered && isUnlocked && (
                  <g transform={`translate(${ZONE_SIZE / 2}, -12)`}>
                    <rect x="-60" y="-22" width="120" height="22" rx="6" fill="#1F2937" opacity="0.9" />
                    <text x="0" y="-8" textAnchor="middle" fontSize="9" fill="white" fontWeight="500">
                      {zone.desc}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* IARA NPC on map */}
          <g
            transform="translate(480, 190)"
            onClick={() => setShowAssistant(true)}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered('iara')}
            onMouseLeave={() => setHovered(null)}
          >
            <circle cx="0" cy="0" r="22" fill="#7C3AED" opacity="0.15" />
            <circle cx="0" cy="0" r="16" fill="#7C3AED" opacity="0.9" filter="url(#shadow)" />
            <text x="0" y="2" textAnchor="middle" fontSize="18" dominantBaseline="middle">🧜‍♀️</text>
            <text x="0" y="30" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7C3AED">IARA</text>
            {hovered === 'iara' && (
              <g transform="translate(0, -30)">
                <rect x="-55" y="-20" width="110" height="20" rx="6" fill="#7C3AED" opacity="0.9" />
                <text x="0" y="-7" textAnchor="middle" fontSize="9" fill="white" fontWeight="500">Olá! Precisa de ajuda?</text>
              </g>
            )}
            {hovered !== 'iara' && (
              <g>
                <circle cx="12" cy="-12" r="6" fill="#EF4444" />
                <text x="12" y="-9" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">!</text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => navigate('/Activities')} className="bg-card rounded-xl border border-border p-3 text-left hover:bg-muted transition-colors">
          <span className="text-xl">📝</span>
          <p className="text-xs font-bold text-foreground mt-1">Atividades</p>
        </button>
        <button onClick={() => navigate('/Farm')} className="bg-card rounded-xl border border-border p-3 text-left hover:bg-muted transition-colors">
          <span className="text-xl">🌾</span>
          <p className="text-xs font-bold text-foreground mt-1">Fazenda</p>
        </button>
        <button onClick={() => navigate('/FarmMissions')} className="bg-card rounded-xl border border-border p-3 text-left hover:bg-muted transition-colors">
          <span className="text-xl">🎯</span>
          <p className="text-xs font-bold text-foreground mt-1">Missões</p>
        </button>
        <button onClick={() => navigate('/Medals')} className="bg-card rounded-xl border border-border p-3 text-left hover:bg-muted transition-colors">
          <span className="text-xl">🏅</span>
          <p className="text-xs font-bold text-foreground mt-1">Conquistas</p>
        </button>
      </div>

      {showAssistant && <IaraAssistant onClose={() => setShowAssistant(false)} />}
    </div>
  );
};

export default WorldMap;
