'use client';

import React, { useEffect } from 'react';
import { Player } from '../../types/game';
import { soundManager } from '../../lib/sound';

interface GameOverModalProps {
  winner: Player | undefined;
  players: Player[];
  round: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  players,
  round,
  onRestart,
}) => {
  useEffect(() => {
    soundManager.playVictory();
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-yellow-400/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(250,204,21,0.3)] text-center relative overflow-hidden">
        {/* Confetti or Trophy icon */}
        <div className="text-6xl mb-3 animate-bounce">
          🏆
        </div>

        <div className="inline-block px-4 py-1 bg-yellow-400/20 border border-yellow-400/40 rounded-full text-xs font-mono font-black text-yellow-300 mb-3 tracking-widest">
          GAME SET
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white mb-1">
          WINNER: <span className="text-yellow-400">{winner?.name || 'UNKNOWN'}</span>!
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 mb-6">
          極限の心理戦を最後まで生き残った最後の1人です！ (到達ラウンド: {round})
        </p>

        {/* Final Ranking Board */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 text-left">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            最終リザルト
          </div>
          <div className="space-y-2">
            {players.map((p, idx) => {
              const isWinner = p.id === winner?.id;
              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isWinner
                      ? 'bg-yellow-950/40 border-yellow-400/60 text-yellow-200 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{isWinner ? '👑 1位' : `${idx + 1}位`}</span>
                    <span>{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>残機: {p.lives}</span>
                    <span>{p.isGameOver ? '💀 GAME OVER' : '🎉 SURVIVED'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg tracking-wider rounded-xl shadow-lg shadow-red-900/50 transition cursor-pointer"
        >
          もう一度遊ぶ ➔
        </button>
      </div>
    </div>
  );
};
