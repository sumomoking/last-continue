'use client';

import React from 'react';
import { TerrainCardType, PioneerPlayer } from '../../types/pioneer';
import { PIONEER_CARDS, RESOURCE_CONFIG } from '../../constants/pioneer';

interface PioneerHexTileProps {
  terrain: TerrainCardType;
  targetingPlayers: PioneerPlayer[];
  phase: string;
}

export const PioneerHexTile: React.FC<PioneerHexTileProps> = ({
  terrain,
  targetingPlayers,
  phase,
}) => {
  const card = PIONEER_CARDS[terrain];
  const res = RESOURCE_CONFIG[card.targetResource!];
  const isContest = targetingPlayers.length > 1;
  const isSolo = targetingPlayers.length === 1;

  const hexTheme = {
    FIELD: {
      bg: 'bg-gradient-to-b from-amber-600/90 via-yellow-600/80 to-amber-800/90',
      border: 'border-amber-400',
      badge: 'bg-amber-950/80 text-amber-200 border-amber-500/50',
    },
    FOREST: {
      bg: 'bg-gradient-to-b from-emerald-700/90 via-green-800/80 to-emerald-950/90',
      border: 'border-emerald-400',
      badge: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/50',
    },
    MOUNTAIN: {
      bg: 'bg-gradient-to-b from-slate-600/90 via-slate-700/80 to-slate-900/90',
      border: 'border-slate-300',
      badge: 'bg-slate-950/80 text-slate-200 border-slate-400/50',
    },
  }[terrain];

  return (
    <div
      className={`
        relative w-full rounded-3xl border-3 p-4 sm:p-5 flex flex-col justify-between shadow-2xl transition-all duration-500 overflow-hidden
        ${hexTheme.bg} ${hexTheme.border}
        ${isContest ? 'ring-4 ring-red-500/80 scale-[1.02] shadow-[0_0_35px_rgba(239,68,68,0.5)]' : ''}
      `}
    >
      {/* Wood / Parchment Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

      {/* Top Badge: Terrain Name & Resource Token */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className={`px-3 py-1 rounded-full text-xs font-serif font-black border shadow-md ${hexTheme.badge}`}
        >
          {card.icon} {card.japaneseName}
        </span>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-mono font-black border shadow-md ${res.bgBadge} ${res.textBadge} ${res.borderBadge}`}
        >
          {res.icon} {res.japaneseName} (+1)
        </span>
      </div>

      {/* Center Giant Terrain Graphic */}
      <div className="my-4 text-center select-none flex flex-col items-center">
        <div className="text-5xl sm:text-6xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform hover:scale-105 transition">
          {card.icon}
        </div>
        <div className="text-xs sm:text-sm font-black text-amber-100 mt-2 tracking-wide font-serif drop-shadow">
          {card.name}
        </div>
      </div>

      {/* Bottom Status / Meeples / Contest Notice */}
      <div className="relative z-10 pt-2 border-t border-black/30">
        {phase === 'REVEAL_ALL' ? (
          <div>
            {isContest && (
              <div className="text-center">
                <div className="inline-block px-2.5 py-0.5 bg-red-900/90 border border-red-400 text-red-200 rounded-full text-xs font-black animate-bounce mb-1.5 shadow-md">
                  ⚔️ 資源争奪！({targetingPlayers.length}組がバッティング)
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs font-bold text-white">
                  {targetingPlayers.map((p) => (
                    <span
                      key={p.id}
                      className="px-2 py-0.5 rounded-md bg-stone-900/80 border border-stone-700 shadow-sm"
                    >
                      {p.meepleIcon} {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {isSolo && (
              <div className="text-center">
                <div className="inline-block px-2.5 py-0.5 bg-emerald-900/90 border border-emerald-400 text-emerald-200 rounded-full text-xs font-black mb-1.5 shadow-md">
                  🌿 単独収穫（安全に+1獲得）
                </div>
                <div className="text-xs font-bold text-white">
                  {targetingPlayers[0].meepleIcon} {targetingPlayers[0].name}
                </div>
              </div>
            )}

            {!isContest && !isSolo && (
              <div className="text-center text-xs font-mono text-stone-300/80 font-medium">
                開拓者の派遣なし
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-xs font-mono text-stone-200/90">
            {phase === 'CARD_SELECT' ? '🎲 開拓者を派遣中…' : '待機中'}
          </div>
        )}
      </div>
    </div>
  );
};
