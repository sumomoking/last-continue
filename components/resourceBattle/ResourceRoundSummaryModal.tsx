'use client';

import React from 'react';
import { BattlePlayer } from '../../types/resourceBattle';
import { GAME_CARDS } from '../../constants/resourceBattle';
import { soundManager } from '../../lib/sound';

interface ResourceRoundSummaryModalProps {
  round: number;
  maxRounds: number;
  players: BattlePlayer[];
  onNext: () => void;
}

export const ResourceRoundSummaryModal: React.FC<ResourceRoundSummaryModalProps> = ({
  round,
  maxRounds,
  players,
  onNext,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-[#0f172a] to-[#080d1a] border-2 border-cyan-500/70 rounded-3xl p-5 sm:p-8 shadow-[0_20px_60px_rgba(6,182,212,0.3)] text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/40 rounded-full text-xs font-mono font-bold text-cyan-300 mb-2">
          📜 第 {round} ターン 獲得結果
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide mb-1">
          資源獲得の集計
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          全プレイヤーが出したカードと、今ターンの獲得資源一覧です。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {players.map((player) => {
            const card = player.selectedCard ? GAME_CARDS[player.selectedCard] : null;
            const gained = player.lastGainedResources || { WOOD: 0, RICE: 0, IRON: 0 };
            const hasGained = gained.WOOD > 0 || gained.RICE > 0 || gained.IRON > 0;
            const setCount = Math.min(player.resources.WOOD, player.resources.RICE, player.resources.IRON);

            return (
              <div
                key={player.id}
                className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between text-left shadow-md relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-200">{player.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                    完成セット: {setCount} 組
                  </span>
                </div>

                <div className="flex items-center gap-2 my-2 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  {card && (
                    <>
                      <span className="text-xl">{card.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{card.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {card.category === 'EVENT' ? '⚡ イベントカード' : '🌲 場所カード'}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[11px]">獲得資源:</span>
                  {hasGained ? (
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      {gained.WOOD > 0 && <span>🪵 木+{gained.WOOD}</span>}
                      {gained.RICE > 0 && <span>🌾 小麦+{gained.RICE}</span>}
                      {gained.IRON > 0 && <span>⚙️ 鉄+{gained.IRON}</span>}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px]">獲得なし (0個)</span>
                  )}
                </div>

                <div className="mt-2 pt-1 flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="text-slate-500">所持累計:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-300">🪵 木:{player.resources.WOOD}</span>
                    <span className="text-amber-300">🌾 小麦:{player.resources.RICE}</span>
                    <span className="text-cyan-300">⚙️ 鉄:{player.resources.IRON}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onNext();
          }}
          className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black font-serif text-base shadow-[0_10px_25px_rgba(6,182,212,0.5)] transition transform hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {round < maxRounds ? `第 ${round + 1} ターン（次ラウンド）へ進む ➔` : '🏆 最終ポイント計算・勝敗判定へ ➔'}
        </button>
      </div>
    </div>
  );
};
