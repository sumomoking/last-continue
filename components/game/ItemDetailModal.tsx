"use client";

import React from "react";
import { ItemType } from "@/types/game";
import { ITEM_DEFINITIONS } from "@/constants/items";

interface ItemDetailModalProps {
  item: ItemType | null;
  canUse?: boolean;
  disabledReason?: string;
  onUse?: () => void;
  onClose: () => void;
}

const ITEM_THEMES: Record<
  ItemType,
  {
    border: string;
    bgGradient: string;
    badgeBg: string;
    accentColor: string;
    tagText: string;
    symbol: string;
    glow: string;
  }
> = {
  DEBUG: {
    border: "border-cyan-400",
    bgGradient: "from-cyan-950 via-slate-900 to-slate-950",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    accentColor: "text-cyan-400",
    tagText: "INSPECT",
    symbol: "🔍",
    glow: "shadow-[0_0_50px_rgba(6,182,212,0.4)]",
  },
  RESET: {
    border: "border-sky-400",
    bgGradient: "from-sky-950 via-slate-900 to-slate-950",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    accentColor: "text-sky-400",
    tagText: "REDRAW",
    symbol: "🔄",
    glow: "shadow-[0_0_50px_rgba(56,189,248,0.4)]",
  },
  SAVE: {
    border: "border-emerald-400",
    bgGradient: "from-emerald-950 via-slate-900 to-slate-950",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    accentColor: "text-emerald-400",
    tagText: "RESURRECT",
    symbol: "💾",
    glow: "shadow-[0_0_50px_rgba(52,211,153,0.4)]",
  },
  "1UP": {
    border: "border-rose-400",
    bgGradient: "from-rose-950 via-slate-900 to-slate-950",
    badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    accentColor: "text-rose-400",
    tagText: "HEAL",
    symbol: "❤️",
    glow: "shadow-[0_0_50px_rgba(244,63,94,0.4)]",
  },
  CONTINUE: {
    border: "border-amber-400",
    bgGradient: "from-amber-950 via-slate-900 to-slate-950",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    accentColor: "text-amber-400",
    tagText: "SHIELD",
    symbol: "🕹️",
    glow: "shadow-[0_0_50px_rgba(251,191,36,0.4)]",
  },
  GLITCH: {
    border: "border-purple-400",
    bgGradient: "from-purple-950 via-slate-900 to-slate-950",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    accentColor: "text-purple-400",
    tagText: "DISPEL",
    symbol: "👾",
    glow: "shadow-[0_0_50px_rgba(192,132,252,0.4)]",
  },
};

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  canUse = false,
  disabledReason,
  onUse,
  onClose,
}) => {
  if (!item) return null;

  const info = ITEM_DEFINITIONS[item];
  const theme = ITEM_THEMES[item];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className={`
          w-full max-w-sm rounded-3xl border-2 ${theme.border} bg-gradient-to-b ${theme.bgGradient}
          p-6 ${theme.glow} shadow-2xl relative overflow-hidden flex flex-col gap-4 text-center
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Holographic overlay */}
        <div className="absolute inset-0 holo-shimmer opacity-40 pointer-events-none" />

        {/* Header: Type Tag & Close Button */}
        <div className="flex items-center justify-between z-10">
          <span className={`font-mono font-bold tracking-widest rounded-full px-2.5 py-0.5 border text-[10px] uppercase ${theme.badgeBg}`}>
            {theme.tagText}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Big Artwork Frame */}
        <div className="relative z-10 w-full h-36 rounded-2xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-center shadow-inner overflow-hidden my-1">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:8px_8px]" />
          <div className={`absolute w-20 h-20 rounded-full blur-xl opacity-50 bg-current ${theme.accentColor}`} />
          <span className="text-6xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] animate-pulse">
            {theme.symbol}
          </span>
        </div>

        {/* Card Title */}
        <div className="z-10">
          <h3 className="text-2xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-2">
            <span>{info.icon}</span>
            <span>{info.name}</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            発動タイミング: {info.timing}
          </span>
        </div>

        {/* Card Description Box */}
        <div className="z-10 bg-slate-950/70 rounded-2xl p-4 border border-slate-800 text-left shadow-inner">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
            CARD EFFECT / 効果説明
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {info.description}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="z-10 pt-1 flex flex-col gap-2">
          {onUse && canUse ? (
            <button
              type="button"
              onClick={() => {
                onUse();
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-xl shadow-cyan-950/80 border border-cyan-400/60 transform active:scale-95 transition cursor-pointer"
            >
              このアイテムを発動する ▶
            </button>
          ) : (
            onUse && (
              <div className="text-center py-2 text-xs font-mono text-slate-400 bg-slate-950/80 rounded-xl border border-slate-800">
                {disabledReason || "現在は使用できません"}
              </div>
            )
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
