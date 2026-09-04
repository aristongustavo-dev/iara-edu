import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44Client } from '@/api/base44Client';
import { submitAttempt } from '@/api/integrations';
import { trackMissionProgress } from '@/lib/gamification';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/metrics';
import { EmptyState } from '@/components/ui/feedback';
import { cn } from '@/lib/utils';
import { subjectLabel, difficultyLabel, gradeLabel, gameModeLabel } from '@/lib/utils';
import MemoryGame from '@/components/games/MemoryGame';
import HangmanGame from '@/components/games/HangmanGame';
import WordSearchGame from '@/components/games/WordSearchGame';

const GAME_MODES = {
  jogo_memoria: MemoryGame,
  forca: HangmanGame,
  caca_palavras: WordSearchGame,
};

const matchingCanonical = (pairs, mapping) =>
  JSON.stringify(pairs.map((p, i) => [String(i), mapping[String(i)] ?? '']));

const isQuestionCorrect = (q, userAnswer) => {
  if (q.type === 'correspondencia') {
    return JSON.stringify((q.pairs || []).map((_, i) => [String(i), q.pairs[i].right])) === userAnswer;
  }
  return userAnswer === q.correct_answer;
};

const PlayActivity = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState(null);
  const [startedAt, setStartedAt] = useState(null);

  const id = params.get('id');

  useEffect(() => {
    let active = true;
    if (!id) {
      setLoading(false);
      return;
    }
    base44Client.getById('activities', id).then((a) => {
      if (!active) return;
      setActivity(a);
      setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  const question = activity?.questions?.[index];
  const total = activity?.questions?.length || 0;
  const GameComponent = activity ? GAME_MODES[activity.game_mode] : null;
  const isGameMode = !!GameComponent;

  const gameMeta = useMemo(() => {
    if (!activity) return null;
    const content = activity.game_content || {};
    if (activity.game_mode === 'jogo_memoria') return { count: content.pairs?.length || 0, unit: 'pares' };
    if (activity.game_mode === 'forca') return { count: content.words?.length || 0, unit: 'palavras' };
    if (activity.game_mode === 'caca_palavras') return { count: content.words?.length || 0, unit: 'palavras' };
    return { count: total, unit: 'questões' };
  }, [activity, total]);

  const reset = () => {
    setIndex(0);
    setAnswers([]);
    setRevealed(false);
    setResult(null);
    setStartedAt(null);
    setPhase('intro');
  };

  const selectAnswer = (answer) => {
    if (revealed) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { user_answer: answer, time_spent_seconds: 0 };
      return next;
    });
  };

  const confirmQuestion = () => {
    const ans = answers[index];
    if (!ans || ans.user_answer === '') return;
    setRevealed(true);
  };

  const nextQuestion = () => {
    setRevealed(false);
    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const finish = async ({ answers: gameAnswers, score: gameScore } = {}) => {
    const timeSpent = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    const res = await submitAttempt({
      student: user,
      activity,
      answers,
      gameAnswers,
      gameScore,
      timeSpentSeconds: timeSpent,
    });
    setResult(res);
    setPhase('result');
    refreshUser();
    // Track mission progress
    if (user?.email) {
      trackMissionProgress(user.email, 'activities_today');
      trackMissionProgress(user.email, 'activities_week');
      if (res?.attempt?.score >= 70) trackMissionProgress(user.email, 'correct_today', Math.round((res.attempt.score / 100) * (activity?.questions?.length || 1)));
      if (res?.attempt?.score === 100) trackMissionProgress(user.email, 'perfect_week');
    }
  };

  const score = useMemo(() => {
    if (result?.attempt?.score != null) return Math.round(result.attempt.score);
    const correct = answers.filter((a, i) => a && isQuestionCorrect(activity?.questions?.[i], a.user_answer)).length;
    return total ? Math.round((correct / total) * 100) : 0;
  }, [answers, activity, total, result]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) {
    return (
      <EmptyState icon="🧩" title="Nenhuma atividade selecionada">
        <Button onClick={() => navigate('/Activities')}>Ver atividades</Button>
      </EmptyState>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto animate-pop-in">
        <div className="card-playful p-8 text-center space-y-5">
          <span className="text-6xl inline-block animate-bounce-soft">🚀</span>
          <div>
            <h1 className="text-3xl font-display font-bold">{activity.title}</h1>
            <p className="text-muted-foreground mt-2">{activity.description}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge tone="primary">{gameModeLabel(activity.game_mode)}</Badge>
            <Badge tone="neutral">{subjectLabel(activity.subject)}</Badge>
            <Badge tone="neutral">{gradeLabel(activity.grade_level)}</Badge>
            <Badge tone="neutral">{difficultyLabel(activity.difficulty)}</Badge>
            <Badge tone="success">⚡ {activity.xp_reward} XP</Badge>
            <Badge tone="secondary">{gameMeta?.count || 0} {gameMeta?.unit}</Badge>
          </div>
          {activity.bncc_skills?.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Habilidades BNCC: {activity.bncc_skills.join(', ')}
            </p>
          )}
          <Button size="lg" className="w-full sm:w-auto px-10" onClick={() => { setStartedAt(Date.now()); setPhase('playing'); }}>
            Começar aventura
          </Button>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const great = score >= 70;
    return (
      <div className="max-w-2xl mx-auto">
        {score === 100 && <div className="confetti-layer" />}
        <div className="card-playful p-8 text-center space-y-5 animate-pop-in">
          <div className="text-6xl">{score === 100 ? '🏆' : great ? '🎉' : '💪'}</div>
          <h1 className="text-3xl font-display font-bold">
            {score === 100 ? 'Perfeito!' : great ? 'Mandou bem!' : 'Continue praticando!'}
          </h1>
          <div className="flex justify-center">
            <div className="relative w-40 h-40 rounded-full bg-muted flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${great ? '#10b981' : '#f59e0b'} ${score * 3.6}deg, #f1f0f7 0deg)`,
                }}
              />
              <div className="absolute inset-2.5 rounded-full bg-card flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold">{score}%</span>
                <span className="text-xs text-muted-foreground">de acerto</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3">
              <p className="text-xl font-bold text-amber-600">⚡ +{result?.xpEarned} XP</p>
              <p className="text-xs text-amber-700/70"> experiência ganha</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
              <p className="text-xl font-bold text-emerald-600">🪙 +{Math.min(10, result?.attempt?.correct_count * 2)}</p>
              <p className="text-xs text-emerald-700/70"> moedas para a fazenda</p>
            </div>
          </div>
          {result?.attempt?.ai_feedback && (
            <p className="text-sm text-muted-foreground italic bg-muted/50 rounded-2xl p-4">
              🤖 {result.attempt.ai_feedback}
            </p>
          )}
          {result?.levelUp && (
            <Badge tone="success" className="text-sm px-3 py-1">🎉 Você subiu de nível!</Badge>
          )}
          <div className="flex justify-center gap-3 mt-2">
            <Button variant="outline" onClick={reset}>Jogar de novo</Button>
            <Button variant="secondary" onClick={() => navigate('/Activities')}>Mais atividades</Button>
            <Button onClick={() => navigate('/MyReport')}>Ver relatório</Button>
          </div>
        </div>
      </div>
    );
  }

  // playing
  const isLast = index === total - 1;
  const selected = answers[index]?.user_answer ?? '';
  const isCorresp = question?.type === 'correspondencia';

  if (isGameMode) {
    const Game = GameComponent;
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Badge tone="primary">{gameModeLabel(activity.game_mode)}</Badge>
          <div className="flex-1 hidden sm:block" />
          <Button variant="ghost" size="sm" onClick={() => navigate('/Activities')}>Sair</Button>
        </div>
        <div className="card-playful p-5 sm:p-8">
          <Game
            content={activity.game_content || {}}
            onFinish={finish}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4">
        <Badge tone="primary">Questão {index + 1} de {total}</Badge>
        <div className="flex-1"><ProgressBar value={((index + (revealed ? 1 : 0)) / total) * 100} /></div>
        <Badge tone="neutral">⚡ {activity.xp_reward} XP</Badge>
      </div>

      <div className="card-playful p-6 sm:p-8 space-y-6">
        <h2 className="font-heading text-xl font-bold">{question.statement}</h2>

        {isCorresp ? (
          <MatchingQuestion question={question} selected={selected} onSelect={selectAnswer} revealed={revealed} disabled={revealed} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.options?.map((opt, i) => {
              const chosen = selected === opt.id;
              const showCorrect = revealed && opt.id === question.correct_answer;
              const showWrong = revealed && chosen && opt.id !== question.correct_answer;
              return (
                <button
                  key={opt.id}
                  disabled={revealed}
                  onClick={() => selectAnswer(opt.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-2 p-4 text-left font-semibold transition-all text-sm sm:text-base',
                    !revealed && !chosen && 'border-border hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-0.5',
                    !revealed && chosen && 'border-primary bg-primary/10 text-primary',
                    showCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-700',
                    showWrong && 'border-destructive bg-destructive/5 text-destructive',
                    revealed && !chosen && !showCorrect && 'border-border opacity-60',
                  )}
                >
                  <span className={cn(
                    'w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-bold',
                    showCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : showWrong ? 'border-destructive text-destructive' : 'border-border text-muted-foreground',
                  )}>
                    {showCorrect ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {revealed && question.explanation && (
          <div className={cn(
            'rounded-2xl p-4 text-sm border',
            selected === question.correct_answer || (question.type === 'correspondencia' && isCorrCorrect(question, selected))
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800',
          )}>
            💡 {question.explanation}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/Activities')}>Sair</Button>
        {!revealed ? (
          <Button onClick={confirmQuestion} disabled={selected === ''}>Confirmar resposta</Button>
        ) : (
          <Button onClick={nextQuestion}>{isLast ? 'Finalizar 🏁' : 'Próxima →'}</Button>
        )}
      </div>
    </div>
  );
};

const MatchingQuestion = ({ question, selected, onSelect, revealed }) => {
  const pairs = question.pairs || [];
  const [mapping, setMapping] = useState({});
  const apply = (idx, value) => {
    const next = { ...mapping, [String(idx)]: value };
    setMapping(next);
    onSelect(matchingCanonical(pairs, next));
  };
  return (
    <div className="space-y-3">
      {pairs.map((p, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex-1 rounded-2xl border border-border bg-muted/40 p-3 font-semibold text-sm">{p.left}</div>
          <span className="text-muted-foreground">→</span>
          <select
            disabled={revealed}
            value={mapping[String(i)] ?? ''}
            onChange={(e) => apply(i, e.target.value)}
            className="flex-1 h-11 rounded-2xl border border-input bg-card px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring/40"
          >
            <option value="">Selecione…</option>
            {question.options?.map((o) => <option key={o.id} value={o.text}>{o.text}</option>)}
          </select>
        </div>
      ))}
    </div>
  );
};

const isCorrCorrect = (q, userAnswer) =>
  q && userAnswer === JSON.stringify((q.pairs || []).map((_, i) => [String(i), q.pairs[i].right]));

export default PlayActivity;