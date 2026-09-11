'use client';

import React, { useState, useEffect } from 'react';
import { CardType, ItemType, Player } from '../../types/game';
import { ITEM_DEFINITIONS } from '../../constants/items';

interface CardRevealModalProps {
  card: CardType;
  actorPlayer: Player;
  targetPlayer: Player;
  targetPlayerIndex: number;
  glitched: boolean;
  continued: boolean;
  onRevealComplete: () => void;
  onConfirmResult: () => void;
  isRevealing: boolean;
}

export const CardRevealModal: React.FC<CardRevealModalProps> = ({
  card,
  actorPlayer,
  targetPlayer,
  targetPlayerIndex,
  glitched,
  continued,
  onRevealComplete,
  onConfirmResult,
  isRevealing,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isSelf = actorPlayer.id === targetPlayer.id;

  // カードめくり開始
  const handleFlip = () => {
    if (isFlipped) return;
    setIsFlipped(true);
    setTimeout(() => {
      onRevealComplete();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Top Context Header */}
        <div className="mb-4">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-1">
            STAGE CARD DRAW
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isSelf ? (
              <span>
                <span className="text-cyan-400 font-black">{actorPlayer.name}</span> の挑戦
              </span>
            ) : (
              <span>
                <span className="text-slate-400">{actorPlayer.name}</span> ➔{' '}
                <span className="text-yellow-400 font-black">{targetPlayer.name}</span> に指名！
              </span>
            )}
          </h3>
        </div>

        {/* 3D Flip Card Container */}
        <div className="perspective-1000 w-52 h-72 sm:w-60 sm:h-80 my-4 cursor-pointer" onClick={handleFlip}>
          <div
            className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Card Back (裏面) */}
            <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-slate-700 shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none group hover:border-cyan-500/60 transition">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-3xl mb-3 shadow-inner">
                ❓
              </div>
              <div className="text-sm font-mono tracking-widest text-cyan-400 font-black mb-1">
                LAST CONTINUE
              </div>
              <p className="text-xs text-slate-400">タップしてカードをめくる</p>
              <div className="mt-4 px-4 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold animate-pulse">
                CLICK TO OPEN
              </div>
            </div>

            {/* Card Front (表面) */}
            <div
              className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl border-2 shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none ${
                card === 'GOOD'
                  ? 'bg-gradient-to-b from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.4)]'
                  : 'bg-gradient-to-b from-red-950/80 via-slate-900 to-slate-950 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
              }`}
            >
              {/* Card Badge */}
              <div className="text-5xl sm:text-6xl mb-3">
                {card === 'GOOD' ? '🟦' : '🟥'}
              </div>

              <div
                className={`text-2xl sm:text-3xl font-black tracking-wider mb-2 ${
                  card === 'GOOD' ? 'text-cyan-400' : 'text-red-500 animate-glitch'
                }`}
              >
                {card === 'GOOD' ? 'GOOD STAGE' : 'BAD STAGE'}
              </div>

              {/* Status override indicator */}
              {glitched && (
                <div className="mt-2 px-3 py-1 bg-purple-950/80 border border-purple-500 text-purple-300 font-bold text-xs rounded-lg animate-bounce">
                  👾 GLITCH 無効化発動中！
                </div>
              )}
              {continued && (
                <div className="mt-2 px-3 py-1 bg-yellow-950/80 border border-yellow-400 text-yellow-300 font-bold text-xs rounded-lg animate-bounce">
                  🕹️ CONTINUE 残機保護発動！
                </div>
              )}

              {/* Card Effect Description */}
              {!glitched && !continued && (
                <p className="text-xs text-slate-300 mt-2">
                  {isSelf
                    ? card === 'GOOD'
                      ? '🎉 ターン継続！次のPLAYもあなたの番です。'
                      : '💀 残機が1減少し、次のプレイヤーへターンが移ります。'
                    : card === 'GOOD'
                    ? `✨ ${targetPlayer.name} はセーフ！次のプレイヤーへターンが移ります。`
                    : `💀 ${targetPlayer.name} の残機が1減少し、次のプレイヤーへターンが移ります。`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel after Reveal */}
        {isFlipped && !isRevealing && (
          <div className="w-full space-y-3 mt-2 animate-fade-in">
            {/* Confirm & Proceed Button */}
            <button
              type="button"
              onClick={onConfirmResult}
              className={`w-full py-3.5 px-6 font-black text-base rounded-xl transition duration-150 shadow-lg cursor-pointer ${
                card === 'GOOD' || continued || glitched
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/50'
                  : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/50'
              }`}
            >
              結果を確定して進む ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
