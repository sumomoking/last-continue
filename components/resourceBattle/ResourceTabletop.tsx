'use client';

import React, { useState } from 'react';
import {
  ResourceGameState,
  GameCardType,
  ResourceType,
} from '../../types/resourceBattle';
import {
  GAME_CARDS,
  RESOURCE_MAP,
  ALL_LOCATIONS,
} from '../../constants/resourceBattle';
import { ResourceCard } from './ResourceCard';
import { soundManager } from '../../lib/sound';

interface ResourceTabletopProps {
  state: ResourceGameState;
  onStartCardSelection: () => void;
  onSelectCard: (
    playerIndex: number,
    card: GameCardType,
    targetPlayerId?: string,
    targetResource?: ResourceType
  ) => void;
  onResolveReveals: () => void;
  onResetGame: () => void;
}

export const ResourceTabletop: React.FC<ResourceTabletopProps> = ({
  state,
  onStartCardSelection,
  onSelectCard,
  onResolveReveals,
  onResetGame,
}) => {
  const [selectedCard, setSelectedCard] = useState<GameCardType | null>(null);
  const [targetOpponentId, setTargetOpponentId] = useState<string>('');
  const [targetResource, setTargetResource] = useState<ResourceType>('WOOD');

  const curPlayer = state.players[state.currentSelectingPlayerIndex];
  const opponents = state.players.filter((_, idx) => idx !== state.currentSelectingPlayerIndex);

  const handleCardClick = (cardType: GameCardType) => {
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
    setTargetResource('WOOD');
  };

  // 各プレイヤーの現在のポイント計算（セット数＋最多ボーナス概算）
  const maxWood = Math.max(...state.players.map((p) => p.resources.WOOD), 1);
  const maxRice = Math.max(...state.players.map((p) => p.resources.RICE), 1);
  const maxIron = Math.max(...state.players.map((p) => p.resources.IRON), 1);

  // イベントカードを出したプレイヤー一覧 (REVEAL_ALL時)
  const eventPlayers = state.players.filter(
    (p) =>
      state.phase === 'REVEAL_ALL' &&
      p.selectedCard &&
      GAME_CARDS[p.selectedCard].category === 'EVENT'
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col justify-between min-h-[92vh] p-3 sm:p-5 school-desk-wood rounded-[2rem] sm:rounded-[2.5rem] border-4 border-[#784d24] shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-stone-900 select-none relative overflow-hidden">
      {/* Tabletop Wood Surface Grain & Pencil Groove */}
      <div className="absolute top-2 left-16 right-16 h-1 bg-black/25 rounded-full shadow-inner pointer-events-none" />

      {/* ── 1. Header Board: School Festival Card Match Header ── */}
      <div className="w-full school-chalkboard border-2 border-[#5c3a1e] rounded-2xl p-3 shadow-lg mb-3 text-white relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-700/60">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow">
              🏫 文化祭・対決 ターン {state.round} / {state.maxRounds}
            </span>
            <span className="text-sm font-bold text-amber-200 hidden sm:inline font-serif">
              🃏 資源争奪カードゲーム（机の上のリアルカード対戦）
            </span>
          </div>

          <button
            type="button"
            onClick={onResetGame}
            className="text-xs font-mono text-emerald-200 hover:text-white transition cursor-pointer px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80"
          >
            ↺ 最初からやり直す
          </button>
        </div>

        {/* Phase Progress Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold">
          <div
            className={`p-1.5 rounded-xl transition ${
              state.phase === 'CARD_SELECT' || state.phase === 'ROUND_START'
                ? 'bg-amber-300 text-stone-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-400/80'
            }`}
          >
            ① 手札から1枚伏せて場に出す
          </div>
          <div
            className={`p-1.5 rounded-xl transition ${
              state.phase === 'REVEAL_ALL'
                ? 'bg-amber-300 text-stone-950 font-black shadow-md animate-pulse'
                : 'bg-emerald-950/60 text-emerald-400/80'
            }`}
          >
            ② せーので一斉オープン！
          </div>
          <div
            className={`p-1.5 rounded-xl transition ${
              state.phase === 'BATTLE_RESOLUTION' || state.phase === 'ROUND_SUMMARY'
                ? 'bg-amber-300 text-stone-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-400/80'
            }`}
          >
            ③ 資源カード獲得・サイコロ勝負
          </div>
        </div>
      </div>

      {/* ── 2. Other Players' Mats (Cards In Play & Collected Resource Cards) ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3 relative z-10">
        {state.players.map((p, idx) => {
          const isCurrent = state.phase === 'CARD_SELECT' && idx === state.currentSelectingPlayerIndex;
          const hasPlayed = p.selectedCard !== null;
          const isRevealed = state.phase === 'REVEAL_ALL' && p.selectedCard !== null;
          const setCount = Math.min(p.resources.WOOD, p.resources.RICE, p.resources.IRON);
          
          let majorityPts = 0;
          if (p.resources.WOOD === maxWood && p.resources.WOOD > 0) majorityPts += 2;
          if (p.resources.RICE === maxRice && p.resources.RICE > 0) majorityPts += 2;
          if (p.resources.IRON === maxIron && p.resources.IRON > 0) majorityPts += 2;
          const currentTotalPts = setCount * 1 + majorityPts;

          return (
            <div
              key={p.id}
              className={`
                rounded-2xl p-2.5 sm:p-3 border-2 transition-all flex flex-col justify-between shadow-md relative bg-[#faf6ea] text-stone-900
                ${
                  isCurrent
                    ? 'border-amber-500 ring-4 ring-amber-400/60 shadow-xl'
                    : 'border-[#c4a47c]'
                }
              `}
            >
              {/* Player Name Tag Tape */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="font-black text-xs sm:text-sm text-stone-800 truncate">
                    {p.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 font-bold text-amber-900">
                  計 {currentTotalPts}P
                </span>
              </div>

              {/* Played Card Slot (Physical Card Face-down or Face-up) */}
              <div className="my-1.5 p-2 rounded-xl bg-[#ede2cf] border border-[#cfbca1] flex flex-col items-center justify-center min-h-[95px]">
                <div className="text-[10px] font-bold text-stone-600 mb-1">
                  出したカード:
                </div>
                {isRevealed && p.selectedCard ? (
                  <div className="animate-scale-in">
                    <ResourceCard cardType={p.selectedCard} size="sm" />
                  </div>
                ) : hasPlayed ? (
                  <div className="animate-fade-in">
                    <ResourceCard cardType="FOREST" isFaceDown size="sm" />
                  </div>
                ) : (
                  <div className="w-20 h-28 border-2 border-dashed border-stone-400/70 rounded-xl flex flex-col items-center justify-center text-stone-500 text-[10px] text-center p-1 font-bold">
                    {isCurrent ? (
                      <span className="text-amber-700 font-black animate-pulse">
                        🎴 選択中...
                      </span>
                    ) : (
                      <span>待機中</span>
                    )}
                  </div>
                )}
              </div>

              {/* Collected Physical Resource Cards Display (Mini Cards Stack) */}
              <div className="pt-1.5 border-t border-stone-300/80">
                <div className="text-[10px] font-bold text-stone-600 mb-1 flex items-center justify-between">
                  <span>獲得した資源カード:</span>
                  <span className="text-amber-800 font-mono text-[10px]">
                    {setCount > 0 ? `★ ${setCount}セット組` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1">
                  {/* Wood Card Stack */}
                  <div className="flex flex-col items-center">
                    {p.resources.WOOD > 0 ? (
                      <ResourceCard
                        cardType="RES_WOOD"
                        size="micro"
                        count={p.resources.WOOD}
                      />
                    ) : (
                      <div className="w-10 h-14 rounded-md border border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-[9px] text-stone-400">
                        <span>🪵</span>
                        <span>0</span>
                      </div>
                    )}
                  </div>

                  {/* Wheat Card Stack */}
                  <div className="flex flex-col items-center">
                    {p.resources.RICE > 0 ? (
                      <ResourceCard
                        cardType="RES_RICE"
                        size="micro"
                        count={p.resources.RICE}
                      />
                    ) : (
                      <div className="w-10 h-14 rounded-md border border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-[9px] text-stone-400">
                        <span>🌾</span>
                        <span>0</span>
                      </div>
                    )}
                  </div>

                  {/* Iron Card Stack */}
                  <div className="flex flex-col items-center">
                    {p.resources.IRON > 0 ? (
                      <ResourceCard
                        cardType="RES_IRON"
                        size="micro"
                        count={p.resources.IRON}
                      />
                    ) : (
                      <div className="w-10 h-14 rounded-md border border-dashed border-stone-300 bg-stone-100 flex flex-col items-center justify-center text-[9px] text-stone-400">
                        <span>⚙️</span>
                        <span>0</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Center Tabletop Battle Mat: Resource Decks & Location Drop Zones ── */}
      <div className="w-full bg-[#1b3d2b] border-4 border-[#12281c] rounded-3xl p-3.5 sm:p-5 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] my-2 text-white relative z-10">
        <div className="text-center mb-3">
          <h3 className="text-sm sm:text-base font-black text-amber-200 flex items-center justify-center gap-2">
            <span>🏫 机の中央：3つの資源カード置き場 ＆ 出されたカード</span>
          </h3>
          <p className="text-xs text-emerald-200/80">
            単独なら中央の山札から資源カードを1枚獲得！被ったらサイコロ勝者が2枚総取り！
          </p>
        </div>

        {/* 3 Location Zones & Supply Decks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ALL_LOCATIONS.map((loc) => {
            const card = GAME_CARDS[loc];
            const targetResKey = card.targetResource!;
            const targetRes = RESOURCE_MAP[targetResKey];

            // Players who played this location card in REVEAL_ALL
            const playersHere = state.players.filter(
              (p) => state.phase === 'REVEAL_ALL' && p.selectedCard === loc
            );
            const isConflict = playersHere.length > 1;
            const isSolo = playersHere.length === 1;

            return (
              <div
                key={loc}
                className={`
                  rounded-2xl p-3.5 border-2 flex flex-col justify-between transition-all duration-300 relative overflow-hidden
                  ${
                    isConflict
                      ? 'bg-gradient-to-b from-red-950/90 to-red-900/80 border-red-400 ring-4 ring-red-400/50 shadow-2xl'
                      : isSolo
                      ? 'bg-gradient-to-b from-emerald-950/90 to-teal-900/80 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl'
                      : 'bg-emerald-950/80 border-emerald-800/80'
                  }
                `}
              >
                {/* Zone Title & Target Resource Deck */}
                <div className="flex items-center justify-between pb-2 border-b border-emerald-700/60">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-2xl">{card.icon}</span>
                    <span className="font-black text-sm text-white">
                      【{card.name}】エリア
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 border border-emerald-600">
                    獲得: {targetRes.name}カード
                  </span>
                </div>

                {/* Central Visual: Resource Supply Card Stack & Played Cards */}
                <div className="my-3 flex items-center justify-around gap-2 min-h-[120px]">
                  {/* 1. The Central Resource Supply Card */}
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold text-amber-300 mb-1">
                      場の資源山札
                    </div>
                    <div className="relative">
                      {/* Stack effect shadows */}
                      <div className="absolute top-1 left-1 w-full h-full rounded-xl bg-black/40 -z-10" />
                      <ResourceCard
                        cardType={`RES_${targetResKey}`}
                        size="sm"
                        showGlow={isSolo || isConflict}
                      />
                    </div>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="text-xl font-bold text-amber-400">➔</div>

                  {/* 2. Played Cards on this zone */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="text-[10px] font-bold text-stone-300 mb-1">
                      出されたカード
                    </div>

                    {state.phase === 'REVEAL_ALL' ? (
                      <div className="flex flex-col items-center">
                        {isConflict && (
                          <div className="text-center">
                            <div className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] animate-bounce mb-1">
                              ⚔️ 被り発生！({playersHere.length}人)
                            </div>
                            <div className="flex flex-wrap justify-center gap-1">
                              {playersHere.map((p) => (
                                <span
                                  key={p.id}
                                  className="px-2 py-0.5 rounded bg-red-950 border border-red-500 text-red-200 font-bold text-[11px]"
                                >
                                  {p.name}
                                </span>
                              ))}
                            </div>
                            <div className="text-[10px] text-amber-300 font-bold mt-1">
                              サイコロ勝負で2枚総取り！
                            </div>
                          </div>
                        )}

                        {isSolo && (
                          <div className="text-center">
                            <div className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] mb-1">
                              🌿 単独獲得！
                            </div>
                            <div className="text-xs font-bold text-emerald-200">
                              {playersHere[0].name}
                            </div>
                            <div className="text-[10px] text-emerald-300 font-bold mt-1">
                              1枚安全に獲得
                            </div>
                          </div>
                        )}

                        {!isConflict && !isSolo && (
                          <div className="text-xs text-emerald-400/50 font-mono py-4">
                            誰も出していません
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-300/60 font-mono text-center py-4">
                        {state.phase === 'CARD_SELECT'
                          ? '🎴 各自伏せています…'
                          : '待機中'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Zone Helper */}
                <div className="text-[10px] text-emerald-300/80 text-center pt-2 border-t border-emerald-800/80 font-mono">
                  単独 ➔ 1枚獲得 / 被り ➔ 戦闘勝者が2枚獲得
                </div>
              </div>
            );
          })}
        </div>

        {/* Event Cards Section in Center if any played */}
        {state.phase === 'REVEAL_ALL' && eventPlayers.length > 0 && (
          <div className="mt-4 p-3 rounded-2xl bg-purple-950/80 border-2 border-purple-500/80">
            <div className="text-xs font-black text-purple-200 mb-2 flex items-center gap-1.5">
              <span>⚡ 発動されたイベントカード:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {eventPlayers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-purple-900/60 border border-purple-400"
                >
                  <ResourceCard cardType={p.selectedCard!} size="sm" />
                  <div>
                    <div className="font-bold text-xs text-white">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-purple-200 mt-0.5">
                      {GAME_CARDS[p.selectedCard!].description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button on Reveal All */}
        {state.phase === 'REVEAL_ALL' && (
          <div className="mt-4 pt-3 border-t border-emerald-800 text-center">
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onResolveReveals();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base shadow-[0_0_25px_rgba(239,68,68,0.6)] transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🎲 判定を実行（サイコロ勝負＆資源カード獲得）➔
            </button>
          </div>
        )}
      </div>

      {/* ── 4. Bottom Player Controls: Your Hand on the Table ── */}
      <div className="w-full bg-[#faf6ea] border-3 border-[#9c6f3b] rounded-3xl p-4 sm:p-5 shadow-2xl mt-2 text-stone-900 relative z-10">
        {state.phase === 'ROUND_START' && (
          <div className="text-center py-4">
            <h3 className="text-xl sm:text-2xl font-black text-amber-950 mb-2 font-serif">
              第 {state.round} ターン開始
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 mb-5">
              手札のカード（「森」「畑」「鉱山」「イベント」）から1枚を選んで、裏向き（伏せ札）で場に出します。
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onStartCardSelection();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-stone-950 font-black text-base shadow-xl transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🃏 手札からカードを場に出す（選択開始）➔
            </button>
          </div>
        )}

        {state.phase === 'CARD_SELECT' && curPlayer && (
          <div className="flex flex-col items-center">
            {/* Header Hand Banner */}
            <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-stone-300">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-900">▶ 出すプレイヤー:</span>
                <span className="font-black text-sm sm:text-base text-stone-950 bg-amber-200 px-2.5 py-0.5 rounded-lg border border-amber-400">
                  {curPlayer.name}
                </span>
              </div>
              <div className="text-xs font-bold text-amber-900">
                出したいカードをクリックして選んでください 👇
              </div>
            </div>

            {/* Hand Cards Fan (Physical Cards Display) */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-2">
              {/* Location Cards */}
              {curPlayer.locationCards.map((loc) => (
                <ResourceCard
                  key={loc}
                  cardType={loc}
                  isSelected={selectedCard === loc}
                  onClick={() => handleCardClick(loc)}
                  size="md"
                />
              ))}

              {/* Event Cards */}
              {curPlayer.eventCards.map((ev, idx) => (
                <ResourceCard
                  key={`${ev}-${idx}`}
                  cardType={ev}
                  isSelected={selectedCard === ev}
                  onClick={() => handleCardClick(ev)}
                  size="md"
                />
              ))}
            </div>

            {/* Event Targeting Controls (if needed) */}
            {selectedCard && GAME_CARDS[selectedCard].category === 'EVENT' && (
              <div className="w-full max-w-md p-3 rounded-2xl bg-purple-100 border-2 border-purple-400 my-3 text-left">
                <div className="text-xs font-bold text-purple-950 mb-2">
                  ⚡ イベントカードの対象指定:
                </div>

                {(selectedCard === 'STEAL_RESOURCE' || selectedCard === 'CHALLENGE') && (
                  <div className="mb-2">
                    <label className="block text-[11px] font-bold text-stone-800 mb-1">
                      対象プレイヤーを選択:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opponents.map((opp) => (
                        <button
                          key={opp.id}
                          type="button"
                          onClick={() => setTargetOpponentId(opp.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            targetOpponentId === opp.id
                              ? 'bg-purple-700 text-white shadow-md'
                              : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                          }`}
                        >
                          {opp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCard === 'STEAL_RESOURCE' && (
                  <div>
                    <label className="block text-[11px] font-bold text-stone-800 mb-1">
                      奪う資源カードを選択:
                    </label>
                    <div className="flex gap-2">
                      {(['WOOD', 'RICE', 'IRON'] as ResourceType[]).map((res) => {
                        const conf = RESOURCE_MAP[res];
                        return (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setTargetResource(res)}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                              targetResource === res
                                ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-700 shadow-md'
                                : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                            }`}
                          >
                            {conf.icon} 【{conf.name}】
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Play Button */}
            <button
              type="button"
              disabled={!selectedCard}
              onClick={handleConfirmPlay}
              className={`
                mt-3 px-8 py-3.5 rounded-2xl font-black text-base transition-all transform
                ${
                  selectedCard
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-stone-950 shadow-[0_4px_18px_rgba(245,158,11,0.6)] hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }
              `}
            >
              {selectedCard
                ? `【${GAME_CARDS[selectedCard].name}】を伏せて場に出す ➔`
                : '手札から出したいカードを選んでください'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

