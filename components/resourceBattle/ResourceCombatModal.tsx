'use client';

import React from 'react';
import { CombatGroup, BattlePlayer } from '../../types/resourceBattle';
import { GAME_CARDS, RESOURCE_MAP } from '../../constants/resourceBattle';
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
  const targetRes = RESOURCE_MAP[combat.resource];
  const winner = players.find((p) => p.id === combat.winnerPlayerId);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-[#101726] to-[#080d1a] border-2 border-red-500/70 rounded-3xl p-5 sm:p-8 shadow-[0_20px_60px_rgba(239,68,68,0.3)] text-center relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950/80 border border-red-500/50 text-red-300">
            ⚔️ 戦（戦闘）発生 #{currentCombatIndex + 1} / {totalCombats}
          </span>
          <span className="text-xs text-slate-300">
            場所: <strong className="text-white">{card.icon} {card.name}</strong>
          </span>
        </div>

        {/* Title */}
        <div className="py-2 my-1">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-red-400 tracking-wider">
            同じカードを出したプレイヤー同士の戦闘！
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            サイコロを振り、出目の大きいプレイヤーが勝利！<br />
            勝者は【{targetRes.icon} {targetRes.name}】を <strong className="text-amber-300 font-bold">2つ獲得</strong>、敗者は <strong className="text-slate-400">0個</strong>。
          </p>
        </div>

        {/* Combat Rolls Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-6">
          {combat.participantPlayerIds.map((pId) => {
            const player = getPlayer(pId);
            if (!player) return null;
            const roll = combat.finalRolls[pId] || player.finalRoll || 1;
            const isWinner = pId === combat.winnerPlayerId;

            return (
              <div
                key={pId}
                className={`
                  relative rounded-2xl p-4 flex flex-col items-center justify-between border-2 transition-all duration-300
                  ${
                    isWinner
                      ? 'bg-gradient-to-b from-amber-950/80 to-yellow-950/50 border-amber-400 ring-4 ring-amber-400/50 shadow-[0_10px_25px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-slate-900/80 border-slate-800 opacity-60'
                  }
                `}
              >
                {isWinner && (
                  <div className="absolute -top-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-md uppercase">
                    👑 勝利！
                  </div>
                )}

                <div className="text-center mb-2 mt-1">
                  <div className="text-xs font-bold text-slate-200 line-clamp-1">
                    {player.name}
                  </div>
                </div>

                <div
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black font-mono text-3xl sm:text-4xl border-2 my-2 shadow-inner
                    ${
                      isWinner
                        ? 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border-white shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-bounce'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }
                  `}
                >
                  🎲 {roll}
                </div>

                <div className="w-full text-center mt-2 pt-2 border-t border-slate-800 font-mono">
                  {isWinner ? (
                    <div className="text-xs font-black text-amber-300">
                      獲得: {targetRes.icon} +2個
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      獲得なし: 0個
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner Callout */}
        {winner && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-xs sm:text-sm text-amber-200 mb-6">
            🏆 勝者: <strong className="text-amber-300 text-base">{winner.name}</strong> が戦闘に勝利し、
            <span className="font-bold text-white px-2 py-0.5 rounded bg-amber-600/40 mx-1">
              {targetRes.icon} {targetRes.name} × 2つ
            </span>
            を獲得しました！
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onNext();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black font-serif text-base shadow-[0_10px_25px_rgba(239,68,68,0.5)] transition transform hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {currentCombatIndex + 1 < totalCombats ? '次の戦闘へ進む ➔' : '戦闘結果を確認して次へ ➔'}
        </button>
      </div>
    </div>
  );
};
