import React, { useState } from 'react';

const Overlay = ({ title, onClose, children, wide }) => (
  <div className="absolute inset-0 z-[96] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
    <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto`}>
      <div className="sticky top-0 flex items-center justify-between px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="font-bold text-sm">{title}</h2>
        <button onClick={onClose} className="text-white/80 hover:text-white font-black text-lg leading-none px-1">✕</button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

export default function ChallengeModal({ subject, questions, onCorrect, onDone, points }) {
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState(null);

  const q = questions[idx];
  if (!q) return null;

  const answer = (i) => {
    if (picked !== null) return;
    setPicked(i);
    const isRight = i === q.a;
    if (isRight) {
      setCorrect((c) => c + 1);
      onCorrect && onCorrect();
    }
    setTimeout(() => {
      setPicked(null);
      if (idx + 1 >= questions.length) onDone(correct + (isRight ? 1 : 0));
      else setIdx(idx + 1);
    }, 900);
  };

  const header = subject ? (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: subject.color || '#7c3aed' }}>
        {subject.emoji || '🧠'}
      </span>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-800">{subject.subject || subject.label}</p>
        {points !== undefined && (
          <p className="text-[11px] text-gray-500">💎 Pontos de Exploração na carteira: {points}</p>
        )}
      </div>
      <span className="text-xs font-bold text-gray-400">{correct}/{idx + (picked !== null ? 1 : 0)} certas</span>
    </div>
  ) : null;

  return (
    <Overlay title={`${subject?.emoji || '🧠'} ${subject?.label || 'Desafio'} — ${idx + 1}/${questions.length}`} onClose={() => onDone(correct)}>
      {header}
      <p className="text-gray-800 font-semibold text-sm mb-3">{q.q}</p>
      <div className="grid gap-2">
        {q.opts.map((o, i) => {
          let cls = 'bg-gray-100 hover:bg-indigo-100 border-gray-200 text-gray-800';
          if (picked !== null) {
            if (i === q.a) cls = 'bg-green-100 border-green-400 text-green-800';
            else if (i === picked) cls = 'bg-red-100 border-red-400 text-red-700';
            else cls = 'bg-gray-50 border-gray-200 text-gray-400';
          }
          return (
            <button key={i} onClick={() => answer(i)} className={`text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${cls}`}>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <p className="mt-3 text-center text-xs font-bold text-indigo-600">
          {picked === q.a ? '✅ Certo! Pontos de Exploração ganhos.' : `😢 Errou! Resposta certa: ${q.opts[q.a]}`}
        </p>
      )}
    </Overlay>
  );
}