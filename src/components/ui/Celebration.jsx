import React, { useCallback, useEffect, useRef, useState } from 'react';

const EMOJIS = ['⭐', '🌟', '✨', '🎉', '🏅', '🪙', '📚', '💎', '🎊'];

const STYLE = `
.celebration-wrap{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:50}
.celeb-layer{position:absolute;inset:0;pointer-events:none}
.celeb-particle{position:absolute;transform:translate(-50%,-50%);animation:celebPop .9s cubic-bezier(.2,.8,.4,1) forwards;will-change:transform,opacity}
@keyframes celebPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(0)}15%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx,0px)),calc(-50% + var(--dy,0px))) scale(1.15) rotate(180deg)}}
.celeb-float{position:absolute;inset:0;pointer-events:none}
.celeb-float-emoji{position:absolute;bottom:-40px;opacity:0;animation:celebFloat 5s linear infinite}
@keyframes celebFloat{0%{transform:translateY(0) scale(.8);opacity:0}12%{opacity:.6}100%{transform:translateY(-115vh) scale(1.2) rotate(12deg);opacity:0}}
.celeb-mascot-btn,.celeb-chest-btn{position:absolute;pointer-events:auto;background:transparent;border:0;cursor:pointer;padding:0;z-index:51}
.celeb-mascot-btn{left:50%;bottom:26px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px}
.celeb-mascot{font-size:64px;display:inline-block;animation:celebBounce 1.4s ease-in-out infinite;filter:drop-shadow(0 8px 12px rgb(245 75 60 / .35))}
@keyframes celebBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-14px) scale(1.06)}}
.celeb-bubble{background:#fff;border:2px solid hsl(245 75% 88%);color:#4c1d95;font-weight:800;font-size:13px;padding:8px 14px;border-radius:16px;position:relative;box-shadow:0 6px 18px -6px rgb(76 29 149 / .25);animation:celebZoom .5s ease-out, celebZoom 1s ease-in-out 1s}
.celeb-bubble::before{content:'';position:absolute;top:-7px;left:50%;transform:translateX(-50%);border:7px solid transparent;border-bottom-color:#fff}
@keyframes celebZoom{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
.celeb-chest-btn{right:22px;bottom:26px;display:flex;flex-direction:column;align-items:center;gap:6px}
.celeb-chest{font-size:58px;display:inline-block;animation:celebShake 1.6s ease-in-out infinite}
.celeb-chest.open{animation:none}
@keyframes celebShake{0%,100%{transform:rotate(0)}20%{transform:rotate(-12deg)}40%{transform:rotate(10deg)}60%{transform:rotate(-8deg)}80%{transform:rotate(6deg)}}
.celeb-chest-label{background:rgba(255,255,255,.92);border:1px solid hsl(35 95% 80%);color:#92400e;font-weight:800;font-size:12px;padding:6px 10px;border-radius:12px}
.celeb-chest-btn.small{right:50%;transform:translateX(50%);bottom:12px}
.celeb-stats{position:absolute;top:14px;left:50%;transform:translateX(-50%);display:flex;gap:10px;pointer-events:none;z-index:51;animation:celebZoom .6s ease-out}
.celeb-stat{font-weight:900;font-size:17px;padding:8px 14px;border-radius:14px;background:#fff;box-shadow:0 6px 18px -6px rgb(0 0 0 / .18)}
.celeb-stat.xp{color:#7c3aed;border:2px solid hsl(245 75% 88%)}
.celeb-stat.coin{color:#b45309;border:2px solid hsl(38 92% 78%)}
@media (max-width:640px){.celeb-mascot{font-size:52px}.celeb-chest{font-size:46px}.celeb-stat{font-size:14px}}
`;

const rand = (n) => Math.floor(Math.random() * n);

const Celebration = ({ score, xp = 0, coins = 0 }) => {
  const [bursts, setBursts] = useState([]);
  const [chestOpen, setChestOpen] = useState(false);
  const [shownXp, setShownXp] = useState(0);
  const [shownCoins, setShownCoins] = useState(0);
  const idRef = useRef(0);

  const fire = useCallback((count = 14, ox = 50, oy = 62) => {
    const parts = Array.from({ length: count }, () => ({
      id: ++idRef.current,
      x: ox + (Math.random() * 24 - 12),
      y: oy,
      dx: (Math.random() - 0.5) * 300,
      dy: -(50 + Math.random() * 130),
      emoji: EMOJIS[rand(EMOJIS.length)],
      size: 22 + Math.random() * 24,
      delay: Math.random() * 0.12,
      dur: 850 + Math.random() * 650,
    }));
    setBursts((b) => [...b, ...parts]);
    setTimeout(() => setBursts((b) => b.filter((p) => !parts.includes(p))), 1800);
  }, []);

  useEffect(() => {
    const t0 = Date.now();
    const dur = 900;
    let raf;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      setShownXp(Math.round(xp * ease));
      setShownCoins(Math.round(coins * ease));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [xp, coins]);

  const perfect = score >= 100;
  const good = score >= 70;

  // fogo de artificio automatico ao abrir
  useEffect(() => {
    const to = setTimeout(() => fire(perfect ? 22 : 12, 50, 45), 200);
    return () => clearTimeout(to);
  }, [perfect, fire]);

  return (
    <div className="celebration-wrap">
      <style>{STYLE}</style>
      <div className="celeb-float" aria-hidden>
        {Array.from({ length: perfect ? 12 : 8 }).map((_, i) => (
          <span
            key={i}
            className="celeb-float-emoji"
            style={{ left: `${(i * 83 + 6) % 96}%`, animationDelay: `${(i % 6) * 0.75}s`, fontSize: `${18 + (i % 4) * 6}px` }}
          >
            {EMOJIS[i % EMOJIS.length]}
          </span>
        ))}
      </div>

      {/* NPC IARA celebra e interage */}
      <button
        type="button"
        aria-label="IARA comemorando com você"
        className="celeb-mascot-btn"
        onClick={() => fire(16, 50, 72)}
      >
        <span className="celeb-mascot">🦊</span>
        <span className="celeb-bubble">{perfect ? 'Perfeito! Você brilhou! ⭐' : good ? 'Mandou bem! Continuou firme! 🚀' : 'Continue praticando, você vai chegar lá! 💪'}</span>
      </button>

      {perfect ? (
        <button type="button" className="celeb-chest-btn" onClick={() => { setChestOpen(true); fire(28, 62, 58); }}>
          <span className={chestOpen ? 'celeb-chest open' : 'celeb-chest'}>🎁</span>
          <span className="celeb-chest-label">{chestOpen ? 'Recompensa coletada!' : 'Toque no baú ⚡'}</span>
        </button>
      ) : (
        <button type="button" className="celeb-chest-btn small" onClick={() => fire(12, 50, 60)}>
          <span className="celeb-chest-label">👏 Toque para comemorar</span>
        </button>
      )}

      <div className="celeb-stats">
        <span className="celeb-stat xp">⚡ {shownXp} XP</span>
        <span className="celeb-stat coin">🪙 {shownCoins} moedas</span>
      </div>

      <div className="celeb-layer" aria-hidden>
        {bursts.map((p) => (
          <span
            key={p.id}
            className="celeb-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: `${p.size}px`,
              animationDuration: `${p.dur}ms`,
              animationDelay: `${p.delay}s`,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Celebration;