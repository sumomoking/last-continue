'use client';

import React from 'react';
import { PioneerScoreBreakdown } from '../../types/pioneer';
import { soundManager } from '../../lib/sound';

interface PioneerScoreModalProps {
  scores: PioneerScoreBreakdown[];
  winnerPlayerId: string | null;
  onRestart: () => void;
}

export const PioneerScoreModal: React.FC<PioneerScoreModalProps> = ({
  scores,
  winnerPlayerId,
  onRestart,
}) => {
  const winner = scores.find((s) => s.playerId === winnerPlayerId) || scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#24170d] via-[#1c130c] to-[#0c0906] border-3 border-amber-500/90 rounded-3xl p-5 sm:p-8 shadow-[0_20px_70px_rgba(245,158,11,0.5)] text-center relative overflow-hidden">
        {/* Golden Sun Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-xs font-mono font-black text-amber-300 mb-2 shadow-inner">
          👑 リソーシア島 開拓完了
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 tracking-wider mb-2 drop-shadow-md">
          {winner.playerName} の大勝利！
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 mb-6 font-sans">
          全5ターンの開拓競争が集結。開拓地セットと最多特産品賞による最終勝利点（VP）です。
        </p>

        {/* Victory Point (VP) Rules Legend */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-[10px] sm:text-xs font-serif text-stone-200 mb-6">
          <div>
            <span className="text-amber-400 font-bold">🌾+🪵+⛏️ 開拓地</span>: <br />
            <strong>+5 VP / 軒</strong>
          </div>
          <div>
            <span className="text-emerald-400 font-bold">余剰資源</span>: <br />
            <strong>+1 VP / 個</strong>
          </div>
          <div>
            <span className="text-sky-400 font-bold">各資源の最多賞</span>: <br />
            <strong>+3 VP / 冠</strong>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-3 mb-6">
          {scores.map((s) => {
            const isWinner = s.playerId === winnerPlayerId;

            return (
              <div
                key={s.playerId}
                className={`
                  p-3.5 rounded-2xl border-2 flex items-center justify-between text-left transition-all
                  ${
                    isWinner
                      ? 'bg-gradient-to-r from-amber-950/90 via-yellow-950/40 to-stone-900 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_5px_20px_rgba(245,158,11,0.4)] scale-102'
                      : 'bg-stone-900/80 border-stone-800 text-stone-300'
                  }
                `}
              >
                {/* Rank & Name */}
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`
                      w-8 h-8 rounded-xl flex items-center justify-center font-black font-mono text-sm
                      ${
                        s.rank === 1
                          ? 'bg-amber-400 text-stone-950 shadow-md'
                          : s.rank === 2
                          ? 'bg-stone-300 text-stone-950'
                          : s.rank === 3
                          ? 'bg-amber-800 text-amber-100'
                          : 'bg-stone-800 text-stone-400'
                      }
                    `}
                  >
                    #{s.rank}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5 font-serif">
                      {s.playerName}
                      {isWinner && <span className="text-xs">🏆 筆頭開拓者</span>}
                    </div>
                    <div className="text-[11px] font-mono text-stone-400 flex items-center gap-2 mt-0.5">
                      <span>🌾 {s.wheatCount}</span>
                      <span>🪵 {s.lumberCount}</span>
                      <span>⛏️ {s.oreCount}</span>
                      <span className="text-amber-300 font-bold">({s.settlementCount} 開拓地)</span>
                    </div>
                  </div>
                </div>

                {/* Score Total */}
                <div className="text-right font-mono">
                  <div className="text-2xl font-black text-amber-300 drop-shadow">
                    {s.totalPoints} <span className="text-xs font-serif text-stone-400">VP</span>
                  </div>
                  <div className="text-[10px] text-stone-400">
                    開拓地+{s.settlementPoints} / 余剰+{s.rawResourcePoints} / 最多+{s.majorityPoints}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Restart Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onRestart();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black font-serif text-lg shadow-[0_10px_25px_rgba(245,158,11,0.7)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          ⛵ 新たな島へ再出航（もう一度遊ぶ）
        </button>
      </div>
    </div>
  );
};
