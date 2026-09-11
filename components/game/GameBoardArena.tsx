'use client';

import React from 'react';
import { CardType, Player } from '../../types/game';
import { CardBackView } from '../cards/CardBackView';

interface GameBoardArenaProps {
  round: number;
  stageDeck: CardType[];
  initialGoodCount: number;
  initialBadCount: number;
  diceResults: [number, number];
  currentTurnPlayer: Player;
  isMyTurn: boolean;
  canPlay: boolean;
  glitchedCard?: boolean;
  continuedCard?: boolean;
  onPlaySelf: () => void;
}

export const GameBoardArena: React.FC<GameBoardArenaProps> = ({
  round,
  stageDeck,
  initialGoodCount,
  initialBadCount,
  diceResults,
  currentTurnPlayer,
  isMyTurn,
  canPlay,
  glitchedCard = false,
  continuedCard = false,
  onPlaySelf,
}) => {
  const remainingCount = stageDeck.length;
  const initialTotal = initialGoodCount + initialBadCount;

  return (
    <div className="w-full relative rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-[#0b101d]/90 via-[#070b14]/95 to-[#04060a] border-2 border-slate-800/80 shadow-2xl backdrop-blur-md overflow-hidden">
      {/* Background Cyber Game Mat Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#00e5ff08_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      {/* Arena Top Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4 relative z-10">
        {/* Round & Dice Info */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/40 rounded-xl flex items-center gap-1.5">
            <span className="text-xs font-mono font-black text-cyan-300">ROUND {round}</span>
          </div>
          <div className="px-2.5 py-1 bg-slate-900/80 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-1">
            <span>🎲</span>
            <span>{diceResults[0]} + {diceResults[1]} =</span>
            <strong className="text-cyan-400 font-bold">{initialTotal}枚</strong>
          </div>
        </div>

        {/* Deck Odds Meter */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">初期構成:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold">
            🟦 GOOD {initialGoodCount}
          </span>
          <span className="px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40 text-red-300 font-bold">
            🟥 BAD {initialBadCount}
          </span>
        </div>
      </div>

      {/* Central 3D Deck & Play Field */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-2 relative z-10">
        {/* 3D Stack Stage Deck */}
        <div className="flex flex-col items-center">
          <div
            className={`relative transition-transform duration-300 ${
              canPlay && isMyTurn ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
            }`}
            onClick={() => {
              if (canPlay && isMyTurn) onPlaySelf();
            }}
          >
            {/* 3D Card Stack Effect */}
            <div className="deck-stack-shadow rounded-xl">
              <CardBackView size="md" />
            </div>

            {/* Remaining Cards Floating Pill */}
            <div className="absolute -bottom-3 inset-x-0 flex justify-center z-20">
              <span className="px-3 py-0.5 bg-slate-900/95 border-2 border-cyan-400 text-cyan-300 font-mono font-black text-xs rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                <span>残り</span>
                <span className="text-sm text-white font-extrabold">{remainingCount}</span>
                <span>枚</span>
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-5 uppercase tracking-widest">
            STAGE DECK
          </span>
        </div>

        {/* Center Turn Action Console */}
        <div className="flex-1 max-w-sm flex flex-col items-center justify-center text-center space-y-3">
          {/* Turn Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs sm:text-sm font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            <span>手番：</span>
            <strong className="text-yellow-400 font-black">{currentTurnPlayer.name}</strong>
          </div>

          {/* Active Buff Badges */}
          {(glitchedCard || continuedCard) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 animate-fade-in">
              {glitchedCard && (
                <span className="px-2.5 py-0.5 bg-purple-950/80 border border-purple-500/70 text-purple-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                  <span>👾</span> GLITCH発動中（カード無効化）
                </span>
              )}
              {continuedCard && (
                <span className="px-2.5 py-0.5 bg-yellow-950/80 border border-yellow-500/70 text-yellow-300 font-bold text-[10px] rounded-full flex items-center gap-1">
                  <span>🕹️</span> CONTINUE発動中（BAD無効化）
                </span>
              )}
            </div>
          )}

          {/* Main Action Button (自分がPLAY) */}
          {isMyTurn ? (
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={onPlaySelf}
                disabled={!canPlay}
                className="w-full py-4 px-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-cyan-950/80 border-2 border-cyan-400/60 transform active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="text-xl">🎴</span>
                <span>自分が PLAY する（カードを引く）</span>
              </button>
              <p className="text-[11px] text-slate-400">
                または 上の対戦相手エリアから「引かせる相手」を選択
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs flex items-center justify-center gap-2 animate-pulse">
              <span className="animate-spin">⏳</span>
              <span>{currentTurnPlayer.name} のアクションを待っています...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
