import React, { useMemo, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const MemoryGame = ({ content = {}, onFinish }) => {
  const pairs = content.pairs || [];
  const deck = useMemo(
    () => shuffle(pairs.flatMap((p, i) => [
      { key: `${p.id || i}-l`, pairIdx: i, text: p.left, side: 'l' },
      { key: `${p.id || i}-r`, pairIdx: i, text: p.right, side: 'r' },
    ])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [content.pairs],
  );

  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState({});
  const [wrongShown, setWrongShown] = useState({});
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);

  const matchedCount = Object.keys(matched).length;
  const done = matchedCount === pairs.length && pairs.length > 0;

  const score = done ? Math.min(100, Math.max(40, Math.round(100 * (pairs.length / Math.max(1, moves))))) : 0;

  const flip = useCallback((idx) => {
    if (lock || flipped.includes(idx) || matched[deck[idx].pairIdx]) return;
    const next = [...flipped, idx];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next;
      if (deck[a].pairIdx === deck[b].pairIdx) {
        setMatched((m) => ({ ...m, [deck[a].pairIdx]: true }));
        setFlipped([]);
      } else {
        setWrongShown((w) => ({
          ...w,
          [deck[a].pairIdx]: true,
          [deck[b].pairIdx]: true,
        }));
        setLock(true);
        setTimeout(() => {
          setFlipped([]);
          setLock(false);
        }, 750);
      }
    }
  }, [flipped, lock, matched, deck]);

  React.useEffect(() => {
    if (done) {
      const timer = setTimeout(() => onFinish({
        score,
        answers: pairs.map((p, i) => ({
          question_id: p.id || `par_${i + 1}`,
          user_answer: p.right,
          correct_answer: p.right,
          is_correct: !wrongShown[i],
          time_spent_seconds: moves,
          ai_explanation: wrongShown[i]
            ? 'Você precisou de novas tentativas para achar este par. Revise os conceitos!'
            : `Pareamento de "${p.left}" com "${p.right}" concluído de primeira!`,
        })),
      }), 700);
      return () => clearTimeout(timer);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const cols = deck.length <= 8 ? 'grid-cols-2 sm:grid-cols-3' : deck.length <= 12 ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-4 sm:grid-cols-5';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-bold text-primary uppercase tracking-wide bg-primary/10 rounded-lg px-2.5 py-1">🃏 Jogo da Memória</span>
          <span className="text-xs font-bold text-muted-foreground bg-muted rounded-lg px-2.5 py-1">Pares: {matchedCount}/{pairs.length}</span>
          <span className="text-xs font-bold text-muted-foreground bg-muted rounded-lg px-2.5 py-1">Jogadas: {moves}</span>
        </div>
        {done && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">🎉 Completou com {moves} jogadas!</span>}
      </div>

      <div className={cn('grid gap-2.5 sm:gap-3', cols)}>
        {deck.map((card, idx) => {
          const isUp = flipped.includes(idx) || matched[card.pairIdx];
          const isMatched = matched[card.pairIdx];
          return (
            <button
              key={card.key}
              type="button"
              disabled={isUp || lock}
              onClick={() => flip(idx)}
              className={cn(
                'relative aspect-[5/4] rounded-2xl transition-all duration-300 text-sm font-bold flex items-center justify-center p-2 text-center select-none',
                !isUp && 'bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-md hover:-translate-y-0.5 hover:shadow-lg active:scale-95',
                isUp && !isMatched && 'bg-amber-100 border-2 border-amber-400 text-amber-900',
                isMatched && 'bg-emerald-100 border-2 border-emerald-400 text-emerald-900',
              )}
            >
              {!isUp ? <span className="text-3xl">🃏</span> : <span className="leading-tight">{card.text}</span>}
            </button>
          );
        })}
      </div>

      {!done && (
        <p className="text-xs text-muted-foreground text-center">
          Os pares são feitos de <b>conceito ↔ definição</b>. Encontre os pares corretos!
        </p>
      )}
    </div>
  );
};

export default MemoryGame;