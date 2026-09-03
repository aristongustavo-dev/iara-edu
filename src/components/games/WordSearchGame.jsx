import React, { useMemo, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Cell = React.memo(({ ch, state, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-7 h-7 sm:w-8 sm:h-8 rounded-md text-sm font-bold flex items-center justify-center transition-all select-none',
      state === 'idle' && 'bg-muted/80 text-foreground hover:bg-primary/15 hover:scale-110',
      state === 'selected' && 'bg-primary/25 ring-2 ring-primary text-primary scale-105',
      state === 'found' && 'bg-emerald-400 text-emerald-950 ring-2 ring-emerald-600 scale-105',
      state === 'invalid' && 'bg-destructive/20 text-destructive',
    )}
  >
    {ch}
  </button>
));
Cell.displayName = 'Cell';

const WordSearchGame = ({ content = {}, onFinish }) => {
  const words = useMemo(
    () => (content.words || []).map((w) => String(w).toUpperCase()).filter((w) => w.length >= 2),
    [content.words],
  );
  const size = Math.min(14, Math.max(10, Math.ceil(Math.sqrt(words.reduce((a, w) => a + w.length, 0)) + 3)));

  const { grid, placed, placedByIndex } = useMemo(() => buildGrid(words, size), [words, size]);

  const [selection, setSelection] = useState([]);
  const [found, setFound] = useState([]);
  const [invalid, setInvalid] = useState(false);
  const [message, setMessage] = useState('');
  const doneRef = useRef(false);

  const foundSet = useMemo(() => new Set(found), [found]);
  const cellFoundIdx = useMemo(() => {
    const map = {};
    placed.forEach((p, pi) => p.cells.forEach((c) => { map[c] = pi; }));
    return map;
  }, [placed]);

  const cellStates = useMemo(() => {
    const states = {};
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        const key = `${r},${c}`;
        const selIdx = selection.indexOf(key);
        if (selIdx >= 0) states[key] = 'selected';
        else if (foundSet.has(cellFoundIdx[key])) states[key] = 'found';
        else states[key] = 'idle';
        if (invalid && selection.includes(key)) states[key] = 'invalid';
      }
    }
    return states;
  }, [selection, foundSet, cellFoundIdx, size, invalid]);

  const handleCell = (r, c) => {
    const key = `${r},${c}`;
    setSelection((prev) => {
      if (prev.includes(key)) return prev;
      if (prev.length >= Math.max(3, ...words.map((w) => w.length)) + 2) return prev;
      return [...prev, key];
    });
    setInvalid(false);
  };

  const tryComplete = () => {
    if (selection.length < 2) return;
    const letters = selection.map((key) => {
      const [r, c] = key.split(',').map(Number);
      return grid[r][c];
    }).join('');
    const reversed = letters.split('').reverse().join('');

    const isStraightLine = selection.every((key, i) => {
      if (i === 0) return true;
      const [r0, c0] = selection[0].split(',').map(Number);
      const [r1, c1] = key.split(',').map(Number);
      const d = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
      return d === i;
    });

    if (!isStraightLine) {
      setInvalid(true);
      setMessage('Selecione uma linha reta!');
      setTimeout(() => { setInvalid(false); setSelection([]); }, 700);
      return;
    }

    let matched = null;
    placed.forEach((p, pi) => {
      if (foundSet.has(pi)) return;
      const pWord = p.word;
      if (pWord === letters || pWord === reversed) matched = pi;
    });

    if (matched !== null) {
      setFound((f) => [...f, matched]);
      setMessage(`🎉 Encontrou: ${placed[matched].word}`);
      setSelection([]);
    } else {
      setInvalid(true);
      setMessage('Essa palavra não está na lista. Tente outra!');
      setTimeout(() => { setInvalid(false); setSelection([]); }, 900);
    }
  };

  const finishEarly = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    const score = placed.length ? Math.round((found.length / placed.length) * 100) : 0;
    onFinish({
      score,
      answers: placed.map((p, pi) => ({
        question_id: `caca_${pi + 1}`,
        user_answer: foundSet.has(pi) ? p.word : '',
        correct_answer: p.word,
        is_correct: foundSet.has(pi),
        time_spent_seconds: 0,
        ai_explanation: foundSet.has(pi)
          ? `Você encontrou "${p.word}"!`
          : `A palavra "${p.word}" não foi encontrada. Explore mais a sopa de letras!`,
      })),
    });
  };

  useEffect(() => {
    if (placed.length && found.length === placed.length) {
      finishEarly();
    }
  }, [found.length, placed.length]);

  const allFound = placed.length > 0 && found.length === placed.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs font-bold text-primary uppercase tracking-wide bg-primary/10 rounded-lg px-2.5 py-1">🔎 Caça-palavras</span>
          <span className="text-xs font-bold text-muted-foreground bg-muted rounded-lg px-2.5 py-1">Encontradas: {found.length}/{placed.length}</span>
        </div>
        {!allFound && (
          <button
            type="button"
            onClick={finishEarly}
            className="text-xs font-bold text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          >
            Finalizar agora →
          </button>
        )}
      </div>

      {message && (
        <div className={cn(
          'text-sm font-semibold text-center rounded-xl px-3 py-2',
          invalid ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 border border-emerald-200 text-emerald-700',
        )}>
          {message}
        </div>
      )}

      <div className="grid place-items-center">
        <div
          className="inline-grid gap-1 rounded-2xl bg-muted/60 p-2.5"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0,1fr))` }}
        >
          {grid.flatMap((row, r) =>
            row.map((ch, c) => (
              <Cell
                key={`${r}-${c}`}
                ch={ch}
                state={cellStates[`${r},${c}`] || 'idle'}
                onClick={() => handleCell(r, c)}
              />
            )),
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {placed.map((p, pi) => {
          const isFound = foundSet.has(pi);
          return (
<div
          key={pi}
          className={cn(
            'rounded-xl px-3 py-2 text-sm font-bold text-center border',
            isFound
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-muted/70 border-border text-muted-foreground',
          )}
        >
          {isFound ? '✅ ' : ''}{p.word}
        </div>
          );
        })}
      </div>

      {!allFound && (
        <p className="text-xs text-muted-foreground text-center">
          Clique nas letras de uma palavra na ordem correta (linha reta: diagonal, vertical ou horizontal). Depois toque em
          {' '}<b>Finalizar agora</b> ou encontre todas!
        </p>
      )}
    </div>
  );
};

const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [1, -1],
  [0, -1], [-1, 0], [-1, -1], [-1, 1],
];

const buildGrid = (wordList, size) => {
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const placed = [];
  const sorted = [...wordList].sort((a, b) => b.length - a.length);

  sorted.forEach((word) => {
    const height = word.length;
    const attempts = [];
    const maxTries = 60;
    for (let t = 0; t < maxTries; t += 1) {
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);
      const cells = [];
      let ok = true;
      for (let i = 0; i < height; i += 1) {
        const r = startR + dir[0] * i;
        const c = startC + dir[1] * i;
        if (r < 0 || r >= size || c < 0 || c >= size) { ok = false; break; }
        const existing = grid[r][c];
        if (existing && existing !== word[i]) { ok = false; break; }
        cells.push(`${r},${c}`);
      }
      if (ok) attempts.push({ cells, word, letterCells: cells.map((key) => key.split(',').map(Number)) });
    }
    if (attempts.length) {
      const chosen = attempts[Math.floor(Math.random() * attempts.length)];
      chosen.cells.forEach((key, i) => {
        grid[Number(key.split(',')[0])][Number(key.split(',')[1])] = word[i];
      });
      placed.push(chosen);
    }
  });

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (!grid[r][c]) grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
  }

  const placedByIndex = {};
  placed.forEach((p, pi) => p.cells.forEach((c) => { placedByIndex[c] = pi; }));
  return { grid, placed, placedByIndex };
};

export default WordSearchGame;