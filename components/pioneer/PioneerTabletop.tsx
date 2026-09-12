'use client';

import React, { useState } from 'react';
import {
  PioneerGameState,
  PioneerCardType,
  ResourceType,
} from '../../types/pioneer';
import {
  PIONEER_CARDS,
  RESOURCE_CONFIG,
  ALL_TERRAIN_TYPES,
} from '../../constants/pioneer';
import { PioneerCardComponent } from './PioneerCard';
import { PioneerHexTile } from './PioneerHexTile';
import { soundManager } from '../../lib/sound';

interface PioneerTabletopProps {
  state: PioneerGameState;
  onStartCardSelection: () => void;
  onSelectCard: (
    playerIndex: number,
    card: PioneerCardType,
    targetPlayerId?: string,
    targetResource?: ResourceType
  ) => void;
  onResolveReveals: () => void;
  onResetGame: () => void;
}

export const PioneerTabletop: React.FC<PioneerTabletopProps> = ({
  state,
  onStartCardSelection,
  onSelectCard,
  onResolveReveals,
  onResetGame,
}) => {
  const [selectedCard, setSelectedCard] = useState<PioneerCardType | null>(null);
  const [targetOpponentId, setTargetOpponentId] = useState<string>('');
  const [targetResource, setTargetResource] = useState<ResourceType>('WHEAT');

  const curPlayer = state.players[state.currentSelectingPlayerIndex];
  const opponents = curPlayer
    ? state.players.filter((p) => p.id !== curPlayer.id)
    : [];

  const handleCardClick = (cardType: PioneerCardType) => {
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
    setTargetResource('WHEAT');
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between min-h-[85vh] p-2 sm:p-4 text-stone-100 select-none relative">
      {/* ── Top Header / Island Status Bar ── */}
      <div className="w-full flex items-center justify-between bg-stone-900/90 border border-stone-800 rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-md mb-3">
        <div className="flex items-center space-x-3 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs text-stone-400">ROUND:</span>
          <span className="text-amber-300 font-black tracking-wider text-base sm:text-lg">
            {state.round} / {state.maxRounds}
          </span>
        </div>

        <div className="text-xs font-serif font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300">
          {state.phase === 'ROUND_START' && '🏝️ ラウンド開始準備中'}
          {state.phase === 'CARD_SELECT' && `🗺️ 派遣先を選択中 (${curPlayer?.name || ''})`}
          {state.phase === 'REVEAL_ALL' && '⚡ 全開拓団の行動が開帳されました'}
          {state.phase === 'BATTLE_RESOLUTION' && '🎲 資源争奪ダイス対決中'}
          {state.phase === 'ROUND_SUMMARY' && '📊 ラウンド収穫集計'}
        </div>

        <button
          type="button"
          onClick={onResetGame}
          className="text-xs font-mono text-stone-500 hover:text-stone-300 transition cursor-pointer"
        >
          ↺ 終了
        </button>
      </div>

      {/* ── Center Stage: Island Hex Terrains (麦畑・森林・鉱山) ── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 my-2">
        {ALL_TERRAIN_TYPES.map((terrain) => {
          const targetingPlayers = state.players.filter(
            (p) => state.phase === 'REVEAL_ALL' && p.selectedCard === terrain
          );

          return (
            <PioneerHexTile
              key={terrain}
              terrain={terrain}
              targetingPlayers={targetingPlayers}
              phase={state.phase}
            />
          );
        })}
      </div>

      {/* ── Player Settlement Camps (開拓団キャンプ & 物資保管庫) ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 my-2">
        {state.players.map((player, idx) => {
          const isSelecting =
            state.phase === 'CARD_SELECT' && idx === state.currentSelectingPlayerIndex;
          const hasSelected = player.selectedCard !== null;
          const settlementCount = Math.min(
            player.resources.WHEAT,
            player.resources.LUMBER,
            player.resources.ORE
          );

          return (
            <div
              key={player.id}
              className={`
                rounded-2xl p-3 border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between
                ${
                  isSelecting
                    ? 'bg-stone-900/95 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-stone-950/80 border-stone-800'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="text-sm">{player.meepleIcon}</span>
                  <div className="font-bold text-xs text-white truncate font-serif">
                    {player.name}
                  </div>
                </div>
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
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    {hasSelected ? '✓ 派遣先決定' : isSelecting ? '▶ 選択中' : '待機'}
                  </span>
                )}
                {state.phase === 'REVEAL_ALL' && player.selectedCard && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/40 text-amber-200 truncate inline-block">
                    {PIONEER_CARDS[player.selectedCard].icon} {PIONEER_CARDS[player.selectedCard].name}
                  </span>
                )}
              </div>

              {/* Resources Inventory */}
              <div className="pt-1.5 border-t border-stone-800 grid grid-cols-3 gap-1 text-center text-xs font-mono">
                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <div className="text-[9px] text-stone-400">小麦</div>
                  <div className="font-bold">{player.resources.WHEAT}</div>
                </div>
                <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <div className="text-[9px] text-stone-400">木材</div>
                  <div className="font-bold">{player.resources.LUMBER}</div>
                </div>
                <div className="p-1 rounded bg-slate-500/10 border border-slate-500/30 text-slate-300">
                  <div className="text-[9px] text-stone-400">鉱石</div>
                  <div className="font-bold">{player.resources.ORE}</div>
                </div>
              </div>

              {/* Settlements Count */}
              <div className="mt-1 text-[10px] font-serif text-center text-stone-400">
                🏠 開拓地: <span className="text-amber-300 font-bold">{settlementCount} 軒 (+{settlementCount * 5} VP)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Interactive Control Tray (カード手札・アクションエリア) ── */}
      <div className="w-full bg-gradient-to-b from-stone-900/95 to-stone-950/95 border-2 border-stone-800 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl mt-2 relative">
        {/* Phase A: Round Start Prompt */}
        {state.phase === 'ROUND_START' && (
          <div className="text-center py-4">
            <h3 className="text-xl sm:text-2xl font-black font-serif text-amber-200 mb-2">
              第 {state.round} ターン 開拓派遣
            </h3>
            <p className="text-xs text-stone-300 mb-5 font-sans">
              地形カード（麦畑・森林・鉱山）または使い捨ての発展カードから1枚を伏せて派遣先を決定します。
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onStartCardSelection();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black font-serif text-base shadow-[0_10px_25px_rgba(245,158,11,0.6)] transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🗺️ 派遣先（カード選択）を開始する
            </button>
          </div>
        )}

        {/* Phase B: Hand Cards Tray */}
        {state.phase === 'CARD_SELECT' && curPlayer && (
          <div className="flex flex-col items-center">
            {/* Turn Banner */}
            <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-stone-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-amber-400">▶ 派遣開拓団:</span>
                <span className="font-bold text-sm sm:text-base text-white font-serif">
                  {curPlayer.name}
                </span>
              </div>
              <div className="text-xs font-sans text-stone-400">
                1枚選んで「派遣先決定」を押してください
              </div>
            </div>

            {/* Hand Cards List */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 my-2">
              {curPlayer.terrainCards.map((ter) => (
                <PioneerCardComponent
                  key={ter}
                  cardType={ter}
                  isSelected={selectedCard === ter}
                  onClick={() => handleCardClick(ter)}
                  size="md"
                />
              ))}

              {curPlayer.devCards.map((dev, idx) => (
                <PioneerCardComponent
                  key={`${dev}-${idx}`}
                  cardType={dev}
                  isSelected={selectedCard === dev}
                  onClick={() => handleCardClick(dev)}
                  size="md"
                />
              ))}
            </div>

            {/* Dev Card Targeting Controls */}
            {selectedCard && PIONEER_CARDS[selectedCard].category === 'DEV' && (
              <div className="w-full max-w-lg p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 my-3 text-left">
                <div className="text-xs font-mono font-bold text-purple-300 mb-2">
                  📜 発展カードの対象設定:
                </div>

                {/* Opponent target for ROBBER / KNIGHT */}
                {(selectedCard === 'ROBBER' || selectedCard === 'KNIGHT') && (
                  <div className="mb-2">
                    <label className="block text-[11px] font-sans text-stone-300 mb-1">
                      対象の開拓団を選択:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opponents.map((opp) => (
                        <button
                          key={opp.id}
                          type="button"
                          onClick={() => setTargetOpponentId(opp.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-serif transition cursor-pointer ${
                            targetOpponentId === opp.id
                              ? 'bg-purple-600 text-white font-bold ring-2 ring-purple-400'
                              : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          }`}
                        >
                          {opp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resource target for ROBBER / ROADS / HARBOR_TRADE */}
                {(selectedCard === 'ROBBER' ||
                  selectedCard === 'ROADS' ||
                  selectedCard === 'HARBOR_TRADE') && (
                  <div>
                    <label className="block text-[11px] font-sans text-stone-300 mb-1">
                      {selectedCard === 'ROBBER' ? '強奪する資源:' : '獲得する資源:'}
                    </label>
                    <div className="flex gap-2">
                      {(['WHEAT', 'LUMBER', 'ORE'] as ResourceType[]).map((res) => {
                        const conf = RESOURCE_CONFIG[res];
                        return (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setTargetResource(res)}
                            className={`flex-1 py-1 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                              targetResource === res
                                ? `${conf.bgBadge} ${conf.textBadge} ring-2 ring-amber-400 border border-amber-400`
                                : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                            }`}
                          >
                            {conf.icon} {conf.japaneseName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Button */}
            <button
              type="button"
              disabled={!selectedCard}
              onClick={handleConfirmPlay}
              className={`
                mt-3 px-8 py-3.5 rounded-2xl font-black font-serif text-base transition-all transform
                ${
                  selectedCard
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-stone-950 shadow-[0_10px_25px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                }
              `}
            >
              {selectedCard
                ? `【${PIONEER_CARDS[selectedCard].name}】を伏せて派遣決定 ➔`
                : 'カードを選択してください'}
            </button>
          </div>
        )}

        {/* Phase C: Reveal All */}
        {state.phase === 'REVEAL_ALL' && (
          <div className="text-center py-3">
            <h3 className="text-xl sm:text-2xl font-black font-serif text-amber-200 mb-2">
              ⚡ 全開拓団の派遣先が開帳されました！
            </h3>
            <p className="text-xs text-stone-300 mb-5 font-sans">
              先制発展カードの実行、および各地形での資源争奪ダイス対決へ進みます。
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onResolveReveals();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black font-serif text-base shadow-[0_10px_25px_rgba(245,158,11,0.6)] transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🎲 資源争奪のダイス対決・結果処理へ ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
