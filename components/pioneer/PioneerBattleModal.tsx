'use client';

import React from 'react';
import { ContestGroup, PioneerPlayer } from '../../types/pioneer';
import { PIONEER_CARDS, RESOURCE_CONFIG } from '../../constants/pioneer';
import { soundManager } from '../../lib/sound';

interface PioneerBattleModalProps {
  contest: ContestGroup;
  currentContestIndex: number;
  totalContests: number;
  players: PioneerPlayer[];
  onNext: () => void;
}

export const PioneerBattleModal: React.FC<PioneerBattleModalProps> = ({
  contest,
  currentContestIndex,
  totalContests,
  players,
  onNext,
}) => {
  const card = PIONEER_CARDS[contest.terrain];
  const targetRes = RESOURCE_CONFIG[contest.resource];
  const winner = players.find((p) => p.id === contest.winnerPlayerId);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#24170e] via-[#1c130d] to-[#0e0906] border-3 border-amber-600/80 rounded-3xl p-5 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Wood Rim & Warm Sun */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950/90 border border-amber-500/50 text-amber-300">
            🎲 資源争奪ダイス対決 #{currentContestIndex + 1} / {totalContests}
          </span>
          <span className="text-xs font-serif font-bold text-amber-200">
            地形: <span className="font-bold text-white">{card.icon} {card.name}</span>
          </span>
        </div>

        {/* Main Title */}
        <div className="py-2 my-1">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-amber-200 drop-shadow-md">
            資源の争奪ダイス勝負！
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1">
            同じ地形へ派遣が重複！ダイス最大の開拓団が【{targetRes.icon} {targetRes.japaneseName}】を
            <strong className="text-amber-400 font-black"> 2個総取り（倍獲）</strong>！
          </p>
        </div>

        {/* Dice Contest Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-6">
          {contest.participantPlayerIds.map((pId) => {
            const player = getPlayer(pId);
            if (!player) return null;
            const roll = contest.rolls[pId] || player.diceRoll || 1;
            const isWinner = pId === contest.winnerPlayerId;

            return (
              <div
                key={pId}
                className={`
                  relative rounded-2xl p-4 flex flex-col items-center justify-between border-2 transition-all duration-300
                  ${
                    isWinner
                      ? 'bg-gradient-to-b from-amber-900/80 to-yellow-950/50 border-amber-400 ring-4 ring-amber-400/50 shadow-[0_10px_25px_rgba(245,158,11,0.5)] scale-105'
                      : 'bg-stone-900/80 border-stone-800 opacity-60'
                  }
                `}
              >
                {/* Winner Ribbon */}
                {isWinner && (
                  <div className="absolute -top-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-md uppercase tracking-wider">
                    🏆 争奪勝利！
                  </div>
                )}

                {/* Player Name */}
                <div className="text-center mb-2 mt-1">
                  <div className="text-xs font-bold text-stone-200 line-clamp-1 flex items-center justify-center gap-1">
                    <span>{player.meepleIcon}</span>
                    <span>{player.name}</span>
                  </div>
                </div>

                {/* Wooden Dice Display */}
                <div
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black font-mono text-3xl sm:text-4xl border-2 my-2 shadow-inner
                    ${
                      isWinner
                        ? 'bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 text-stone-950 border-white shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-bounce'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }
                  `}
                >
                  🎲 {roll}
                </div>

                {/* Yield Status */}
                <div className="w-full text-center mt-2 pt-2 border-t border-stone-800 font-mono">
                  {isWinner ? (
                    <div className="text-xs font-black text-amber-300">
                      獲得: {targetRes.icon} +2個
                    </div>
                  ) : (
                    <div className="text-[11px] text-stone-500">
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
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-xs sm:text-sm text-amber-200 mb-6 font-serif">
            🏆 <strong className="text-amber-300 text-base">{winner.name}</strong> が争奪を制し、
            <span className="font-bold text-white px-2 py-0.5 rounded bg-amber-600/40 mx-1">
              {targetRes.icon} {targetRes.japaneseName} × 2個
            </span>
            を獲得しました！
          </div>
        )}

        {/* Continue Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onNext();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-black font-serif text-base shadow-[0_10px_25px_rgba(245,158,11,0.5)] transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {currentContestIndex + 1 < totalContests ? '次の争奪へ進む ➔' : '収穫結果を確認して次へ ➔'}
        </button>
      </div>
    </div>
  );
};
