'use client';

import React from 'react';
import { GameCardType } from '../../types/resourceBattle';
import { GAME_CARDS, RESOURCE_MAP } from '../../constants/resourceBattle';

interface ResourceCardProps {
  cardType: GameCardType;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  cardType,
  isSelected = false,
  disabled = false,
  onClick,
  size = 'md',
  showDetails = true,
}) => {
  const card = GAME_CARDS[cardType];
  const isEvent = card.category === 'EVENT';
  const targetRes = card.targetResource ? RESOURCE_MAP[card.targetResource] : null;

  const sizeClasses = {
    sm: 'w-24 h-36 p-2 text-xs',
    md: 'w-36 h-52 sm:w-40 sm:h-56 p-3 text-sm',
    lg: 'w-48 h-68 sm:w-52 sm:h-72 p-4 text-base',
  }[size];

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative rounded-2xl border-2 transition-all duration-300 select-none overflow-hidden flex flex-col justify-between
        ${sizeClasses}
        ${
          isSelected
            ? 'scale-105 border-amber-400 ring-4 ring-amber-400/50 shadow-[0_10px_30px_rgba(245,158,11,0.5)] -translate-y-2 z-20'
            : isEvent
            ? 'border-purple-500/70 bg-gradient-to-b from-purple-950/80 via-slate-900 to-slate-950 hover:border-purple-400'
            : 'border-slate-700 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 hover:border-slate-500'
        }
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 active:scale-95'}
      `}
    >
      {/* Header Tag */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
            isEvent
              ? 'bg-purple-950/90 text-purple-300 border-purple-500/40'
              : 'bg-slate-900/90 text-slate-300 border-slate-700'
          }`}
        >
          {isEvent ? '⚡ イベント' : '🌲 場所'}
        </span>
        <span className="text-base sm:text-lg">{card.icon}</span>
      </div>

      {/* Main Title & Kanji */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1">
        <div className="text-4xl sm:text-5xl font-black font-serif tracking-wider text-white drop-shadow">
          {card.kanji}
        </div>
        <div className="text-xs sm:text-sm font-bold text-slate-200 mt-1 font-sans">
          {card.name}
        </div>
      </div>

      {/* Bottom Resource info or effect */}
      {showDetails && (
        <div className="relative z-10 w-full pt-1.5 border-t border-slate-700/60">
          {targetRes ? (
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-slate-400">獲得資源:</span>
              <span
                className={`font-black px-1.5 py-0.5 rounded border ${targetRes.bgBadge} ${targetRes.textBadge} ${targetRes.borderBadge}`}
              >
                {targetRes.icon} 【{targetRes.name}】
              </span>
            </div>
          ) : (
            <div className="text-[9px] sm:text-[10px] text-purple-200 font-medium line-clamp-2 leading-tight">
              {card.description}
            </div>
          )}
        </div>
      )}

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-amber-300 rounded-2xl pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
