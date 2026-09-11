'use client';

import React, { useState } from 'react';
import {
  SengokuGameState,
  SengokuCardType,
  ResourceType,
  EventCardType,
} from '../../types/sengoku';
import {
  SENGOKU_CARDS,
  RESOURCE_CONFIG,
  ALL_LOCATION_TYPES,
} from '../../constants/sengoku';
import { SengokuCardComponent } from './SengokuCard';
import { soundManager } from '../../lib/sound';

interface SengokuTabletopProps {
  state: SengokuGameState;
  onStartCardSelection: () => void;
  onSelectCard: (
    playerIndex: number,
    card: SengokuCardType,
    targetPlayerId?: string,
    targetResource?: ResourceType
  ) => void;
  onResolveReveals: () => void;
  onResetGame: () => void;
}

export const SengokuTabletop: React.FC<SengokuTabletopProps> = ({
  state,
  onStartCardSelection,
  onSelectCard,
  onResolveReveals,
  onResetGame,
}) => {
  const [selectedCard, setSelectedCard] = useState<SengokuCardType | null>(null);
  const [targetOpponentId, setTargetOpponentId] = useState<string>('');
  const [targetResource, setTargetResource] = useState<ResourceType>('RICE');

  const curPlayer = state.players[state.currentSelectingPlayerIndex];
  const opponents = curPlayer
    ? state.players.filter((p) => p.id !== curPlayer.id)
    : [];

  const handleCardClick = (cardType: SengokuCardType) => {
    soundManager.playCardFlip();
    setSelectedCard(cardType);
    if (opponents.length > 0 && !targetOpponentId) {
      setTargetOpponentId(opponents[0].id);
    }
  };

  const handleConfirmPlay = () => {
    if (!selectedCard || !curPlayer) return;
    soundManager.playButtonClick();
    onSelectCard(
      state.currentSelectingPlayerIndex,
      selectedCard,
      targetOpponentId || undefined,
      targetResource
    );
    setSelectedCard(null);
    setTargetOpponentId('');
    setTargetResource('RICE');
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between min-h-[85vh] p-2 sm:p-4 text-slate-100 select-none relative">
      {/* ── Top Header / Status Bar ── */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-800/80 rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-md mb-3">
        <div className="flex items-center space-x-3 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs text-slate-400">ROUND:</span>
          <span className="text-amber-300 font-black tracking-wider text-base sm:text-lg">
            {state.round} / {state.maxRounds}
          </span>
        </div>

        <div className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300">
          {state.phase === 'ROUND_START' && '📜 ラウンド開始準備中'}
          {state.phase === 'CARD_SELECT' && `🎴 札選択中 (${curPlayer?.name || ''})`}
          {state.phase === 'REVEAL_ALL' && '⚡ 全武将の札が開帳されました'}
          {state.phase === 'BATTLE_RESOLUTION' && '⚔️ 合戦判定中'}
          {state.phase === 'ROUND_SUMMARY' && '📊 ラウンド結果'}
        </div>

        <button
          type="button"
          onClick={onResetGame}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 transition cursor-pointer"
        >
          ↺ 終了
        </button>
      </div>

      {/* ── Center Stage: The 3 Shrines (桜・松・鉱山) ── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
        {ALL_LOCATION_TYPES.map((loc) => {
          const card = SENGOKU_CARDS[loc];
          const targetRes = RESOURCE_CONFIG[card.targetResource!];

          // 現在この拠点を選んでいるプレイヤーたち（REVEAL_ALL以降のみ表示）
          const targetingPlayers = state.players.filter(
            (p) => state.phase === 'REVEAL_ALL' && p.selectedCard === loc
          );
          const isBattle = targetingPlayers.length > 1;
          const isSolo = targetingPlayers.length === 1;

          return (
            <div
              key={loc}
              className={`
                relative rounded-3xl border-2 p-4 sm:p-5 flex flex-col justify-between transition-all duration-500 overflow-hidden shadow-xl
                ${
                  isBattle
                    ? 'border-red-500/90 bg-gradient-to-b from-red-950/70 via-slate-950 to-slate-950 shadow-[0_0_30px_rgba(239,68,68,0.4)] ring-2 ring-red-500/50'
                    : isSolo
                    ? 'border-emerald-500/80 bg-gradient-to-b from-emerald-950/70 via-slate-950 to-slate-950'
                    : 'border-slate-800/80 bg-slate-900/60 hover:border-slate-700'
                }
              `}
            >
              {/* Cyber Tatami Wagara Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />

              {/* Header Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold"
                  style={{ backgroundColor: `${card.neonColor}20`, color: card.neonColor, border: `1px solid ${card.neonColor}40` }}
                >
                  {card.icon} {card.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border ${targetRes.bgBadge} ${targetRes.textBadge} ${targetRes.borderBadge}`}
                >
                  {targetRes.icon} {targetRes.name}
                </span>
              </div>

              {/* Giant Kanji Watermark */}
              <div
                className="my-3 text-center text-5xl sm:text-6xl font-black font-serif opacity-30 select-none"
                style={{ color: card.neonColor }}
              >
                {card.kanji}
              </div>

              {/* Status & Deployments */}
              <div className="relative z-10 pt-2 border-t border-slate-800">
                {state.phase === 'REVEAL_ALL' ? (
                  <div>
                    {isBattle && (
                      <div className="text-center">
                        <div className="inline-block px-2 py-0.5 bg-red-600/30 border border-red-500/60 text-red-300 rounded text-[11px] font-mono font-bold animate-pulse mb-1">
                          ⚔️ 合戦発生！({targetingPlayers.length}名鉢合わせ)
                        </div>
                        <div className="text-[11px] font-mono text-slate-300">
                          {targetingPlayers.map((p) => p.name).join(' vs ')}
                        </div>
                      </div>
                    )}
                    {isSolo && (
                      <div className="text-center">
                        <div className="inline-block px-2 py-0.5 bg-emerald-600/30 border border-emerald-500/60 text-emerald-300 rounded text-[11px] font-mono font-bold mb-1">
                          🌿 単独収穫（1個獲得）
                        </div>
                        <div className="text-[11px] font-mono text-emerald-200">
                          {targetingPlayers[0].name}
                        </div>
                      </div>
                    )}
                    {!isBattle && !isSolo && (
                      <div className="text-center text-xs font-mono text-slate-500">
                        出陣武将なし
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-xs font-mono text-slate-400">
                    {state.phase === 'CARD_SELECT' ? '🎴 伏せ札配置中…' : '待機中'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Player Domains (各武将の陣営 & 物資保管庫) ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 my-2">
        {state.players.map((player, idx) => {
          const isSelecting = state.phase === 'CARD_SELECT' && idx === state.currentSelectingPlayerIndex;
          const hasSelected = player.selectedCard !== null;
          const setCount = Math.min(player.resources.RICE, player.resources.WOOD, player.resources.IRON);

          return (
            <div
              key={player.id}
              className={`
                rounded-2xl p-3 border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between
                ${
                  isSelecting
                    ? 'bg-slate-900/95 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-950/80 border-slate-800/80'
                }
              `}
            >
              {/* Player Identity */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${player.avatarColor} shadow-sm shrink-0`}
                  />
                  <div className="font-bold text-xs text-white truncate">{player.name}</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  {player.monPattern}
                </span>
              </div>

              {/* Status Badge */}
              <div className="my-1">
                {state.phase === 'CARD_SELECT' && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full inline-block ${
                      hasSelected
                        ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                        : isSelecting
                        ? 'bg-amber-950 border border-amber-500/40 text-amber-300 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {hasSelected ? '✓ 札伏せ完了' : isSelecting ? '▶ 選択中' : '待機'}
                  </span>
                )}
                {state.phase === 'REVEAL_ALL' && player.selectedCard && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 truncate inline-block">
                    {SENGOKU_CARDS[player.selectedCard].icon} {SENGOKU_CARDS[player.selectedCard].name}
                  </span>
                )}
              </div>

              {/* Resource Inventory */}
              <div className="pt-1.5 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-center text-xs font-mono">
                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <div className="text-[9px] text-slate-400">米</div>
                  <div className="font-bold">{player.resources.RICE}</div>
                </div>
                <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <div className="text-[9px] text-slate-400">木</div>
                  <div className="font-bold">{player.resources.WOOD}</div>
                </div>
                <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  <div className="text-[9px] text-slate-400">鉄</div>
                  <div className="font-bold">{player.resources.IRON}</div>
                </div>
              </div>

              {/* Sets Completed Badge */}
              <div className="mt-1 text-[10px] font-mono text-center text-slate-400">
                揃い組: <span className="text-amber-300 font-bold">{setCount} セット (+{setCount * 5}点)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Interactive Control Tray (札選択・進行エリア) ── */}
      <div className="w-full bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl mt-2 relative">
        {/* Phase A: Round Start Prompt */}
        {state.phase === 'ROUND_START' && (
          <div className="text-center py-4">
            <h3 className="text-xl sm:text-2xl font-black font-serif text-amber-300 mb-2">
              第 {state.round} 巡（ラウンド）出陣
            </h3>
            <p className="text-xs text-slate-300 mb-5 font-mono">
              各武将は拠点カード（桜・松・鉱山）または使い捨ての特殊戦術札から1枚を伏せて出陣します。
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onStartCardSelection();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black font-serif text-base shadow-[0_0_25px_rgba(245,158,11,0.6)] transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🎴 札伏せ（選択）を開始する
            </button>
          </div>
        )}

        {/* Phase B: Card Selection Tray (Active Player Hand) */}
        {state.phase === 'CARD_SELECT' && curPlayer && (
          <div className="flex flex-col items-center">
            {/* Turn Banner */}
            <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-amber-400">▶ 出撃武将:</span>
                <span className="font-bold text-sm sm:text-base text-white">{curPlayer.name}</span>
                <span className="text-xs font-mono text-slate-400">({curPlayer.monPattern})</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                1枚選んで「伏せ札決定」を押してください
              </div>
            </div>

            {/* Hand Cards List */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 my-2">
              {/* Location Cards (Always Available) */}
              {curPlayer.locationCards.map((loc) => (
                <SengokuCardComponent
                  key={loc}
                  cardType={loc}
                  isSelected={selectedCard === loc}
                  onClick={() => handleCardClick(loc)}
                  size="md"
                />
              ))}

              {/* Event Cards (One-time use tactical cards) */}
              {curPlayer.eventCards.map((ev, idx) => (
                <SengokuCardComponent
                  key={`${ev}-${idx}`}
                  cardType={ev}
                  isSelected={selectedCard === ev}
                  onClick={() => handleCardClick(ev)}
                  size="md"
                />
              ))}
            </div>

            {/* Event Targeting Controls (If Event Card requires target) */}
            {selectedCard && SENGOKU_CARDS[selectedCard].category === 'EVENT' && (
              <div className="w-full max-w-lg p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 my-3 text-left">
                <div className="text-xs font-mono font-bold text-purple-300 mb-2">
                  ⚡ 特殊戦術の設定:
                </div>

                {/* Opponent Selection (for RAID / DUEL) */}
                {(selectedCard === 'RAID' || selectedCard === 'DUEL') && (
                  <div className="mb-2">
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      対象武将を選択:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opponents.map((opp) => (
                        <button
                          key={opp.id}
                          type="button"
                          onClick={() => setTargetOpponentId(opp.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-mono transition cursor-pointer ${
                            targetOpponentId === opp.id
                              ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-400'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {opp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resource Selection (for RAID / AEGIS / BLACK_MARKET) */}
                {(selectedCard === 'RAID' || selectedCard === 'AEGIS' || selectedCard === 'BLACK_MARKET') && (
                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1">
                      {selectedCard === 'RAID' ? '強奪する資源:' : '獲得する資源:'}
                    </label>
                    <div className="flex gap-2">
                      {(['RICE', 'WOOD', 'IRON'] as ResourceType[]).map((res) => {
                        const conf = RESOURCE_CONFIG[res];
                        return (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setTargetResource(res)}
                            className={`flex-1 py-1 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                              targetResource === res
                                ? `${conf.bgBadge} ${conf.textBadge} ring-2 ring-amber-400 border border-amber-400`
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {conf.icon} {conf.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Selection Button */}
            <button
              type="button"
              disabled={!selectedCard}
              onClick={handleConfirmPlay}
              className={`
                mt-3 px-8 py-3.5 rounded-2xl font-black font-serif text-base transition-all transform
                ${
                  selectedCard
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }
              `}
            >
              {selectedCard ? `【${SENGOKU_CARDS[selectedCard].name}】を伏せて決定 ➔` : 'カードを選択してください'}
            </button>
          </div>
        )}

        {/* Phase C: Reveal All & Proceed to Battle */}
        {state.phase === 'REVEAL_ALL' && (
          <div className="text-center py-3">
            <h3 className="text-xl sm:text-2xl font-black font-serif text-cyan-300 mb-2">
              ⚡ 全武将の札が開帳されました！
            </h3>
            <p className="text-xs text-slate-300 mb-5 font-mono">
              先制イベントの実行および各拠点のバッティング「合戦」へ突入します。
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onResolveReveals();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-black font-serif text-base shadow-[0_0_25px_rgba(6,182,212,0.6)] transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              ⚔️ 合戦判定・結果処理へ進む ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
