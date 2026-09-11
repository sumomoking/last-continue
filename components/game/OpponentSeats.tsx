'use client';

import React from 'react';
import { Player } from '../../types/game';
import { CardBackView } from '../cards/CardBackView';

interface OpponentSeatsProps {
  players: Player[];
  currentTurnPlayerIndex: number;
  myPlayerId?: string;
  isMyTurn: boolean;
  canTargetPlay: boolean;
  onPlayTarget: (targetIndex: number) => void;
}

export const OpponentSeats: React.FC<OpponentSeatsProps> = ({
  players,
  currentTurnPlayerIndex,
  myPlayerId,
  isMyTurn,
  canTargetPlay,
  onPlayTarget,
}) => {
  // 自分以外のプレイヤー（ローカル対戦時は手番以外のプレイヤー、オンライン時は自分以外のプレイヤー）
  const myIndex = myPlayerId ? players.findIndex((p) => p.id === myPlayerId) : -1;

  const opponents = players
    .map((player, index) => ({ player, index }))
    .filter(({ player, index }) => (myIndex !== -1 ? index !== myIndex : index !== currentTurnPlayerIndex));

  return (
    <div className="w-full">
      <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-2 flex items-center justify-between px-1">
        <span>👥 OPPONENTS ARENA</span>
        <span className="text-[10px] text-slate-500">対戦相手の手札・ステータス</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {opponents.map(({ player, index }) => {
          const isTurn = index === currentTurnPlayerIndex && !player.isGameOver;
          const canTargetThis = canTargetPlay && !player.isGameOver && isMyTurn;

          return (
            <div
              key={player.id}
              className={`relative rounded-2xl p-3 border-2 transition-all duration-300 flex flex-col justify-between ${
                player.isGameOver
                  ? 'bg-slate-950/60 border-slate-900 opacity-40 grayscale'
                  : isTurn
                  ? 'bg-gradient-to-b from-yellow-950/40 via-slate-900/90 to-slate-950 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.25)] ring-1 ring-yellow-400/50'
                  : 'bg-slate-900/80 border-slate-800 shadow-lg'
              }`}
            >
              {/* Turn Banner */}
              {isTurn && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-yellow-400 text-slate-950 text-[10px] font-black rounded-full shadow-md uppercase tracking-wider flex items-center gap-1">
                  <span>👑</span> TURN
                </div>
              )}

              {/* Dead Banner */}
              {player.isGameOver && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 bg-red-900 text-red-200 text-[10px] font-black rounded-full shadow-md uppercase tracking-wider">
                  DEAD
                </div>
              )}

              {/* Top Row: Name & Lives */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    P{index + 1}
                  </span>
                  <span className={`text-xs font-black truncate ${isTurn ? 'text-yellow-300' : 'text-white'}`}>
                    {player.name}
                  </span>
                </div>

                {/* Life Crystals (💎) */}
                <div className="flex items-center space-x-1 shrink-0">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs inline-block transition-transform ${
                        i < player.lives
                          ? 'text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                          : 'text-slate-700 grayscale opacity-30'
                      }`}
                    >
                      ❤️
                    </span>
                  ))}
                </div>
              </div>

              {/* Middle Row: Hidden Hand Fan (裏向き手札の重なりファン表示) */}
              <div className="my-1.5 py-1 flex items-center justify-center min-h-[52px]">
                {player.items.length === 0 ? (
                  <span className="text-[10px] font-mono text-slate-400">手札なし</span>
                ) : (
                  <div className="flex items-center justify-center -space-x-4 hover:space-x-1 transition-all duration-300 py-1">
                    {player.items.map((_, cardIdx) => {
                      // 扇状の傾き
                      const count = player.items.length;
                      const rotateDeg = (cardIdx - (count - 1) / 2) * 8;
                      return (
                        <div
                          key={cardIdx}
                          style={{ transform: `rotate(${rotateDeg}deg)` }}
                          className="transition-transform duration-200 hover:-translate-y-2"
                        >
                          <CardBackView size="sm" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Row: Status Badges & Target Action */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-mono text-slate-400">
                    🎒 <strong className="text-slate-200">{player.items.length}</strong>/4枚
                  </span>
                  {player.savedItem && (
                    <span className="px-1.5 py-0.2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[9px] font-bold rounded flex items-center gap-0.5" title="SAVE発動待機中">
                      <span>💾</span> SAVE
                    </span>
                  )}
                </div>

                {/* Target Play Action Button */}
                {canTargetThis && (
                  <button
                    type="button"
                    onClick={() => onPlayTarget(index)}
                    className="py-1 px-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-[11px] rounded-lg shadow-md shadow-red-950/60 border border-red-400/40 transition transform active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <span>🎯</span>
                    <span>引かせる</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
