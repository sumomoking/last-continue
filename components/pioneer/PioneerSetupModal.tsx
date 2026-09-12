'use client';

import React, { useState } from 'react';
import { soundManager } from '../../lib/sound';

interface PioneerSetupModalProps {
  onStart: (playerCount: number, humanCount: number) => void;
  onBackToMenu?: () => void;
}

export const PioneerSetupModal: React.FC<PioneerSetupModalProps> = ({
  onStart,
  onBackToMenu,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [playMode, setPlayMode] = useState<'SOLO_VS_CPU' | 'PASS_AND_PLAY'>('SOLO_VS_CPU');

  const handleStart = () => {
    soundManager.playButtonClick();
    const humanCount = playMode === 'SOLO_VS_CPU' ? 1 : playerCount;
    onStart(playerCount, humanCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-gradient-to-b from-stone-900 via-[#1c1917] to-[#0c0a09] border-3 border-amber-600/70 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Wood Texture & Warm Sun Accents */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title Header */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-3 shadow-inner">
          🏝️ RESOURCIA: 資源開拓島
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-amber-100 tracking-wide mb-2 drop-shadow">
          開拓者の招集（ゲーム設定）
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 mb-6 leading-relaxed">
          『カタン風 資源バッティング開拓戦』<br />
          麦畑・森林・鉱山へ同時に開拓民を派遣し、資源を集めて開拓地を建設しよう！
        </p>

        {/* Play Mode Selector */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-mono font-bold text-amber-200 uppercase mb-2">
            ① プレイモード選択
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                setPlayMode('SOLO_VS_CPU');
              }}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                playMode === 'SOLO_VS_CPU'
                  ? 'bg-amber-600/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-amber-100'
                  : 'bg-stone-800/50 border-stone-700 hover:border-stone-600 text-stone-400'
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-1.5 text-amber-300">
                🤖 ソロ対戦 (vs CPU)
              </div>
              <div className="text-[11px] text-stone-400 mt-1">
                手強いCPU開拓団と今すぐ対戦！
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                setPlayMode('PASS_AND_PLAY');
              }}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                playMode === 'PASS_AND_PLAY'
                  ? 'bg-emerald-600/20 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-emerald-100'
                  : 'bg-stone-800/50 border-stone-700 hover:border-stone-600 text-stone-400'
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-1.5 text-emerald-300">
                👥 パス＆プレイ対戦
              </div>
              <div className="text-[11px] text-stone-400 mt-1">
                友達と画面を回して駆け引き！
              </div>
            </button>
          </div>
        </div>

        {/* Player Count Selector */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-mono font-bold text-amber-200 uppercase mb-2">
            ② 参加開拓団（2〜4人）
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => {
                  soundManager.playButtonClick();
                  setPlayerCount(count);
                }}
                className={`py-3 rounded-xl border-2 font-black font-mono text-base transition-all cursor-pointer ${
                  playerCount === count
                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 border-amber-300 text-stone-950 shadow-lg scale-105'
                    : 'bg-stone-800/60 border-stone-700 hover:border-stone-600 text-stone-300'
                }`}
              >
                {count} 開拓団
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="w-full sm:w-1/3 py-3 rounded-2xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 font-bold text-xs text-stone-300 transition cursor-pointer"
            >
              ⬅ メニューに戻る
            </button>
          )}
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 font-black font-serif text-stone-950 text-base shadow-[0_10px_25px_rgba(245,158,11,0.5)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            ⛵ リソーシア島へ船出（開拓開始）
          </button>
        </div>
      </div>
    </div>
  );
};
