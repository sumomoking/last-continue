'use client';

import React from 'react';

interface RoundClearModalProps {
  round: number;
  onNextRound: () => void;
}

export const RoundClearModal: React.FC<RoundClearModalProps> = ({ round, onNextRound }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md table-wood-rail border-2 border-amber-600/60 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        {/* Glow decoration */}
        <div className="text-5xl mb-2 animate-bounce">
          ✨
        </div>
        <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-2">
          ROUND COMPLETE
        </div>
        <h2 className="text-3xl font-black text-white mb-2 drop-shadow-md">
          ROUND {round} CLEAR!
        </h2>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          ステージデッキのカードがすべて消費されました！<br />
          次ラウンド開始時に、生存している全プレイヤーへ <strong className="text-amber-300">アイテムカードが2枚</strong> 補充されます。
        </p>

        <button
          type="button"
          onClick={onNextRound}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base tracking-wider rounded-xl shadow-lg shadow-amber-950/60 border border-amber-200 transition cursor-pointer active:scale-98"
        >
          次のラウンドへ進む
        </button>
      </div>
    </div>
  );
};
