import React from 'react';
import { EXPLORATION_REDEEM_ITEMS } from './worldContent';

export default function ShopModal({ points, onRedeem, onClose }) {
  return (
    <div className="absolute inset-0 z-[96] bg-black/45 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="w-[22rem] bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <h2 className="font-bold text-sm">🛒 Loja do Explorador</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white font-black text-lg leading-none px-1">✕</button>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500 mb-3">
            💎 Seus Pontos de Exploração: <b className="text-indigo-600">{points || 0}</b>
          </p>
          <div className="grid gap-2">
            {EXPLORATION_REDEEM_ITEMS.map((item) => {
              const afford = (points || 0) >= item.points;
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                    {item.type === 'seed' && <p className="text-[10px] text-gray-500">Vai para o inventário da fazenda</p>}
                    {item.type === 'material' && <p className="text-[10px] text-gray-500">Constrói a ponte e mais</p>}
                    {item.type === 'decor' && <p className="text-[10px] text-gray-500">Decoração celebrativa 🎉</p>}
                  </div>
                  <button
                    onClick={() => afford && onRedeem(item)}
                    disabled={!afford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${afford ? 'bg-amber-500 text-white hover:bg-amber-400' : 'bg-gray-100 text-gray-400'}`}
                  >
                    💎 {item.points}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}