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
  const opponents = curPlayer
    ? state.players.filter((p) => p.id !== curPlayer.id)
    : [];

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

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-between min-h-[85vh] p-2 sm:p-4 text-slate-100 select-none relative">
      {/* ── Top Status Bar ── */}
      <div className="w-full flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 shadow-lg backdrop-blur-md mb-3">
        <div className="flex items-center space-x-3 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs text-slate-400">TURN:</span>
          <span className="text-amber-300 font-black tracking-wider text-base sm:text-lg">
            {state.round} / {state.maxRounds}
          </span>
        </div>

        <div className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300">
          {state.phase === 'ROUND_START' && '🃏 ターン開始'}
          {state.phase === 'CARD_SELECT' && `手札選択中 (${curPlayer?.name || ''})`}
          {state.phase === 'REVEAL_ALL' && '⚡ 一斉公開されました'}
          {state.phase === 'BATTLE_RESOLUTION' && '⚔️ 戦闘判定中'}
          {state.phase === 'ROUND_SUMMARY' && '📊 獲得集計'}
        </div>

        <button
          type="button"
          onClick={onResetGame}
          className="text-xs font-mono text-slate-500 hover:text-slate-300 transition cursor-pointer"
        >
          ↺ 最初からやり直す
        </button>
      </div>

      {/* ── Center Stage: 場の中央の資源（木・米・鉄）とエリア（森・畑・鉱山） ── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3.5 my-2">
        {ALL_LOCATIONS.map((loc) => {
          const card = GAME_CARDS[loc];
          const targetRes = RESOURCE_MAP[card.targetResource!];

          const targetingPlayers = state.players.filter(
            (p) => state.phase === 'REVEAL_ALL' && p.selectedCard === loc
          );
          const isCombat = targetingPlayers.length > 1;
          const isSolo = targetingPlayers.length === 1;

          return (
            <div
              key={loc}
              className={`
                relative rounded-3xl border-2 p-4 sm:p-5 flex flex-col justify-between shadow-xl transition-all duration-500 overflow-hidden
                ${
                  isCombat
                    ? 'border-red-500/90 bg-gradient-to-b from-red-950/70 via-slate-950 to-slate-950 shadow-[0_0_30px_rgba(239,68,68,0.4)] ring-2 ring-red-500/50'
                    : isSolo
                    ? 'border-emerald-500/80 bg-gradient-to-b from-emerald-950/70 via-slate-950 to-slate-950'
                    : 'border-slate-800 bg-slate-900/60'
                }
              `}
            >
              {/* Header */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-white border border-slate-700">
                  {card.icon} エリア: 【{card.name}】
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border ${targetRes.bgBadge} ${targetRes.textBadge} ${targetRes.borderBadge}`}
                >
                  獲得: {targetRes.icon} 【{targetRes.name}】
                </span>
              </div>

              {/* Center Kanji */}
              <div className="my-4 text-center select-none">
                <div className="text-5xl sm:text-6xl font-black font-serif text-white/90 drop-shadow">
                  {card.kanji}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  単独 ➔ 1つ獲得 / 被り ➔ 戦闘勝者が2つ獲得！
                </div>
              </div>

              {/* Status */}
              <div className="relative z-10 pt-2 border-t border-slate-800">
                {state.phase === 'REVEAL_ALL' ? (
                  <div>
                    {isCombat && (
                      <div className="text-center">
                        <div className="inline-block px-2.5 py-0.5 bg-red-600/30 border border-red-500 text-red-300 rounded text-xs font-bold animate-pulse mb-1">
                          ⚔️ 戦（戦闘）発生！({targetingPlayers.length}人被り)
                        </div>
                        <div className="text-xs text-slate-300">
                          {targetingPlayers.map((p) => p.name).join(' vs ')}
                        </div>
                      </div>
                    )}
                    {isSolo && (
                      <div className="text-center">
                        <div className="inline-block px-2.5 py-0.5 bg-emerald-600/30 border border-emerald-500 text-emerald-300 rounded text-xs font-bold mb-1">
                          🌿 単独獲得（1つ獲得）
                        </div>
                        <div className="text-xs text-emerald-200">
                          {targetingPlayers[0].name}
                        </div>
                      </div>
                    )}
                    {!isCombat && !isSolo && (
                      <div className="text-center text-xs font-mono text-slate-500">
                        出したプレイヤーなし
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-xs font-mono text-slate-400">
                    {state.phase === 'CARD_SELECT' ? '裏向きでカード選択中…' : '待機中'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Player Boards (各プレイヤーの所持資源 & セット数) ── */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 my-2">
        {state.players.map((player, idx) => {
          const isSelecting =
            state.phase === 'CARD_SELECT' && idx === state.currentSelectingPlayerIndex;
          const hasSelected = player.selectedCard !== null;
          const setCount = Math.min(
            player.resources.WOOD,
            player.resources.RICE,
            player.resources.IRON
          );

          return (
            <div
              key={player.id}
              className={`
                rounded-2xl p-3 border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between
                ${
                  isSelecting
                    ? 'bg-slate-900/95 border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-950/80 border-slate-800'
                }
              `}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-bold text-xs text-white truncate">
                  {player.name}
                </div>
              </div>

              {/* Status */}
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
                    {hasSelected ? '✓ 選択完了' : isSelecting ? '▶ 選択中' : '待機'}
                  </span>
                )}
                {state.phase === 'REVEAL_ALL' && player.selectedCard && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 truncate inline-block">
                    {GAME_CARDS[player.selectedCard].icon} {GAME_CARDS[player.selectedCard].name}
                  </span>
                )}
              </div>

              {/* Current Resources */}
              <div className="pt-1.5 border-t border-slate-800 grid grid-cols-3 gap-1 text-center text-xs font-mono">
                <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                  <div className="text-[9px] text-slate-400">木</div>
                  <div className="font-bold">{player.resources.WOOD}</div>
                </div>
                <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <div className="text-[9px] text-slate-400">米</div>
                  <div className="font-bold">{player.resources.RICE}</div>
                </div>
                <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  <div className="text-[9px] text-slate-400">鉄</div>
                  <div className="font-bold">{player.resources.IRON}</div>
                </div>
              </div>

              {/* Set points */}
              <div className="mt-1 text-[10px] font-mono text-center text-slate-400">
                木米鉄セット: <span className="text-amber-300 font-bold">{setCount} セット ({setCount}P)</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Hand Cards Tray (手札から1枚選び、裏向きで場に出す) ── */}
      <div className="w-full bg-gradient-to-b from-slate-900/95 to-slate-950/95 border-2 border-slate-800 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-xl mt-2 relative">
        {state.phase === 'ROUND_START' && (
          <div className="text-center py-4">
            <h3 className="text-xl sm:text-2xl font-black text-amber-300 mb-2">
              第 {state.round} ターン開始
            </h3>
            <p className="text-xs text-slate-300 mb-5">
              各プレイヤーは手札から「森・畑・鉱山」またはイベントカードから1枚を選び、裏向きで場に出します。
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onStartCardSelection();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 font-black text-base shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              🃏 手札からカードを出す（選択開始）
            </button>
          </div>
        )}

        {state.phase === 'CARD_SELECT' && curPlayer && (
          <div className="flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-amber-400">▶ 選択プレイヤー:</span>
                <span className="font-bold text-sm sm:text-base text-white">{curPlayer.name}</span>
              </div>
              <div className="text-xs text-slate-400">
                1枚選んで「裏向きで場に出す」を押してください
              </div>
            </div>

            {/* Hand Cards */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 my-2">
              {curPlayer.locationCards.map((loc) => (
                <ResourceCard
                  key={loc}
                  cardType={loc}
                  isSelected={selectedCard === loc}
                  onClick={() => handleCardClick(loc)}
                  size="md"
                />
              ))}

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

            {/* Event Targeting */}
            {selectedCard && GAME_CARDS[selectedCard].category === 'EVENT' && (
              <div className="w-full max-w-lg p-3 rounded-2xl bg-purple-950/40 border border-purple-500/40 my-3 text-left">
                <div className="text-xs font-bold text-purple-300 mb-2">
                  ⚡ イベントカードの設定:
                </div>

                {(selectedCard === 'STEAL_RESOURCE' || selectedCard === 'CHALLENGE') && (
                  <div className="mb-2">
                    <label className="block text-[11px] text-slate-300 mb-1">
                      対象プレイヤーを選択:
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

                {selectedCard === 'STEAL_RESOURCE' && (
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">
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
                                ? `${conf.bgBadge} ${conf.textBadge} ring-2 ring-amber-400 border border-amber-400`
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
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

            {/* Confirm */}
            <button
              type="button"
              disabled={!selectedCard}
              onClick={handleConfirmPlay}
              className={`
                mt-3 px-8 py-3.5 rounded-2xl font-black text-base transition-all transform
                ${
                  selectedCard
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-lg hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                }
              `}
            >
              {selectedCard
                ? `【${GAME_CARDS[selectedCard].name}】を裏向きで場に出す ➔`
                : 'カードを選択してください'}
            </button>
          </div>
        )}

        {state.phase === 'REVEAL_ALL' && (
          <div className="text-center py-3">
            <h3 className="text-xl sm:text-2xl font-black text-cyan-300 mb-2">
              ⚡ 全員がカードを出しました！一斉に表向きにします。
            </h3>
            <p className="text-xs text-slate-300 mb-5">
              イベントの先制実行、および被った場合の「戦（戦闘）」ダイス勝負へ進みます。
            </p>
            <button
              type="button"
              onClick={() => {
                soundManager.playButtonClick();
                onResolveReveals();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 hover:from-cyan-400 text-slate-950 font-black text-base shadow-lg transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              ⚔️ 判定・戦闘処理を実行する ➔
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
