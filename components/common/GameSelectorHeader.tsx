'use client';

import React from 'react';
import { soundManager } from '../../lib/sound';

export type ActiveGame = 'LAST_CONTINUE' | 'SENGOKU';

interface GameSelectorHeaderProps {
  activeGame: ActiveGame;
  onSelectGame: (game: ActiveGame) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameSelectorHeader: React.FC<GameSelectorHeaderProps> = ({
  activeGame,
  onSelectGame,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-3.5 py-2.5 school-chalkboard border-3 border-amber-800 rounded-2xl shadow-xl mb-3 select-none relative overflow-hidden">
      {/* Chalkboard Dust Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />

      {/* Game Selector Tabs */}
      <div className="flex items-center space-x-2 relative z-10">
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onSelectGame('LAST_CONTINUE');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeGame === 'LAST_CONTINUE'
              ? 'bg-amber-100 text-stone-900 border-2 border-amber-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)] scale-102 font-black'
              : 'bg-emerald-950/70 text-emerald-200 hover:text-white border border-emerald-700/60'
          }`}
        >
          <span>🃏</span>
          <span>LAST CONTINUE</span>
          <span className="hidden sm:inline text-[10px] opacity-80">(放課後チキンレース)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onSelectGame('SENGOKU');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeGame === 'SENGOKU'
              ? 'bg-amber-100 text-stone-900 border-2 border-amber-300 shadow-[0_2px_8px_rgba(0,0,0,0.4)] scale-102 font-black'
              : 'bg-emerald-950/70 text-emerald-200 hover:text-white border border-emerald-700/60'
          }`}
        >
          <span>🌲</span>
          <span>資源争奪戦 (森・畑・鉱山)</span>
          <span className="hidden sm:inline text-[10px] text-amber-300 font-bold">✨ NEW</span>
        </button>
      </div>

      {/* Sound Mute Toggle */}
      <div className="flex items-center space-x-2 relative z-10">
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? 'サウンドをオン' : 'サウンドをミュート'}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-mono transition border cursor-pointer ${
            isMuted
              ? 'bg-red-950/60 border-red-500/50 text-red-300 hover:bg-red-900/60'
              : 'bg-emerald-900/80 border-emerald-600/60 text-emerald-300 hover:bg-emerald-800'
          }`}
        >
          {isMuted ? '🔇 消音' : '🔔 効果音ON'}
        </button>
      </div>
    </header>
  );
};
