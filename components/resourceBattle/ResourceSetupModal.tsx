'use client';

import React, { useState } from 'react';
import { soundManager } from '../../lib/sound';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-[#0d1424] to-[#060a14] border-2 border-amber-500/70 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-3 shadow-inner">
          🃏 資源争奪カードゲーム
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide mb-2">
          ゲーム設定
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
          全プレイヤーに「森」「畑」「鉱山」とイベントカードを配り、<br />
          場の「木」「小麦」「鉄」を奪い合ってポイントを競います。
        </p>

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
