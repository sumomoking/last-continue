'use client';

import React from 'react';
import { ScoreSummary } from '../../types/resourceBattle';
import { soundManager } from '../../lib/sound';

interface ResourceScoreModalProps {
  scores: ScoreSummary[];
  winnerPlayerId: string | null;
  onRestart: () => void;
}

export const ResourceScoreModal: React.FC<ResourceScoreModalProps> = ({
  scores,
  winnerPlayerId,
  onRestart,
}) => {
  const winner = scores.find((s) => s.playerId === winnerPlayerId) || scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-[#101726] to-[#080d1a] border-2 border-amber-400 rounded-3xl p-5 sm:p-8 shadow-[0_20px_70px_rgba(245,158,11,0.4)] text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-xs font-mono font-black text-amber-300 mb-2 shadow-inner">
          👑 最終結果・ポイント計算
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wider mb-2">
          {winner.playerName} の勝利！
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-6 font-sans">
          全ターンの獲得資源を集計した最終ポイントです。
        </p>

        {/* Rules Reminder Box */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 mb-6">
          <div className="text-left">
            <span className="text-amber-400 font-bold">① セットによるポイント</span>: <br />
            「木・小麦・鉄」1セットにつき <strong>1ポイント</strong>
          </div>
          <div className="text-left">
            <span className="text-cyan-400 font-bold">② 各資源の最多所持ボーナス</span>: <br />
            木・小麦・鉄の各最多プレイヤーに <strong>各2ポイント</strong>
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
                      ? 'bg-gradient-to-r from-amber-950/80 via-yellow-950/40 to-slate-900 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_5px_20px_rgba(245,158,11,0.3)] scale-102'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300'
                  }
                `}
              >
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
                          ? 'bg-amber-800 text-amber-100'
                          : 'bg-slate-800 text-slate-400'
                      }
                    `}
                  >
                    #{s.rank}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      {s.playerName}
                      {isWinner && <span className="text-xs">🏆 勝者</span>}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>🪵 木:{s.woodCount}</span>
                      <span>🌾 小麦:{s.riceCount}</span>
                      <span>⚙️ 鉄:{s.ironCount}</span>
                      <span className="text-amber-300 font-bold">({s.setCount}セット)</span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-2xl font-black text-amber-300 drop-shadow">
                    {s.totalPoints} <span className="text-xs font-normal text-slate-400">ポイント</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    セット点:{s.setPoints}P ＋ 最多ボーナス:{s.majorityPoints}P
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
            onRestart();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black font-serif text-lg shadow-[0_10px_25px_rgba(245,158,11,0.6)] transition transform hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          🔄 もう一度最初から遊ぶ
        </button>
      </div>
    </div>
  );
};
