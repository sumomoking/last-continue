'use client';

import React, { useState } from 'react';
import { ItemType, Player } from '../../types/game';
import { ITEM_DEFINITIONS, MAX_ITEM_COUNT } from '../../constants/items';

interface ItemInventoryProps {
  players: Player[];
  currentTurnPlayerIndex: number;
  onUseItem: (item: ItemType, playerIndex: number) => void;
  onOpenSaveModal: (playerIndex: number) => void;
  glitchedCard?: boolean;
  continuedCard?: boolean;
  myPlayerId?: string;
  disabled: boolean;
}

export const ItemInventory: React.FC<ItemInventoryProps> = ({
  players,
  currentTurnPlayerIndex,
  onUseItem,
  onOpenSaveModal,
  glitchedCard = false,
  continuedCard = false,
  myPlayerId,
  disabled,
}) => {
  // 表示対象プレイヤー（オンライン時は自分のプレイヤーを優先、ローカル時は手番プレイヤー）
  const myPlayerIndex = myPlayerId ? players.findIndex((p) => p.id === myPlayerId) : -1;
  const initialIndex = myPlayerIndex !== -1 ? myPlayerIndex : currentTurnPlayerIndex;

  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(initialIndex);

  // ローカル対戦時はターン切り替えに連動
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
    <div className="w-full bg-slate-900/80 border border-slate-800 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-xl">
      {/* Header and Player Selector Tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-base">🎒</span>
          <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <span>MY ITEMS ({player.name})</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-normal">
              {player.items.length}/{MAX_ITEM_COUNT}枚 {player.items.length >= MAX_ITEM_COUNT ? '⚡MAX' : ''}
            </span>
          </h3>
        </div>

        {/* Player Switcher (ローカル対戦時のみ表示) */}
        {!myPlayerId && (
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] text-slate-500 font-mono mr-1">手札切替:</span>
            {players.map((p, idx) => {
              if (p.isGameOver) return null;
              const isSelected = idx === viewingPlayerIndex;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlayerIndex(idx)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] opacity-80">({p.items.length}/{MAX_ITEM_COUNT})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Items Grid */}
      {player.items.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs font-mono">
          所持しているアイテムカードはありません
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {player.items.map((item, index) => {
            const info = ITEM_DEFINITIONS[item];

            // 使用可能条件の判定
            let canUseNow = isCurrentTurnPlayer && !disabled;
            let disabledReason = '';

            if (!isCurrentTurnPlayer) {
              canUseNow = false;
              disabledReason = '手番でのみ使用可能';
            } else if (disabled) {
              canUseNow = false;
              disabledReason = 'カード引く前のみ使用可能';
            } else if (item === '1UP' && player.lives >= 3) {
              canUseNow = false;
              disabledReason = '残機は最大(3)です';
            } else if (item === 'SAVE') {
              if (player.lives !== 1) {
                canUseNow = false;
                disabledReason = '残機1の時のみ使用可能';
              } else if (player.savedItem) {
                canUseNow = false;
                disabledReason = 'すでにSAVEセット中';
              } else if (player.items.length <= 1) {
                canUseNow = false;
                disabledReason = 'セットする別のカードが必要';
              }
            } else if (item === 'GLITCH' && glitchedCard) {
              canUseNow = false;
              disabledReason = 'GLITCH発動中';
            } else if (item === 'CONTINUE' && continuedCard) {
              canUseNow = false;
              disabledReason = 'CONTINUE発動中';
            }

            return (
              <div
                key={`${item}-${index}`}
                className={`rounded-xl p-3 border flex flex-col justify-between transition-all ${
                  canUseNow
                    ? 'bg-slate-800/80 border-slate-700 hover:border-cyan-400/80 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/50 border-slate-900/80 opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-1.5 font-bold text-sm text-white">
                      <span>{info.icon}</span>
                      <span>{info.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {info.timing}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {info.description}
                  </p>
                </div>

                {/* Use Action Button */}
                {canUseNow ? (
                  <button
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className="w-full py-1.5 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition duration-150 shadow-md cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>使用する</span>
                    <span>➔</span>
                  </button>
                ) : (
                  <div className="text-center py-1 text-[11px] font-mono text-slate-500 bg-slate-900/60 rounded border border-slate-800">
                    {disabledReason || '現在使用不可'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SAVE Status Indicator if set */}
      {player.savedItem && (
        <div className="mt-3 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <span>💾</span>
            <span>
              <strong>SAVE発動待機中:</strong> セットカード「<strong>{player.savedItem}</strong>」
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-900/60 px-2 py-0.5 rounded">
            残機0で自動復活
          </span>
        </div>
      )}
    </div>
  );
};
