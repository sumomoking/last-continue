'use client';

import React, { useState } from 'react';
import { ItemType, Player } from '../../types/game';
import { MAX_ITEM_COUNT } from '../../constants/items';
import { ItemCardView } from '../cards/ItemCardView';

interface PlayerHandConsoleProps {
  players: Player[];
  currentTurnPlayerIndex: number;
  myPlayerId?: string;
  isMyTurn: boolean;
  glitchedCard?: boolean;
  continuedCard?: boolean;
  disabled: boolean;
  onUseItem: (item: ItemType, playerIndex: number) => void;
  onOpenSaveModal: (playerIndex: number) => void;
}

export const PlayerHandConsole: React.FC<PlayerHandConsoleProps> = ({
  players,
  currentTurnPlayerIndex,
  myPlayerId,
  isMyTurn,
  glitchedCard = false,
  continuedCard = false,
  disabled,
  onUseItem,
  onOpenSaveModal,
}) => {
  // 表示対象プレイヤー
  const myPlayerIndex = myPlayerId ? players.findIndex((p) => p.id === myPlayerId) : -1;
  const initialIndex = myPlayerIndex !== -1 ? myPlayerIndex : currentTurnPlayerIndex;

  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(initialIndex);

  const viewingPlayerIndex = myPlayerIndex !== -1 ? myPlayerIndex : (
    selectedPlayerIndex >= 0 && selectedPlayerIndex < players.length
      ? selectedPlayerIndex
      : currentTurnPlayerIndex
  );

  const player = players[viewingPlayerIndex];
  const isCurrentTurnPlayer = viewingPlayerIndex === currentTurnPlayerIndex;

  if (!player || player.isGameOver) return null;

  const handleItemClick = (item: ItemType) => {
    if (disabled || !isCurrentTurnPlayer) return;

    if (item === 'SAVE') {
      onOpenSaveModal(viewingPlayerIndex);
    } else {
      onUseItem(item, viewingPlayerIndex);
    }
  };

  return (
    <div className="w-full relative rounded-3xl p-4 sm:p-5 bg-gradient-to-t from-[#04060b] via-[#090e1b]/95 to-[#0e1628]/80 border-2 border-slate-800 shadow-2xl backdrop-blur-xl">
      {/* Hand Header: My Info & Lives */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
        {/* Left: Player Profile & Life Crystals */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-black flex items-center justify-center shadow-inner">
              P{viewingPlayerIndex + 1}
            </span>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>{player.name}</span>
              {myPlayerId && <span className="text-xs text-cyan-400 font-normal">（あなた）</span>}
            </h3>
          </div>

          {/* Life Hearts */}
          <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-sm inline-block transition-transform ${
                  i < player.lives
                    ? 'text-red-500 scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : 'text-slate-700 grayscale opacity-30'
                }`}
              >
                ❤️
              </span>
            ))}
            <span className="text-[11px] font-mono text-slate-400 ml-1">
              ({player.lives}/3)
            </span>
          </div>

          {/* SAVE Status Indicator */}
          {player.savedItem && (
            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
              <span>💾</span> SAVEセット中: {player.savedItem}
            </span>
          )}
        </div>

        {/* Right: Hand Count Badge & Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700 font-bold flex items-center gap-1">
            <span>🎒 手札:</span>
            <strong className="text-cyan-400">{player.items.length}</strong>/{MAX_ITEM_COUNT}枚
            {player.items.length >= MAX_ITEM_COUNT && (
              <span className="text-[10px] text-amber-400 font-black">MAX</span>
            )}
          </span>

          {/* Local Mode Switcher */}
          {!myPlayerId && (
            <div className="flex items-center space-x-1 overflow-x-auto">
              {players.map((p, idx) => {
                if (p.isGameOver) return null;
                const isSelected = idx === viewingPlayerIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlayerIndex(idx)}
                    className={`px-2 py-1 text-xs rounded-lg font-bold border transition cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-80">({p.items.length})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* TCG Hand Fan Grid (扇状・カードスロット配置) */}
      {player.items.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs font-mono bg-slate-950/40 rounded-2xl border border-slate-800/80">
          所持しているアイテムカードはありません
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
          {player.items.map((item, index) => {
            // 使用可否判定
            let canUseNow = isCurrentTurnPlayer && !disabled;
            let disabledReason = '';

            if (!isCurrentTurnPlayer) {
              canUseNow = false;
              disabledReason = '手番のみ';
            } else if (disabled) {
              canUseNow = false;
              disabledReason = 'カード引く前のみ';
            } else if (item === '1UP' && player.lives >= 3) {
              canUseNow = false;
              disabledReason = '残機最大(3)';
            } else if (item === 'SAVE') {
              if (player.lives !== 1) {
                canUseNow = false;
                disabledReason = '残機1の時のみ';
              } else if (player.savedItem) {
                canUseNow = false;
                disabledReason = 'セット中';
              } else if (player.items.length <= 1) {
                canUseNow = false;
                disabledReason = 'セット用カード不足';
              }
            } else if (item === 'GLITCH' && glitchedCard) {
              canUseNow = false;
              disabledReason = 'GLITCH発動中';
            } else if (item === 'CONTINUE' && continuedCard) {
              canUseNow = false;
              disabledReason = 'CONTINUE発動中';
            }

            return (
              <div key={`${item}-${index}`} className="flex justify-center">
                <ItemCardView
                  item={item}
                  canUse={canUseNow}
                  disabledReason={disabledReason}
                  onUse={() => handleItemClick(item)}
                  isCompact={player.items.length >= 3}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
