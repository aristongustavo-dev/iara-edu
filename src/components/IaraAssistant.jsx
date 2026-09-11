import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TIPS = {
  welcome: [
    'Olá! Eu sou a IARA, sua guia na Fazenda do Conhecimento! 🧜‍♀️',
    'Posso te ajudar a encontrar atividades, missões e muito mais!',
  ],
  activities: [
    'Que tal completar uma atividade agora? Elas te dão XP e moedas! 📝',
    'Cada atividade concluída faz sua fazenda crescer! 🌾',
  ],
  farm: [
    'Sua Fazenda precisa de cuidados! Plante sementes e colha recompensas. 🌱',
    'Use moedas no Mercado para comprar novas sementes! 🌽',
  ],
  streak: [
    'Estude todos os dias para manter sua sequência! 🔥',
    '3 dias seguidos = bônus de XP extra!',
  ],
  level: [
    'Para subir de nível, acumule XP completando atividades. ⭐',
    'Novos locais são desbloqueados quando você sobe de nível!',
  ],
  missions: [
    'Confira as missões diárias para ganhar recompensas extras! 🎯',
    'Missões semanais dão ainda mais XP!',
  ],
  ranking: [
    'Veja como está o ranking da sua turma na Praça dos Campeões! 🏆',
  ],
  badge: [
    'Complete desafios para ganhar medalhas! 🏅',
    'Cada medalha é uma conquista única!',
  ],
  '3d': [
    'Entre no mundo em 3ª pessoa! Clique em "🎮 Mundo 3D" na nav para controlar um personagem e explorar o cenário como num jogo de verdade. Use WASD para andar, Shift para correr, Espaço para pular e colete os itens brilhantes! 🎮✨',
  ],
};

const KEYWORDS = {
  atividade: 'activities',
  atividades: 'activities',
  activity: 'activities',
  exercise: 'activities',
  quiz: 'activities',
  fazer: 'activities',
  estudar: 'activities',
  estudo: 'activities',
  fazenda: 'farm',
  farm: 'farm',
  plantar: 'farm',
  colher: 'farm',
  plantio: 'farm',
  semente: 'farm',
  milho: 'farm',
  moeda: 'farm',
  moedas: 'farm',
  dia: 'streak',
  dias: 'streak',
  sequência: 'streak',
  consecutivo: 'streak',
  level: 'level',
  nível: 'level',
  nivel: 'level',
  xp: 'level',
  subir: 'level',
  evoluir: 'level',
  missão: 'missions',
  missões: 'missions',
  mission: 'missions',
  diária: 'missions',
  semanal: 'missions',
  ranking: 'ranking',
  pontuação: 'ranking',
  competir: 'ranking',
  medalha: 'badge',
  medalhas: 'badge',
  badge: 'badge',
  conquista: 'badge',
  conquistas: 'badge',
  mundo: '3d',
  '3d': '3d',
  '3D': '3d',
  entrar: '3d',
  cenário: '3d',
  game: '3d',
  jogo: '3d',
};

const QUICK_ACTIONS = [
  { label: '📝 Atividades', route: '/Activities' },
  { label: '🌾 Fazenda', route: '/Farm' },
  { label: '🎯 Missões', route: '/FarmMissions' },
  { label: '🏅 Conquistas', route: '/Medals' },
  { label: '🎮 Mundo 3D', route: '/World3D' },
  { label: '🗺️ Meu Mundo', route: '/' },
];

const IaraAssistant = ({ onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const level = user?.level || 1;

  useEffect(() => {
    const welcome = TIPS.welcome[Math.floor(Math.random() * TIPS.welcome.length)];
    const levelTip = level < 3 ? TIPS.level[Math.floor(Math.random() * TIPS.level.length)] : '';
    const streakTip = (user?.streak_days || 0) > 0 ? TIPS.streak[Math.floor(Math.random() * TIPS.streak.length)] : '';

    setMessages([
      { from: 'iara', text: welcome },
      levelTip && { from: 'iara', text: levelTip },
      streakTip && { from: 'iara', text: streakTip },
    ].filter(Boolean));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.level, user?.streak_days]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const findResponse = (text) => {
    const lower = text.toLowerCase();
    for (const [keyword, category] of Object.entries(KEYWORDS)) {
      if (lower.includes(keyword)) {
        const tips = TIPS[category];
        return tips[Math.floor(Math.random() * tips.length)];
      }
    }
    // Default responses
    const defaults = [
      'Interessante! Posso te ajudar com atividades, fazenda, missões ou ranking. O que precisa? 🤔',
      'Não tenho certeza do que você quer, mas posso te ajudar a explorar o mundo! Toque em um local no mapa. 🗺️',
      'Para ganhar XP, complete atividades na Escola! Para moedas, plante na Fazenda. 💡',
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  };

  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = { from: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = findResponse(text);
      setMessages((prev) => [...prev, { from: 'iara', text: response }]);
      setIsTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Chat container */}
      <div className="relative w-full max-w-md bg-card rounded-t-2xl md:rounded-2xl border border-border shadow-2xl flex flex-col animate-pop-in" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xl shadow-md">
            🧜‍♀️
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm">IARA</p>
            <p className="text-[10px] text-muted-foreground">Sua assistente educacional</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            ✕
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 200, maxHeight: '50vh' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                msg.from === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm',
                  msg.from === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.route}
              onClick={() => { onClose(); navigate(qa.route); }}
              className="text-[10px] font-bold bg-muted hover:bg-muted/80 rounded-full px-3 py-1.5 text-foreground transition-colors"
            >
              {qa.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte à IARA..."
            className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button size="sm" onClick={() => sendMessage(input)} disabled={!input.trim()}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IaraAssistant;
