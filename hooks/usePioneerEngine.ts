'use client';

import { useState, useCallback, useRef } from 'react';
import {
  PioneerGameState,
  PioneerPlayer,
  PioneerCardType,
  TerrainCardType,
  DevCardType,
  ResourceType,
  ContestGroup,
  PioneerScoreBreakdown,
  PioneerLog,
} from '../types/pioneer';
import {
  PIONEER_MAX_ROUNDS,
  ALL_TERRAIN_TYPES,
  ALL_DEV_TYPES,
  PIONEER_PRESETS,
  PIONEER_CARDS,
} from '../constants/pioneer';
import { soundManager } from '../lib/sound';

const DEFAULT_STATE: PioneerGameState = {
  round: 1,
  maxRounds: PIONEER_MAX_ROUNDS,
  phase: 'SETUP',
  players: [],
  currentSelectingPlayerIndex: 0,
  activeContests: [],
  currentContestIndex: 0,
  activeDevsQueue: [],
  currentDevIndex: 0,
  roundLogs: [],
  finalScores: [],
  winnerPlayerId: null,
};

export function usePioneerEngine() {
  const [state, setState] = useState<PioneerGameState>(DEFAULT_STATE);
  const logCounter = useRef(1);

  // 1. ゲーム初期化
  const initGame = useCallback((playerCount: number = 3, humanCount: number = 1) => {
    const players: PioneerPlayer[] = [];

    const getRandomDevs = (): DevCardType[] => {
      const pool = [...ALL_DEV_TYPES];
      const selected: DevCardType[] = [];
      for (let i = 0; i < 2; i++) {
        const randIdx = Math.floor(Math.random() * pool.length);
        selected.push(pool[randIdx]);
      }
      return selected;
    };

    for (let i = 0; i < playerCount; i++) {
      const isCpu = i >= humanCount;
      const preset = PIONEER_PRESETS[i % PIONEER_PRESETS.length];
      players.push({
        id: `pioneer-${i + 1}`,
        name: isCpu
          ? preset.name.replace(' (あなた)', ' (CPU)')
          : i === 0
          ? '青の開拓団 (あなた)'
          : `開拓者 ${i + 1}`,
        isCpu,
        colorName: preset.colorName,
        colorClass: preset.colorClass,
        meepleIcon: preset.meepleIcon,
        resources: { WHEAT: 0, LUMBER: 0, ORE: 0 },
        terrainCards: [...ALL_TERRAIN_TYPES],
        devCards: getRandomDevs(),
        selectedCard: null,
        lastGainedResources: { WHEAT: 0, LUMBER: 0, ORE: 0 },
      });
    }

    const startLog: PioneerLog = {
      id: `log-init-${Date.now()}`,
      round: 1,
      message: `🏝️ 【リソーシア島 開拓開始】参加開拓団: ${playerCount}組（プレイヤー: ${humanCount}名, CPU: ${playerCount - humanCount}名）`,
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
      roundLogs: [startLog],
    });
  }, []);

  // 2. ラウンド開始（カード選択へ）
  const startCardSelection = useCallback(() => {
    setState((prev) => {
      const resetPlayers = prev.players.map((p) => ({
        ...p,
        selectedCard: null,
        devTargetPlayerId: undefined,
        devTargetResource: undefined,
        diceRoll: undefined,
        lastGainedResources: { WHEAT: 0, LUMBER: 0, ORE: 0 },
      }));

      const firstHumanIdx = resetPlayers.findIndex((p) => !p.isCpu);

      return {
        ...prev,
        phase: 'CARD_SELECT',
        players: resetPlayers,
        currentSelectingPlayerIndex: firstHumanIdx !== -1 ? firstHumanIdx : 0,
        activeContests: [],
        currentContestIndex: 0,
        activeDevsQueue: [],
        currentDevIndex: 0,
      };
    });
  }, []);

  // CPU 思考ロジック
  const decideCpuMove = (
    cpu: PioneerPlayer,
    allPlayers: PioneerPlayer[]
  ): {
    card: PioneerCardType;
    targetPlayerId?: string;
    targetResource?: ResourceType;
  } => {
    const { WHEAT, LUMBER, ORE } = cpu.resources;
    const resourcePriorities: { type: ResourceType; card: TerrainCardType; count: number }[] = [
      { type: 'WHEAT', card: 'FIELD', count: WHEAT },
      { type: 'LUMBER', card: 'FOREST', count: LUMBER },
      { type: 'ORE', card: 'MOUNTAIN', count: ORE },
    ];
    resourcePriorities.sort((a, b) => a.count - b.count);

    if (cpu.devCards.length > 0 && Math.random() < 0.35) {
      const chosenDev = cpu.devCards[Math.floor(Math.random() * cpu.devCards.length)];
      const opponents = allPlayers.filter((p) => p.id !== cpu.id);
      const targetOpponent = opponents[Math.floor(Math.random() * opponents.length)];

      if (chosenDev === 'ROBBER' || chosenDev === 'KNIGHT') {
        return {
          card: chosenDev,
          targetPlayerId: targetOpponent.id,
          targetResource: resourcePriorities[0].type,
        };
      }
      if (chosenDev === 'ROADS' || chosenDev === 'HARBOR_TRADE') {
        return {
          card: chosenDev,
          targetResource: resourcePriorities[0].type,
        };
      }
      return { card: chosenDev };
    }

    if (Math.random() < 0.7) {
      return { card: resourcePriorities[0].card };
    } else {
      const randIdx = Math.floor(Math.random() * resourcePriorities.length);
      return { card: resourcePriorities[randIdx].card };
    }
  };

  // 3. カード選択
  const selectCard = useCallback(
    (
      playerIndex: number,
      card: PioneerCardType,
      targetPlayerId?: string,
      targetResource?: ResourceType
    ) => {
      soundManager.playCardFlip();

      setState((prev) => {
        const updatedPlayers = [...prev.players];
        const curPlayer = { ...updatedPlayers[playerIndex] };

        curPlayer.selectedCard = card;
        curPlayer.devTargetPlayerId = targetPlayerId;
        curPlayer.devTargetResource = targetResource;

        if (PIONEER_CARDS[card].category === 'DEV') {
          const devIdx = curPlayer.devCards.indexOf(card as DevCardType);
          if (devIdx !== -1) {
            curPlayer.devCards = [
              ...curPlayer.devCards.slice(0, devIdx),
              ...curPlayer.devCards.slice(devIdx + 1),
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

        // 全員の選択を確定（CPU分も自動プロット）
        for (let i = 0; i < updatedPlayers.length; i++) {
          if (updatedPlayers[i].isCpu && updatedPlayers[i].selectedCard === null) {
            const cpuMove = decideCpuMove(updatedPlayers[i], updatedPlayers);
            updatedPlayers[i] = {
              ...updatedPlayers[i],
              selectedCard: cpuMove.card,
              devTargetPlayerId: cpuMove.targetPlayerId,
              devTargetResource: cpuMove.targetResource,
            };
            if (PIONEER_CARDS[cpuMove.card].category === 'DEV') {
              const devIdx = updatedPlayers[i].devCards.indexOf(cpuMove.card as DevCardType);
              if (devIdx !== -1) {
                updatedPlayers[i].devCards = [
                  ...updatedPlayers[i].devCards.slice(0, devIdx),
                  ...updatedPlayers[i].devCards.slice(devIdx + 1),
                ];
              }
            }
          }
        }

        const newLogs: PioneerLog[] = [...prev.roundLogs];
        newLogs.push({
          id: `log-reveal-${Date.now()}`,
          round: prev.round,
          message: `📜 全開拓者の行動が決定！一斉オープン！`,
          type: 'INFO',
          timestamp: new Date().toLocaleTimeString(),
        });

        return {
          ...prev,
          players: updatedPlayers,
          phase: 'REVEAL_ALL',
          roundLogs: newLogs,
        };
      });
    },
    []
  );

  // 4. 一斉開帳後の判定（発展カード先制処理 ➔ エリアバッティング判定 ➔ ダイス対決）
  const resolveReveals = useCallback(() => {
    setState((prev) => {
      const logs: PioneerLog[] = [...prev.roundLogs];
      const players = prev.players.map((p) => ({ ...p, resources: { ...p.resources } }));

      // ── Step 1: 発展カードの先制処理 ──
      const devQueue: PioneerGameState['activeDevsQueue'] = [];
      players.forEach((p) => {
        if (p.selectedCard && PIONEER_CARDS[p.selectedCard].category === 'DEV') {
          devQueue.push({
            playerId: p.id,
            card: p.selectedCard as DevCardType,
            targetPlayerId: p.devTargetPlayerId,
            targetResource: p.devTargetResource,
          });
        }
      });

      devQueue.forEach((ev) => {
        const actor = players.find((p) => p.id === ev.playerId);
        if (!actor) return;

        if (ev.card === 'MONOPOLY') {
          actor.resources.WHEAT += 1;
          actor.resources.LUMBER += 1;
          actor.resources.ORE += 1;
          actor.lastGainedResources = { WHEAT: 1, LUMBER: 1, ORE: 1 };
          logs.push({
            id: `log-dev-${Date.now()}-${actor.id}`,
            round: prev.round,
            message: `🏛️ 【独占宣言】${actor.name}が島全土の市場を掌握！小麦・木材・鉱石を各+1獲得！`,
            type: 'DEV',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (ev.card === 'ROBBER') {
          const target = players.find((p) => p.id === ev.targetPlayerId);
          const res = ev.targetResource || 'WHEAT';
          if (target && target.resources[res] > 0) {
            target.resources[res] -= 1;
            actor.resources[res] += 1;
            actor.lastGainedResources = {
              ...actor.lastGainedResources!,
              [res]: (actor.lastGainedResources?.[res] || 0) + 1,
            };
            logs.push({
              id: `log-dev-${Date.now()}-${actor.id}`,
              round: prev.round,
              message: `🏴‍☠️ 【盗賊の襲撃】${actor.name}が${target.name}から【${res}】を1つ強奪！`,
              type: 'DEV',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else if (target) {
            logs.push({
              id: `log-dev-${Date.now()}-${actor.id}`,
              round: prev.round,
              message: `🏴‍☠️ 【盗賊の襲撃】${actor.name}が${target.name}を襲撃するも、該当資源を所持していなかった！`,
              type: 'DEV',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        } else if (ev.card === 'ROADS') {
          const res = ev.targetResource || 'WHEAT';
          actor.resources[res] += 2;
          actor.lastGainedResources = {
            ...actor.lastGainedResources!,
            [res]: (actor.lastGainedResources?.[res] || 0) + 2,
          };
          logs.push({
            id: `log-dev-${Date.now()}-${actor.id}`,
            round: prev.round,
            message: `🛡️ 【街道整備】${actor.name}が安全ルートを開拓！【${res}】を無傷で+2獲得！`,
            type: 'DEV',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (ev.card === 'HARBOR_TRADE') {
          const res = ev.targetResource || 'ORE';
          actor.resources[res] += 2;
          actor.lastGainedResources = {
            ...actor.lastGainedResources!,
            [res]: (actor.lastGainedResources?.[res] || 0) + 2,
          };
          logs.push({
            id: `log-dev-${Date.now()}-${actor.id}`,
            round: prev.round,
            message: `⛵ 【港湾貿易】${actor.name}が貿易船と有利取引！【${res}】を+2獲得！`,
            type: 'DEV',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      });

      // ── Step 2: 地形カードのバッティング判定 ──
      const terrainGroups: Record<TerrainCardType, PioneerPlayer[]> = {
        FIELD: [],
        FOREST: [],
        MOUNTAIN: [],
      };

      players.forEach((p) => {
        if (p.selectedCard && PIONEER_CARDS[p.selectedCard].category === 'TERRAIN') {
          terrainGroups[p.selectedCard as TerrainCardType].push(p);
        }
      });

      const contestList: ContestGroup[] = [];

      (Object.keys(terrainGroups) as TerrainCardType[]).forEach((ter) => {
        const group = terrainGroups[ter];
        const targetRes = PIONEER_CARDS[ter].targetResource!;

        if (group.length === 1) {
          const soloPlayer = group[0];
          soloPlayer.resources[targetRes] += 1;
          soloPlayer.lastGainedResources = {
            ...soloPlayer.lastGainedResources!,
            [targetRes]: (soloPlayer.lastGainedResources?.[targetRes] || 0) + 1,
          };
          logs.push({
            id: `log-gain-${Date.now()}-${ter}`,
            round: prev.round,
            message: `🌿 【単独収穫】${soloPlayer.name}が【${PIONEER_CARDS[ter].name}】を独占！【${targetRes}】+1獲得。`,
            type: 'INFO',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (group.length > 1) {
          const rolls: Record<string, number> = {};
          let maxRoll = -1;
          let winnerId: string | null = null;
          let isTie = false;

          group.forEach((p) => {
            const roll = Math.floor(Math.random() * 6) + 1;
            rolls[p.id] = roll;
            p.diceRoll = roll;

            if (roll > maxRoll) {
              maxRoll = roll;
              winnerId = p.id;
              isTie = false;
            } else if (roll === maxRoll) {
              isTie = true;
            }
          });

          if (isTie) {
            const highestRollers = group.filter((p) => rolls[p.id] === maxRoll);
            const chosen = highestRollers[Math.floor(Math.random() * highestRollers.length)];
            winnerId = chosen.id;
          }

          if (winnerId) {
            const winPlayer = players.find((p) => p.id === winnerId)!;
            winPlayer.resources[targetRes] += 2;
            winPlayer.lastGainedResources = {
              ...winPlayer.lastGainedResources!,
              [targetRes]: (winPlayer.lastGainedResources?.[targetRes] || 0) + 2,
            };
          }

          contestList.push({
            terrain: ter,
            resource: targetRes,
            participantPlayerIds: group.map((p) => p.id),
            rolls,
            winnerPlayerId: winnerId,
            isTie,
          });

          logs.push({
            id: `log-contest-${Date.now()}-${ter}`,
            round: prev.round,
            message: `🎲 【資源争奪】${group.map((p) => p.name).join(' vs ')} が【${PIONEER_CARDS[ter].name}】で激突！勝者: ${players.find((p) => p.id === winnerId)?.name} (出目: ${maxRoll}) ➔ 【${targetRes}】+2倍獲得！`,
            type: 'CONTEST',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      });

      const nextPhase = contestList.length > 0 ? 'BATTLE_RESOLUTION' : 'ROUND_SUMMARY';

      if (contestList.length > 0) {
        soundManager.playDiceRoll();
      } else {
        soundManager.playRoundClear();
      }

      return {
        ...prev,
        players,
        phase: nextPhase,
        activeContests: contestList,
        currentContestIndex: 0,
        roundLogs: logs,
      };
    });
  }, []);

  // 5. 次のダイス対決へ進む
  const nextContestOrFinish = useCallback(() => {
    setState((prev) => {
      if (prev.currentContestIndex + 1 < prev.activeContests.length) {
        return {
          ...prev,
          currentContestIndex: prev.currentContestIndex + 1,
        };
      }
      soundManager.playRoundClear();
      return {
        ...prev,
        phase: 'ROUND_SUMMARY',
      };
    });
  }, []);

  // 6. スコア計算
  const calculateFinalScores = (
    players: PioneerPlayer[]
  ): { scores: PioneerScoreBreakdown[]; winnerId: string } => {
    const maxWheat = Math.max(...players.map((p) => p.resources.WHEAT), 1);
    const maxLumber = Math.max(...players.map((p) => p.resources.LUMBER), 1);
    const maxOre = Math.max(...players.map((p) => p.resources.ORE), 1);

    const breakdowns: PioneerScoreBreakdown[] = players.map((p) => {
      const { WHEAT, LUMBER, ORE } = p.resources;
      const settlementCount = Math.min(WHEAT, LUMBER, ORE);
      const settlementPoints = settlementCount * 5;

      const leftoverWheat = WHEAT - settlementCount;
      const leftoverLumber = LUMBER - settlementCount;
      const leftoverOre = ORE - settlementCount;
      const rawResourcePoints = leftoverWheat + leftoverLumber + leftoverOre;

      const majorityWheat = WHEAT === maxWheat && WHEAT > 0;
      const majorityLumber = LUMBER === maxLumber && LUMBER > 0;
      const majorityOre = ORE === maxOre && ORE > 0;

      let majorityPoints = 0;
      if (majorityWheat) majorityPoints += 3;
      if (majorityLumber) majorityPoints += 3;
      if (majorityOre) majorityPoints += 3;

      const totalPoints = settlementPoints + rawResourcePoints + majorityPoints;

      return {
        playerId: p.id,
        playerName: p.name,
        colorClass: p.colorClass,
        wheatCount: WHEAT,
        lumberCount: LUMBER,
        oreCount: ORE,
        settlementCount,
        settlementPoints,
        rawResourcePoints,
        majorityBonuses: {
          wheat: majorityWheat,
          lumber: majorityLumber,
          ore: majorityOre,
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

  // 7. 次のラウンドへ / 最終結果へ
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
    nextContestOrFinish,
    nextRound,
    resetGame,
  };
}
