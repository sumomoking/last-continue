'use client';

import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../lib/sound';

interface RoundClearModalProps {
  round: number;
  onNextRound: () => void;
}

export const RoundClearModal: React.FC<RoundClearModalProps> = ({ round, onNextRound }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    soundManager.playRoundClear();
    setTimeLeft(5);
    hasTriggeredRef.current = false;

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const autoNextTimer = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onNextRound();
      }
    }, 5000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(autoNextTimer);
    };
  }, [onNextRound]);

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
        <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-2 shadow-inner">
          ROUND COMPLETE
        </div>
        <h2 className="text-3xl font-black text-white mb-2 drop-shadow-md">
          ROUND {round} CLEAR!
        </h2>
        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          ステージデッキのカードがすべて消費されました！<br />
          次ラウンド開始時に、生存している全プレイヤーへ <strong className="text-amber-300">アイテムカードが2枚</strong> 補充されます。
        </p>

        {/* 5-second Countdown Progress Bar without button */}
        <div className="w-full space-y-2">
          <div className="w-full bg-black/50 border border-amber-600/30 rounded-full h-2.5 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(timeLeft / 5) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-center text-xs text-amber-200/90 font-mono gap-1.5 py-1">
            <span className="animate-spin text-amber-400">⏳</span>
            <span>{timeLeft}秒後に自動で次ラウンド（ダイスロール）へ進みます...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
