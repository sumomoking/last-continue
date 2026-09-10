'use client';

import React, { useState, useEffect } from 'react';

interface RoundStartModalProps {
  round: number;
  diceResults: [number, number];
  goodCount: number;
  badCount: number;
  totalDeckCount: number;
  onConfirm: () => void;
}

export const RoundStartModal: React.FC<RoundStartModalProps> = ({
  round,
  diceResults,
  goodCount,
  badCount,
  totalDeckCount,
  onConfirm,
}) => {
  const [isRolling, setIsRolling] = useState(true);
  const [displayDice, setDisplayDice] = useState<[number, number]>([1, 1]);

  useEffect(() => {
    // ダイス回転アニメーション演出
    let count = 0;
    const interval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setDisplayDice(diceResults);
        setIsRolling(false);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [diceResults]);

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Round Badge */}
        <div className="inline-block px-3 py-1 bg-red-600/20 border border-red-500/40 rounded-full text-xs font-mono font-bold text-red-400 mb-2">
          ROUND INITIALIZATION
        </div>
        <h2 className="text-3xl font-black text-white mb-1">
          ROUND {round} START
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          ダイスを2個振り、今回のラウンドで使用するカード枚数を決定します。
        </p>

        {/* Dice Area */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 mb-6">
          <div className="text-xs font-mono font-bold text-slate-400 mb-3 uppercase tracking-wider">
            2 DICE ROLL
          </div>
          <div className="flex items-center justify-center gap-4 text-5xl sm:text-6xl text-cyan-400 mb-3 select-none">
            <span className={`inline-block p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner ${isRolling ? 'animate-spin' : ''}`}>
              {diceFaces[displayDice[0] - 1]}
            </span>
            <span className="text-2xl text-slate-500 font-bold">+</span>
            <span className={`inline-block p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner ${isRolling ? 'animate-spin' : ''}`}>
              {diceFaces[displayDice[1] - 1]}
            </span>
          </div>

          <div className="text-sm font-bold text-slate-300">
            出目合計:{' '}
            <span className="text-cyan-400 font-mono text-xl font-black">
              {displayDice[0] + displayDice[1]}
            </span>{' '}
            枚
          </div>
        </div>

        {/* Good/Bad Stage Breakdown Announcement */}
        {!isRolling && (
          <div className="space-y-4 mb-6 animate-fade-in">
            <div className="text-xs font-bold text-slate-300">
              📊 今回のステージデッキ内訳（公開情報）
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cyan-950/40 border border-cyan-500/40 rounded-xl p-3">
                <div className="text-xs font-bold text-cyan-300 mb-1">🟦 GOOD STAGE</div>
                <div className="text-2xl font-black text-cyan-400 font-mono">{goodCount} <span className="text-xs font-normal">枚</span></div>
              </div>
              <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3">
                <div className="text-xs font-bold text-red-400 mb-1">🟥 BAD STAGE</div>
                <div className="text-2xl font-black text-red-500 font-mono">{badCount} <span className="text-xs font-normal">枚</span></div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              ※カードの順番はシャッフルされており非公開です。
            </p>
          </div>
        )}

        {/* Start Button */}
        <button
          type="button"
          disabled={isRolling}
          onClick={onConfirm}
          className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-base tracking-wider rounded-xl shadow-lg shadow-red-900/50 transition cursor-pointer"
        >
          ラウンドを開始する ➔
        </button>
      </div>
    </div>
  );
};
