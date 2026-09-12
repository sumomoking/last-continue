'use client';

import React from 'react';
import { CombatGroup, BattlePlayer } from '../../types/resourceBattle';
import { GAME_CARDS, RESOURCE_MAP } from '../../constants/resourceBattle';
import { ResourceCard } from './ResourceCard';
import { soundManager } from '../../lib/sound';

interface ResourceCombatModalProps {
  combat: CombatGroup;
  currentCombatIndex: number;
  totalCombats: number;
  players: BattlePlayer[];
  onNext: () => void;
}

export const ResourceCombatModal: React.FC<ResourceCombatModalProps> = ({
  combat,
  currentCombatIndex,
  totalCombats,
  players,
  onNext,
}) => {
  const card = GAME_CARDS[combat.location];
  const targetResKey = combat.resource;
  const targetRes = RESOURCE_MAP[targetResKey];
  const winner = players.find((p) => p.id === combat.winnerPlayerId);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#12100e] border-4 border-red-500 rounded-3xl p-5 sm:p-7 shadow-[0_20px_60px_rgba(239,68,68,0.4)] text-center relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-red-600 text-white shadow">
            ⚔️ 戦闘発生！ #{currentCombatIndex + 1} / {totalCombats}
          </span>
          <span className="text-xs text-amber-200 font-bold">
            場所: 【{card.icon} {card.name}】カードの被り
          </span>
        </div>

        {/* Title */}
        <div className="py-2 my-1">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif text-white tracking-wider drop-shadow">
            同じカードを出したプレイヤー同士のサイコロ勝負！
          </h2>
          <p className="text-xs sm:text-sm text-amber-200/90 mt-1">
            勝者は中央の山札から【{targetRes.name}】資源カードを <strong className="text-amber-300 font-black">2枚総取り！</strong>
          </p>
        </div>

        {/* Center Prize: 2 Physical Resource Cards at stake */}
        <div className="my-3 p-3 rounded-2xl bg-black/40 border-2 border-amber-500/50 inline-flex flex-col items-center">
          <div className="text-[11px] font-black text-amber-300 mb-1.5">
            🏆 争奪する景品（資源カード 2枚）
          </div>
          <div className="flex items-center gap-2">
            <ResourceCard cardType={`RES_${targetResKey}`} size="sm" showGlow />
            <span className="text-xl font-bold text-amber-400">＋</span>
            <ResourceCard cardType={`RES_${targetResKey}`} size="sm" showGlow />
          </div>
        </div>

        {/* Combat Rolls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-4">
          {combat.participantPlayerIds.map((pId) => {
            const player = getPlayer(pId);
            if (!player) return null;
            const roll = combat.finalRolls[pId] || player.finalRoll || 1;
            const isWinner = pId === combat.winnerPlayerId;

            return (
              <div
                key={pId}
                className={`
                  relative rounded-2xl p-3 flex flex-col items-center justify-between border-2 transition-all duration-300
                  ${
                    isWinner
                      ? 'bg-gradient-to-b from-amber-950 to-yellow-950 border-amber-400 ring-4 ring-amber-400/60 shadow-xl scale-105'
                      : 'bg-stone-900 border-stone-700 opacity-60'
                  }
                `}
              >
                {isWinner && (
                  <div className="absolute -top-3 bg-amber-400 text-stone-950 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-md uppercase">
                    👑 勝利！
                  </div>
                )}

                <div className="text-center mb-1.5 mt-0.5">
                  <div className="text-xs font-black text-white line-clamp-1">
                    {player.name}
                  </div>
                </div>

                {/* Rolled Dice */}
                <div
                  className={`
                    w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-black font-mono text-2xl sm:text-3xl border-2 my-1 shadow-inner
                    ${
                      isWinner
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-300 text-stone-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-bounce'
                        : 'bg-stone-800 text-stone-300 border-stone-600'
                    }
                  `}
                >
                  🎲 {roll}
                </div>

                <div className="w-full text-center mt-1 pt-1.5 border-t border-stone-800 font-mono">
                  {isWinner ? (
                    <div className="text-[11px] font-black text-amber-300">
                      獲得: {targetRes.name}カード ×2
                    </div>
                  ) : (
                    <div className="text-[10px] text-stone-400">
                      獲得なし (0枚)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner Callout */}
        {winner && (
          <div className="p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-xs sm:text-sm text-amber-100 mb-4">
            🎉 勝者: <strong className="text-amber-300 text-base">{winner.name}</strong> がサイコロ勝負に勝ち、
            <span className="font-bold text-white px-2 py-0.5 rounded bg-amber-700 mx-1">
              {targetRes.icon} {targetRes.name}カード × 2枚
            </span>
            を手元に獲得しました！
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onNext();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black font-serif text-base shadow-[0_10px_25px_rgba(239,68,68,0.5)] transition transform hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {currentCombatIndex + 1 < totalCombats ? '次の戦闘判定へ進む ➔' : '結果を確認してラウンド終了へ ➔'}
        </button>
      </div>
    </div>
  );
};

