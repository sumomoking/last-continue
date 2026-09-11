'use client';

import { useState, useCallback, useRef } from 'react';
import {
  SengokuGameState,
  SengokuPlayer,
  SengokuCardType,
  LocationCardType,
  EventCardType,
  ResourceType,
  BattleGroup,
  SengokuScoreBreakdown,
  SengokuLog,
} from '../types/sengoku';
import {
  SENGOKU_MAX_ROUNDS,
  ALL_LOCATION_TYPES,
  ALL_EVENT_TYPES,
  PLAYER_PRESETS,
  SENGOKU_CARDS,
} from '../constants/sengoku';
import { soundManager } from '../lib/sound';

const DEFAULT_STATE: SengokuGameState = {
  round: 1,
  maxRounds: SENGOKU_MAX_ROUNDS,
  phase: 'SETUP',
  players: [],
  currentSelectingPlayerIndex: 0,
  activeBattles: [],
  currentBattleIndex: 0,
  activeEventsQueue: [],
  currentEventIndex: 0,
  roundLogs: [],
  finalScores: [],
  winnerPlayerId: null,
};

export function useSengokuEngine() {
  const [state, setState] = useState<SengokuGameState>(DEFAULT_STATE);
  const logCounter = useRef(1);

  const addLog = useCallback(
    (message: string, type: SengokuLog['type'] = 'INFO', roundNum?: number) => {
      const newLog: SengokuLog = {
        id: `log-${Date.now()}-${logCounter.current++}`,
        round: roundNum ?? state.round,
        message,
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      return newLog;
    },
    [state.round]
  );

  // 1. ゲーム初期化
  const initGame = useCallback((playerCount: number = 3, humanCount: number = 1) => {
    const players: SengokuPlayer[] = [];

    // イベントカードのランダム配布用プール
    const getRandomEvents = (): EventCardType[] => {
      const pool = [...ALL_EVENT_TYPES];
      const selected: EventCardType[] = [];
      for (let i = 0; i < 2; i++) {
        const randIdx = Math.floor(Math.random() * pool.length);
        selected.push(pool[randIdx]);
      }
      return selected;
    };

    for (let i = 0; i < playerCount; i++) {
      const isCpu = i >= humanCount;
      const preset = PLAYER_PRESETS[i % PLAYER_PRESETS.length];
      players.push({
        id: `p-${i + 1}`,
        name: isCpu ? preset.name.replace(' (あなた)', ' (CPU)') : (i === 0 ? 'あなた (織田)' : `プレイヤー${i + 1}`),
        isCpu,
        avatarColor: preset.avatarColor,
        monPattern: preset.monPattern,
        resources: { RICE: 0, WOOD: 0, IRON: 0 },
        locationCards: [...ALL_LOCATION_TYPES],
        eventCards: getRandomEvents(),
        selectedCard: null,
        lastGainedResources: { RICE: 0, WOOD: 0, IRON: 0 },
      });
    }

    const startLog: SengokuLog = {
      id: `log-init-${Date.now()}`,
      round: 1,
      message: `🏯 戦国プロトコル 資源争奪戦が開幕！参加武将: ${playerCount}名（人間: ${humanCount}名, CPU: ${playerCount - humanCount}名）`,
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

  // 2. ラウンド開始（札選びフェーズへ）
  const startCardSelection = useCallback(() => {
    setState((prev) => {
      const resetPlayers = prev.players.map((p) => ({
        ...p,
        selectedCard: null,
        eventTargetPlayerId: undefined,
        eventTargetResource: undefined,
        diceRoll: undefined,
        lastGainedResources: { RICE: 0, WOOD: 0, IRON: 0 },
      }));

      // 最初の人間プレイヤーのインデックスを特定
      const firstHumanIdx = resetPlayers.findIndex((p) => !p.isCpu);

      return {
        ...prev,
        phase: 'CARD_SELECT',
        players: resetPlayers,
        currentSelectingPlayerIndex: firstHumanIdx !== -1 ? firstHumanIdx : 0,
        activeBattles: [],
        currentBattleIndex: 0,
        activeEventsQueue: [],
        currentEventIndex: 0,
      };
    });
  }, []);

  // CPU の意思決定ロジック
  const decideCpuMove = (cpu: SengokuPlayer, allPlayers: SengokuPlayer[]): {
    card: SengokuCardType;
    targetPlayerId?: string;
    targetResource?: ResourceType;
  } => {
    // 1. 手持ちの資源から足りない資源（セットになりやすいもの）を評価
    const { RICE, WOOD, IRON } = cpu.resources;
    const resourcePriorities: { type: ResourceType; card: LocationCardType; count: number }[] = [
      { type: 'RICE', card: 'SAKURA', count: RICE },
      { type: 'WOOD', card: 'PINE', count: WOOD },
      { type: 'IRON', card: 'MINE', count: IRON },
    ];
    resourcePriorities.sort((a, b) => a.count - b.count); // 少ない資源を優先

    // 2. イベントカードを使うか判断（30%の確率でイベント保持時に使用）
    if (cpu.eventCards.length > 0 && Math.random() < 0.35) {
      const chosenEvent = cpu.eventCards[Math.floor(Math.random() * cpu.eventCards.length)];
      const opponents = allPlayers.filter((p) => p.id !== cpu.id);
      const targetOpponent = opponents[Math.floor(Math.random() * opponents.length)];

      if (chosenEvent === 'RAID' || chosenEvent === 'DUEL') {
        return {
          card: chosenEvent,
          targetPlayerId: targetOpponent.id,
          targetResource: resourcePriorities[0].type, // 欲しい資源
        };
      }
      if (chosenEvent === 'AEGIS') {
        return {
          card: chosenEvent,
          targetResource: resourcePriorities[0].type,
        };
      }
      if (chosenEvent === 'BLACK_MARKET') {
        return {
          card: chosenEvent,
          targetResource: resourcePriorities[0].type,
        };
      }
      return { card: chosenEvent };
    }

    // 3. 場所カードの選択（最も足りない資源へ、少しランダム性を加味）
    if (Math.random() < 0.7) {
      return { card: resourcePriorities[0].card };
    } else {
      const randIdx = Math.floor(Math.random() * resourcePriorities.length);
      return { card: resourcePriorities[randIdx].card };
    }
  };

  // 3. プレイヤーがカードを選択
  const selectCard = useCallback(
    (
      playerIndex: number,
      card: SengokuCardType,
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

        // もしイベントカードなら手札から1枚消費
        if (SENGOKU_CARDS[card].category === 'EVENT') {
          const evIdx = curPlayer.eventCards.indexOf(card as EventCardType);
          if (evIdx !== -1) {
            curPlayer.eventCards = [
              ...curPlayer.eventCards.slice(0, evIdx),
              ...curPlayer.eventCards.slice(evIdx + 1),
            ];
          }
        }

        updatedPlayers[playerIndex] = curPlayer;

        // 次の未選択の人間プレイヤーを探す
        let nextHumanIdx = -1;
        for (let i = playerIndex + 1; i < updatedPlayers.length; i++) {
          if (!updatedPlayers[i].isCpu && updatedPlayers[i].selectedCard === null) {
            nextHumanIdx = i;
            break;
          }
        }

        if (nextHumanIdx !== -1) {
          // まだカードを選んでいない人間プレイヤーがいる
          return {
            ...prev,
            players: updatedPlayers,
            currentSelectingPlayerIndex: nextHumanIdx,
          };
        }

        // 全員（人間）の選択が完了！ここで全CPUのカードも決定して REVEAL_ALL へ
        for (let i = 0; i < updatedPlayers.length; i++) {
          if (updatedPlayers[i].isCpu && updatedPlayers[i].selectedCard === null) {
            const cpuMove = decideCpuMove(updatedPlayers[i], updatedPlayers);
            updatedPlayers[i] = {
              ...updatedPlayers[i],
              selectedCard: cpuMove.card,
              eventTargetPlayerId: cpuMove.targetPlayerId,
              eventTargetResource: cpuMove.targetResource,
            };
            if (SENGOKU_CARDS[cpuMove.card].category === 'EVENT') {
              const evIdx = updatedPlayers[i].eventCards.indexOf(cpuMove.card as EventCardType);
              if (evIdx !== -1) {
                updatedPlayers[i].eventCards = [
                  ...updatedPlayers[i].eventCards.slice(0, evIdx),
                  ...updatedPlayers[i].eventCards.slice(evIdx + 1),
                ];
              }
            }
          }
        }

        const newLogs: SengokuLog[] = [...prev.roundLogs];
        newLogs.push({
          id: `log-reveal-${Date.now()}`,
          round: prev.round,
          message: `📜 全武将の札が出揃いました！一斉開帳！`,
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

  // 4. 開帳後の判定（イベント先制処理 ➔ エリアバッティング判定 ➔ バトル）
  const resolveReveals = useCallback(() => {
    setState((prev) => {
      const logs: SengokuLog[] = [...prev.roundLogs];
      const players = prev.players.map((p) => ({ ...p, resources: { ...p.resources } }));

      // ── Step 1: イベントカードの抽出 ──
      const eventQueue: SengokuGameState['activeEventsQueue'] = [];
      players.forEach((p) => {
        if (p.selectedCard && SENGOKU_CARDS[p.selectedCard].category === 'EVENT') {
          eventQueue.push({
            playerId: p.id,
            card: p.selectedCard as EventCardType,
            targetPlayerId: p.eventTargetPlayerId,
            targetResource: p.eventTargetResource,
          });
        }
      });

      // イベントを実行
      eventQueue.forEach((ev) => {
        const actor = players.find((p) => p.id === ev.playerId);
        if (!actor) return;

        if (ev.card === 'DOMINATION') {
          // 天下布武: 米・木・鉄を1個ずつ総取り
          actor.resources.RICE += 1;
          actor.resources.WOOD += 1;
          actor.resources.IRON += 1;
          actor.lastGainedResources = { RICE: 1, WOOD: 1, IRON: 1 };
          logs.push({
            id: `log-ev-${Date.now()}-${actor.id}`,
            round: prev.round,
            message: `🏯 【天下布武】${actor.name}が天下を掌握！米・木・鉄を各+1獲得！`,
            type: 'EVENT',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (ev.card === 'RAID') {
          // 奇襲略奪: 相手から任意の資源を1つ強奪
          const target = players.find((p) => p.id === ev.targetPlayerId);
          const res = ev.targetResource || 'RICE';
          if (target && target.resources[res] > 0) {
            target.resources[res] -= 1;
            actor.resources[res] += 1;
            actor.lastGainedResources = { ...actor.lastGainedResources!, [res]: (actor.lastGainedResources?.[res] || 0) + 1 };
            logs.push({
              id: `log-ev-${Date.now()}-${actor.id}`,
              round: prev.round,
              message: `⚡ 【奇襲略奪】${actor.name}が${target.name}から【${res}】を1つ強奪！`,
              type: 'EVENT',
              timestamp: new Date().toLocaleTimeString(),
            });
          } else if (target) {
            logs.push({
              id: `log-ev-${Date.now()}-${actor.id}`,
              round: prev.round,
              message: `⚡ 【奇襲略奪】${actor.name}が${target.name}を強襲するも、対象の資源を保持していなかった！`,
              type: 'EVENT',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        } else if (ev.card === 'AEGIS') {
          // 不可侵条約: 指定エリアの資源を無傷で2個獲得
          const res = ev.targetResource || 'RICE';
          actor.resources[res] += 2;
          actor.lastGainedResources = { ...actor.lastGainedResources!, [res]: (actor.lastGainedResources?.[res] || 0) + 2 };
          logs.push({
            id: `log-ev-${Date.now()}-${actor.id}`,
            round: prev.round,
            message: `🛡️ 【不可侵条約】${actor.name}が防壁を展開！【${res}】を無傷で+2獲得！`,
            type: 'EVENT',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (ev.card === 'BLACK_MARKET') {
          // 闇商人: 任意の資源2個を獲得（密輸）
          const res = ev.targetResource || 'IRON';
          actor.resources[res] += 2;
          actor.lastGainedResources = { ...actor.lastGainedResources!, [res]: (actor.lastGainedResources?.[res] || 0) + 2 };
          logs.push({
            id: `log-ev-${Date.now()}-${actor.id}`,
            round: prev.round,
            message: `💱 【闇商人】${actor.name}が闇取引を成立！【${res}】を+2獲得！`,
            type: 'EVENT',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      });

      // ── Step 2: 場所カードのバッティング判定 ──
      const locationGroups: Record<LocationCardType, SengokuPlayer[]> = {
        SAKURA: [],
        PINE: [],
        MINE: [],
      };

      players.forEach((p) => {
        if (p.selectedCard && SENGOKU_CARDS[p.selectedCard].category === 'LOCATION') {
          locationGroups[p.selectedCard as LocationCardType].push(p);
        }
      });

      const battleList: BattleGroup[] = [];

      (Object.keys(locationGroups) as LocationCardType[]).forEach((loc) => {
        const group = locationGroups[loc];
        const targetRes = SENGOKU_CARDS[loc].targetResource!;

        if (group.length === 1) {
          // 単独獲得！安全に1個獲得
          const soloPlayer = group[0];
          soloPlayer.resources[targetRes] += 1;
          soloPlayer.lastGainedResources = {
            ...soloPlayer.lastGainedResources!,
            [targetRes]: (soloPlayer.lastGainedResources?.[targetRes] || 0) + 1,
          };
          logs.push({
            id: `log-gain-${Date.now()}-${loc}`,
            round: prev.round,
            message: `🌿 【単独収穫】${soloPlayer.name}が【${SENGOKU_CARDS[loc].name}】を独占！【${targetRes}】+1獲得。`,
            type: 'INFO',
            timestamp: new Date().toLocaleTimeString(),
          });
        } else if (group.length > 1) {
          // バッティング！「戦」発生！
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

          // 同点の場合はサイコロ再ロール判定（簡単のため微小ボーナスで解決）
          if (isTie) {
            // 同点判定時は最初のプレイヤーに+0.1等のタイブレーク
            const highestRollers = group.filter((p) => rolls[p.id] === maxRoll);
            const chosen = highestRollers[Math.floor(Math.random() * highestRollers.length)];
            winnerId = chosen.id;
          }

          if (winnerId) {
            const winPlayer = players.find((p) => p.id === winnerId)!;
            winPlayer.resources[targetRes] += 2; // 勝者は2倍獲得！
            winPlayer.lastGainedResources = {
              ...winPlayer.lastGainedResources!,
              [targetRes]: (winPlayer.lastGainedResources?.[targetRes] || 0) + 2,
            };
          }

          battleList.push({
            location: loc,
            resource: targetRes,
            participantPlayerIds: group.map((p) => p.id),
            rolls,
            winnerPlayerId: winnerId,
            isTie,
          });

          logs.push({
            id: `log-battle-${Date.now()}-${loc}`,
            round: prev.round,
            message: `⚔️ 【合戦勃発】${group.map((p) => p.name).join(' vs ')} が【${SENGOKU_CARDS[loc].name}】で激突！勝者: ${players.find((p) => p.id === winnerId)?.name} (出目: ${maxRoll}) ➔ 【${targetRes}】+2倍獲得！`,
            type: 'BATTLE',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      });

      // 戦闘がある場合は BATTLE_RESOLUTION モーダルへ、なければ ROUND_SUMMARY へ
      const nextPhase = battleList.length > 0 ? 'BATTLE_RESOLUTION' : 'ROUND_SUMMARY';

      if (battleList.length > 0) {
        soundManager.playExplosion();
      } else {
        soundManager.playRoundClear();
      }

      return {
        ...prev,
        players,
        phase: nextPhase,
        activeBattles: battleList,
        currentBattleIndex: 0,
        roundLogs: logs,
      };
    });
  }, []);

  // 5. バトル演出の次へ進む / 完了
  const nextBattleOrFinish = useCallback(() => {
    setState((prev) => {
      if (prev.currentBattleIndex + 1 < prev.activeBattles.length) {
        return {
          ...prev,
          currentBattleIndex: prev.currentBattleIndex + 1,
        };
      }
      // 全バトル終了 ➔ ラウンドサマリーへ
      soundManager.playRoundClear();
      return {
        ...prev,
        phase: 'ROUND_SUMMARY',
      };
    });
  }, []);

  // 6. スコア計算
  const calculateFinalScores = (players: SengokuPlayer[]): { scores: SengokuScoreBreakdown[]; winnerId: string } => {
    // 最多賞（マジョリティ）の判定
    const maxRice = Math.max(...players.map((p) => p.resources.RICE), 1);
    const maxWood = Math.max(...players.map((p) => p.resources.WOOD), 1);
    const maxIron = Math.max(...players.map((p) => p.resources.IRON), 1);

    const breakdowns: SengokuScoreBreakdown[] = players.map((p) => {
      const { RICE, WOOD, IRON } = p.resources;
      // 3種1セットの数
      const setCount = Math.min(RICE, WOOD, IRON);
      const setPoints = setCount * 5; // 1セット = 5pt

      // セットに使われなかった余り資源
      const leftoverRice = RICE - setCount;
      const leftoverWood = WOOD - setCount;
      const leftoverIron = IRON - setCount;
      const rawResourcePoints = leftoverRice + leftoverWood + leftoverIron; // 余り各1pt

      // マジョリティボーナス (+3pt)
      const majorityRice = RICE === maxRice && RICE > 0;
      const majorityWood = WOOD === maxWood && WOOD > 0;
      const majorityIron = IRON === maxIron && IRON > 0;

      let majorityPoints = 0;
      if (majorityRice) majorityPoints += 3;
      if (majorityWood) majorityPoints += 3;
      if (majorityIron) majorityPoints += 3;

      const totalPoints = setPoints + rawResourcePoints + majorityPoints;

      return {
        playerId: p.id,
        playerName: p.name,
        riceCount: RICE,
        woodCount: WOOD,
        ironCount: IRON,
        setCount,
        setPoints,
        rawResourcePoints,
        majorityBonuses: {
          rice: majorityRice,
          wood: majorityWood,
          iron: majorityIron,
        },
        majorityPoints,
        totalPoints,
        rank: 1,
      };
    });

    // 順位ソート
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
        // 最終ラウンド終了 ➔ 勝敗集計
        const { scores, winnerId } = calculateFinalScores(prev.players);
        soundManager.playGameOver();
        return {
          ...prev,
          phase: 'GAME_OVER_SUMMARY',
          finalScores: scores,
          winnerPlayerId: winnerId,
        };
      }
    });
  }, []);

  // 8. ゲームリセット
  const resetGame = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    initGame,
    startCardSelection,
    selectCard,
    resolveReveals,
    nextBattleOrFinish,
    nextRound,
    resetGame,
  };
}
