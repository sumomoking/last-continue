'use client';

import React, { useState } from 'react';
import { soundManager } from '../../lib/sound';

import { ResourceCard } from './ResourceCard';

interface ResourceSetupModalProps {
  onStart: (playerCount: number, humanCount: number) => void;
  onBackToMenu?: () => void;
}

export const ResourceSetupModal: React.FC<ResourceSetupModalProps> = ({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-gradient-to-b from-[#1c1917] via-[#292524] to-[#12100e] border-4 border-amber-500 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-2 shadow-inner">
          🏫 文化祭 リアルカード対決
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide mb-1">
          資源争奪カードゲーム
        </h2>
        <p className="text-xs text-stone-300 mb-4 leading-relaxed">
          手札から「森」「畑」「鉱山」カードを伏せて出し、<br />
          場の「木」「小麦」「鉄」資源カードを奪い合います！
        </p>

        {/* Card Previews Preview Row */}
        <div className="flex items-center justify-center gap-2 my-3 p-2.5 rounded-2xl bg-black/40 border border-stone-700">
          <div className="flex -space-x-2">
            <ResourceCard cardType="FOREST" size="micro" />
            <ResourceCard cardType="FIELD" size="micro" />
            <ResourceCard cardType="MINE" size="micro" />
          </div>
          <span className="text-xs font-bold text-amber-300">➔ 獲得 ➔</span>
          <div className="flex -space-x-2">
            <ResourceCard cardType="RES_WOOD" size="micro" />
            <ResourceCard cardType="RES_RICE" size="micro" />
            <ResourceCard cardType="RES_IRON" size="micro" />
          </div>
        </div>

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
              className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                playMode === 'SOLO_VS_CPU'
                  ? 'bg-amber-600/20 border-amber-400 text-white shadow-md'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <div className="font-bold text-sm text-amber-300">
                🤖 ソロ対戦 (vs CPU)
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                CPUプレイヤーとすぐに対戦できます。
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                setPlayMode('PASS_AND_PLAY');
              }}
              className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                playMode === 'PASS_AND_PLAY'
                  ? 'bg-cyan-600/20 border-cyan-400 text-white shadow-md'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400'
              }`}
            >
              <div className="font-bold text-sm text-cyan-300">
                👥 パス＆プレイ対戦
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                1台の端末で順番にカードを出します。
              </div>
            </button>
          </div>
        </div>

        <div className="mb-6 text-left">
          <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
            ② プレイ人数（2～4人）
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
                className={`py-3 rounded-xl border-2 font-black font-mono text-base transition cursor-pointer ${
                  playerCount === count
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 border-amber-300 text-slate-950 shadow-lg scale-105'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300'
                }`}
              >
                {count} 人
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="w-full sm:w-1/3 py-3 rounded-2xl border border-slate-700 bg-slate-800/80 font-bold text-xs text-slate-300 transition cursor-pointer"
            >
              ⬅ メニューに戻る
            </button>
          )}
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black font-serif text-base shadow-[0_10px_25px_rgba(245,158,11,0.5)] transition transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            🔥 ゲーム開始（カード配布）
          </button>
        </div>
      </div>
    </div>
  );
};
