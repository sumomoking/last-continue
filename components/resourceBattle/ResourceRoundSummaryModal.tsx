'use client';

import React from 'react';
import { BattlePlayer } from '../../types/resourceBattle';
import { ResourceCard } from './ResourceCard';
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
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#12100e] border-4 border-amber-500 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(245,158,11,0.3)] text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-xs font-mono font-bold text-amber-300 mb-2">
          📜 第 {round} ターン 終了
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide mb-1">
          資源カード獲得結果
        </h2>
        <p className="text-xs text-stone-300 mb-4">
          各プレイヤーが出したカードと、今ターン獲得した資源カードの一覧です。
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {players.map((player) => {
            const gained = player.lastGainedResources || { WOOD: 0, RICE: 0, IRON: 0 };
            const hasGained = gained.WOOD > 0 || gained.RICE > 0 || gained.IRON > 0;
            const setCount = Math.min(player.resources.WOOD, player.resources.RICE, player.resources.IRON);

            return (
              <div
                key={player.id}
                className="bg-[#24201c] border-2 border-[#57483a] rounded-2xl p-3.5 flex flex-col justify-between text-left shadow-md relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white">{player.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/60 font-bold">
                    完成: {setCount} 組
                  </span>
                </div>

                {/* Played Card Visual */}
                <div className="flex items-center gap-3 my-1.5 p-2 rounded-xl bg-black/40 border border-stone-700">
                  {player.selectedCard ? (
                    <ResourceCard cardType={player.selectedCard} size="sm" />
                  ) : (
                    <div className="text-xs text-stone-500">カードなし</div>
                  )}
                  <div className="flex-1">
                    <div className="text-[11px] text-stone-400 font-bold">今ターン獲得:</div>
                    {hasGained ? (
                      <div className="flex items-center gap-1.5 mt-1 font-bold">
                        {gained.WOOD > 0 && (
                          <div className="flex items-center">
                            <ResourceCard cardType="RES_WOOD" size="micro" count={gained.WOOD} />
                          </div>
                        )}
                        {gained.RICE > 0 && (
                          <div className="flex items-center">
                            <ResourceCard cardType="RES_RICE" size="micro" count={gained.RICE} />
                          </div>
                        )}
                        {gained.IRON > 0 && (
                          <div className="flex items-center">
                            <ResourceCard cardType="RES_IRON" size="micro" count={gained.IRON} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-stone-500 mt-1">獲得なし (0枚)</div>
                    )}
                  </div>
                </div>

                {/* Total Resources Cards */}
                <div className="mt-2 pt-2 border-t border-stone-700 flex items-center justify-between text-[11px] font-mono text-stone-300">
                  <span className="text-stone-400">手元の資源カード:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-200">🪵×{player.resources.WOOD}</span>
                    <span className="text-amber-300">🌾×{player.resources.RICE}</span>
                    <span className="text-cyan-200">⚙️×{player.resources.IRON}</span>
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
          className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-stone-950 font-black font-serif text-base shadow-[0_10px_25px_rgba(245,158,11,0.5)] transition transform hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {round < maxRounds ? `第 ${round + 1} ターン（次ラウンド）へ進む ➔` : '🏆 最終ポイント計算・勝敗判定へ ➔'}
        </button>
      </div>
    </div>
  );
};

