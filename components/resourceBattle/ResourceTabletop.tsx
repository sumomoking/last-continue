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

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col justify-between min-h-[90vh] p-3 sm:p-5 school-desk-wood rounded-[2rem] sm:rounded-[2.5rem] border-4 border-[#875c2e] shadow-2xl text-stone-900 select-none relative overflow-hidden">
      {/* Pencil Groove Accent */}
      <div className="absolute top-2 left-16 right-16 h-1 bg-black/20 rounded-full shadow-inner pointer-events-none" />

      {/* ── 1. Top Bar: Chalkboard / Notebook Step Guide ── */}
      <div className="w-full school-chalkboard border-2 border-[#5c3a1e] rounded-2xl p-3 shadow-lg mb-3 text-white relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-emerald-700/60">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs sm:text-sm shadow">
              🏫 放課後 ターン {state.round} / {state.maxRounds}
            </span>
            <span className="text-sm font-bold text-amber-200 hidden sm:inline font-serif">
              🌲 資源争奪カードゲーム（机の上の対決）
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

        {/* Step Guide Bar */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs font-bold">
          <div
            className={`p-1.5 rounded-xl transition ${
              state.phase === 'CARD_SELECT' || state.phase === 'ROUND_START'
                ? 'bg-amber-300 text-stone-950 font-black shadow-md'
                : 'bg-emerald-950/60 text-emerald-400/80'
            }`}
          >
            ① 手札から1枚伏せて出す
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
            ③ 資源獲得・サイコロ勝負
          </div>
        </div>
      </div>

      {/* ── 2. Real-time Player Status: Student Desk Sticky Notes ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3 relative z-10">
        {state.players.map((p, idx) => {
          const isCurrent = state.phase === 'CARD_SELECT' && idx === state.currentSelectingPlayerIndex;
          const hasPlayed = p.selectedCard !== null;
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
                rounded-2xl p-3 border-2 transition-all flex flex-col justify-between shadow-md relative bg-[#fffdf0] text-stone-900
                ${
                  isCurrent
                    ? 'border-amber-500 ring-4 ring-amber-400/60 shadow-lg'
                    : 'border-stone-300/80'
                }
              `}
            >
              {/* Tape Accent */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-3.5 school-tape rounded-sm rotate-1 pointer-events-none" />

              {/* Player Name & Play Status */}
              <div className="flex items-center justify-between mb-1.5 mt-0.5">
                <div className="font-black text-xs sm:text-sm text-stone-800 truncate">
                  {p.name}
                </div>
                {state.phase === 'CARD_SELECT' && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      hasPlayed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isCurrent
                        ? 'bg-amber-200 text-amber-900 border border-amber-400 animate-pulse'
                        : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {hasPlayed ? '✓ 出した' : isCurrent ? '▶ 選択中' : '待機'}
                  </span>
                )}
              </div>

              {/* Resources Inventory */}
              <div className="grid grid-cols-3 gap-1 my-1 text-center font-mono">
                <div className="p-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <div className="text-[10px] text-stone-500 font-sans font-bold">木</div>
                  <div className="font-black text-sm">{p.resources.WOOD}</div>
                </div>
                <div className="p-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
                  <div className="text-[10px] text-stone-500 font-sans font-bold">小麦</div>
                  <div className="font-black text-sm">{p.resources.RICE}</div>
                </div>
                <div className="p-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800">
                  <div className="text-[10px] text-stone-500 font-sans font-bold">鉄</div>
                  <div className="font-black text-sm">{p.resources.IRON}</div>
                </div>
              </div>

              {/* Set & Points Summary */}
              <div className="pt-1 mt-1 border-t border-stone-200 flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-600">セット: <strong className="text-amber-700">{setCount}組({setCount}P)</strong></span>
                <span className="text-stone-900 font-black">計: {currentTotalPts}P</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. Center Battle Ground: Classroom Desk Mat ── */}
      <div className="w-full bg-[#1b3d2b] border-2 border-[#12281c] rounded-3xl p-4 sm:p-5 shadow-inner my-2 text-white relative z-10">
        <div className="text-center mb-3">
          <h3 className="text-sm sm:text-base font-black text-amber-200 flex items-center justify-center gap-2">
            <span>🏫 机の中央（3つの資源獲得エリア）</span>
          </h3>
          <p className="text-xs text-emerald-200/80">
            出されたカードが集まる場所です。被ったら「戦（戦闘）」になり、サイコロ勝者が2個総取り！
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {ALL_LOCATIONS.map((loc) => {
            const card = GAME_CARDS[loc];
            const targetRes = RESOURCE_MAP[card.targetResource!];

            // 公開フェーズでこの場所を選んだプレイヤーたち
            const playersHere = state.players.filter(
              (p) => state.phase === 'REVEAL_ALL' && p.selectedCard === loc
            );
            const isConflict = playersHere.length > 1;
            const isSolo = playersHere.length === 1;

            return (
              <div
                key={loc}
                className={`
                  rounded-2xl p-4 border-2 flex flex-col justify-between transition-all duration-300 min-h-[160px]
                  ${
                    isConflict
                      ? 'bg-red-950/80 border-red-400 ring-2 ring-red-400/50 shadow-lg'
                      : isSolo
                      ? 'bg-emerald-900/80 border-emerald-400 shadow-md'
                      : 'bg-emerald-950/60 border-emerald-800/80'
                  }
                `}
              >
                {/* Zone Header */}
                <div className="flex items-center justify-between pb-2 border-b border-emerald-800">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xl">{card.icon}</span>
                    <span className="font-black text-sm text-white">【{card.name}】</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold border ${targetRes.bgBadge} ${targetRes.textBadge} ${targetRes.borderBadge}`}
                  >
                    獲得: {targetRes.icon} {targetRes.name}
                  </span>
                </div>

                {/* Cards Placed Here */}
                <div className="my-3 flex flex-col items-center justify-center text-center">
                  {state.phase === 'REVEAL_ALL' ? (
                    <div>
                      {isConflict && (
                        <div>
                          <div className="px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-300 font-bold text-xs animate-bounce mb-2">
                            ⚔️ 被り発生！({playersHere.length}人が鉢合わせ)
                          </div>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {playersHere.map((p) => (
                              <span
                                key={p.id}
                                className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-white shadow"
                              >
                                {p.name}
                              </span>
                            ))}
                          </div>
                          <div className="text-[11px] text-amber-300 mt-2 font-bold">
                            ➔ サイコロ勝負で勝者が【{targetRes.name}】を2つ獲得！
                          </div>
                        </div>
                      )}

                      {isSolo && (
                        <div>
                          <div className="px-2.5 py-1 rounded-full bg-emerald-600/30 border border-emerald-500 text-emerald-300 font-bold text-xs mb-2">
                            🌿 単独獲得！
                          </div>
                          <div className="text-xs font-bold text-white">
                            {playersHere[0].name}
                          </div>
                          <div className="text-[11px] text-emerald-300 mt-1 font-bold">
                            ➔ 安全に【{targetRes.name}】を1つ獲得
                          </div>
                        </div>
                      )}

                      {!isConflict && !isSolo && (
                        <div className="text-xs text-slate-500 font-mono">
                          誰も選んでいません
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">
                      {state.phase === 'CARD_SELECT'
                        ? '🎴 各プレイヤーがカードを伏せています…'
                        : '待機中'}
                    </div>
                  )}
                </div>

                {/* Bottom Helper */}
                <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-800/80">
                  単独 ➔ 1つ獲得 / 被り ➔ 戦闘勝者が2つ獲得
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button on Reveal All */}
        {state.phase === 'REVEAL_ALL' && (
          <div className="mt-4 pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onResolveReveals();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base shadow-[0_0_25px_rgba(239,68,68,0.5)] transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🎲 判定を実行（サイコロ戦闘＆資源獲得へ）➔
            </button>
          </div>
        )}
      </div>

      {/* ── 4. Bottom Player Controls: Your Hand on the Wooden Desk ── */}
      <div className="w-full bg-[#fdfbf7] border-2 border-[#b58c58] rounded-3xl p-4 sm:p-5 shadow-xl mt-2 text-stone-900 relative z-10">
        {state.phase === 'ROUND_START' && (
          <div className="text-center py-4">
            <h3 className="text-xl sm:text-2xl font-black text-amber-900 mb-2 font-serif">
              第 {state.round} ターン開始
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mb-5">
              手札から「森」「畑」「鉱山」またはイベントカードから1枚を選んで裏向きで場に出します。
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onStartCardSelection();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-stone-950 font-black text-base shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🃏 手札からカードを出す（選択開始）
            </button>
          </div>
        )}

        {state.phase === 'CARD_SELECT' && curPlayer && (
          <div className="flex flex-col items-center">
            {/* Header prompt */}
            <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-stone-200">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-800">▶ 出すプレイヤー:</span>
                <span className="font-black text-sm sm:text-base text-stone-900">{curPlayer.name}</span>
              </div>
              <div className="text-xs font-bold text-amber-800">
                出したいカードを1枚クリックしてください 👇
              </div>
            </div>

            {/* Hand Cards List */}
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
              <div className="w-full max-w-md p-3 rounded-2xl bg-purple-50 border border-purple-300 my-3 text-left">
                <div className="text-xs font-bold text-purple-900 mb-2">
                  ⚡ イベントカードの対象指定:
                </div>

                {(selectedCard === 'STEAL_RESOURCE' || selectedCard === 'CHALLENGE') && (
                  <div className="mb-2">
                    <label className="block text-[11px] text-stone-700 mb-1">
                      対象プレイヤーを選択:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opponents.map((opp) => (
                        <button
                          key={opp.id}
                          type="button"
                          onClick={() => setTargetOpponentId(opp.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                            targetOpponentId === opp.id
                              ? 'bg-purple-600 text-white shadow'
                              : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
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
                    <label className="block text-[11px] text-stone-700 mb-1">
                      奪う資源を選択:
                    </label>
                    <div className="flex gap-2">
                      {(['WOOD', 'RICE', 'IRON'] as ResourceType[]).map((res) => {
                        const conf = RESOURCE_MAP[res];
                        return (
                          <button
                            key={res}
                            type="button"
                            onClick={() => setTargetResource(res)}
                            className={`flex-1 py-1 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                              targetResource === res
                                ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-600'
                                : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
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
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-stone-950 shadow-[0_4px_15px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                }
              `}
            >
              {selectedCard
                ? `【${GAME_CARDS[selectedCard].name}】を裏向きで場に出す ➔`
                : 'カードを1枚選んでください'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
