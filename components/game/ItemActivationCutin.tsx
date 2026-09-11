"use client";

import React, { useState, useEffect } from "react";
import { ItemAnnouncement, ItemType } from "@/types/game";
import { ITEM_DEFINITIONS } from "@/constants/items";
import { soundManager } from "@/lib/sound";

interface ItemActivationCutinProps {
  announcement?: ItemAnnouncement | null;
}

const ITEM_THEMES: Record<
  ItemType,
  {
    border: string;
    bgGradient: string;
    textGlow: string;
    badgeBg: string;
    symbol: string;
    accentGlow: string;
  }
> = {
  DEBUG: {
    border: "border-cyan-400",
    bgGradient: "from-cyan-950/95 via-slate-900/95 to-slate-950/95",
    textGlow: "text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]",
    badgeBg: "bg-cyan-500/30 text-cyan-200 border-cyan-400/60",
    symbol: "🔍",
    accentGlow: "shadow-[0_0_50px_rgba(6,182,212,0.5)]",
  },
  RESET: {
    border: "border-sky-400",
    bgGradient: "from-sky-950/95 via-slate-900/95 to-slate-950/95",
    textGlow: "text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]",
    badgeBg: "bg-sky-500/30 text-sky-200 border-sky-400/60",
    symbol: "🔄",
    accentGlow: "shadow-[0_0_50px_rgba(56,189,248,0.5)]",
  },
  SAVE: {
    border: "border-emerald-400",
    bgGradient: "from-emerald-950/95 via-slate-900/95 to-slate-950/95",
    textGlow: "text-emerald-300 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]",
    badgeBg: "bg-emerald-500/30 text-emerald-200 border-emerald-400/60",
    symbol: "💾",
    accentGlow: "shadow-[0_0_50px_rgba(52,211,153,0.5)]",
  },
  "1UP": {
    border: "border-rose-400",
    bgGradient: "from-rose-950/95 via-slate-900/95 to-slate-950/95",
    textGlow: "text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]",
    badgeBg: "bg-rose-500/30 text-rose-200 border-rose-400/60",
    symbol: "❤️",
    accentGlow: "shadow-[0_0_50px_rgba(244,63,94,0.5)]",
  },
  CONTINUE: {
    border: "border-amber-400",
    bgGradient: "from-amber-950/95 via-slate-900/95 to-slate-950/95",
    textGlow: "text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]",
    badgeBg: "bg-amber-500/30 text-amber-200 border-amber-400/60",
    symbol: "🕹️",
    accentGlow: "shadow-[0_0_50px_rgba(251,191,36,0.5)]",
  },
  GLITCH: {
    border: "border-purple-400",
    bgGradient: "from-purple-950/95 via-slate-900/95 to-slate-950/95",
    textGlow: "text-purple-300 drop-shadow-[0_0_12px_rgba(192,132,252,0.8)]",
    badgeBg: "bg-purple-500/30 text-purple-200 border-purple-400/60",
    symbol: "👾",
    accentGlow: "shadow-[0_0_50px_rgba(192,132,252,0.5)]",
  },
};

export const ItemActivationCutin: React.FC<ItemActivationCutinProps> = ({
  announcement,
}) => {
  const [visible, setVisible] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<ItemAnnouncement | null>(null);

  useEffect(() => {
    if (!announcement) return;

    // Only show if the announcement is fresh (< 6 seconds old)
    const isFresh = Date.now() - announcement.timestamp < 6000;
    if (isFresh) {
      setCurrentAnnouncement(announcement);
      setVisible(true);
      soundManager.playItemUse(announcement.item);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [announcement?.id, announcement?.timestamp]);

  if (!visible || !currentAnnouncement) return null;

  const itemInfo = ITEM_DEFINITIONS[currentAnnouncement.item];
  const theme = ITEM_THEMES[currentAnnouncement.item];

  return (
    <div className="fixed inset-x-0 top-16 sm:top-20 z-50 flex justify-center pointer-events-none px-4 animate-fade-in">
      <div
        className={`
          max-w-lg w-full rounded-2xl border-2 ${theme.border} bg-gradient-to-r ${theme.bgGradient}
          p-3 sm:p-4 ${theme.accentGlow} backdrop-blur-xl pointer-events-auto
          flex items-center gap-3 sm:gap-4 shadow-2xl relative overflow-hidden
          transform transition-all duration-300
        `}
      >
        {/* Holographic sweep overlay */}
        <div className="absolute inset-0 holo-shimmer opacity-30 pointer-events-none" />

        {/* Big Card Icon Window */}
        <div className="relative shrink-0 w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-center shadow-inner overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff20_1px,transparent_1px)] [background-size:6px_6px]" />
          <span className="text-2xl sm:text-3xl filter drop-shadow-md animate-bounce">
            {theme.symbol}
          </span>
        </div>

        {/* Announcement Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border shadow-sm ${theme.badgeBg}">
              ITEM ACTIVATED
            </span>
            <span className="text-xs font-mono text-slate-400 truncate">
              {currentAnnouncement.playerName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className={`text-sm sm:text-base font-black ${theme.textGlow}`}>
              【{itemInfo.name}】を発動！
            </h4>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-200 mt-0.5 leading-snug">
            {currentAnnouncement.message}
          </p>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg text-xs font-mono transition"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
