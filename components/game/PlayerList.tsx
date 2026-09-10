'use client';

import React from 'react';
import { Player } from '../../types/game';

interface PlayerListProps {
  players: Player[];
  currentTurnPlayerIndex: number;
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, currentTurnPlayerIndex }) => {
  return (
    <div className="w-full">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
        <span>👥</span> プレイヤー情報
      </div>
      <div className={`grid gap-2.5 ${players.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
        {players.map((player, idx) => {
          const isCurrentTurn = idx === currentTurnPlayerIndex && !player.isGameOver;

          // 残機ハート表示
          const hearts = [];
          for (let i = 0; i < 3; i++) {
            if (i < player.lives) {
              hearts.push(
                <span key={i} className="text-red-500 scale-105 inline-block transition-transform drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]">
                  ❤️
                </span>
              );
            } else {
              hearts.push(
                <span key={i} className="text-slate-700 opacity-40 inline-block grayscale">
                  🖤
                </span>
              );
            }
          }

          return (
            <div
              key={player.id}
              className={`relative rounded-xl p-3 border transition-all duration-300 ${
                player.isGameOver
                  ? 'bg-slate-950/60 border-slate-900 opacity-50 grayscale'
                  : isCurrentTurn
                  ? 'bg-slate-900/90 border-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.25)] ring-1 ring-yellow-400/50'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              {/* Turn Indicator Badge */}
              {isCurrentTurn && (
                <div className="absolute -top-2.5 right-2 px-2 py-0.5 bg-yellow-400 text-slate-950 text-[10px] font-black rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <span>👑</span> TURN
                </div>
              )}

              {/* Game Over Banner */}
              {player.isGameOver && (
                <div className="absolute -top-2.5 right-2 px-2 py-0.5 bg-red-900 text-red-200 text-[10px] font-black rounded-full shadow-md uppercase tracking-wider">
                  DEAD
                </div>
              )}

              {/* Player Name */}
              <div className="flex items-center space-x-1.5 mb-1.5">
                <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono font-bold flex items-center justify-center">
                  P{idx + 1}
                </span>
                <span className={`text-sm font-bold truncate ${player.isGameOver ? 'text-slate-500 line-through' : isCurrentTurn ? 'text-yellow-300' : 'text-white'}`}>
                  {player.name}
                </span>
              </div>

              {/* Lives (Hearts) */}
              <div className="flex items-center space-x-1 mb-2 text-base">
                {hearts}
                <span className="text-[11px] font-mono text-slate-400 ml-1">
                  ({player.lives}/3)
                </span>
              </div>

              {/* Status / Items Tag */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-1.5">
                <div className="flex items-center gap-1">
                  <span>🎒</span>
                  <span className="font-mono text-slate-300 font-semibold">{player.items.length}</span>
                  <span className="text-[10px]">枚</span>
                </div>

                {player.savedItem && (
                  <div className="px-1.5 py-0.2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] rounded flex items-center gap-0.5" title={`SAVEセット中: ${player.savedItem}`}>
                    <span>💾</span> SAVE
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
