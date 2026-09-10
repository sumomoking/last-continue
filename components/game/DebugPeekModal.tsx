'use client';

import React, { useState } from 'react';
import { CardType } from '../../types/game';

interface DebugPeekModalProps {
  card: CardType;
  onClose: () => void;
}

export const DebugPeekModal: React.FC<DebugPeekModalProps> = ({ card, onClose }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/60 text-center relative overflow-hidden">
        {/* Header */}
        <div className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-xs font-mono font-bold text-cyan-300 mb-3">
          🔍 DEBUG MODE
        </div>
        <h3 className="text-xl font-black text-white mb-2">ステージデッキ先頭の確認</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          他のプレイヤーに見られないよう注意してください。<br />
          確認後、カードは順番を変えずに山札の先頭へ戻されます。
        </p>

        {/* Secret Blind Area */}
        {!isRevealed ? (
          <button
            type="button"
            onClick={() => setIsRevealed(true)}
            className="w-full py-12 px-4 rounded-2xl bg-slate-800/80 border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 flex flex-col items-center justify-center transition group cursor-pointer"
          >
            <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">👁️</span>
            <span className="text-sm font-bold text-cyan-300">タップしてカードを覗く</span>
            <span className="text-[11px] text-slate-500 mt-1">（あなただけに見えます）</span>
          </button>
        ) : (
          <div
            className={`w-full py-8 px-4 rounded-2xl border-2 flex flex-col items-center justify-center animate-fade-in ${
              card === 'GOOD'
                ? 'bg-cyan-950/40 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-red-950/40 border-red-500 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            }`}
          >
            <div className="text-5xl mb-2">{card === 'GOOD' ? '🟦' : '🟥'}</div>
            <div className="text-2xl font-black tracking-wider">
              {card === 'GOOD' ? 'GOOD STAGE' : 'BAD STAGE'}
            </div>
            <p className="text-xs text-slate-300 mt-2">
              {card === 'GOOD'
                ? '次はGOODです！自分で引けば安全にターンを継続できます。'
                : '次はBADです！他人に引かせて残機を削るチャンスです。'}
            </p>
          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition cursor-pointer"
        >
          確認完了（閉じる）
        </button>
      </div>
    </div>
  );
};
