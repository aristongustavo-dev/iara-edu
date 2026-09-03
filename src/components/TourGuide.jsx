import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TOUR_KEY = (email) => `iara_tour_done_${email}`;

const stepCopy = (label) => {
  const copy = {
    'Início': 'Este é o seu ponto de partida. Aqui você vê o boas-vindas, seu nível e atalhos para o que é mais importante.',
    'Atividades': 'Encontre as atividades da sua série. Ao responder, você ganha XP, medalhas e milhos para a fazenda.',
    'A Fazendinha': 'Aqui você planta, espera crescer e colhe recompensas! Cada colheita soma XP e milhos 🌽.',
    'Loja': 'Compre sementes, animais, construções e decorações usando os milhos que você ganhou.',
    'Missões': 'Missões diárias: complete tarefas e resgate recompensas extras de milhos e XP.',
    'Ranking': 'Compare seu desempenho com a turma e a escola. Suba no ranking estudando!',
    'Conquistas': 'Suas medalhas e conquistas. Complete desafios para ganhar novas 🌟.',
    'Meu Relatório': 'Acompanhe seu aproveitamento por matéria, acertos e pontos a reforçar.',
    'Mural de Avisos': 'Recados e avisos da escola, dos professores e da direção.',
    'Meu Avatar': 'Personalize seu mascote com avatares divertidos ou sua própria foto.',
    'Meu Perfil': 'Edite seus dados, veja seu nível e informações da sua conta.',
    'Dashboard': 'Visão geral da escola: alunos, professores, atividades e desempenho em um só lugar.',
    'Gerenciar Atividades': 'Crie, edite e publique atividades para as turmas.',
    'Turmas': 'Organize as turmas e veja quais alunos estão matriculados.',
    'Professores': 'Cadastre e gerencie os professores da escola.',
    'Alunos': 'Cadastre e acompanhe os alunos matriculados.',
    'Frequência': 'Registre a presença dos alunos em cada aula.',
    'Grupos': 'Crie grupos e competições entre os alunos.',
    'Relatórios': 'Gere relatórios de desempenho por turma ou aluno.',
    'Matriz Curricular': 'Consulte as habilidades da BNCC organizadas por série e matéria.',
    'Painel': 'Acesso rápido às principais ferramentas do espaço institucional.',
    'PlayActivity': 'Resolva as questões da atividade selecionada e colete os pontos.',
    'GameMap': 'Explore as cidades, plante e colha recompensas no cenário da fazenda.',
    'Home': 'Sua porta de entrada para todas as aventuras de aprendizagem.',
  };
  return copy[label] || `Explore esta seção para aproveitar ao máximo o IARA EDU.`;
};

const TourGuide = () => {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [target, setTarget] = useState(null);

  const staff = ['admin', 'professor', 'direcao', 'secretaria'].includes(user?.role);
  const isAdmin = ['admin', 'direcao'].includes(user?.role);

  // Detecta os itens do menu presentes no sidebar e monta os passos do tutorial
  const collectItems = useCallback(() => {
    const links = Array.from(document.querySelectorAll('aside nav a'));
    const labels = links.map((a) => (a.textContent || '').trim()).filter(Boolean);
    // Prioridade didática: uma ordem fixa interessante por perfil
    const priority = staff
      ? ['Início', 'Dashboard', 'Alunos', 'Turmas', 'Atividades', 'Gerenciar Atividades', 'Frequência', 'Relatórios', 'Painel']
      : ['Início', 'Atividades', 'A Fazendinha', 'Loja', 'Missões', 'Conquistas', 'Meu Relatório', 'Meu Avatar'];
    const ordered = priority.filter((name) => labels.includes(name));
    const rest = labels.filter((name) => !priority.includes(name));
    return ordered.concat(rest).slice(0, isAdmin ? 8 : 6).map((name) => ({
      targetText: name,
      title: `É assim que o ${name} funciona`,
      body: stepCopy(name),
      hint: `Toque em “${name}” no menu para abrir esta tela.`,
    }));
  }, [staff, isAdmin]);

  // Localiza o elemento do menu pelo rótulo e calcula a posição do spotlight
  const locate = useCallback((label) => {
    const links = Array.from(document.querySelectorAll('aside nav a'));
    const a = links.find((x) => (x.textContent || '').trim() === label || (x.textContent || '').includes(label));
    if (!a) return document.querySelector('header');
    return a;
  }, []);

  const applyStep = useCallback((itemsList, idx) => {
    setStepIndex(idx);
    const s = itemsList[idx];
    if (!s) return;
    const el = locate(s.targetText);
    setTarget(el);
  }, [locate]);

  const startTour = useCallback(() => {
    const list = collectItems();
    if (list.length === 0) return;
    setItems(list);
    setOpen(true);
    applyStep(list, 0);
  }, [collectItems, applyStep]);

  const closeTour = useCallback((done = false) => {
    setOpen(false);
    setTarget(null);
    if (done && user?.email) {
      try {
        localStorage.setItem(TOUR_KEY(user.email), '1');
      } catch (e) { /* ignore */ }
    }
  }, [user]);

  // Primeira visita: inicia o tour automaticamente após logado
  useEffect(() => {
    if (!isAuthenticated || !user?.email) return;
    try {
      if (localStorage.getItem(TOUR_KEY(user.email))) return;
    } catch (e) { return; }
    const t = setTimeout(() => {
      // garante que o sidebar já está montado
      startTour();
    }, 900);
    return () => clearTimeout(t);
  }, [isAuthenticated, user?.email, startTour]);

  // Permite reabrir o tour a qualquer momento (ex.: botão "Como usar")
  useEffect(() => {
    const handler = () => {
      if (!open) startTour();
    };
    window.addEventListener('iara:start-tour', handler);
    return () => window.removeEventListener('iara:start-tour', handler);
  }, [open, startTour]);

  // Reposiciona o spotlight em redimensionamento
  useEffect(() => {
    const onResize = () => {
      if (open && items[stepIndex]) {
        const el = locate(items[stepIndex].targetText);
        setTarget(el);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, items, stepIndex, locate]);

  if (!open) return null;

  const steps = items;
  const s = steps[stepIndex];
  if (!s) return null;

  const rect = target?.getBoundingClientRect?.();

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Overlay escuro com recorte no alvo */}
      <svg className="fixed inset-0 h-full w-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="tour_mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 6}
                y={rect.top - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(2,6,23,0.6)" mask="url(#tour_mask)" />
      </svg>

      {/* Borda brilhante no alvo */}
      {rect && (
        <div
          className="fixed border-[3px] border-primary rounded-[14px] shadow-[0_0_0_4px_rgba(124,58,237,0.35)] animate-pulse transition-all"
          style={{ left: rect.left - 8, top: rect.top - 8, width: rect.width + 16, height: rect.height + 16, pointerEvents: 'none' }}
        />
      )}

      {/* Bolha de explicação */}
      <div
        className="fixed w-[300px] max-w-[85vw] animate-pop-in"
        style={{
          left: Math.min(window.innerWidth - 320, Math.max(16, rect ? rect.left : 16)),
          top: rect ? rect.top + rect.height + 16 : 80,
        }}
      >
        <div className="bg-card p-5 rounded-2xl shadow-2xl space-y-3 border border-border">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
              🧭
            </span>
            <h3 className="font-heading font-bold text-foreground leading-tight">{s.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{s.body}</p>
          <p className="text-xs font-bold text-primary">{s.hint}</p>

          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5">
              {steps.map((st, i) => (
                <span key={st.id} className={cn('w-2 h-2 rounded-full', i === stepIndex ? 'bg-primary' : 'bg-muted')} />
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => closeTour(false)}>Pular</Button>
              {stepIndex < steps.length - 1 ? (
                <Button size="sm" onClick={() => applyStep(steps, stepIndex + 1)}>Próximo</Button>
              ) : (
                <Button size="sm" variant="success" onClick={() => closeTour(true)}>Entendi!</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourGuide;