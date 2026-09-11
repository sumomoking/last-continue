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
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-3 py-2 bg-slate-950/80 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-md mb-3 select-none">
      {/* Game Selector Tabs */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onSelectGame('LAST_CONTINUE');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeGame === 'LAST_CONTINUE'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-102'
              : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>🃏</span>
          <span>LAST CONTINUE</span>
          <span className="hidden sm:inline text-[10px] opacity-75">(チキンレース)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onSelectGame('SENGOKU');
          }}
          className={`px-3.5 py-1.5 rounded-xl font-bold font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeGame === 'SENGOKU'
              ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-102'
              : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <span>⚔️</span>
          <span>戦国プロトコル</span>
          <span className="hidden sm:inline text-[10px] opacity-90 font-sans font-bold">✨ NEW (バッティング資源戦)</span>
        </button>
      </div>

      {/* Sound Mute Toggle */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={onToggleMute}
          title={isMuted ? 'サウンドをオン' : 'サウンドをミュート'}
          className={`p-2 rounded-xl text-xs font-mono transition border cursor-pointer ${
            isMuted
              ? 'bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/60'
              : 'bg-slate-900/80 border-slate-800 text-emerald-400 hover:bg-slate-800'
          }`}
        >
          {isMuted ? '🔇 消音中' : '🔊 音声ON'}
        </button>
      </div>
    </header>
  );
};
