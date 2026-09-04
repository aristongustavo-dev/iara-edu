import React from 'react';

const HUD = ({ xp = 0, coins = 0, notifications = [] }) => {
  const level = Math.floor(Math.sqrt(xp / 10)) + 1;
  const xpForNext = level * level * 10;
  const xpForPrev = (level - 1) * (level - 1) * 10;
  const progress = ((xp - xpForPrev) / (xpForNext - xpForPrev)) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-[94]">
      {/* Top Left - Player Info */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2.5 text-white min-w-[160px]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">🦊</span>
            <span className="font-bold text-sm">Nível {level}</span>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-1">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="text-[10px] text-white/60">{xp} / {xpForNext} XP</p>
        </div>
      </div>

      {/* Top Center - Mission */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-center">
          <p className="text-[10px] text-white/50 uppercase tracking-wide">Missão Atual</p>
          <p className="text-xs font-bold">Explore o mundo</p>
        </div>
      </div>

      {/* Top Right - Coins */}
      <div className="absolute top-16 right-4 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 text-white flex items-center gap-2">
          <span className="text-lg">🪙</span>
          <span className="font-bold text-sm">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Notifications */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="bg-black/70 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-xl animate-bounce"
            style={{ animationDuration: '0.6s' }}
          >
            {n.text}
          </div>
        ))}
      </div>

      {/* Minimap placeholder */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <div className="w-28 h-28 bg-black/50 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Você" />
          </div>
          {/* Simplified map dots */}
          <div className="absolute top-2 left-3 w-1.5 h-1.5 bg-blue-400 rounded-full" title="Escola" />
          <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-green-400 rounded-full" title="Lab" />
          <div className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-amber-400 rounded-full" title="Fazenda" />
          <div className="absolute bottom-3 right-4 w-1.5 h-1.5 bg-orange-400 rounded-full" title="Mercado" />
          <div className="absolute top-1/2 left-1 w-1.5 h-1.5 bg-purple-400 rounded-full" title="IARA" />
          <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-white/50">MAPA</p>
        </div>
      </div>

      {/* Mobile controls placeholder */}
      <div className="md:hidden absolute bottom-20 left-4 pointer-events-auto">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 flex items-center justify-center">
          <span className="text-white/50 text-xs">Joystick</span>
        </div>
      </div>
    </div>
  );
};

export default HUD;
