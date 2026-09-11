'use client';

import React, { useState } from 'react';
import { Player } from '../../types/game';

interface ResetTargetSelectModalProps {
  actorPlayerIndex: number;
  players: Player[];
  onConfirm: (targetPlayerIndex: number) => void;
  onCancel: () => void;
}

export const ResetTargetSelectModal: React.FC<ResetTargetSelectModalProps> = ({
  actorPlayerIndex,
  players,
  onConfirm,
  onCancel,
}) => {
  const [selectedTargetIndex, setSelectedTargetIndex] = useState<number>(actorPlayerIndex);

  // 生存しているプレイヤー一覧
  const alivePlayers = players
    .map((p, idx) => ({ player: p, index: idx }))
    .filter(({ player }) => !player.isGameOver);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md table-wood-rail border-2 border-amber-600/60 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        <div className="inline-block px-3 py-1 bg-sky-500/20 border border-sky-400/40 rounded-full text-xs font-mono font-bold text-sky-300 mb-3 shadow-inner">
          🔄 RESET TARGET SELECT
        </div>
        <h3 className="text-xl font-black text-white mb-1 drop-shadow">手札をリセットする対象を選択</h3>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          手札を山札に戻して全引き直しさせるプレイヤーを選んでください。<br />
          <span className="text-amber-200/80 text-[11px]">※自分を選んで手札を入れ替えることも、相手を選んで手札を流すことも可能です。</span>
        </p>

        <div className="space-y-2.5 mb-6 text-left max-h-60 overflow-y-auto pr-1">
          {alivePlayers.map(({ player: p, index: idx }) => {
            const isSelf = idx === actorPlayerIndex;
            const isSelected = selectedTargetIndex === idx;
            const cardCount = isSelf ? Math.max(0, p.items.length - 1) : p.items.length;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedTargetIndex(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between shadow-sm ${
                  isSelected
                    ? 'bg-sky-950/60 border-sky-400 text-white shadow-md ring-1 ring-sky-400/50'
                    : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-sky-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-black ${
                    isSelf ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {isSelf ? 'YOU' : `P${idx + 1}`}
                  </span>
                  <div>
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          自分
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      所持アイテム: <strong className="text-amber-300">{cardCount}枚</strong>
                      {isSelf ? '（RESET消費後）' : ''}
                    </div>
                  </div>
                </div>

                {isSelected && <span className="text-sky-400 font-black text-lg">✓</span>}
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedTargetIndex)}
            className="flex-1 py-3 bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:from-sky-400 hover:to-sky-600 text-white font-black text-xs rounded-xl shadow-lg shadow-sky-950/60 border border-sky-300/40 transition cursor-pointer active:scale-98"
          >
            🔄 リセットを実行する
          </button>
        </div>
      </div>
    </div>
  );
};
