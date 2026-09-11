'use client';

import React from 'react';
import { SengokuScoreBreakdown } from '../../types/sengoku';
import { soundManager } from '../../lib/sound';

interface SengokuScoreModalProps {
  scores: SengokuScoreBreakdown[];
  winnerPlayerId: string | null;
  onRestart: () => void;
}

export const SengokuScoreModal: React.FC<SengokuScoreModalProps> = ({
  scores,
  winnerPlayerId,
  onRestart,
}) => {
  const winner = scores.find((s) => s.playerId === winnerPlayerId) || scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#181106] via-[#0d0d14] to-[#040408] border-2 border-amber-400/80 rounded-3xl p-5 sm:p-8 shadow-[0_0_70px_rgba(245,158,11,0.5)] text-center relative overflow-hidden">
        {/* Golden Dragon / Neon Cyber Aura */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-pulse" />
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Victory Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-xs font-mono font-black text-amber-300 mb-2 shadow-inner">
          👑 天下統一・勝敗決着
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wider mb-2 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
          {winner.playerName} の天下統一！
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-6 font-mono">
          全5巡の資源争奪戦が終結。セットボーナスと最多賞による最終得点です。
        </p>

        {/* Scoring Rules Legend */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-[10px] sm:text-xs font-mono text-slate-300 mb-6">
          <div>
            <span className="text-amber-400 font-bold">🌾+🪵+⚙️ セット</span>: <br />
            <strong>+5点 / 組</strong>
          </div>
          <div>
            <span className="text-cyan-400 font-bold">単体余り資源</span>: <br />
            <strong>+1点 / 個</strong>
          </div>
          <div>
            <span className="text-emerald-400 font-bold">各資源の最多賞</span>: <br />
            <strong>+3点 / 冠</strong>
          </div>
        </div>

        {/* Score Leaderboard */}
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
                      ? 'bg-gradient-to-r from-amber-950/90 via-yellow-950/40 to-slate-900 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-102'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
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
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : s.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : s.rank === 3
                          ? 'bg-amber-800 text-amber-200'
                          : 'bg-slate-800 text-slate-400'
                      }
                    `}
                  >
                    #{s.rank}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      {s.playerName}
                      {isWinner && <span className="text-xs">🏆</span>}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>🌾 {s.riceCount}</span>
                      <span>🪵 {s.woodCount}</span>
                      <span>⚙️ {s.ironCount}</span>
                      <span className="text-amber-300 font-bold">({s.setCount}組)</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown & Total */}
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-amber-300 drop-shadow">
                    {s.totalPoints} <span className="text-xs font-normal text-slate-400">点</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    セット+{s.setPoints} / 余り+{s.rawResourcePoints} / 最多+{s.majorityPoints}
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black font-serif text-lg shadow-[0_0_25px_rgba(245,158,11,0.7)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          🔄 もう一度合戦を始める（再出陣）
        </button>
      </div>
    </div>
  );
};
