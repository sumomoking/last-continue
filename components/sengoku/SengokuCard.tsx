'use client';

import React from 'react';
import { SengokuCardType, ResourceType } from '../../types/sengoku';
import { SENGOKU_CARDS, RESOURCE_CONFIG } from '../../constants/sengoku';

interface SengokuCardProps {
  cardType: SengokuCardType;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const SengokuCardComponent: React.FC<SengokuCardProps> = ({
  cardType,
  isSelected = false,
  disabled = false,
  onClick,
  size = 'md',
  showDetails = true,
}) => {
  const card = SENGOKU_CARDS[cardType];
  const isEvent = card.category === 'EVENT';
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
            ? 'scale-105 border-amber-400 ring-4 ring-amber-400/50 shadow-[0_0_25px_rgba(251,191,36,0.6)] -translate-y-2 z-20'
            : isEvent
            ? 'border-purple-500/60 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]'
            : `${card.borderColor}/60 hover:${card.borderColor} hover:shadow-[0_0_15px_${card.neonColor}66]`
        }
        ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 active:scale-95'}
        bg-gradient-to-b ${card.bgGradient}
      `}
    >
      {/* Cyber Tatami / Wagara Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />

      {/* Hologram Sheen Corner Accent */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

      {/* Top Header: Badge & Category */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
            isEvent
              ? 'bg-purple-900/60 text-purple-300 border-purple-500/40'
              : 'bg-slate-900/80 text-cyan-300 border-cyan-500/40'
          }`}
        >
          {isEvent ? '⚡ 戦術' : '🚩 拠点'}
        </span>
        <span className="text-base sm:text-lg drop-shadow">{card.icon}</span>
      </div>

      {/* Center Art: Massive Kanji Brush Character with Neon Glow */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1">
        <div
          className="text-3xl sm:text-4xl md:text-5xl font-black font-serif tracking-widest drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          style={{ color: card.neonColor }}
        >
          {card.kanji}
        </div>
        <div className="text-[11px] sm:text-xs font-bold text-slate-200 mt-1 tracking-tight text-center font-mono">
          {card.name}
        </div>
      </div>

      {/* Bottom Target Resource or Effect Brief */}
      {showDetails && (
        <div className="relative z-10 w-full pt-1 border-t border-slate-700/60">
          {targetRes ? (
            <div className="flex items-center justify-between text-[10px] sm:text-xs">
              <span className="text-slate-400">獲得資源:</span>
              <span
                className={`font-bold px-1.5 py-0.5 rounded border ${targetRes.bgBadge} ${targetRes.textBadge} ${targetRes.borderBadge}`}
              >
                {targetRes.icon} {targetRes.kanji}
              </span>
            </div>
          ) : (
            <div className="text-[9px] sm:text-[10px] text-purple-200 font-medium line-clamp-2 leading-tight">
              {card.description}
            </div>
          )}
        </div>
      )}

      {/* Selected Glow Ring */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-amber-300 rounded-2xl pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
