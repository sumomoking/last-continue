"use client";

import React, { useState } from "react";
import { Player, ItemType, GamePhase } from "@/types/game";
import { MAX_ITEM_COUNT } from "@/constants/items";
import { LifeToken } from "./LifeToken";
import { ItemCardView } from "../cards/ItemCardView";
import { ItemDetailModal } from "../game/ItemDetailModal";

interface PlayerTableHandProps {
  player: Player;
  isMyTurn: boolean;
  phase: GamePhase;
  onUseItem: (item: ItemType) => void;
  checkCanUseItem: (item: ItemType) => { canUse: boolean; reason?: string };
  isOnline?: boolean;
}

export const PlayerTableHand: React.FC<PlayerTableHandProps> = ({
  player,
  isMyTurn,
  phase,
  onUseItem,
  checkCanUseItem,
  isOnline = false,
}) => {
  const [inspectingItem, setInspectingItem] = useState<ItemType | null>(null);

  const inspectingItemCanUse = inspectingItem ? checkCanUseItem(inspectingItem) : { canUse: false };

  return (
    <div className="w-full max-w-5xl mx-auto z-20 flex flex-col items-center">
      {/* Table Rail Hand Tray */}
      <div className="w-full table-wood-rail rounded-t-3xl border-t-2 border-x-2 border-amber-600/40 p-3 sm:p-4 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md flex flex-col gap-3">
        {/* Header Bar: Player Name, Life Hearts, Item Capacity */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2">
          {/* Player Identity & Turn Status */}
          <div className="flex items-center gap-3">
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm
                ${
                  isMyTurn
                    ? "bg-amber-400 text-slate-950 ring-4 ring-amber-400/40 ring-offset-2 ring-offset-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                    : "bg-slate-800 text-slate-300 border border-slate-600"
                }
              `}
            >
              <span>👤</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-100 text-sm sm:text-base tracking-wide drop-shadow-sm">
                  {player.name}
                </span>
                {isOnline && (
                  <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                    YOU
                  </span>
                )}
                {isMyTurn && (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black tracking-wider shadow animate-pulse flex items-center gap-1">
                    <span>✨</span>
                    <span>YOUR TURN</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {player.isGameOver ? (
                  <span className="text-red-400 font-bold">GAME OVER</span>
                ) : (
                  <span>
                    LIFE: {player.lives} / 3 | 手札: {player.items.length} / {MAX_ITEM_COUNT}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Life Hearts Shelf */}
          <div className="flex items-center gap-2 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <span className="text-[10px] font-bold font-mono text-rose-400 tracking-widest mr-0.5">
              LIFE
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((slotIdx) => (
                <LifeToken
                  key={slotIdx}
                  active={slotIdx < player.lives}
                  size="md"
                  index={slotIdx}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Card Resting Area */}
        <div className="relative min-h-[160px] sm:min-h-[190px] rounded-2xl bg-gradient-to-b from-slate-950/80 to-slate-900/90 border border-slate-700/50 p-3 sm:p-4 shadow-inner flex items-center justify-center">
          {/* Subtle felt texture overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none rounded-2xl" />

          {/* Cards Flex Grid */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 w-full">
            {player.items.map((item, index) => {
              const { canUse, reason } = checkCanUseItem(item);
              return (
                <div
                  key={`${item}-${index}`}
                  className="shrink-0 transition-transform duration-200 hover:-translate-y-2"
                >
                  <ItemCardView
                    item={item}
                    canUse={canUse}
                    disabledReason={reason}
                    onUse={() => onUseItem(item)}
                    onInspect={() => setInspectingItem(item)}
                    isCompact={true}
                  />
                </div>
              );
            })}

            {/* Empty Hand Placeholder */}
            {player.items.length === 0 && !player.savedItem && (
              <div className="flex flex-col items-center justify-center py-6 text-slate-500 gap-1.5">
                <span className="text-2xl opacity-60">📦</span>
                <span className="text-xs font-mono">所持アイテムなし</span>
                <span className="text-[10px] text-slate-600">
                  ステージをクリアするとアイテムを獲得できます
                </span>
              </div>
            )}

            {/* Saved Item Display Slot */}
            {player.savedItem && (
              <div
                onClick={() => setInspectingItem("SAVE")}
                title="クリックしてSAVE詳細を表示"
                className="shrink-0 relative p-2 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex flex-col items-center animate-fade-in cursor-pointer hover:scale-105 transition"
              >
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 mb-1">
                  <span className="animate-pulse">🛡️</span>
                  <span>SAVE セット中</span>
                </div>
                <div className="w-28 sm:w-32 h-40 sm:h-44 rounded-xl bg-slate-900 border border-emerald-400/40 p-2 flex flex-col items-center justify-between text-center">
                  <span className="text-xs font-bold text-emerald-200">💾 {player.savedItem}</span>
                  <div className="my-auto text-[10px] text-emerald-300/80 leading-snug">
                    ライフ0になった瞬間、自動で全回復して復活します
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400/70 border border-emerald-500/30 rounded px-1">
                    パッシブ発動
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {inspectingItem && (
        <ItemDetailModal
          item={inspectingItem}
          canUse={inspectingItemCanUse.canUse}
          disabledReason={inspectingItemCanUse.reason}
          onUse={() => onUseItem(inspectingItem)}
          onClose={() => setInspectingItem(null)}
        />
      )}
    </div>
  );
};
