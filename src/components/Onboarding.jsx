import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { PROFESSIONS } from '@/api/integrations';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo à Fazenda do Conhecimento!', emoji: '🏫' },
  { id: 'avatar', title: 'Escolha seu Avatar', emoji: '🎭' },
  { id: 'goal', title: 'Qual seu objetivo?', emoji: '🎯' },
  { id: 'profession', title: 'Qual profissão dos sonhos?', emoji: '💫' },
  { id: 'tour', title: 'Conheça seu mundo', emoji: '🗺️' },
  { id: 'first_mission', title: 'Sua primeira missão!', emoji: '🌱' },
];

const AVATAR_OPTIONS = [
  { emoji: '👦', label: 'Garoto', color: '#4A90D9' },
  { emoji: '👧', label: 'Garota', color: '#E91E63' },
  { emoji: '🧑', label: 'Neutro', color: '#2ECC71' },
  { emoji: '🧒', label: 'Criança', color: '#FF9800' },
  { emoji: '👨', label: 'Adulto', color: '#795548' },
  { emoji: '👩', label: 'Adulta', color: '#9C27B0' },
];

const GOALS = [
  { id: 'learn', label: 'Aprender coisas novas', icon: '📚' },
  { id: 'improve', label: 'Melhorar minhas notas', icon: '📈' },
  { id: 'explore', label: 'Explorar o mundo', icon: '🌍' },
  { id: 'compete', label: 'Competir com amigos', icon: '🏆' },
];

const Onboarding = ({ onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedProfession, setSelectedProfession] = useState(null);

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      // Save selections and complete
      try {
        localStorage.setItem('iara_onboarding_done', '1');
        if (selectedAvatar) localStorage.setItem('iara_onboarding_avatar', JSON.stringify(selectedAvatar));
        if (selectedGoal) localStorage.setItem('iara_onboarding_goal', selectedGoal);
        if (selectedProfession) localStorage.setItem('iara_onboarding_profession', selectedProfession);
      } catch (e) { /* ignore */ }
      onComplete?.();
    }
  };

  const back = () => { if (step > 0) setStep(step - 1); };

  return (
    <div className="fixed inset-0 z-[95] bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-pop-in">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">Passo {step + 1} de {STEPS.length}</p>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          {/* Step Header */}
          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 text-center">
            <span className="text-5xl mb-3 block">{current.emoji}</span>
            <h2 className="font-display text-xl font-bold text-foreground">{current.title}</h2>
          </div>

          {/* Step Content */}
          <div className="p-6 min-h-[260px]">
            {current.id === 'welcome' && (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Olá, <span className="font-bold text-foreground">{user?.name || 'Estudante'}</span>! 👋
                </p>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo à <strong>Fazenda do Conhecimento</strong>. Aqui, cada atividade que você completa faz seu mundo crescer e evoluir!
                </p>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-2xl block">📝</span>
                    <p className="text-xs font-bold text-foreground mt-1">Atividades</p>
                    <p className="text-[10px] text-muted-foreground">Ganhe XP</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-2xl block">🌾</span>
                    <p className="text-xs font-bold text-foreground mt-1">Fazenda</p>
                    <p className="text-[10px] text-muted-foreground">Plante e colha</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-xl">
                    <span className="text-2xl block">🏆</span>
                    <p className="text-xs font-bold text-foreground mt-1">Ranking</p>
                    <p className="text-[10px] text-muted-foreground">Compite</p>
                  </div>
                </div>
              </div>
            )}

            {current.id === 'avatar' && (
              <div className="grid grid-cols-3 gap-3">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.label}
                    onClick={() => setSelectedAvatar(av)}
                    className={cn(
                      'flex flex-col items-center p-4 rounded-2xl border-2 transition-all',
                      selectedAvatar?.label === av.label
                        ? 'border-primary bg-primary/10 scale-105 shadow-lg'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    )}
                  >
                    <span className="text-4xl mb-1">{av.emoji}</span>
                    <span className="text-xs font-bold text-foreground">{av.label}</span>
                  </button>
                ))}
              </div>
            )}

            {current.id === 'goal' && (
              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGoal(g.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                      selectedGoal === g.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    )}
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="font-bold text-foreground">{g.label}</span>
                  </button>
                ))}
              </div>
            )}

            {current.id === 'profession' && (
              <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {PROFESSIONS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfession(p.id)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
                      selectedProfession === p.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-muted'
                    )}
                  >
                    <span className="text-xl">{p.emoji || '💼'}</span>
                    <span className="text-sm font-bold text-foreground">{p.label}</span>
                  </button>
                ))}
              </div>
            )}

            {current.id === 'tour' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-3">Seu mundo tem vários locais para explorar:</p>
                {[
                  { icon: '🏫', name: 'Escola', desc: 'Onde você faz atividades e aprende' },
                  { icon: '🌾', name: 'Fazenda', desc: 'Plante, colha e ganhe moedas' },
                  { icon: '📚', name: 'Biblioteca', desc: 'Conteúdos e apostilas' },
                  { icon: '🏪', name: 'Mercado', desc: 'Compre sementes e itens' },
                  { icon: '🏆', name: 'Praça', desc: 'Veja o ranking da turma' },
                ].map((loc) => (
                  <div key={loc.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <span className="text-xl">{loc.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{loc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{loc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {current.id === 'first_mission' && (
              <div className="text-center space-y-4">
                <div className="bg-muted/50 rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Missão #1</p>
                  <p className="font-bold text-foreground">Complete sua primeira atividade</p>
                  <p className="text-xs text-muted-foreground mt-1">Escolha qualquer atividade disponível e resolva</p>
                  <div className="flex justify-center gap-4 mt-3">
                    <span className="text-xs font-bold text-primary">+50 XP</span>
                    <span className="text-xs font-bold text-amber-600">+25 🌽</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Após completar, volte ao mundo para ver sua fazenda crescer!
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={back} disabled={step === 0}>
              Voltar
            </Button>
            <Button size="sm" onClick={next}>
              {step === STEPS.length - 1 ? 'Começar!' : 'Próximo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
