'use client';

import React, { useState } from 'react';
import { soundManager } from '../../lib/sound';

interface SengokuSetupModalProps {
  onStart: (playerCount: number, humanCount: number) => void;
  onBackToMenu?: () => void;
}

export const SengokuSetupModal: React.FC<SengokuSetupModalProps> = ({ onStart, onBackToMenu }) => {
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [playMode, setPlayMode] = useState<'SOLO_VS_CPU' | 'PASS_AND_PLAY'>('SOLO_VS_CPU');

  const handleStart = () => {
    soundManager.playButtonClick();
    const humanCount = playMode === 'SOLO_VS_CPU' ? 1 : playerCount;
    onStart(playerCount, humanCount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-[#0d1117] to-[#05070a] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-center relative overflow-hidden">
        {/* Cyber Neon Accents */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-3 shadow-inner">
          ⚔️ SENGOKU PROTOCOL: 資源争奪戦
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wider mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
          出陣設定（武将招集）
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          『同時出しバッティング × 合戦ダイス × 資源セット収集』<br />
          参戦武将の人数と対戦モードを選択してください。
        </p>

        {/* Mode Selector */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
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
                  ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] text-white'
                  : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-400'
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-1.5 text-amber-300">
                🤖 ソロ対戦 (vs CPU)
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                あなた1人 vs 手強いCPU武将たちと即座に対戦！
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
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-white'
                  : 'bg-slate-800/40 border-slate-700 hover:border-slate-600 text-slate-400'
              }`}
            >
              <div className="font-bold text-sm flex items-center gap-1.5 text-cyan-300">
                👥 パス＆プレイ対戦
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                1台の画面を順番に回して友達と同時心理戦！
              </div>
            </button>
          </div>
        </div>

        {/* Player Count Selector */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
            ② 参加武将数（2〜4人）
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
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-300 text-slate-950 shadow-lg scale-105'
                    : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                {count} 名
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="w-full sm:w-1/3 py-3 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 font-bold text-xs text-slate-300 transition cursor-pointer"
            >
              ⬅ メニューに戻る
            </button>
          )}
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 font-black font-serif text-slate-950 text-base shadow-[0_0_20px_rgba(245,158,11,0.6)] transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            🔥 天下分け目の出陣（ゲーム開始）
          </button>
        </div>
      </div>
    </div>
  );
};
