'use client';

import React, { useState } from 'react';

interface SetupScreenProps {
  onStart: (playerNames: string[]) => void;
  onSelectOnline: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, onSelectOnline }) => {
  const [playerCount, setPlayerCount] = useState<3 | 4>(3);
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
    const finalNames = playerNames.slice(0, playerCount).map((name, i) => name.trim() || `Player ${i + 1}`);
    onStart(finalNames);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 relative z-10 select-none bg-[#05070c]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#05070c] to-[#020306] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Online Mode Switch Button on Top Right */}
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
            LOCAL PASS & PLAY MODE
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            LAST <span className="text-red-500">CONTINUE</span>
          </h1>
          <p className="text-amber-200/80 font-medium text-xs sm:text-sm mb-6 tracking-wide">
            「次の1PLAY、誰が挑戦する？」
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Player Count Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-2">
                1. プレイ人数の選択
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlayerCount(3)}
                  className={`py-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    playerCount === 3
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-black/40 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  👥 3 人プレイ
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerCount(4)}
                  className={`py-3 rounded-xl font-bold border transition-all cursor-pointer ${
                    playerCount === 4
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                      : 'bg-black/40 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  👥 4 人プレイ
                </button>
              </div>
            </div>

            {/* Player Names Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-2">
                2. プレイヤー名の入力
              </label>
              <div className="space-y-2.5">
                {Array.from({ length: playerCount }).map((_, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-amber-300 text-xs font-mono font-black shadow-inner">
                      P{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={playerNames[idx]}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={`Player ${idx + 1}`}
                      maxLength={12}
                      className="flex-1 bg-[#0b101d] border border-amber-600/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rules Summary Box */}
            <div className="bg-black/40 border border-amber-600/30 rounded-xl p-3.5 text-xs text-slate-300/80 space-y-1.5 leading-relaxed">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>📋</span> ルール概要
              </div>
              <p>• 全員初期残機 <span className="text-red-400 font-bold">❤️❤️❤️</span>、アイテム各2枚配布（所持上限: 最大4枚）。</p>
              <p>• 🟦 GOOD STAGEを引けば自分のターンが継続！</p>
              <p>• 🟥 BAD STAGEを引くと残機-1で次のプレイヤーへ。</p>
              <p>• 🎒 アイテムの使用は <span className="text-amber-300 font-bold">「カードを引く前（手番中）」</span> のみ可能！</p>
              <p>• 心理戦：自分で引くか、他人に引かせるかを選択。</p>
            </div>

            {/* Start Button */}
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg tracking-wider rounded-2xl shadow-[0_8px_20px_rgba(225,29,72,0.4)] border border-rose-400/40 hover:shadow-red-700/60 transform active:scale-98 transition duration-150 cursor-pointer"
            >
              🎲 GAME START
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
