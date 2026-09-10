'use client';

import React from 'react';

interface RoundClearModalProps {
  round: number;
  onNextRound: () => void;
}

export const RoundClearModal: React.FC<RoundClearModalProps> = ({ round, onNextRound }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50 text-center relative overflow-hidden">
        {/* Glow decoration */}
        <div className="text-5xl mb-3 animate-bounce">
          ✨
        </div>
        <div className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-xs font-mono font-bold text-cyan-300 mb-2">
          ROUND COMPLETE
        </div>
        <h2 className="text-3xl font-black text-white mb-2">
          ROUND {round} CLEAR!
        </h2>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          ステージデッキのカードがすべて消費されました！<br />
          次ラウンド開始時に、生存している全プレイヤーへ<strong>アイテムカードが2枚</strong>補充されます。
        </p>

        <button
          type="button"
          onClick={onNextRound}
          className="w-full py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base tracking-wider rounded-xl shadow-lg shadow-cyan-900/50 transition cursor-pointer"
        >
          次のラウンドへ進む ➔
        </button>
      </div>
    </div>
  );
};
