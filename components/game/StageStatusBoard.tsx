'use client';

import React from 'react';
import { CardType } from '../../types/game';

interface StageStatusBoardProps {
  round: number;
  stageDeck: CardType[];
}

export const StageStatusBoard: React.FC<StageStatusBoardProps> = ({ round, stageDeck }) => {
  const goodCount = stageDeck.filter((c) => c === 'GOOD').length;
  const badCount = stageDeck.filter((c) => c === 'BAD').length;
  const totalCount = stageDeck.length;

  const badRate = totalCount > 0 ? (badCount / totalCount) * 100 : 0;
  const goodRate = totalCount > 0 ? (goodCount / totalCount) * 100 : 0;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
      {/* Top Header: Round & Total Deck Count */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-md bg-red-600/20 text-red-400 font-mono font-bold text-xs border border-red-500/30">
            STAGE INFO
          </span>
          <h2 className="text-lg font-black tracking-wider text-white">
            ROUND {round}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">残りデッキ: </span>
          <span className="font-mono font-black text-cyan-400 text-base">{totalCount}</span>
          <span className="text-xs text-slate-500"> 枚</span>
        </div>
      </div>

      {/* Main Stats: Good vs Bad Count */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Good Cards Count */}
        <div className="bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-xs font-bold text-cyan-300 tracking-wider flex items-center gap-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            GOOD STAGE
          </div>
          <div className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">
            {goodCount} <span className="text-xs text-cyan-500 font-sans font-normal">枚</span>
          </div>
          <div className="text-[11px] font-mono text-cyan-400/70 mt-0.5">
            確率: {goodRate.toFixed(1)}%
          </div>
        </div>

        {/* Bad Cards Count */}
        <div className="bg-red-950/30 border border-red-500/40 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-xs font-bold text-red-400 tracking-wider flex items-center gap-1 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            BAD STAGE
          </div>
          <div className="text-3xl sm:text-4xl font-black text-red-500 font-mono">
            {badCount} <span className="text-xs text-red-400/80 font-sans font-normal">枚</span>
          </div>
          <div className="text-[11px] font-mono text-red-400/80 mt-0.5 font-bold">
            被弾率: {badRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Probability Gauge Bar */}
      <div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span>SAFE 確率</span>
          <span className="text-red-400 font-bold">BAD 危険度: {badRate.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex border border-slate-700/50">
          <div
            className="bg-cyan-400 transition-all duration-500 ease-out"
            style={{ width: `${goodRate}%` }}
          />
          <div
            className="bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500 ease-out animate-pulse"
            style={{ width: `${badRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};
