'use client';

import { useState, useCallback, useRef } from 'react';
import {
  ResourceGameState,
  BattlePlayer,
  GameCardType,
  LocationCardType,
  EventCardType,
  ResourceType,
  CombatGroup,
  ScoreSummary,
  ActionLog,
} from '../types/resourceBattle';
import {
  MAX_ROUNDS,
  ALL_LOCATIONS,
  ALL_EVENTS,
  PLAYER_CONFIGS,
  GAME_CARDS,
} from '../constants/resourceBattle';
import { soundManager } from '../lib/sound';

const DEFAULT_STATE: ResourceGameState = {
  round: 1,
  maxRounds: MAX_ROUNDS,
  phase: 'SETUP',
  players: [],
  currentSelectingPlayerIndex: 0,
  activeCombats: [],
  currentCombatIndex: 0,
  activeEventsQueue: [],
  currentEventIndex: 0,
  logs: [],
  finalScores: [],
  winnerPlayerId: null,
};

export function useResourceBattleEngine() {
  const [state, setState] = useState<ResourceGameState>(DEFAULT_STATE);
  const logCounter = useRef(1);

  // 1. ゲーム初期化
  const initGame = useCallback(
    (
      playerCount: number = 3,
      humanCount: number = 1,
      playerNames?: string[]
    ) => {
      const players: BattlePlayer[] = [];

      const getRandomEvents = (): EventCardType[] => {
        const pool = [...ALL_EVENTS];
        const selected: EventCardType[] = [];
        for (let i = 0; i < 2; i++) {
          const randIdx = Math.floor(Math.random() * pool.length);
          selected.push(pool[randIdx]);
        }
        return selected;
      };

      for (let i = 0; i < playerCount; i++) {
        const isCpu = i >= humanCount;
        const config = PLAYER_CONFIGS[i % PLAYER_CONFIGS.length];
        const customName = playerNames?.[i]?.trim();
        const defaultName = isCpu
          ? `CPU ${i + 1}`
          : humanCount === 1 && i === 0
          ? 'プレイヤー1'
          : `プレイヤー${i + 1}`;

        players.push({
          id: `player-${i + 1}`,
          name: customName || defaultName,
          isCpu,
          colorBadge: config.colorBadge,
          resources: { WOOD: 0, RICE: 0, IRON: 0 },
          locationCards: [...ALL_LOCATIONS], // 「森」「畑」「鉱山」
          eventCards: getRandomEvents(),     // イベントカード
          selectedCard: null,
          lastGainedResources: { WOOD: 0, RICE: 0, IRON: 0 },
        });
      }

      const startLog: ActionLog = {
        id: `log-init-${Date.now()}`,
        round: 1,
        message: `🃏 ゲーム開始！全プレイヤーに「森・畑・鉱山」とイベントカードを配布しました。（参加: ${playerCount}人）`,
        type: 'INFO',
        timestamp: new Date().toLocaleTimeString(),
      };

      soundManager.playRoundStart();

    setState({
      ...DEFAULT_STATE,
      round: 1,
      phase: 'ROUND_START',
      players,
      currentSelectingPlayerIndex: 0,
      logs: [startLog],
    });
  }, []);

  // 2. ラウンド開始（手札から1枚裏向きで出すフェーズへ）
  const startCardSelection = useCallback(() => {
    setState((prev) => {
      const resetPlayers = prev.players.map((p) => ({
        ...p,
        selectedCard: null,
        eventTargetPlayerId: undefined,
        eventTargetResource: undefined,
        diceRoll: undefined,
        diceModifier: undefined,
        finalRoll: undefined,
        lastGainedResources: { WOOD: 0, RICE: 0, IRON: 0 },
      }));

      const firstHumanIdx = resetPlayers.findIndex((p) => !p.isCpu);

      return {
        ...prev,
        phase: 'CARD_SELECT',
        players: resetPlayers,
        currentSelectingPlayerIndex: firstHumanIdx !== -1 ? firstHumanIdx : 0,
        activeCombats: [],
        currentCombatIndex: 0,
        activeEventsQueue: [],
        currentEventIndex: 0,
      };
    });
  }, []);

  // CPU思考ルーチン
  const decideCpuMove = (
    cpu: BattlePlayer,
    allPlayers: BattlePlayer[]
  ): {
    card: GameCardType;
    targetPlayerId?: string;
    targetResource?: ResourceType;
  } => {
    const { WOOD, RICE, IRON } = cpu.resources;
    const priorities: { type: ResourceType; card: LocationCardType; count: number }[] = [
      { type: 'WOOD', card: 'FOREST', count: WOOD },
      { type: 'RICE', card: 'FIELD', count: RICE },
      { type: 'IRON', card: 'MINE', count: IRON },
    ];
    priorities.sort((a, b) => a.count - b.count);

    if (cpu.eventCards.length > 0 && Math.random() < 0.35) {
      const chosenEvent = cpu.eventCards[Math.floor(Math.random() * cpu.eventCards.length)];
      const opponents = allPlayers.filter((p) => p.id !== cpu.id);
      const targetOpponent = opponents[Math.floor(Math.random() * opponents.length)];

      if (chosenEvent === 'STEAL_RESOURCE' || chosenEvent === 'CHALLENGE') {
        return {
          card: chosenEvent,
          targetPlayerId: targetOpponent.id,
          targetResource: priorities[0].type,
        };
      }
      return { card: chosenEvent };
    }

    if (Math.random() < 0.7) {
      return { card: priorities[0].card };
    } else {
      const randIdx = Math.floor(Math.random() * priorities.length);
      return { card: priorities[randIdx].card };
    }
  };

  // 3. カードを裏向きで出す
  const selectCard = useCallback(
    (
      playerIndex: number,
      card: GameCardType,
      targetPlayerId?: string,
      targetResource?: ResourceType
    ) => {
      soundManager.playCardFlip();

      setState((prev) => {
        const updatedPlayers = [...prev.players];
        const curPlayer = { ...updatedPlayers[playerIndex] };

        curPlayer.selectedCard = card;
        curPlayer.eventTargetPlayerId = targetPlayerId;
        curPlayer.eventTargetResource = targetResource;

        if (GAME_CARDS[card].category === 'EVENT') {
          const devIdx = curPlayer.eventCards.indexOf(card as EventCardType);
          if (devIdx !== -1) {
            curPlayer.eventCards = [
              ...curPlayer.eventCards.slice(0, devIdx),
              ...curPlayer.eventCards.slice(devIdx + 1),
            ];
          }
        }

        updatedPlayers[playerIndex] = curPlayer;

        let nextHumanIdx = -1;
        for (let i = playerIndex + 1; i < updatedPlayers.length; i++) {
          if (!updatedPlayers[i].isCpu && updatedPlayers[i].selectedCard === null) {
            nextHumanIdx = i;
            break;
          }
        }

        if (nextHumanIdx !== -1) {
          return {
            ...prev,
            players: updatedPlayers,
            currentSelectingPlayerIndex: nextHumanIdx,
          };
        }

        // 全員の選択が完了！CPUも自動選択して一斉公開（REVEAL_ALL）へ
        for (let i = 0; i < updatedPlayers.length; i++) {
          if (updatedPlayers[i].isCpu && updatedPlayers[i].selectedCard === null) {
            const cpuMove = decideCpuMove(updatedPlayers[i], updatedPlayers);
            updatedPlayers[i] = {
              ...updatedPlayers[i],
              selectedCard: cpuMove.card,
              eventTargetPlayerId: cpuMove.targetPlayerId,
              eventTargetResource: cpuMove.targetResource,
            };
            if (GAME_CARDS[cpuMove.card].category === 'EVENT') {
              const devIdx = updatedPlayers[i].eventCards.indexOf(cpuMove.card as EventCardType);
              if (devIdx !== -1) {
                updatedPlayers[i].eventCards = [
                  ...updatedPlayers[i].eventCards.slice(0, devIdx),
                  ...updatedPlayers[i].eventCards.slice(devIdx + 1),
                ];
              }
            }
          }
        }

        const newLogs: ActionLog[] = [...prev.logs];
        newLogs.push({
          id: `log-reveal-${Date.now()}`,
          round: prev.round,
          message: `📜 全員がカードを出しました！一斉に表向きにします。`,
          type: 'INFO',
          timestamp: new Date().toLocaleTimeString(),
        });

        return {
          ...prev,
          players: updatedPlayers,
          phase: 'REVEAL_ALL',
          logs: newLogs,
        };
      });
    },
    []
  );

  // 4. 一斉公開後の処理（イベント先制実行 ➔ 森/畑/鉱山の獲得 or 戦闘）
  const resolveReveals = useCallback(() => {
    setState((prev) => {
      const logs: ActionLog[] = [...prev.logs];
      const players = prev.players.map((p) => ({ ...p, resources: { ...p.resources } }));

      // ── Step 1: イベントカードの先制実行 ──
      const eventQueue: ResourceGameState['activeEventsQueue'] = [];
      players.forEach((p) => {
        if (p.selectedCard && GAME_CARDS[p.selectedCard].category === 'EVENT') {
          eventQueue.push({
            playerId: p.id,
            card: p.selectedCard as EventCardType,
            targetPlayerId: p.eventTargetPlayerId,
            targetResource: p.eventTargetResource,
          });
        }
      });

      eventQueue.forEach((ev) => {
        const actor = players.find((p) => p.id === ev.playerId);
        if (!actor) return;

        if (ev.card === 'ALL_AREAS') {
          // 全エリアの選択: 木・小麦・鉄を1つずつ獲得
          actor.resources.WOOD += 1;
          actor.resources.RICE += 1;
          actor.resources.IRON += 1;
          actor.lastGainedResources = { WOOD: 1, RICE: 1, IRON: 1 };
          logs.push({
            id: `log-ev-${Date.now()}-${actor.id}`,
            round: prev.round,
            message: `🌟 【全エリアの選択】${actor.name}が「木・小麦・鉄」を1つずつ獲得しました！`,
            type: 'EVENT',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (ev.card === 'STEAL_RESOURCE') {
          // 資源を奪う: 特定プレイヤーから指定資源を1つ奪う
          const target = players.find((p) => p.id === ev.targetPlayerId);
          const res = ev.targetResource || 'WOOD';
          const resName = res === 'WOOD' ? '木' : res === 'RICE' ? '小麦' : '鉄';
          if (target && target.resources[res] > 0) {
            target.resources[res] -= 1;
            actor.resources[res] += 1;
            actor.lastGainedResources = {
              ...actor.lastGainedResources!,
              [res]: (actor.lastGainedResources?.[res] || 0) + 1,
            };
            logs.push({
              id: `log-ev-${Date.now()}-${actor.id}`,
              round: prev.round,
              message: `🥷 【資源を奪う】${actor.name}が${target.name}から【${resName}】を1つ奪いました！`,
              type: 'EVENT',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else if (target) {
            logs.push({
              id: `log-ev-${Date.now()}-${actor.id}`,
              round: prev.round,
              message: `🥷 【資源を奪う】${actor.name}が${target.name}を指定したが、該当の資源を持っていなかった！`,
              type: 'EVENT',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        } else if (ev.card === 'CHALLENGE') {
          // 特定のプレイヤーと戦う
          const target = players.find((p) => p.id === ev.targetPlayerId);
          if (target) {
            const actorRoll = Math.floor(Math.random() * 6) + 1;
            const targetRoll = Math.floor(Math.random() * 6) + 1;
            const res = ev.targetResource || 'WOOD';
            const resName = res === 'WOOD' ? '木' : res === 'RICE' ? '小麦' : '鉄';

            if (actorRoll >= targetRoll && target.resources[res] > 0) {
              target.resources[res] -= 1;
              actor.resources[res] += 1;
              actor.lastGainedResources = {
                ...actor.lastGainedResources!,
                [res]: (actor.lastGainedResources?.[res] || 0) + 1,
              };
              logs.push({
                id: `log-ev-${Date.now()}-${actor.id}`,
                round: prev.round,
                message: `⚔️ 【指名戦闘】${actor.name}(出目:${actorRoll}) が ${target.name}(出目:${targetRoll}) に勝利し、【${resName}】を1つ奪取！`,
                type: 'EVENT',
                timestamp: new Date().toLocaleTimeString(),
              });
            } else {
              logs.push({
                id: `log-ev-${Date.now()}-${actor.id}`,
                round: prev.round,
                message: `⚔️ 【指名戦闘】${actor.name}(出目:${actorRoll}) と ${target.name}(出目:${targetRoll}) の戦闘！奪取失敗。`,
                type: 'EVENT',
                timestamp: new Date().toLocaleTimeString(),
              });
            }
          }
        }
      });

      // ── Step 2: 「森」「畑」「鉱山」の獲得 or 戦闘 ──
      const locationGroups: Record<LocationCardType, BattlePlayer[]> = {
        FOREST: [],
        FIELD: [],
        MINE: [],
      };

      players.forEach((p) => {
        if (p.selectedCard && GAME_CARDS[p.selectedCard].category === 'LOCATION') {
          locationGroups[p.selectedCard as LocationCardType].push(p);
        }
      });

      const combatList: CombatGroup[] = [];

      (Object.keys(locationGroups) as LocationCardType[]).forEach((loc) => {
        const group = locationGroups[loc];
        const cardInfo = GAME_CARDS[loc];
        const targetRes = cardInfo.targetResource!;
        const resName = targetRes === 'WOOD' ? '木' : targetRes === 'RICE' ? '小麦' : '鉄';

        if (group.length === 1) {
          // 単独: 対応する資源を1つ獲得
          const soloPlayer = group[0];
          soloPlayer.resources[targetRes] += 1;
          soloPlayer.lastGainedResources = {
            ...soloPlayer.lastGainedResources!,
            [targetRes]: (soloPlayer.lastGainedResources?.[targetRes] || 0) + 1,
          };
          logs.push({
            id: `log-gain-${Date.now()}-${loc}`,
            round: prev.round,
            message: `🌿 【単独獲得】${soloPlayer.name}が「${cardInfo.name}」を出し、【${resName}】を1つ獲得！`,
            type: 'INFO',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (group.length > 1) {
          // 他プレイヤーと同じカードを出した ➔ 「戦（戦闘）」が発生！
          const rawRolls: Record<string, number> = {};
          const modifiers: Record<string, number> = {};
          const finalRolls: Record<string, number> = {};
          let maxFinalRoll = -999;
          let winnerId: string | null = null;
          let isTie = false;

          group.forEach((p) => {
            const raw = Math.floor(Math.random() * 6) + 1;
            let mod = 0;
            if (p.selectedCard === 'DICE_PLUS_TWO') mod += 2;
            const final = raw + mod;

            rawRolls[p.id] = raw;
            modifiers[p.id] = mod;
            finalRolls[p.id] = final;
            p.diceRoll = raw;
            p.finalRoll = final;

            if (final > maxFinalRoll) {
              maxFinalRoll = final;
              winnerId = p.id;
              isTie = false;
            } else if (final === maxFinalRoll) {
              isTie = true;
            }
          });

          // 同点の場合はタイブレーク
          if (isTie) {
            const highestRollers = group.filter((p) => finalRolls[p.id] === maxFinalRoll);
            const chosen = highestRollers[Math.floor(Math.random() * highestRollers.length)];
            winnerId = chosen.id;
          }

          // 勝ったプレイヤーは自分が選んだ資源を2つ獲得、負けたプレイヤーは獲得できない(0個)
          if (winnerId) {
            const winPlayer = players.find((p) => p.id === winnerId)!;
            winPlayer.resources[targetRes] += 2;
            winPlayer.lastGainedResources = {
              ...winPlayer.lastGainedResources!,
              [targetRes]: (winPlayer.lastGainedResources?.[targetRes] || 0) + 2,
            };
          }

          combatList.push({
            location: loc,
            resource: targetRes,
            participantPlayerIds: group.map((p) => p.id),
            rawRolls,
            modifiers,
            finalRolls,
            winnerPlayerId: winnerId,
            isTie,
          });

          logs.push({
            id: `log-combat-${Date.now()}-${loc}`,
            round: prev.round,
            message: `⚔️ 【戦闘発生】「${cardInfo.name}」で${group.map((p) => p.name).join(' vs ')}が激突！勝者: ${players.find((p) => p.id === winnerId)?.name} (出目:${maxFinalRoll}) ➔ 【${resName}】を2つ獲得！`,
            type: 'BATTLE',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      });

      const nextPhase = combatList.length > 0 ? 'BATTLE_RESOLUTION' : 'ROUND_SUMMARY';

      if (combatList.length > 0) {
        soundManager.playDiceRoll();
      } else {
        soundManager.playRoundClear();
      }

      return {
        ...prev,
        players,
        phase: nextPhase,
        activeCombats: combatList,
        currentCombatIndex: 0,
        logs,
      };
    });
  }, []);

  // 5. 次の戦闘へ進む / 完了
  const nextCombatOrFinish = useCallback(() => {
    setState((prev) => {
      if (prev.currentCombatIndex + 1 < prev.activeCombats.length) {
        return {
          ...prev,
          currentCombatIndex: prev.currentCombatIndex + 1,
        };
      }
      soundManager.playRoundClear();
      return {
        ...prev,
        phase: 'ROUND_SUMMARY',
      };
    });
  }, []);

  // 6. ポイント計算（ルール7 & 8に完全準拠）
  const calculateFinalScores = (
    players: BattlePlayer[]
  ): { scores: ScoreSummary[]; winnerId: string } => {
    // 各資源の最多所持比較
    const maxWood = Math.max(...players.map((p) => p.resources.WOOD), 1);
    const maxRice = Math.max(...players.map((p) => p.resources.RICE), 1);
    const maxIron = Math.max(...players.map((p) => p.resources.IRON), 1);

    const breakdowns: ScoreSummary[] = players.map((p) => {
      const { WOOD, RICE, IRON } = p.resources;

      // 1. セットによるポイント: 「木・小麦・鉄」1セットにつき1ポイント
      const setCount = Math.min(WOOD, RICE, IRON);
      const setPoints = setCount * 1; // 1セット = 1P

      // 2. 各資源の最多所持ボーナス: それぞれに2ポイント
      const majorityWood = WOOD === maxWood && WOOD > 0;
      const majorityRice = RICE === maxRice && RICE > 0;
      const majorityIron = IRON === maxIron && IRON > 0;

      let majorityPoints = 0;
      if (majorityWood) majorityPoints += 2;
      if (majorityRice) majorityPoints += 2;
      if (majorityIron) majorityPoints += 2;

      // 最終ポイント = セット数 + 各最多ボーナス
      const totalPoints = setPoints + majorityPoints;

      return {
        playerId: p.id,
        playerName: p.name,
        woodCount: WOOD,
        riceCount: RICE,
        ironCount: IRON,
        setCount,
        setPoints,
        majorityBonuses: {
          wood: majorityWood,
          rice: majorityRice,
          iron: majorityIron,
        },
        majorityPoints,
        totalPoints,
        rank: 1,
      };
    });

    breakdowns.sort((a, b) => b.totalPoints - a.totalPoints);
    breakdowns.forEach((b, idx) => {
      b.rank = idx + 1;
    });

    const winnerId = breakdowns[0]?.playerId || players[0].id;
    return { scores: breakdowns, winnerId };
  };

  // 7. 次のターンへ / 最終結果へ
  const nextRound = useCallback(() => {
    setState((prev) => {
      if (prev.round < prev.maxRounds) {
        soundManager.playRoundStart();
        return {
          ...prev,
          round: prev.round + 1,
          phase: 'ROUND_START',
          currentSelectingPlayerIndex: 0,
        };
      } else {
        const { scores, winnerId } = calculateFinalScores(prev.players);
        soundManager.playVictory();
        return {
          ...prev,
          phase: 'GAME_OVER_SUMMARY',
          finalScores: scores,
          winnerPlayerId: winnerId,
        };
      }
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    initGame,
    startCardSelection,
    selectCard,
    resolveReveals,
    nextCombatOrFinish,
    nextRound,
    resetGame,
  };
}
