"use client";

import React, { useState, useEffect } from "react";
import { PhysicalDice } from "../tabletop/PhysicalDice";

interface RoundStartModalProps {
  round: number;
  diceResults: [number, number];
  goodCount?: number;
  badCount?: number;
  totalDeckCount?: number;
  onConfirm: () => void;
}

export const RoundStartModal: React.FC<RoundStartModalProps> = ({
  round,
  diceResults,
  onConfirm,
}) => {
  const [isRolling, setIsRolling] = useState(true);
  const [displayDice, setDisplayDice] = useState<[number, number]>([1, 1]);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      setDisplayDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setDisplayDice(diceResults);
        setIsRolling(false);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [diceResults]);

  const totalDice = displayDice[0] + displayDice[1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md table-wood-rail border-2 border-amber-600/60 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Round Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-2">
          <span>✨</span>
          <span>ROUND INITIALIZATION</span>
        </div>
        <h2 className="text-3xl font-black text-white mb-1 drop-shadow-md">
          ROUND {round} START
        </h2>
        <p className="text-xs text-slate-300 mb-5">
          ダイスを2個振り、今回のラウンドで使用するカード枚数を決定します。
        </p>

        {/* Felt Dice Tray */}
        <div className="tabletop-surface border border-emerald-500/40 rounded-2xl p-5 mb-6 shadow-inner">
          <div className="text-[10px] font-mono font-bold text-emerald-300 mb-3 uppercase tracking-widest flex items-center justify-center gap-1">
            <span>🎲</span>
            <span>2 PHYSICAL DICE ROLL</span>
          </div>

          <div className="flex items-center justify-center gap-6 my-2">
            <PhysicalDice value={displayDice[0]} isRolling={isRolling} size="lg" />
            <span className="text-2xl text-amber-200 font-black">+</span>
            <PhysicalDice value={displayDice[1]} isRolling={isRolling} size="lg" />
          </div>

          <div className="mt-4 text-sm font-bold text-slate-200">
            出目合計:{" "}
            <span className="text-amber-300 font-mono text-2xl font-black ml-1">
              {totalDice}
            </span>{" "}
            <span className="text-xs text-slate-400">枚のステージデッキ</span>
          </div>
        </div>

        {!isRolling && (
          <p className="text-xs text-amber-200/90 font-medium mb-5 animate-fade-in">
            ※出たカード（GOOD / BAD）の枚数を記憶しながら推理して生き残ろう！
          </p>
        )}

        {/* Start Button */}
        <button
          type="button"
          disabled={isRolling}
          onClick={onConfirm}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-base tracking-wider rounded-xl shadow-lg shadow-amber-950/60 border border-amber-200 transition cursor-pointer"
        >
          ラウンドを開始する ➔
        </button>
      </div>
    </div>
  );
};
