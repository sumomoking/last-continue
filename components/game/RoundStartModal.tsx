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
  goodCount,
  badCount,
  totalDeckCount,
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
  const finalGood = goodCount !== undefined ? goodCount : Math.ceil(totalDice / 2);
  const finalBad = badCount !== undefined ? badCount : Math.floor(totalDice / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md table-wood-rail border-2 border-amber-600/60 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        {/* Round Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-2">
          <span>✨</span>
          <span>ROUND INITIALIZATION</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-1 drop-shadow-md">
          ROUND {round} START
        </h2>
        <p className="text-xs text-slate-300 mb-4">
          ダイスを2個振り、今回のラウンドで使用するカード構成を決定しました。
        </p>

        {/* Felt Dice Tray */}
        <div className="tabletop-surface border border-amber-500/40 rounded-2xl p-4 mb-4 shadow-inner">
          <div className="text-[10px] font-mono font-bold text-amber-300 mb-2 uppercase tracking-widest flex items-center justify-center gap-1">
            <span>🎲</span>
            <span>2 PHYSICAL DICE ROLL</span>
          </div>

          <div className="flex items-center justify-center gap-6 my-2">
            <PhysicalDice value={displayDice[0]} isRolling={isRolling} size="lg" />
            <span className="text-2xl text-amber-200 font-black">+</span>
            <PhysicalDice value={displayDice[1]} isRolling={isRolling} size="lg" />
          </div>

          <div className="mt-3 text-sm font-bold text-slate-200">
            出目合計:{" "}
            <span className="text-amber-300 font-mono text-2xl font-black ml-1">
              {totalDice}
            </span>{" "}
            <span className="text-xs text-slate-400">枚のステージデッキ</span>
          </div>
        </div>

        {/* Initial GOOD / BAD breakdown revealed at round start */}
        {!isRolling ? (
          <div className="space-y-3 mb-5 animate-fade-in">
            <div className="p-3 bg-black/40 border border-amber-600/40 rounded-2xl">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 mb-2">
                📋 初期デッキ構成（最初のみ公開）
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-cyan-950/50 border border-cyan-400/60 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                    <span>🟦</span> GOOD
                  </div>
                  <span className="text-xl font-mono font-black text-cyan-200">
                    {finalGood} <span className="text-[10px] font-normal text-cyan-300/80">枚</span>
                  </span>
                </div>

                <div className="bg-red-950/50 border border-red-500/60 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-300">
                    <span>🟥</span> BAD
                  </div>
                  <span className="text-xl font-mono font-black text-red-200">
                    {finalBad} <span className="text-[10px] font-normal text-red-300/80">枚</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-amber-200/90 font-medium">
              🧠 プレイ中は残り枚数が隠れるので、この初期枚数を覚えて推理しよう！
            </p>
          </div>
        ) : (
          <div className="py-4 text-xs text-slate-400 animate-pulse">
            🎲 ダイスロール中...
          </div>
        )}

        {/* Start Button */}
        <button
          type="button"
          disabled={isRolling}
          onClick={onConfirm}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-base tracking-wider rounded-xl shadow-lg shadow-amber-950/60 border border-amber-200 transition cursor-pointer active:scale-98"
        >
          ラウンドを開始する
        </button>
      </div>
    </div>
  );
};
