'use client';

import React from 'react';
import { Player } from '../../types/game';

interface TurnActionPanelProps {
  currentTurnPlayer: Player;
  currentTurnPlayerIndex: number;
  players: Player[];
  glitchedCard?: boolean;
  continuedCard?: boolean;
  myPlayerId?: string;
  onPlaySelf: () => void;
  onPlayTarget: (targetIndex: number) => void;
  disabled: boolean;
}

export const TurnActionPanel: React.FC<TurnActionPanelProps> = ({
  currentTurnPlayer,
  currentTurnPlayerIndex,
  players,
  glitchedCard = false,
  continuedCard = false,
  myPlayerId,
  onPlaySelf,
  onPlayTarget,
  disabled,
}) => {
  const isMyTurn = !myPlayerId || currentTurnPlayer.id === myPlayerId;

  // 手番プレイヤー以外の生存プレイヤー
  const otherAlivePlayers = players
    .map((player, index) => ({ player, index }))
    .filter(({ player, index }) => index !== currentTurnPlayerIndex && !player.isGameOver);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Current Turn Banner */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs sm:text-sm font-bold tracking-wide mb-1">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
          現在のターン：
          <span className="text-yellow-400 font-black text-base">{currentTurnPlayer.name}</span>
          {myPlayerId && isMyTurn && (
            <span className="ml-1 px-2 py-0.2 bg-yellow-400 text-slate-950 text-[10px] font-black rounded-full">
              YOUR TURN
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          {isMyTurn
            ? '自分で挑戦するか、他のプレイヤーに押し付けるかを選択してください。'
            : `⏳ ${currentTurnPlayer.name} のアクションを待っています...`}
        </p>

        {/* Active Item Buff Badges */}
        {(glitchedCard || continuedCard) && (
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5 animate-fade-in">
            {glitchedCard && (
              <span className="px-3 py-1 bg-purple-950/80 border border-purple-500/70 text-purple-300 font-bold text-xs rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="animate-pulse">👾</span> GLITCH 発動中（次のカード無効化）
              </span>
            )}
            {continuedCard && (
              <span className="px-3 py-1 bg-yellow-950/80 border border-yellow-500/70 text-yellow-300 font-bold text-xs rounded-full flex items-center gap-1.5 shadow-sm">
                <span className="animate-pulse">🕹️</span> CONTINUE 発動中（BAD無効化＆継続）
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-3">
        {/* A. 自分がPLAY */}
        <button
          type="button"
          onClick={onPlaySelf}
          disabled={disabled}
          className="w-full group relative overflow-hidden py-4 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base sm:text-lg rounded-xl shadow-lg shadow-cyan-950/60 border border-cyan-400/40 transform active:scale-98 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">🎴</span>
            <span>自分が PLAY する</span>
          </div>
          <div className="text-[11px] font-normal text-cyan-200/80 mt-0.5">
            GOODなら自分のターン継続！ / BADなら残機-1
          </div>
        </button>

        {/* B. 他のプレイヤーにPLAYさせる */}
        {otherAlivePlayers.length > 0 && (
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center flex items-center justify-center gap-2">
              <span className="h-px bg-slate-800 flex-1" />
              <span>または 他人にPLAYさせる</span>
              <span className="h-px bg-slate-800 flex-1" />
            </div>

            <div className={`grid gap-2.5 ${otherAlivePlayers.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {otherAlivePlayers.map(({ player, index }) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => onPlayTarget(index)}
                  disabled={disabled}
                  className="py-3 px-4 bg-slate-800/90 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/60 text-slate-200 hover:text-red-300 font-bold text-sm rounded-xl transition duration-150 shadow-md transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-center cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>🎯</span>
                    <span className="truncate">{player.name} にPLAYさせる</span>
                  </div>
                  <div className="text-[10px] font-normal text-slate-400 mt-0.5">
                    相手が引く（自分のターンは終了）
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
