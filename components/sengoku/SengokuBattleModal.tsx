'use client';

import React from 'react';
import { BattleGroup, SengokuPlayer } from '../../types/sengoku';
import { SENGOKU_CARDS, RESOURCE_CONFIG } from '../../constants/sengoku';
import { soundManager } from '../../lib/sound';

interface SengokuBattleModalProps {
  battle: BattleGroup;
  currentBattleIndex: number;
  totalBattles: number;
  players: SengokuPlayer[];
  onNext: () => void;
}

export const SengokuBattleModal: React.FC<SengokuBattleModalProps> = ({
  battle,
  currentBattleIndex,
  totalBattles,
  players,
  onNext,
}) => {
  const card = SENGOKU_CARDS[battle.location];
  const targetRes = RESOURCE_CONFIG[battle.resource];
  const winner = players.find((p) => p.id === battle.winnerPlayerId);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#180808] via-[#0f0914] to-[#060408] border-2 border-red-500/70 rounded-3xl p-5 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.4)] text-center relative overflow-hidden">
        {/* Slashing Cyber Sparks Background */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950/80 border border-red-500/50 text-red-300">
            ⚔️ 合戦発生 #{currentBattleIndex + 1} / {totalBattles}
          </span>
          <span className="text-xs font-mono text-slate-400">
            拠点: <span className="font-bold text-white">{card.name}</span>
          </span>
        </div>

        {/* Dramatic Slashing Title */}
        <div className="relative py-2 my-1">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-serif tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-pulse">
            いざ、合戦！
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            同じ拠点で鉢合わせ！サイコロの目が最大の者が【{targetRes.icon} {targetRes.name}】を
            <strong className="text-amber-400 font-bold"> 2個総取り（倍獲）</strong>！
          </p>
        </div>

        {/* Participants & Dice Combat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 my-6">
          {battle.participantPlayerIds.map((pId) => {
            const player = getPlayer(pId);
            if (!player) return null;
            const roll = battle.rolls[pId] || player.diceRoll || 1;
            const isWinner = pId === battle.winnerPlayerId;

            return (
              <div
                key={pId}
                className={`
                  relative rounded-2xl p-4 flex flex-col items-center justify-between border-2 transition-all duration-300
                  ${
                    isWinner
                      ? 'bg-gradient-to-b from-amber-950/80 to-yellow-950/40 border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_25px_rgba(245,158,11,0.6)] scale-105'
                      : 'bg-slate-900/80 border-slate-800 opacity-60'
                  }
                `}
              >
                {/* Winner Crown / Badge */}
                {isWinner && (
                  <div className="absolute -top-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono shadow-md uppercase tracking-wider">
                    👑 合戦勝利！
                  </div>
                )}

                {/* Player Name & Crest */}
                <div className="text-center mb-2 mt-1">
                  <div className="text-xs font-mono font-bold text-slate-200 line-clamp-1">
                    {player.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {player.monPattern}
                  </div>
                </div>

                {/* Dice Box */}
                <div
                  className={`
                    w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-black font-mono text-3xl sm:text-4xl shadow-inner border-2 my-2
                    ${
                      isWinner
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-bounce'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }
                  `}
                >
                  🎲 {roll}
                </div>

                {/* Gain Status */}
                <div className="w-full text-center mt-2 pt-2 border-t border-slate-800">
                  {isWinner ? (
                    <div className="text-xs font-black text-amber-300 font-mono">
                      獲得: {targetRes.icon} +2個
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 font-mono">
                      敗北: 0個
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner Announcement Banner */}
        {winner && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-xs sm:text-sm font-mono text-amber-200 mb-6 shadow-inner">
            🏆 勝者: <strong className="text-amber-300 text-base">{winner.name}</strong> が合戦を制し、
            <span className="font-bold text-white px-2 py-0.5 rounded bg-amber-600/40 mx-1">
              {targetRes.icon} {targetRes.name} × 2個
            </span>
            を獲得しました！
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => {
            soundManager.playButtonClick();
            onNext();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black font-serif text-base shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer"
        >
          {currentBattleIndex + 1 < totalBattles ? '次の合戦へ進む ⚔️' : '合戦結果を確認して次へ ➔'}
        </button>
      </div>
    </div>
  );
};
