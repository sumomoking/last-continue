"use client";

import React, { useState } from "react";
import { CardType, Player, GamePhase, ItemType, ItemAnnouncement, GameLog } from "@/types/game";
import { TabletopSeats } from "./TabletopSeats";
import { PlayerTableHand } from "./PlayerTableHand";
import { CardBackView } from "../cards/CardBackView";

interface TabletopBoardProps {
  round: number;
  stageDeck: CardType[];
  initialGoodCount?: number;
  initialBadCount?: number;
  diceResults?: [number, number];
  players: Player[];
  currentTurnPlayerIndex: number;
  perspectivePlayerIndex: number;
  phase: GamePhase;
  isMyTurn: boolean;
  canPlay: boolean;
  glitchedCard?: boolean;
  continuedCard?: boolean;
  isOnline?: boolean;
  lastAnnouncement?: ItemAnnouncement | null;
  logs?: GameLog[];
  onPlaySelf: () => void;
  onPlayTarget: (targetIndex: number) => void;
  onUseItem: (item: ItemType, playerIndex: number) => void;
  onOpenSaveModal: (playerIndex: number) => void;
  onOpenResetModal: (playerIndex: number) => void;
}

export const TabletopBoard: React.FC<TabletopBoardProps> = ({
  round,
  stageDeck,
  players,
  currentTurnPlayerIndex,
  perspectivePlayerIndex,
  phase,
  isMyTurn,
  canPlay,
  glitchedCard = false,
  continuedCard = false,
  isOnline = false,
  lastAnnouncement,
  logs = [],
  onPlaySelf,
  onPlayTarget,
  onUseItem,
  onOpenSaveModal,
  onOpenResetModal,
}) => {
  const [isTargetSelectMode, setIsTargetSelectMode] = useState(false);
  const currentTurnPlayer = players[currentTurnPlayerIndex] || players[0];
  const perspectivePlayer = players[perspectivePlayerIndex] || currentTurnPlayer;

  // Latest log message for the live action ticker
  const latestLog = logs.length > 0 ? logs[0] : null;

  const checkCanUseItem = (item: ItemType) => {
    if (perspectivePlayer.isGameOver) {
      return { canUse: false, reason: "脱落しています" };
    }
    if (phase !== "TURN_ACTION") {
      return { canUse: false, reason: "ターン進行中のみ" };
    }
    if (!isMyTurn) {
      return { canUse: false, reason: "自分の手番のみ" };
    }
    if (item === "1UP" && perspectivePlayer.lives >= 3) {
      return { canUse: false, reason: "ライフ満タン" };
    }
    if (item === "SAVE" && perspectivePlayer.lives !== 1) {
      return { canUse: false, reason: "ライフ1の時のみセット可" };
    }
    if (item === "SAVE" && perspectivePlayer.savedItem !== null) {
      return { canUse: false, reason: "セット済" };
    }
    return { canUse: true };
  };

  const handleItemClick = (item: ItemType) => {
    if (item === "SAVE") {
      onOpenSaveModal(perspectivePlayerIndex);
    } else if (item === "RESET") {
      onOpenResetModal(perspectivePlayerIndex);
    } else {
      onUseItem(item, perspectivePlayerIndex);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-4 select-none">
      {/* ── Classroom Wooden Desk Top Frame ── */}
      <div className="w-full relative school-desk-wood rounded-[2rem] sm:rounded-[2.5rem] p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] border-4 border-[#875c2e] overflow-hidden">
        {/* Pencil Groove Accent (机の上の鉛筆溝) */}
        <div className="absolute top-2 left-12 right-12 h-1 bg-black/20 rounded-full shadow-inner pointer-events-none" />

        {/* ── Tabletop Desk Mat Surface (Center Field) ── */}
        <div className="w-full relative rounded-3xl p-3 sm:p-5 flex flex-col gap-3.5 border-2 border-emerald-800/60 bg-gradient-to-b from-[#163323] via-[#0f2419] to-[#0a1811] shadow-[inset_0_0_60px_rgba(0,0,0,0.6)]">
          {/* Top Status Bar: Clean Round Info */}
          <div className="w-full flex items-center justify-between z-10 px-1 border-b border-emerald-600/30 pb-2">
            <div className="px-3.5 py-1 bg-stone-900/90 border border-amber-400/50 rounded-full shadow-md flex items-center gap-1.5 text-xs font-mono font-black text-amber-300">
              <span>🏫 放課後 第 {round} 回戦</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-300 font-bold flex items-center gap-1">
              <span>🎴 山札 (STAGE DECK)</span>
            </div>
          </div>

          {/* Live Action Ticker on Tabletop */}
          {latestLog && (
            <div className="w-full bg-slate-950/70 border border-emerald-500/30 rounded-xl px-3 py-1 flex items-center justify-between text-xs font-mono z-10 animate-fade-in shadow-inner">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11px] text-slate-300 truncate">{latestLog.text}</span>
              </div>
              <span className="text-[9px] text-slate-500 shrink-0 ml-2">{latestLog.timestamp}</span>
            </div>
          )}

          {/* 1. Opponent Seats Row (Top Field) */}
          <TabletopSeats
            players={players}
            currentTurnPlayerIndex={currentTurnPlayerIndex}
            perspectivePlayerIndex={perspectivePlayerIndex}
            phase={phase}
            lastAnnouncement={lastAnnouncement}
            isTargetSelectMode={isTargetSelectMode}
            onSelectTarget={(targetIdx) => {
              setIsTargetSelectMode(false);
              onPlayTarget(targetIdx);
            }}
          />

          {/* 2. Center Tabletop Arena: 3D Stack Deck, Buffs & Play Console */}
          <div className="my-auto z-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 py-1">
            {/* 3D Stage Deck Stack Resting On The Felt (No remaining count badge) */}
            <div className="flex flex-col items-center">
              <div
                onClick={() => {
                  if (canPlay && isMyTurn) {
                    setIsTargetSelectMode(false);
                    onPlaySelf();
                  }
                }}
                className={`
                  relative cursor-pointer transition-all duration-300
                  ${canPlay && isMyTurn ? "hover:scale-105 active:scale-95 ring-4 ring-amber-400/60 ring-offset-4 ring-offset-emerald-950 rounded-2xl animate-pulse" : ""}
                `}
              >
                {/* 3D Stack Drop Shadow and Thickness */}
                <div className="deck-stack-shadow">
                  <CardBackView size="md" />
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-300/70 mt-3 tracking-widest font-bold">
                STAGE DECK
              </span>
            </div>

            {/* Center Action Decision Area */}
            <div className="flex flex-col items-center gap-2 max-w-sm w-full">
              {/* Turn Banner */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>手番：</span>
                <strong className="text-white font-black">{currentTurnPlayer.name}</strong>
              </div>

              {/* Active Buffs (GLITCH / CONTINUE) */}
              {(glitchedCard || continuedCard) && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 animate-fade-in">
                  {glitchedCard && (
                    <span className="px-2.5 py-0.5 bg-purple-950/90 border border-purple-400 text-purple-200 text-[10px] font-bold rounded-full shadow-md animate-pulse">
                      👾 GLITCH発動中 (カード無効化)
                    </span>
                  )}
                  {continuedCard && (
                    <span className="px-2.5 py-0.5 bg-amber-950/90 border border-amber-400 text-amber-200 text-[10px] font-bold rounded-full shadow-md animate-pulse">
                      🕹️ CONTINUE発動中 (BAD無効化)
                    </span>
                  )}
                </div>
              )}

              {/* Turn Action Buttons */}
              {isMyTurn && canPlay ? (
                <div className="w-full flex flex-col gap-2 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTargetSelectMode(false);
                      onPlaySelf();
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-amber-950/60 border-2 border-amber-200 transform active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">🎴</span>
                    <span>自分が PLAY する（カードを引く）</span>
                  </button>

                  {players.filter((p) => !p.isGameOver).length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIsTargetSelectMode(!isTargetSelectMode)}
                      className={`
                        w-full py-2 px-3 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5
                        ${
                          isTargetSelectMode
                            ? "bg-red-600 text-white border-red-400 shadow-lg shadow-red-950/60 animate-pulse"
                            : "bg-slate-950/80 text-slate-300 border-slate-700 hover:bg-slate-900"
                        }
                      `}
                    >
                      <span>🎯</span>
                      <span>
                        {isTargetSelectMode
                          ? "対戦相手の席をクリックして選択中 (キャンセル)"
                          : "他人に PLAY させる（相手を選択）"}
                      </span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 text-xs flex items-center gap-2 animate-pulse">
                  <span className="animate-spin">⏳</span>
                  <span>{currentTurnPlayer.name} のアクションを待っています...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Active Player Hand Tray Resting at Bottom ── */}
      <div className="w-full relative z-20">
        <PlayerTableHand
          player={perspectivePlayer}
          isMyTurn={isMyTurn}
          phase={phase}
          onUseItem={handleItemClick}
          checkCanUseItem={checkCanUseItem}
          isOnline={isOnline}
        />
      </div>
    </div>
  );
};
