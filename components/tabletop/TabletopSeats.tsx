"use client";

import React, { useState } from "react";
import { Player, GamePhase, ItemAnnouncement, ItemType } from "@/types/game";
import { ITEM_DEFINITIONS } from "@/constants/items";
import { LifeToken } from "./LifeToken";
import { ItemDetailModal } from "../game/ItemDetailModal";

interface TabletopSeatsProps {
  players: Player[];
  currentTurnPlayerIndex: number;
  perspectivePlayerIndex: number;
  phase: GamePhase;
  lastAnnouncement?: ItemAnnouncement | null;
  onSelectTarget?: (targetIndex: number) => void;
  isTargetSelectMode?: boolean;
}

const MINI_ITEM_STYLES: Record<
  ItemType,
  {
    border: string;
    bg: string;
    text: string;
  }
> = {
  DEBUG: {
    border: "border-cyan-400/80",
    bg: "bg-cyan-950/90 hover:bg-cyan-900/90",
    text: "text-cyan-300",
  },
  RESET: {
    border: "border-sky-400/80",
    bg: "bg-sky-950/90 hover:bg-sky-900/90",
    text: "text-sky-300",
  },
  SAVE: {
    border: "border-emerald-400/80",
    bg: "bg-emerald-950/90 hover:bg-emerald-900/90",
    text: "text-emerald-300",
  },
  "1UP": {
    border: "border-rose-400/80",
    bg: "bg-rose-950/90 hover:bg-rose-900/90",
    text: "text-rose-300",
  },
  CONTINUE: {
    border: "border-amber-400/80",
    bg: "bg-amber-950/90 hover:bg-amber-900/90",
    text: "text-amber-300",
  },
  GLITCH: {
    border: "border-purple-400/80",
    bg: "bg-purple-950/90 hover:bg-purple-900/90",
    text: "text-purple-300",
  },
};

export const TabletopSeats: React.FC<TabletopSeatsProps> = ({
  players,
  currentTurnPlayerIndex,
  perspectivePlayerIndex,
  phase,
  lastAnnouncement,
  onSelectTarget,
  isTargetSelectMode = false,
}) => {
  const [inspectingItem, setInspectingItem] = useState<ItemType | null>(null);

  // Filter out the perspective player (who is shown at the bottom)
  const opponents = players
    .map((player, originalIndex) => ({ player, originalIndex }))
    .filter(({ originalIndex }) => originalIndex !== perspectivePlayerIndex);

  if (opponents.length === 0) return null;

  return (
    <>
      <div className="w-full flex items-start justify-center gap-3 sm:gap-6 px-2 py-1 z-20">
        {opponents.map(({ player, originalIndex }) => {
          const isCurrentTurn = currentTurnPlayerIndex === originalIndex;
          const isTargetable =
            isTargetSelectMode &&
            !player.isGameOver &&
            originalIndex !== currentTurnPlayerIndex;

          // Check if this opponent recently used an item (< 5 seconds ago)
          const isRecentItemUser =
            lastAnnouncement &&
            lastAnnouncement.playerIndex === originalIndex &&
            Date.now() - lastAnnouncement.timestamp < 5000;

          return (
            <div
              key={player.id || originalIndex}
              className="relative flex flex-col items-center transition-all duration-300"
            >
              {/* Opponent Item Use Flash Bubble */}
              {isRecentItemUser && lastAnnouncement && (
                <div className="absolute -top-7 z-40 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-black text-[10px] shadow-lg shadow-purple-900/60 border border-white/60 animate-bounce flex items-center gap-1 whitespace-nowrap">
                  <span>{ITEM_DEFINITIONS[lastAnnouncement.item]?.icon}</span>
                  <span>{ITEM_DEFINITIONS[lastAnnouncement.item]?.name} 発動!</span>
                </div>
              )}

              {/* Target Select Button Overlay */}
              {isTargetable && (
                <button
                  type="button"
                  onClick={() => onSelectTarget?.(originalIndex)}
                  className="absolute -inset-2 rounded-2xl border-2 border-dashed border-red-500 bg-red-600/30 backdrop-blur-xs flex items-center justify-center z-30 cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse transition transform hover:scale-105"
                >
                  <div className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white font-black text-xs rounded-full shadow-lg">
                    <span>🎯</span>
                    <span>引かせる</span>
                  </div>
                </button>
              )}

              {/* Seat Mat / Card Pad */}
              <div
                className={`
                  relative px-3 py-2 rounded-2xl transition-all duration-300 min-w-[130px] sm:min-w-[150px]
                  ${
                    isRecentItemUser
                      ? "ring-4 ring-purple-400 bg-purple-950/90 shadow-[0_0_30px_rgba(192,132,252,0.6)]"
                      : isCurrentTurn
                      ? "bg-slate-900/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.45)] ring-2 ring-amber-400/30"
                      : "bg-slate-950/80 border border-slate-700/70 shadow-md"
                  }
                  ${player.isGameOver ? "opacity-50 grayscale" : ""}
                  backdrop-blur-md flex flex-col items-center gap-1.5
                `}
              >
                {/* Turn Banner */}
                {isCurrentTurn && !player.isGameOver && !isRecentItemUser && (
                  <div className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow-md flex items-center gap-1 animate-bounce">
                    <span>✨</span>
                    <span>TURN</span>
                  </div>
                )}

                {/* Player Name and Avatar Header */}
                <div className="flex items-center gap-1.5 w-full justify-center">
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0
                      ${
                        isCurrentTurn
                          ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300"
                          : "bg-slate-800 text-slate-300 border border-slate-600"
                      }
                    `}
                  >
                    <span>👤</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-100 truncate max-w-[90px] drop-shadow-sm">
                      {player.name}
                    </span>
                    {player.isGameOver && (
                      <span className="text-[8px] text-red-400 font-mono font-bold">GAME OVER</span>
                    )}
                  </div>
                </div>

                {/* Life Hearts Tray */}
                <div className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800">
                  {[0, 1, 2].map((slotIndex) => (
                    <LifeToken
                      key={slotIndex}
                      active={slotIndex < player.lives}
                      size="sm"
                      index={slotIndex}
                    />
                  ))}
                </div>

                {/* Opponent's Face-Up Items Display Tray */}
                {!player.isGameOver && (
                  <div className="w-full flex flex-col items-center mt-1">
                    <div className="text-[9px] font-mono text-slate-400 font-bold mb-1 flex items-center gap-1">
                      <span>所持アイテム</span>
                      <span className="text-slate-500">({player.items.length}/4)</span>
                    </div>

                    {player.items.length === 0 && !player.savedItem ? (
                      <span className="text-[9px] text-slate-500 font-mono italic py-1">なし</span>
                    ) : (
                      <div className="flex flex-wrap items-center justify-center gap-1 max-w-[150px]">
                        {player.items.map((item, itemIdx) => {
                          const info = ITEM_DEFINITIONS[item];
                          const style = MINI_ITEM_STYLES[item];
                          return (
                            <button
                              type="button"
                              key={itemIdx}
                              onClick={() => setInspectingItem(item)}
                              title={`クリックして効果を表示: ${info.name}`}
                              className={`
                                px-1.5 py-0.5 rounded-md border text-[9px] font-bold font-mono
                                flex items-center gap-1 cursor-pointer transition transform hover:scale-110 shadow-sm
                                ${style.border} ${style.bg} ${style.text}
                              `}
                            >
                              <span>{info.icon}</span>
                              <span className="text-[8px]">{info.name}</span>
                            </button>
                          );
                        })}

                        {/* Saved Item Shield Slot */}
                        {player.savedItem && (
                          <button
                            type="button"
                            onClick={() => setInspectingItem("SAVE")}
                            title={`SAVEスロットにセット中: ${player.savedItem} (クリックして詳細)`}
                            className="px-1.5 py-0.5 rounded-md border border-emerald-400 bg-emerald-950 text-emerald-300 text-[9px] font-bold font-mono flex items-center gap-1 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse cursor-pointer hover:scale-105 transition"
                          >
                            <span>💾</span>
                            <span className="text-[8px]">{player.savedItem}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Opponent Card Detail Inspection Modal */}
      {inspectingItem && (
        <ItemDetailModal
          item={inspectingItem}
          canUse={false}
          onClose={() => setInspectingItem(null)}
        />
      )}
    </>
  );
};
