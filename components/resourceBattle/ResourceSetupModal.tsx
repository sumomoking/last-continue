'use client';

import React, { useState } from 'react';
import { soundManager } from '../../lib/sound';
import { ResourceCard } from './ResourceCard';

interface ResourceSetupModalProps {
  onStart: (playerCount: number, humanCount: number, playerNames?: string[]) => void;
  onSelectOnline?: () => void;
  onBackToMenu?: () => void;
}

export const ResourceSetupModal: React.FC<ResourceSetupModalProps> = ({
  onStart,
  onSelectOnline,
  onBackToMenu,
}) => {
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [playMode, setPlayMode] = useState<'SOLO_VS_CPU' | 'PASS_AND_PLAY'>('SOLO_VS_CPU');
  const [playerNames, setPlayerNames] = useState<string[]>([
    'Player 1',
    'Player 2',
    'Player 3',
    'Player 4',
  ]);

  const handleNameChange = (index: number, val: string) => {
    const updated = [...playerNames];
    updated[index] = val;
    setPlayerNames(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playButtonClick();
    const humanCount = playMode === 'SOLO_VS_CPU' ? 1 : playerCount;
    const finalNames = playerNames.slice(0, playerCount).map((name, i) => {
      if (playMode === 'SOLO_VS_CPU' && i > 0) {
        return `CPU ${i + 1}`;
      }
      return name.trim() || `Player ${i + 1}`;
    });
    onStart(playerCount, humanCount, finalNames);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-3 sm:p-6 relative z-10 select-none">
      {/* Online Mode Switch Button on Top Right */}
      {onSelectOnline && (
        <div className="w-full max-w-xl mb-4 flex justify-end z-20">
          <button
            type="button"
            onClick={onSelectOnline}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-[0_4px_12px_rgba(217,119,6,0.3)] border border-amber-300/60 transition flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95"
          >
            <span>🌐</span>
            <span>オンライン対戦（部屋作成・参加）➔</span>
          </button>
        </div>
      )}

      {/* Main Tabletop Board Frame */}
      <div className="w-full max-w-xl table-wood-rail p-3 sm:p-4 rounded-[28px] shadow-2xl relative z-20 border border-amber-900/40">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        {/* Inner Tabletop Felt Surface */}
        <div className="tabletop-surface rounded-[22px] p-5 sm:p-7 table-leather-stitch text-center relative overflow-hidden">
          {/* Title Badge */}
          <div className="inline-block px-4 py-1 bg-amber-950/60 border border-amber-500/40 rounded-full text-xs font-mono tracking-widest text-amber-300 mb-2 shadow-inner">
            {playMode === 'SOLO_VS_CPU' ? 'SOLO VS CPU MODE' : 'LOCAL PASS & PLAY MODE'}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            資源争奪 <span className="text-amber-400">カードゲーム</span>
          </h1>
          <p className="text-amber-200/80 font-medium text-xs sm:text-sm mb-4 tracking-wide">
            「森・畑・鉱山から資源を集め、最多ボーナス＆セットを狙え！」
          </p>

          {/* Card Previews Preview Row */}
          <div className="flex items-center justify-center gap-2 mb-5 p-2 rounded-2xl bg-black/40 border border-amber-900/40">
            <div className="flex -space-x-2">
              <ResourceCard cardType="FOREST" size="micro" />
              <ResourceCard cardType="FIELD" size="micro" />
              <ResourceCard cardType="MINE" size="micro" />
            </div>
            <span className="text-[11px] font-bold text-amber-300">➔ 獲得 ➔</span>
            <div className="flex -space-x-2">
              <ResourceCard cardType="RES_WOOD" size="micro" />
              <ResourceCard cardType="RES_RICE" size="micro" />
              <ResourceCard cardType="RES_IRON" size="micro" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* 1. Play Mode Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-2">
                1. プレイモードの選択
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setPlayMode('SOLO_VS_CPU');
                  }}
                  className={`p-3 rounded-xl font-bold border transition-all cursor-pointer text-left ${
                    playMode === 'SOLO_VS_CPU'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-black/40 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-black text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                    <span>🤖</span> ソロ対戦 (vs CPU)
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                    CPUとすぐに対戦
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.playButtonClick();
                    setPlayMode('PASS_AND_PLAY');
                  }}
                  className={`p-3 rounded-xl font-bold border transition-all cursor-pointer text-left ${
                    playMode === 'PASS_AND_PLAY'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-black/40 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-black text-xs sm:text-sm text-amber-300 flex items-center gap-1.5">
                    <span>👥</span> パス＆プレイ対戦
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
                    1台の端末で交代対戦
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Player Count Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-2">
                2. プレイ人数の選択
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
                    className={`py-3 rounded-xl font-bold border transition-all cursor-pointer ${
                      playerCount === count
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-black/40 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    👥 {count} 人プレイ
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Player Names Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-2">
                3. プレイヤー名の入力
              </label>
              <div className="space-y-2.5">
                {Array.from({ length: playerCount }).map((_, idx) => {
                  const isCpuPlayer = playMode === 'SOLO_VS_CPU' && idx > 0;
                  return (
                    <div key={idx} className="flex items-center space-x-2.5">
                      <span className={`w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-mono font-black shadow-inner ${
                        isCpuPlayer
                          ? 'bg-slate-900 border-slate-700 text-slate-400'
                          : 'bg-slate-800 border-slate-700 text-amber-300'
                      }`}>
                        P{idx + 1}
                      </span>
                      {isCpuPlayer ? (
                        <div className="flex-1 bg-[#0b101d]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-400 flex items-center justify-between">
                          <span>CPU {idx + 1}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold">
                            🤖 CPU
                          </span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={playerNames[idx]}
                          onChange={(e) => handleNameChange(idx, e.target.value)}
                          placeholder={`Player ${idx + 1}`}
                          maxLength={12}
                          className="flex-1 bg-[#0b101d] border border-amber-600/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Rules Summary Box */}
            <div className="bg-black/40 border border-amber-600/30 rounded-xl p-3.5 text-xs text-slate-300/80 space-y-1.5 leading-relaxed">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>📋</span> ルール概要
              </div>
              <p>• 全3ターン勝負！手札の「森」「畑」「鉱山」「イベント」を1枚伏せて同時にオープン。</p>
              <p>• 🌿 <span className="text-emerald-300 font-bold">単独獲得</span>：他の人と被らなければ資源カードを1枚獲得！</p>
              <p>• ⚔️ <span className="text-red-300 font-bold">被り発生</span>：同じ場所を選んだプレイヤー同士でサイコロ勝負！勝者が2枚総取り！</p>
              <p>• 🏆 <span className="text-amber-300 font-bold">得点計算</span>：🪵木・🌾小麦・⚙️鉄の「3種セット(1P)」＋「各資源の最多ボーナス(2P)」！</p>
            </div>

            {/* 5. Start Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {onBackToMenu && (
                <button
                  type="button"
                  onClick={onBackToMenu}
                  className="w-full sm:w-1/3 py-4 rounded-2xl border border-slate-700 bg-slate-800/80 font-bold text-xs text-slate-300 hover:text-white transition cursor-pointer"
                >
                  ⬅ メニューに戻る
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-lg tracking-wider rounded-2xl shadow-[0_8px_20px_rgba(245,158,11,0.4)] border border-amber-300/60 hover:shadow-amber-500/60 transform active:scale-98 transition duration-150 cursor-pointer"
              >
                🎲 GAME START
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
