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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Online Mode Switch Button on Top Right */}
      <div className="w-full max-w-lg mb-4 flex justify-end">
        <button
          type="button"
          onClick={onSelectOnline}
          className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-full shadow-lg shadow-cyan-950/50 border border-cyan-400/40 transition flex items-center gap-1.5 cursor-pointer transform hover:scale-105"
        >
          <span>🌐</span>
          <span>オンライン対戦（部屋作成・参加）➔</span>
        </button>
      </div>

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-center relative">
        {/* Title Badge */}
        <div className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-red-500/20 border border-slate-700/60 rounded-full text-xs font-mono tracking-widest text-slate-300 mb-3">
          LOCAL PASS & PLAY MODE
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-2">
          LAST <span className="text-red-500">CONTINUE</span>
        </h1>
        <p className="text-slate-400 font-medium text-sm sm:text-base mb-6 tracking-wide">
          「次の1PLAY、誰が挑戦する？」
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Player Count Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. プレイ人数の選択
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlayerCount(3)}
                className={`py-3 rounded-xl font-bold border transition-all ${
                  playerCount === 3
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                👥 3 人プレイ
              </button>
              <button
                type="button"
                onClick={() => setPlayerCount(4)}
                className={`py-3 rounded-xl font-bold border transition-all ${
                  playerCount === 4
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                👥 4 人プレイ
              </button>
            </div>
          </div>

          {/* Player Names Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              2. プレイヤー名の入力
            </label>
            <div className="space-y-2.5">
              {Array.from({ length: playerCount }).map((_, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                    P{idx + 1}
                  </span>
                  <input
                    type="text"
                    value={playerNames[idx]}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    placeholder={`Player ${idx + 1}`}
                    maxLength={12}
                    className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rules Summary Box */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>📋</span> ルール概要
            </div>
            <p>• 全員初期残機 <span className="text-red-400">❤️❤️❤️</span>、アイテム各2枚配布（所持上限: 最大4枚）。</p>
            <p>• 🟦 GOOD STAGEを引けば自分のターンが継続！</p>
            <p>• 🟥 BAD STAGEを引くと残機-1で次のプレイヤーへ。</p>
            <p>• 🎒 アイテムの使用は **「カードを引く前（手番中）」** のみ可能！</p>
            <p>• 心理戦：自分で引くか、他人に引かせるかを選択。</p>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-lg tracking-wider rounded-xl shadow-lg shadow-red-900/50 hover:shadow-red-700/60 transform active:scale-98 transition duration-150 cursor-pointer"
          >
            GAME START
          </button>
        </form>
      </div>
    </div>
  );
};
