'use client';

import React from 'react';
import { ScoreSummary } from '../../types/resourceBattle';
import { ResourceCard } from './ResourceCard';
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
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#12100e] border-4 border-amber-500 rounded-3xl p-5 sm:p-8 shadow-[0_20px_70px_rgba(245,158,11,0.5)] text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-400/50 rounded-full text-xs font-mono font-black text-amber-300 mb-2 shadow-inner">
          👑 最終結果・ポイント計算
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 tracking-wider mb-2">
          {winner.playerName} の勝利！
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 mb-5 font-sans">
          獲得した資源カードの「3枚セット」と「各最多所持ボーナス」の集計結果です。
        </p>

        {/* Rules Reminder Box with Card Visuals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-black/50 border border-stone-700 text-xs text-stone-200 mb-5">
          <div className="text-left flex items-center gap-2">
            <div className="flex -space-x-2">
              <ResourceCard cardType="RES_WOOD" size="micro" />
              <ResourceCard cardType="RES_RICE" size="micro" />
              <ResourceCard cardType="RES_IRON" size="micro" />
            </div>
            <div>
              <span className="text-amber-400 font-bold">① 3枚1セット</span>: <br />
              「木＋小麦＋鉄」＝ <strong>1ポイント</strong>
            </div>
          </div>
          <div className="text-left flex items-center gap-2">
            <div className="text-2xl">🏆</div>
            <div>
              <span className="text-amber-300 font-bold">② 最多所持ボーナス</span>: <br />
              木・小麦・鉄の各最多 ＝ <strong>各＋2ポイント</strong>
            </div>
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
                      ? 'bg-gradient-to-r from-amber-950/90 via-yellow-950/60 to-stone-900 border-amber-400 ring-2 ring-amber-400/60 shadow-xl scale-102'
                      : 'bg-stone-900/80 border-stone-800 text-stone-300'
                  }
                `}
              >
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
                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                      {s.playerName}
                      {isWinner && <span className="text-xs">🏆 勝者</span>}
                    </div>

                    {/* Miniature Cards breakdown */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <ResourceCard cardType="RES_WOOD" size="micro" count={s.woodCount} />
                        <ResourceCard cardType="RES_RICE" size="micro" count={s.riceCount} />
                        <ResourceCard cardType="RES_IRON" size="micro" count={s.ironCount} />
                      </div>
                      <span className="text-xs text-amber-300 font-bold font-mono">
                        ({s.setCount}セット組)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-2xl font-black text-amber-300 drop-shadow">
                    {s.totalPoints} <span className="text-xs font-normal text-stone-400">ポイント</span>
                  </div>
                  <div className="text-[10px] text-stone-400">
                    セット点:{s.setPoints}P ＋ 最多:{s.majorityPoints}P
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black font-serif text-lg shadow-[0_10px_25px_rgba(245,158,11,0.6)] transition transform hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          🔄 もう一度最初から遊ぶ
        </button>
      </div>
    </div>
  );
};

