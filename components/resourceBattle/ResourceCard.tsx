'use client';

import React from 'react';
import { GameCardType, ResourceType } from '../../types/resourceBattle';
import { GAME_CARDS, RESOURCE_MAP } from '../../constants/resourceBattle';

export type CardDisplayType = GameCardType | `RES_${ResourceType}`;

interface ResourceCardProps {
  cardType: CardDisplayType;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  isFaceDown?: boolean;
  size?: 'micro' | 'sm' | 'md' | 'lg';
  count?: number; // For stacked resource cards
  showGlow?: boolean;
  highlightText?: string;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  cardType,
  isSelected = false,
  disabled = false,
  onClick,
  isFaceDown = false,
  size = 'md',
  count,
  showGlow = false,
  highlightText,
}) => {
  // Check if it's a physical resource card (e.g., RES_WOOD, RES_RICE, RES_IRON)
  const isResourceCard = typeof cardType === 'string' && cardType.startsWith('RES_');
  const resourceKey = isResourceCard ? (cardType.replace('RES_', '') as ResourceType) : null;
  const resData = resourceKey ? RESOURCE_MAP[resourceKey] : null;

  const gameCard = !isResourceCard ? GAME_CARDS[cardType as GameCardType] : null;
  const isEvent = gameCard?.category === 'EVENT';
  const targetRes = gameCard?.targetResource ? RESOURCE_MAP[gameCard.targetResource] : null;

  // Sizing definitions for physical card proportions (approx standard 2.5 x 3.5 ratio)
  const sizeStyles = {
    micro: {
      box: 'w-10 h-14 rounded-md text-[9px] p-1',
      kanji: 'text-sm font-black',
      title: 'hidden',
      badge: 'hidden',
      icon: 'text-xs',
      desc: 'hidden',
    },
    sm: {
      box: 'w-20 h-28 sm:w-22 sm:h-32 rounded-xl text-[11px] p-2',
      kanji: 'text-2xl font-black',
      title: 'text-[11px] font-black',
      badge: 'text-[9px] px-1.5 py-0.2',
      icon: 'text-sm',
      desc: 'text-[9px] leading-tight',
    },
    md: {
      box: 'w-32 h-48 sm:w-36 sm:h-52 rounded-2xl text-xs p-3',
      kanji: 'text-4xl sm:text-5xl font-black',
      title: 'text-sm sm:text-base font-black',
      badge: 'text-[10px] px-2 py-0.5',
      icon: 'text-base',
      desc: 'text-[10px] sm:text-[11px] leading-tight',
    },
    lg: {
      box: 'w-44 h-64 sm:w-48 sm:h-70 rounded-2xl text-sm p-4',
      kanji: 'text-5xl sm:text-6xl font-black',
      title: 'text-base sm:text-lg font-black',
      badge: 'text-xs px-2.5 py-1',
      icon: 'text-xl',
      desc: 'text-xs leading-normal',
    },
  }[size];

  // ── 1. FACE-DOWN CARD (Physical Card Back) ──
  if (isFaceDown) {
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        className={`
          ${sizeStyles.box}
          relative select-none border-2 border-[#8b5a2b] rounded-xl sm:rounded-2xl
          bg-gradient-to-br from-[#2c1d11] via-[#1a110a] to-[#3a2213]
          shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center overflow-hidden
          transition-transform duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
        `}
      >
        {/* Card Back Ornate Border Pattern */}
        <div className="absolute inset-1 border border-amber-500/40 rounded-lg sm:rounded-xl pointer-events-none flex flex-col items-center justify-center p-1 bg-[radial-gradient(#f59e0b15_1px,transparent_1px)] bg-[size:0.5rem_0.5rem]">
          <div className="w-full h-full border border-amber-600/30 rounded-md flex flex-col items-center justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-amber-400/50 bg-amber-950/80 flex items-center justify-center shadow-inner">
              <span className="text-amber-300 text-sm sm:text-base">🎴</span>
            </div>
            {size !== 'micro' && (
              <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-200/90 mt-1 tracking-widest uppercase">
                CARD
              </span>
            )}
          </div>
        </div>

        {count !== undefined && count > 1 && (
          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-white z-20">
            ×{count}
          </div>
        )}
      </div>
    );
  }

  // ── 2. PHYSICAL RESOURCE CARD (木 / 小麦 / 鉄) ──
  if (isResourceCard && resData) {
    const resColorStyles = {
      WOOD: {
        border: 'border-[#784820]',
        bg: 'bg-gradient-to-b from-[#f5ede2] via-[#e8d7c0] to-[#dbc2a0] text-[#42250e]',
        innerBorder: 'border-[#8c592a]',
        badgeBg: 'bg-[#613612] text-[#ffedd5]',
        glow: 'shadow-[0_0_20px_rgba(180,83,9,0.5)]',
      },
      RICE: {
        border: 'border-[#ca8a04]',
        bg: 'bg-gradient-to-b from-[#fefce8] via-[#fef08a] to-[#fde047] text-[#713f12]',
        innerBorder: 'border-[#eab308]',
        badgeBg: 'bg-[#854d0e] text-[#fef9c3]',
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.6)]',
      },
      IRON: {
        border: 'border-[#475569]',
        bg: 'bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] text-[#0f172a]',
        innerBorder: 'border-[#64748b]',
        badgeBg: 'bg-[#1e293b] text-[#e2e8f0]',
        glow: 'shadow-[0_0_20px_rgba(100,116,139,0.5)]',
      },
    }[resourceKey!];

    return (
      <div
        onClick={!disabled ? onClick : undefined}
        className={`
          ${sizeStyles.box}
          ${resColorStyles.border}
          ${resColorStyles.bg}
          relative select-none border-2 sm:border-[2.5px] rounded-xl sm:rounded-2xl
          shadow-[0_8px_18px_rgba(0,0,0,0.35)] flex flex-col justify-between overflow-hidden
          transition-all duration-200
          ${isSelected ? 'scale-105 ring-4 ring-amber-400 -translate-y-2 z-30 ' + resColorStyles.glow : ''}
          ${showGlow ? resColorStyles.glow : ''}
          ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl active:scale-95' : ''}
        `}
      >
        {/* Inner Card Margin Line */}
        <div className={`absolute inset-1 sm:inset-1.5 border ${resColorStyles.innerBorder} rounded-lg sm:rounded-xl pointer-events-none opacity-40`} />

        {/* Top Tag: 資源カード */}
        <div className="relative z-10 flex items-center justify-between w-full">
          <span className={`rounded-sm font-black tracking-wider uppercase ${sizeStyles.badge} ${resColorStyles.badgeBg}`}>
            資源
          </span>
          <span className={sizeStyles.icon}>{resData.icon}</span>
        </div>

        {/* Center Illustration & Resource Name */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-0.5 text-center">
          <div className="text-2xl sm:text-3xl filter drop-shadow-sm mb-0.5">
            {resData.icon}
          </div>
          <div className={`${sizeStyles.kanji} font-serif tracking-tight drop-shadow-sm`}>
            {resData.name}
          </div>
        </div>

        {/* Bottom Card Footer */}
        <div className="relative z-10 w-full pt-1 border-t border-black/15 flex items-center justify-between text-[9px] sm:text-[10px] font-bold opacity-80">
          <span>{size !== 'micro' ? '【文化祭】' : ''}</span>
          <span className="font-mono">RESOURCE</span>
        </div>

        {/* Quantity Badge if stacked */}
        {count !== undefined && count > 0 && (
          <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-black text-[11px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20 animate-scale-in">
            ×{count}
          </div>
        )}
      </div>
    );
  }

  // ── 3. LOCATION & EVENT GAME CARDS (森 / 畑 / 鉱山 / イベントカード) ──
  if (!gameCard) return null;

  const cardTheme = isEvent
    ? {
        border: 'border-purple-600',
        bg: 'bg-gradient-to-b from-[#2e1065] via-[#1e1b4b] to-[#0f0e1e] text-purple-100',
        innerBorder: 'border-purple-400/40',
        badgeBg: 'bg-purple-900/90 text-purple-200 border-purple-400/70',
        kanjiColor: 'text-purple-200',
        glow: 'shadow-[0_0_25px_rgba(168,85,247,0.6)]',
      }
    : {
        border: 'border-amber-600',
        bg: 'bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#171513] text-amber-100',
        innerBorder: 'border-amber-500/40',
        badgeBg: 'bg-amber-950/90 text-amber-200 border-amber-500/70',
        kanjiColor: 'text-amber-200',
        glow: 'shadow-[0_0_25px_rgba(245,158,11,0.6)]',
      };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        ${sizeStyles.box}
        ${cardTheme.border}
        ${cardTheme.bg}
        relative select-none border-2 sm:border-[2.5px] rounded-xl sm:rounded-2xl
        shadow-[0_10px_25px_rgba(0,0,0,0.55)] flex flex-col justify-between overflow-hidden
        transition-all duration-200
        ${
          isSelected
            ? 'scale-105 ring-4 ring-yellow-400 -translate-y-3 z-30 ' + cardTheme.glow
            : ''
        }
        ${showGlow ? cardTheme.glow : ''}
        ${
          disabled
            ? 'opacity-40 grayscale cursor-not-allowed'
            : onClick
            ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl active:scale-95'
            : ''
        }
      `}
    >
      {/* Decorative Ornate Inner Border */}
      <div className={`absolute inset-1 sm:inset-1.5 border ${cardTheme.innerBorder} rounded-lg sm:rounded-xl pointer-events-none`} />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className={`rounded font-black tracking-wider uppercase border ${sizeStyles.badge} ${cardTheme.badgeBg}`}>
          {isEvent ? '⚡ イベント' : '🌲 場所カード'}
        </span>
        <span className={sizeStyles.icon}>{gameCard.icon}</span>
      </div>

      {/* Center Kanji Artwork */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-1 text-center">
        <div className={`${sizeStyles.kanji} font-serif ${cardTheme.kanjiColor} drop-shadow-md`}>
          {gameCard.kanji}
        </div>
        <div className={`${sizeStyles.title} text-white mt-0.5 drop-shadow`}>
          {gameCard.name}
        </div>
      </div>

      {/* Bottom Yield / Effect Box */}
      <div className="relative z-10 w-full pt-1.5 border-t border-white/20">
        {targetRes ? (
          <div className="bg-black/60 rounded-lg p-1 text-center border border-white/10">
            <div className="text-[9px] sm:text-[10px] text-stone-300">
              単独で出すと獲得:
            </div>
            <div className="font-black text-xs sm:text-sm text-amber-300 flex items-center justify-center gap-1">
              <span>{targetRes.icon}</span>
              <span>【{targetRes.name}】カード</span>
            </div>
          </div>
        ) : (
          <div className={`bg-black/60 rounded-lg p-1.5 text-center border border-white/10 ${sizeStyles.desc} text-purple-200 font-medium`}>
            {gameCard.description}
          </div>
        )}
      </div>

      {/* Highlight Text Overlay if provided */}
      {highlightText && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-black text-xs px-2 py-1 rounded-full shadow-lg border border-white rotate-[-6deg] z-30 whitespace-nowrap animate-pulse">
          {highlightText}
        </div>
      )}
    </div>
  );
};

