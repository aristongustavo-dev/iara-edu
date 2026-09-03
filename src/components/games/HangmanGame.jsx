import React, { useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const normalize = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const HangmanGame = ({ content = {}, onFinish }) => {
  const words = (content.words || []).filter((w) => w && (w.word || '').trim());
  const total = words.length;

  const [idx, setIdx] = useState(0);
  const [guessed, setGuessed] = useState([]);
  const [errors, setErrors] = useState(0);
  const [results, setResults] = useState([]);
  const [revealLoss, setRevealLoss] = useState(false);

  const current = words[idx];
  const rawWord = current ? normalize(current.word) : '';
  const displayChars = current ? normalize(current.word).split('') : [];

  const wonCount = results.filter((r) => r).length;
  const currentComplete = current && rawWord.split('').every((ch) => guessed.includes(ch));
  const lost = errors >= 6;

  const phaseDone = () => {
    const result = !lost;
    setResults((r) => [...r, result]);
    setRevealLoss(false);
    setErrors(0);
    setGuessed([]);
    if (idx + 1 >= total) {
      const allResults = [...results, result];
      const wins = allResults.filter(Boolean).length;
      setTimeout(() => onFinish({
        score: total ? Math.round((wins / total) * 100) : 0,
        answers: allResults.map((r, i) => ({
          question_id: words[i]?.id || `pal_${i + 1}`,
          user_answer: r ? words[i].word.toUpperCase() : 'Não acertou',
          correct_answer: words[i].word.toUpperCase(),
          is_correct: r,
          time_spent_seconds: 0,
          ai_explanation: r ? `Você acertou a palavra "${words[i].word}"!` : `A palavra era "${words[i].word}". Revise: ${words[i].hint}`,
        })),
      }), 350);
      return;
    }
    setIdx(idx + 1);
  };

  const guess = useCallback((letter) => {
    if (guessed.includes(letter) || lost || !current) return;
    const next = [...guessed, letter];
    if (rawWord.includes(letter)) {
      setGuessed(next);
    } else {
      setGuessed(next);
      setErrors((e) => e + 1);
    }
  }, [guessed, lost, current, rawWord]);

  React.useEffect(() => {
    if (currentComplete) {
      const t = setTimeout(phaseDone, 350);
      return () => clearTimeout(t);
    }
    if (lost) {
      setRevealLoss(true);
      const t = setTimeout(phaseDone, 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [currentComplete, lost]);

  const lostDisplay = useMemo(() => {
    if (errors === 0) return '🙂';
    const faces = ['🙂', '😯', '😟', '🤨', '😣', '😵', '💀'];
    return faces[Math.min(errors, 6)];
  }, [errors]);

  if (!total) {
    return <p className="text-sm text-muted-foreground text-center py-8">Nenhuma palavra configurada.</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-bold text-primary uppercase tracking-wide bg-primary/10 rounded-lg px-2.5 py-1">🎯 Forca</span>
          <span className="text-xs font-bold text-muted-foreground bg-muted rounded-lg px-2.5 py-1">Palavras: {Math.min(idx + 1, total)}/{total}</span>
          <span className="text-xs font-bold text-muted-foreground bg-muted rounded-lg px-2.5 py-1">Erros: {errors}/6 ({lostDisplay})</span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={cn('text-xs', i < errors ? 'text-destructive' : 'text-muted-foreground/40')}>●</span>
          ))}
        </div>
      </div>

      {current && (
        <div className="card-playful p-5 space-y-4">
          <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-center pt-2">
            {displayChars.map((ch, i) => (
              <span
                key={i}
                className={cn(
                  'w-8 h-10 sm:w-9 sm:h-11 flex items-center justify-center rounded-xl border-2 text-xl font-display font-bold',
                  ch === ' ' ? 'border-transparent' : 'border-border bg-muted/50',
                  guessed.includes(ch) && 'text-emerald-600',
                  revealLoss && !guessed.includes(ch) && ch !== ' ' && 'text-destructive',
                )}
              >
                {ch === ' ' ? '' : guessed.includes(ch) ? ch : '_'}
              </span>
            ))}
          </div>
          {current.hint && (
            <p className="text-center text-sm text-muted-foreground">💡 Dica: {current.hint}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-6 sm:grid-cols-7 gap-1.5 sm:gap-2">
        {LETTERS.map((ch) => {
          const state = guessed.includes(ch) ? (rawWord.includes(ch) ? 'ok' : 'err') : 'idle';
          return (
            <button
              key={ch}
              type="button"
              disabled={state !== 'idle' || lost}
              onClick={() => guess(ch)}
              className={cn(
                'aspect-square rounded-xl font-bold text-sm transition-all',
                state === 'idle' && 'bg-muted hover:bg-primary/10 hover:-translate-y-0.5 active:scale-95',
                state === 'ok' && 'bg-emerald-100 text-emerald-700',
                state === 'err' && 'bg-destructive/10 text-destructive line-through',
                lost && 'opacity-50',
              )}
            >
              {ch}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {wonCount > 0 && `✅ Palavras acertadas até agora: ${wonCount}. `}A cada {total} palavras concluídas, seu resultado é registrado!
      </p>
    </div>
  );
};

export default HangmanGame;