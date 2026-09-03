import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44Client } from '@/api/base44Client';
import { levelBounds } from '@/api/integrations';
import { getOrCreateFarm } from '@/api/farm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/metrics';
import { subjectLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

const isStaff = (role) => role === 'professor' || role === 'admin' || role === 'direcao' || role === 'secretaria';

const IaraChat = ({ open, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'iara', content: `Olá, ${user?.name}! 🦊 Sou a Iara, sua companheira de estudos. Pergunte sobre suas atividades ou como melhorar nas matérias!` },
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    const lower = text.toLowerCase();
    let reply = 'Interessante! Que tal praticar em uma das atividades do Mapa? Complete as questões para ganhar XP e medalhas. 🏅';
    if (lower.includes('fra') || lower.includes('matem')) {
      reply = 'Você pode praticar frações na atividade "Frações na Fazenda"! É o caminho certo para virar Mestre da Matemática. 🧮';
    } else if (lower.includes('x') || lower.includes('nível') || lower.includes('level')) {
      reply = 'Você ganha XP ao completar atividades. A cada nível, novas cidades e mascotes são desbloqueados na sua fazenda! 🚜';
    } else if (lower.includes('leitura') || lower.includes('portugu')) {
      reply = 'Para melhorar a leitura, tente a "Aventura de Leitura". Preste atenção no sentido das palavras e volta e meia releia o texto. 📖';
    } else if (lower.includes('oi') || lower.includes('olá')) {
      reply = 'Oi! Como posso ajudar você hoje? 😊';
    }
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'iara', content: reply }]);
    }, 500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Converse com a Iara">
      <div className="flex flex-col gap-3 min-h-[320px] max-h-[60vh]">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-sm font-semibold'
                    : 'bg-muted text-foreground rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[85%] text-sm'
                }
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 pt-2 border-t border-border">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Escreva sua dúvida…"
            className="flex-1 h-10 rounded-xl border border-input bg-card px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          <Button onClick={send}>Enviar</Button>
        </div>
      </div>
    </Modal>
  );
};

const quickStudent = [
  { to: '/Activities', emoji: '🧩', title: 'Atividades', desc: 'Jogue e ganhe XP', color: 'from-violet-500 to-indigo-500' },
  { to: '/Farm', emoji: '🏡', title: 'Minha Fazenda', desc: 'Plante e colha', color: 'from-amber-400 to-orange-500' },
  { to: '/FarmMissions', emoji: '📋', title: 'Missões', desc: 'Desafios diários', color: 'from-emerald-400 to-teal-500' },
  { to: '/Medals', emoji: '🏅', title: 'Conquistas', desc: 'Suas medalhas', color: 'from-rose-400 to-pink-500' },
];

const Home = () => {
  const { user, character } = useAuth();
  const navigate = useNavigate();
  const staff = isStaff(user?.role);
  const [chatOpen, setChatOpen] = useState(false);
  const [todayActivity, setTodayActivity] = useState(null);
  const [nextBadge, setNextBadge] = useState(null);

  const farm = useMemo(() => (user?.role === 'aluno' ? getOrCreateFarm(user) : null), [user]);
  const lvl = levelBounds(user?.xp || 0);

  useEffect(() => {
    let active = true;
    base44Client.get('activities', { status: 'publicada' }).then((rows) => {
      if (!active) return;
      if (rows.length) {
        setTodayActivity(rows[Math.floor(Math.random() * rows.length)]);
      }
      const badges = user?.badges || [];
      const all = ['Primeiros Passos', 'Mestre da Matemática', 'Explorador(a) de Leitura', 'Sequência de 3 dias', 'Perfeição Total'];
      const next = all.find((b) => !badges.find((x) => x.name === b));
      setNextBadge(next);
    });
    return () => { active = false; };
  }, [user?.badges]);

  const roleForAvatar = user?.role || 'aluno';

  return (
    <div className="space-y-8 animate-pop-in">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar character={character} role={roleForAvatar} className="w-14 h-14 rounded-2xl text-3xl shadow-lg" />
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground leading-tight">
              Olá, <span className="text-gradient-primary">{user?.name}</span>! 👋
            </h1>
            <p className="text-muted-foreground">
              {staff ? 'Bem-vindo(a) de volta ao seu espaço de gestão.' : 'Bora aprender jogando?'}
            </p>
          </div>
        </div>
        {user?.role === 'aluno' && (
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Nv', value: lvl.level, cls: 'text-rose-500' },
              { label: '🌽 Milhos', value: farm?.milhos ?? 0, cls: 'text-amber-600' },
              { label: '💎 Gemas', value: farm?.gemas ?? 0, cls: 'text-indigo-500' },
              { label: '⚡ Energia', value: `${farm?.energy ?? 100}/${farm?.energy_max ?? 100}`, cls: 'text-emerald-600' },
            ].map((s) => (
              <div key={s.label} className="card-playful px-3 py-1.5 flex items-center gap-1.5">
                <span className={cn('font-display font-bold text-lg leading-none', s.cls)}>{s.value}</span>
                <span className="text-[10px] text-muted-foreground font-bold">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </header>

      {!staff && (
        <section className="card-playful p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-heading font-bold text-sm">Seu nível: <b className="text-primary">{lvl.level}</b></span>
            <span className="text-xs text-muted-foreground">{Math.round(lvl.progress)}% até o nível {lvl.level + 1}</span>
          </div>
          <ProgressBar value={lvl.progress} showLabel={false} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {lvl.xpToNext > 0 ? `Faltam ${lvl.xpToNext} XP para o próximo nível. Complete atividades para evoluir!` : 'Você pode subir de nível — continue praticando! ⚡'}
          </p>
        </section>
      )}

      {!staff && character && todayActivity && (
        <section className="card-playful p-6 bg-mesh border-none relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <span className="text-5xl animate-bounce-soft">⭐</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-bold text-xl">Missão de hoje</h3>
                {nextBadge && <Badge tone="warning">Próxima medalha: {nextBadge}</Badge>}
              </div>
              <p className="text-muted-foreground mt-1">
                Complete <b>“{todayActivity.title}”</b> ({subjectLabel(todayActivity.subject)}) e ganhe <b>+{todayActivity.xp_reward} XP</b>!
              </p>
            </div>
            <Button size="lg" className="shrink-0" onClick={() => navigate(`/PlayActivity?id=${todayActivity.id}`)}>
              Jogar → 
            </Button>
          </div>
        </section>
      )}

      {!staff ? (
        <>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-2xl">🚀 Comece por aqui</h2>
              <button onClick={() => navigate('/Activities')} className="text-sm font-bold text-primary hover:underline">ver tudo</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStudent.map((t) => (
                <button
                  key={t.to}
                  onClick={() => navigate(t.to)}
                  className={cn(
                    'group relative rounded-3xl bg-gradient-to-br p-5 text-left shadow-lg transition-all hover:-translate-y-1.5 hover:shadow-xl active:scale-95 text-white overflow-hidden',
                    t.color,
                  )}
                >
                  <span className="absolute -right-4 -top-4 text-7xl opacity-20 group-hover:scale-110 transition-transform">🍃</span>
                  <span className="text-4xl block mb-2 drop-shadow">{t.emoji}</span>
                  <h3 className="font-heading font-bold text-lg leading-tight">{t.title}</h3>
                  <p className="text-white/80 text-xs mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { to: '/MyReport', emoji: '📊', title: 'Meu Relatório', desc: 'Sua evolução em cada matéria', chip: '📈' },
              { to: '/Mural', emoji: '📌', title: 'Mural de Avisos', desc: 'Avisos e eventos da escola', chip: '🔔' },
              { onClick: () => setChatOpen(true), emoji: '🤖', title: 'Falar com a Iara', desc: 'Tire dúvidas com a assistente', chip: '💬' },
              { to: '/CharacterCreation', emoji: '🦸', title: 'Meu Avatar', desc: 'Personalize seu herói', chip: '✨' },
            ].map((t, i) => (
              <button
                key={i}
                onClick={() => (t.to ? navigate(t.to) : t.onClick())}
                className="card-playful p-5 flex flex-col gap-2 text-left transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-3xl">{t.emoji}</span>
                <h3 className="font-heading font-bold">{t.title}</h3>
                <p className="text-xs text-muted-foreground flex-1">{t.desc}</p>
                <span className="text-xs font-bold text-primary">{t.chip} abrir</span>
              </button>
            ))}
          </section>
        </>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card-playful p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl mb-2">🧩</div>
            <h3 className="font-heading font-bold text-xl">Gerenciar conteúdos</h3>
            <p className="text-muted-foreground flex-1">Publique e edite atividades alinhadas à BNCC para suas turmas.</p>
            <Button onClick={() => navigate('/ActivityManager')}>Abrir gerenciador</Button>
          </div>

          <div className="card-playful p-6 flex flex-col gap-4 bg-mesh border-none">
            <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur flex items-center justify-center text-2xl mb-2">🤖</div>
            <h3 className="font-heading font-bold text-xl">Falar com a Iara</h3>
            <p className="text-muted-foreground flex-1">Peça à Iara dicas de como usar a plataforma e gerar relatórios.</p>
            <Button onClick={() => setChatOpen(true)} className="bg-white text-foreground border border-border shadow-sm hover:bg-white/90">Abrir Chat</Button>
          </div>

          <div className="card-playful p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-500 text-2xl mb-2">🏅</div>
            <h3 className="font-heading font-bold text-xl">Conquistas</h3>
            <p className="text-muted-foreground flex-1">Colecione medalhas e mostre seu progresso para a turma.</p>
            <Button variant="outline" onClick={() => navigate('/Medals')}>Ver medalhas</Button>
          </div>

          <div className="card-playful p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 text-2xl mb-2">📌</div>
            <h3 className="font-heading font-bold text-xl">Mural de Avisos</h3>
            <p className="text-muted-foreground flex-1">Fique por dentro de avisos, eventos e comunicados da escola.</p>
            <Button variant="outline" onClick={() => navigate('/Mural')}>Ver avisos</Button>
          </div>

          <div className="card-playful p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl mb-2">📊</div>
            <h3 className="font-heading font-bold text-xl">Relatórios</h3>
            <p className="text-muted-foreground flex-1">Gere relatórios de desempenho para alunos e turmas.</p>
            <Button variant="outline" onClick={() => navigate('/Reports')}>Gerar relatório</Button>
          </div>

          <div className="card-playful p-6 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 text-2xl mb-2">🏠</div>
            <h3 className="font-heading font-bold text-xl">A Fazendinha</h3>
            <p className="text-muted-foreground flex-1">Acompanhe as fazendas dos alunos e crie eventos escolares.</p>
            <Button variant="outline" onClick={() => navigate('/FarmAdmin')}>Painel da fazenda</Button>
          </div>
        </section>
      )}

      <IaraChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Home;