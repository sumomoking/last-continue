'use client';

import React from 'react';
import { PioneerPlayer } from '../../types/pioneer';
import { PIONEER_CARDS } from '../../constants/pioneer';
import { soundManager } from '../../lib/sound';

interface PioneerRoundSummaryModalProps {
  round: number;
  maxRounds: number;
  players: PioneerPlayer[];
  onNext: () => void;
}

export const PioneerRoundSummaryModal: React.FC<PioneerRoundSummaryModalProps> = ({
  round,
  maxRounds,
  players,
  onNext,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-stone-900 via-[#1c1917] to-[#0f0e0c] border-3 border-amber-600/70 rounded-3xl p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-2">
          📜 第 {round} ターン 収穫報告書
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-amber-100 tracking-wide mb-1 drop-shadow">
          開拓成果と物資の集計
        </h2>
        <p className="text-xs text-stone-400 mb-6 font-sans">
          全開拓団の派遣結果と今ターンの獲得資源一覧です。
        </p>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {players.map((player) => {
            const card = player.selectedCard ? PIONEER_CARDS[player.selectedCard] : null;
            const gained = player.lastGainedResources || { WHEAT: 0, LUMBER: 0, ORE: 0 };
            const hasGained = gained.WHEAT > 0 || gained.LUMBER > 0 || gained.ORE > 0;
            const settlementCount = Math.min(player.resources.WHEAT, player.resources.LUMBER, player.resources.ORE);

            return (
              <div
                key={player.id}
                className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between text-left shadow-md relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span>{player.meepleIcon}</span>
                    <span className="font-bold text-sm text-stone-200">{player.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-bold">
                    開拓地: {settlementCount} 軒
                  </span>
                </div>

                {/* Card Played */}
                <div className="flex items-center gap-2 my-2 p-2 rounded-xl bg-stone-900 border border-stone-800">
                  {card && (
                    <>
                      <span className="text-xl">{card.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-amber-100 truncate">{card.name}</div>
                        <div className="text-[10px] text-stone-400">
                          {card.category === 'DEV' ? '📜 発展カード発動' : '🗺️ 地形派遣'}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Gained This Round */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-400 font-sans text-[11px]">獲得物資:</span>
                  {hasGained ? (
                    <div className="flex items-center gap-1.5 font-mono font-black text-amber-300">
                      {gained.WHEAT > 0 && <span>🌾 +{gained.WHEAT}</span>}
                      {gained.LUMBER > 0 && <span>🪵 +{gained.LUMBER}</span>}
                      {gained.ORE > 0 && <span>⛏️ +{gained.ORE}</span>}
                    </div>
                  ) : (
                    <span className="text-stone-500 font-mono text-[11px]">獲得なし (0個)</span>
                  )}
                </div>

                {/* Current Stock */}
                <div className="mt-2 pt-1 flex items-center justify-between text-[11px] font-mono text-stone-300">
                  <span className="text-stone-500">所持累計:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300">🌾 {player.resources.WHEAT}</span>
                    <span className="text-emerald-300">🪵 {player.resources.LUMBER}</span>
                    <span className="text-slate-300">⛏️ {player.resources.ORE}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onNext();
          }}
          className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 font-black font-serif text-stone-950 text-base shadow-[0_10px_25px_rgba(245,158,11,0.5)] transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {round < maxRounds ? `第 ${round + 1} ターン（次ラウンド）へ進む ➔` : '🏆 最終集計（筆頭開拓者の決定）へ ➔'}
        </button>
      </div>
    </div>
  );
};
