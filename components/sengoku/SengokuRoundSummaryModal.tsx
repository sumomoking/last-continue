'use client';

import React from 'react';
import { SengokuPlayer } from '../../types/sengoku';
import { SENGOKU_CARDS, RESOURCE_CONFIG } from '../../constants/sengoku';
import { soundManager } from '../../lib/sound';

interface SengokuRoundSummaryModalProps {
  round: number;
  maxRounds: number;
  players: SengokuPlayer[];
  onNext: () => void;
}

export const SengokuRoundSummaryModal: React.FC<SengokuRoundSummaryModalProps> = ({
  round,
  maxRounds,
  players,
  onNext,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#04060a] border-2 border-cyan-500/60 rounded-3xl p-5 sm:p-8 shadow-[0_20px_50px_rgba(6,182,212,0.3)] text-center relative overflow-hidden">
        {/* Neon Accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-xs font-mono font-bold text-cyan-300 mb-2">
          📜 第 {round} 巡（ラウンド）結果報告
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide mb-1 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          収穫と合戦の戦況集計
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          全武将の行動結果と今ターンの獲得資源一覧です。
        </p>

        {/* Players Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {players.map((player) => {
            const card = player.selectedCard ? SENGOKU_CARDS[player.selectedCard] : null;
            const gained = player.lastGainedResources || { RICE: 0, WOOD: 0, IRON: 0 };
            const hasGained = gained.RICE > 0 || gained.WOOD > 0 || gained.IRON > 0;

            return (
              <div
                key={player.id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between text-left shadow-md relative overflow-hidden"
              >
                {/* Mon pattern top ribbon */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span className="font-bold text-sm text-slate-200">{player.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800">
                    {player.monPattern}
                  </span>
                </div>

                {/* Card Played */}
                <div className="flex items-center gap-2 my-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  {card && (
                    <>
                      <span className="text-xl">{card.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{card.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {card.category === 'EVENT' ? '⚡ 特殊戦術札' : '🚩 拠点出撃'}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Gained Resources This Turn */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">獲得物資:</span>
                  {hasGained ? (
                    <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
                      {gained.RICE > 0 && <span>🌾 +{gained.RICE}</span>}
                      {gained.WOOD > 0 && <span>🪵 +{gained.WOOD}</span>}
                      {gained.IRON > 0 && <span>⚙️ +{gained.IRON}</span>}
                    </div>
                  ) : (
                    <span className="text-slate-500 font-mono text-[11px]">獲得なし (0個)</span>
                  )}
                </div>

                {/* Current Total Inventory */}
                <div className="mt-2 pt-1 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="text-slate-500">所持累計:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300">🌾 {player.resources.RICE}</span>
                    <span className="text-emerald-300">🪵 {player.resources.WOOD}</span>
                    <span className="text-cyan-300">⚙️ {player.resources.IRON}</span>
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
          className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 hover:from-cyan-400 hover:to-teal-400 font-black font-serif text-slate-950 text-base shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {round < maxRounds ? `第 ${round + 1} 巡（次ラウンド）へ進む ➔` : '🏆 最終集計（天下統一者の決定）へ ➔'}
        </button>
      </div>
    </div>
  );
};
