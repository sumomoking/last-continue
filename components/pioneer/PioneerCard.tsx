'use client';

import React from 'react';
import { PioneerCardType } from '../../types/pioneer';
import { PIONEER_CARDS, RESOURCE_CONFIG } from '../../constants/pioneer';

interface PioneerCardProps {
  cardType: PioneerCardType;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const PioneerCardComponent: React.FC<PioneerCardProps> = ({
  cardType,
  isSelected = false,
  disabled = false,
  onClick,
  size = 'md',
  showDetails = true,
}) => {
  const card = PIONEER_CARDS[cardType];
  const isDev = card.category === 'DEV';
  const targetRes = card.targetResource ? RESOURCE_CONFIG[card.targetResource] : null;

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
            ? 'scale-105 border-amber-400 ring-4 ring-amber-400/60 shadow-[0_10px_30px_rgba(245,158,11,0.5)] -translate-y-2 z-20'
            : isDev
            ? 'border-purple-600/70 hover:border-purple-400 hover:shadow-[0_8px_20px_rgba(168,85,247,0.3)]'
            : `${card.borderColor} hover:scale-102 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]`
        }
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 active:scale-95'}
        bg-gradient-to-b ${card.bgGradient}
      `}
    >
      {/* Parchment / Wood Grain Texture Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#d9770610_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black tracking-wider uppercase border ${
            isDev
              ? 'bg-purple-900/80 text-purple-200 border-purple-400/50'
              : 'bg-stone-900/80 text-amber-200 border-amber-600/40'
          }`}
        >
          {isDev ? '📜 発展カード' : '🗺️ 地形カード'}
        </span>
        <span className="text-base sm:text-lg drop-shadow">{card.icon}</span>
      </div>

      {/* Center Icon & Illustration */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1">
        <div className="text-4xl sm:text-5xl drop-shadow-md transform transition hover:scale-110">
          {card.icon}
        </div>
        <div className="text-xs sm:text-sm font-black text-amber-100 mt-2 tracking-wide text-center font-serif">
          {card.name}
        </div>
      </div>

      {/* Bottom Resource Yield or Description */}
      {showDetails && (
        <div className="relative z-10 w-full pt-1.5 border-t border-stone-700/60">
          {targetRes ? (
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-stone-400 font-sans">産出資源:</span>
              <span
                className={`font-black px-1.5 py-0.5 rounded border ${targetRes.bgBadge} ${targetRes.textBadge} ${targetRes.borderBadge}`}
              >
                {targetRes.icon} {targetRes.japaneseName}
              </span>
            </div>
          ) : (
            <div className="text-[9px] sm:text-[10px] text-purple-200 font-medium line-clamp-2 leading-tight">
              {card.description}
            </div>
          )}
        </div>
      )}

      {/* Selected Wooden Rim */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-amber-300 rounded-2xl pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
