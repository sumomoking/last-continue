'use client';

import React from 'react';
import { ItemType } from '../../types/game';
import { ITEM_DEFINITIONS } from '../../constants/items';

interface ItemCardViewProps {
  item: ItemType;
  canUse: boolean;
  disabledReason?: string;
  onUse?: () => void;
  isCompact?: boolean;
}

// アイテムごとのカラーテーマ定義
const ITEM_THEMES: Record<
  ItemType,
  {
    border: string;
    glow: string;
    bgGradient: string;
    badgeBg: string;
    accentColor: string;
    tagText: string;
    symbol: string;
  }
> = {
  DEBUG: {
    border: 'border-cyan-400/80',
    glow: 'hover:shadow-[0_0_25px_rgba(0,229,255,0.45)]',
    bgGradient: 'from-cyan-950/90 via-slate-900/95 to-slate-950',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    accentColor: 'text-cyan-400',
    tagText: 'INSPECT',
    symbol: '🔍',
  },
  RESET: {
    border: 'border-sky-400/80',
    glow: 'hover:shadow-[0_0_25px_rgba(56,189,248,0.45)]',
    bgGradient: 'from-sky-950/90 via-slate-900/95 to-slate-950',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    accentColor: 'text-sky-400',
    tagText: 'SHUFFLE',
    symbol: '🔄',
  },
  SAVE: {
    border: 'border-emerald-400/80',
    glow: 'hover:shadow-[0_0_25px_rgba(52,211,153,0.45)]',
    bgGradient: 'from-emerald-950/90 via-slate-900/95 to-slate-950',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    accentColor: 'text-emerald-400',
    tagText: 'RESURRECT',
    symbol: '💾',
  },
  '1UP': {
    border: 'border-rose-400/80',
    glow: 'hover:shadow-[0_0_25px_rgba(244,63,94,0.45)]',
    bgGradient: 'from-rose-950/90 via-slate-900/95 to-slate-950',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    accentColor: 'text-rose-400',
    tagText: 'HEAL',
    symbol: '❤️',
  },
  CONTINUE: {
    border: 'border-amber-400/80',
    glow: 'hover:shadow-[0_0_25px_rgba(251,191,36,0.45)]',
    bgGradient: 'from-amber-950/90 via-slate-900/95 to-slate-950',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    accentColor: 'text-amber-400',
    tagText: 'SHIELD',
    symbol: '🕹️',
  },
  GLITCH: {
    border: 'border-purple-400/80',
    glow: 'hover:shadow-[0_0_25px_rgba(192,132,252,0.45)]',
    bgGradient: 'from-purple-950/90 via-slate-900/95 to-slate-950',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    accentColor: 'text-purple-400',
    tagText: 'DISPEL',
    symbol: '👾',
  },
};

export const ItemCardView: React.FC<ItemCardViewProps> = ({
  item,
  canUse,
  disabledReason,
  onUse,
  isCompact = false,
}) => {
  const info = ITEM_DEFINITIONS[item];
  const theme = ITEM_THEMES[item];

  return (
    <div
      className={`group relative select-none rounded-2xl border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
        theme.border
      } ${canUse ? `${theme.glow} hover-lift-card cursor-pointer` : 'opacity-75 grayscale-[25%]'} ${
        isCompact ? 'w-32 sm:w-36 h-48 sm:h-52 p-2.5' : 'w-full max-w-[210px] h-[270px] p-3'
      } bg-gradient-to-b ${theme.bgGradient}`}
    >
      {/* Outer Foil Corner Accents */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-white/40 pointer-events-none" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-white/40 pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-white/40 pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-white/40 pointer-events-none" />

      {/* Holographic Sheen Overlay */}
      <div className="absolute inset-0 holo-shimmer opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none" />

      {/* 1. Header (Title & Type Badge) */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm">{info.icon}</span>
            <span className={`font-black font-mono tracking-tight truncate ${isCompact ? 'text-xs' : 'text-sm'} text-white`}>
              {info.name}
            </span>
          </div>
          <span
            className={`font-mono font-bold tracking-widest rounded px-1.5 py-0.2 border text-[9px] uppercase shrink-0 ${theme.badgeBg}`}
          >
            {theme.tagText}
          </span>
        </div>
      </div>

      {/* 2. Center Art Frame (Cyber Artwork Window) */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center">
        <div
          className={`w-full rounded-xl bg-slate-950/80 border border-slate-700/60 flex items-center justify-center shadow-inner relative overflow-hidden ${
            isCompact ? 'h-16' : 'h-24'
          }`}
        >
          {/* Cyber Radial Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />
          
          {/* Animated Glow Aura */}
          <div className={`absolute w-12 h-12 rounded-full blur-md opacity-40 bg-current ${theme.accentColor}`} />

          {/* Center Big Icon */}
          <span className={`${isCompact ? 'text-2xl' : 'text-4xl'} transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]`}>
            {theme.symbol}
          </span>
        </div>

        {/* Description Text */}
        <div className="w-full mt-2 bg-slate-950/60 rounded-lg p-1.5 border border-slate-800/80 text-left">
          <p className={`text-slate-300 leading-tight ${isCompact ? 'text-[10px] line-clamp-2' : 'text-[11px] line-clamp-3'}`}>
            {info.description}
          </p>
        </div>
      </div>

      {/* 3. Footer Action Button */}
      <div className="relative z-10 pt-1">
        {canUse ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUse?.();
            }}
            className="w-full py-1.5 px-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs rounded-lg shadow-lg shadow-cyan-950/60 border border-cyan-400/50 transition duration-150 transform active:scale-95 cursor-pointer flex items-center justify-center gap-1"
          >
            <span>発動</span>
            <span className="text-[10px]">▶</span>
          </button>
        ) : (
          <div className="text-center py-1 text-[10px] font-mono text-slate-400 bg-slate-950/80 rounded border border-slate-800/80 truncate px-1">
            {disabledReason || '使用不可'}
          </div>
        )}
      </div>
    </div>
  );
};
