'use client';

import React from 'react';
import { GameCardType } from '../../types/resourceBattle';
import { GAME_CARDS, RESOURCE_MAP } from '../../constants/resourceBattle';

interface ResourceCardProps {
  cardType: GameCardType;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  isFaceDown?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  cardType,
  isSelected = false,
  disabled = false,
  onClick,
  isFaceDown = false,
  size = 'md',
}) => {
  const card = GAME_CARDS[cardType];
  const isEvent = card.category === 'EVENT';
  const targetRes = card.targetResource ? RESOURCE_MAP[card.targetResource] : null;

  const sizeClasses = {
    sm: 'w-24 h-36 p-2 text-xs',
    md: 'w-32 h-48 sm:w-36 sm:h-52 p-3 text-sm',
    lg: 'w-44 h-64 sm:w-48 sm:h-68 p-4 text-base',
  }[size];

  // 裏向き（伏せ札）表示
  if (isFaceDown) {
    return (
      <div
        className={`
          ${sizeClasses} rounded-2xl border-2 border-slate-600 bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900
          shadow-lg flex flex-col items-center justify-center select-none relative overflow-hidden
        `}
      >
        <div className="w-12 h-12 rounded-full border-2 border-slate-500/60 bg-slate-800/80 flex items-center justify-center text-xl shadow-inner">
          🎴
        </div>
        <div className="text-[11px] font-bold text-slate-400 mt-2 font-mono tracking-wider">
          伏せ札
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative rounded-2xl border-2 transition-all duration-200 select-none overflow-hidden flex flex-col justify-between
        ${sizeClasses}
        ${
          isSelected
            ? 'scale-105 border-yellow-400 ring-4 ring-yellow-400/50 shadow-[0_0_25px_rgba(250,204,21,0.6)] -translate-y-3 z-30'
            : isEvent
            ? 'border-purple-500/80 bg-gradient-to-b from-purple-950/90 via-slate-900 to-slate-950 hover:border-purple-400 hover:shadow-lg'
            : 'border-slate-600 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 hover:border-amber-400 hover:shadow-lg'
        }
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1.5 active:scale-95'}
      `}
    >
      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
            isEvent
              ? 'bg-purple-900/90 text-purple-200 border-purple-400'
              : 'bg-slate-800/90 text-amber-200 border-slate-600'
          }`}
        >
          {isEvent ? '⚡ イベント' : '🌲 基本カード'}
        </span>
        <span className="text-base">{card.icon}</span>
      </div>

      {/* Center Character & Title */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1 text-center">
        <div className="text-4xl sm:text-5xl font-black font-serif text-white drop-shadow">
          {card.kanji}
        </div>
        <div className="text-sm sm:text-base font-black text-amber-300 mt-1">
          {card.name}
        </div>
      </div>

      {/* Bottom Resource Yield or Effect */}
      <div className="relative z-10 w-full pt-1.5 border-t border-slate-700/80">
        {targetRes ? (
          <div className="bg-slate-950/80 rounded-lg p-1.5 text-center border border-slate-700">
            <div className="text-[10px] text-slate-400">出したら獲得:</div>
            <div className="font-black text-xs sm:text-sm text-amber-300">
              {targetRes.icon} 【{targetRes.name}】
            </div>
          </div>
        ) : (
          <div className="text-[9px] sm:text-[10px] text-purple-200 font-medium leading-snug line-clamp-2">
            {card.description}
          </div>
        )}
      </div>

      {/* Selected Indicator Glow */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-yellow-300 rounded-2xl pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
