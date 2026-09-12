'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';
import { getFirebaseInstance } from '../lib/firebase';
import { OnlineRoom, RoomPlayer } from '../types/online';
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
  RESOURCE_MAP,
} from '../constants/resourceBattle';
import { soundManager } from '../lib/sound';

const getMyPlayerId = (): string => {
  if (typeof window === 'undefined') return 'rb-client';
  let id = sessionStorage.getItem('resource_battle_player_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('resource_battle_player_id', id);
  }
  return id;
};

// 4桁の読みやすいルームコード生成 (例: RB-4821)
const generateRoomCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `RB-${code}`;
};

const getRandomEvents = (): EventCardType[] => {
  const pool = [...ALL_EVENTS];
  const selected: EventCardType[] = [];
  for (let i = 0; i < 2; i++) {
    const randIdx = Math.floor(Math.random() * pool.length);
    selected.push(pool[randIdx]);
  }
  return selected;
};

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

export function useResourceOnlineRoom() {
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<OnlineRoom | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setMyPlayerId(getMyPlayerId());
  }, []);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // ルームを監視（リアルタイム同期）
  const subscribeToRoom = useCallback((roomId: string) => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    const { db } = getFirebaseInstance();
    if (!db) {
      setErrorMessage('Firebaseが設定されていません。');
      return;
    }

    const roomRef = doc(db, 'rooms', roomId);
    const unsub = onSnapshot(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as OnlineRoom;
          if (data.status === 'ABORTED') {
            setErrorMessage(
              data.terminatedReason || 'プレイヤーがルームを退出したため、ゲームが終了しました。'
            );
            if (unsubscribeRef.current) {
              unsubscribeRef.current();
              unsubscribeRef.current = null;
            }
            setCurrentRoom(null);
            return;
          }
          setCurrentRoom(data);
          setErrorMessage(null);
        } else {
          setCurrentRoom(null);
          setErrorMessage('ルームが解散または削除されました。');
        }
      },
      (err) => {
        console.error('Room snapshot error:', err);
        setErrorMessage('通信エラーが発生しました: ' + err.message);
      }
    );

    unsubscribeRef.current = unsub;
  }, []);

  // 1. ルームを作成（ホスト）
  const createRoom = useCallback(
    async (hostName: string, maxPlayers: 2 | 3 | 4) => {
      setIsLoading(true);
      setErrorMessage(null);

      const { db } = getFirebaseInstance();
      if (!db) {
        setIsLoading(false);
        setErrorMessage('Firebaseの設定が完了していません。');
        return null;
      }

      const playerId = getMyPlayerId();
      const roomId = generateRoomCode();

      const hostPlayer: RoomPlayer = {
        id: playerId,
        name: hostName.trim() || 'Player 1',
        isHost: true,
        joinedAt: Date.now(),
      };

      const newRoom: OnlineRoom = {
        id: roomId,
        gameType: 'RESOURCE_BATTLE',
        status: 'WAITING',
        maxPlayers,
        hostId: playerId,
        players: [hostPlayer],
        gameState: null,
        resourceGameState: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      try {
        const roomRef = doc(db, 'rooms', roomId);
        await setDoc(roomRef, newRoom);
        subscribeToRoom(roomId);
        setIsLoading(false);
        return roomId;
      } catch (err: any) {
        console.error('Error creating room:', err);
        setIsLoading(false);
        setErrorMessage('ルーム作成に失敗しました: ' + (err.message || ''));
        return null;
      }
    },
    [subscribeToRoom]
  );

  // 2. ルームに参加（ゲスト）
  const joinRoom = useCallback(
    async (roomId: string, playerName: string) => {
      setIsLoading(true);
      setErrorMessage(null);

      const { db } = getFirebaseInstance();
      if (!db) {
        setIsLoading(false);
        setErrorMessage('Firebaseの設定が完了していません。');
        return false;
      }

      const cleanRoomId = roomId.trim().toUpperCase();
      const playerId = getMyPlayerId();

      try {
        const roomRef = doc(db, 'rooms', cleanRoomId);
        const snapshot = await getDoc(roomRef);

        if (!snapshot.exists()) {
          setIsLoading(false);
          setErrorMessage(`ルーム「${cleanRoomId}」が見つかりませんでした。`);
          return false;
        }

        const roomData = snapshot.data() as OnlineRoom;

        if (roomData.status !== 'WAITING') {
          const isAlreadyMember = roomData.players.some((p) => p.id === playerId);
          if (!isAlreadyMember) {
            setIsLoading(false);
            setErrorMessage('このルームはすでにゲームが進行中です。');
            return false;
          }
        }

        const existingPlayerIdx = roomData.players.findIndex((p) => p.id === playerId);
        let updatedPlayers = [...roomData.players];

        if (existingPlayerIdx !== -1) {
          updatedPlayers[existingPlayerIdx] = {
            ...updatedPlayers[existingPlayerIdx],
            name: playerName.trim() || updatedPlayers[existingPlayerIdx].name,
          };
        } else {
          if (roomData.players.length >= roomData.maxPlayers) {
            setIsLoading(false);
            setErrorMessage(`このルームは満員です（最大 ${roomData.maxPlayers} 人）。`);
            return false;
          }

          const newPlayer: RoomPlayer = {
            id: playerId,
            name: playerName.trim() || `Player ${roomData.players.length + 1}`,
            isHost: false,
            joinedAt: Date.now(),
          };
          updatedPlayers.push(newPlayer);
        }

        await updateDoc(roomRef, {
          players: updatedPlayers,
          updatedAt: Date.now(),
        });

        subscribeToRoom(cleanRoomId);
        setIsLoading(false);
        return true;
      } catch (err: any) {
        console.error('Error joining room:', err);
        setIsLoading(false);
        setErrorMessage('ルーム参加に失敗しました: ' + (err.message || ''));
        return false;
      }
    },
    [subscribeToRoom]
  );

  // 2.5 CPUプレイヤーの追加（ホスト専用）
  const addCpuPlayer = useCallback(async () => {
    if (!currentRoom || currentRoom.hostId !== myPlayerId) return;
    if (currentRoom.players.length >= currentRoom.maxPlayers) return;

    const { db } = getFirebaseInstance();
    if (!db) return;

    const cpuNames = ['アルファ', 'ベータ', 'ガンマ', 'デルタ'];
    const currentCpuCount = currentRoom.players.filter((p) => p.isCpu).length;
    const cpuName = cpuNames[currentCpuCount % cpuNames.length] || `${currentCpuCount + 1}`;
    const cpuId = `cpu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newCpu: RoomPlayer = {
      id: cpuId,
      name: `CPU-${cpuName}`,
      isHost: false,
      isCpu: true,
      joinedAt: Date.now(),
    };

    const updatedPlayers = [...currentRoom.players, newCpu];

    try {
      const roomRef = doc(db, 'rooms', currentRoom.id);
      await updateDoc(roomRef, {
        players: updatedPlayers,
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      console.error('Error adding CPU player:', err);
      setErrorMessage('CPU追加に失敗しました: ' + (err.message || ''));
    }
  }, [currentRoom, myPlayerId]);

  // 2.6 CPUプレイヤーの削除（ホスト専用）
  const removeCpuPlayer = useCallback(
    async (cpuPlayerId: string) => {
      if (!currentRoom || currentRoom.hostId !== myPlayerId) return;

      const { db } = getFirebaseInstance();
      if (!db) return;

      const updatedPlayers = currentRoom.players.filter((p) => p.id !== cpuPlayerId);

      try {
        const roomRef = doc(db, 'rooms', currentRoom.id);
        await updateDoc(roomRef, {
          players: updatedPlayers,
          updatedAt: Date.now(),
        });
      } catch (err: any) {
        console.error('Error removing CPU player:', err);
        setErrorMessage('CPU削除に失敗しました: ' + (err.message || ''));
      }
    },
    [currentRoom, myPlayerId]
  );

  // 3. ルームから退出
  const leaveRoom = useCallback(async () => {
    if (!currentRoom) return;

    const { db } = getFirebaseInstance();
    const playerId = getMyPlayerId();
    const leavingPlayer = currentRoom.players.find((p) => p.id === playerId);
    const leavingName = leavingPlayer?.name || 'プレイヤー';

    if (db) {
      try {
        const roomRef = doc(db, 'rooms', currentRoom.id);
        const remainingPlayers = currentRoom.players.filter((p) => p.id !== playerId);

        const isGamePlaying = currentRoom.status === 'PLAYING';

        if (remainingPlayers.length === 0) {
          await deleteDoc(roomRef);
        } else if (isGamePlaying) {
          await updateDoc(roomRef, {
            status: 'ABORTED',
            terminatedReason: `プレイヤー「${leavingName}」が対戦途中でルームを退出したため、ゲームが終了しました。`,
            players: remainingPlayers,
            updatedAt: Date.now(),
          });
        } else {
          let nextHostId = currentRoom.hostId;
          if (currentRoom.hostId === playerId && remainingPlayers.length > 0) {
            nextHostId = remainingPlayers[0].id;
            remainingPlayers[0].isHost = true;
          }

          await updateDoc(roomRef, {
            players: remainingPlayers,
            hostId: nextHostId,
            updatedAt: Date.now(),
          });
        }
      } catch (err) {
        console.error('Error leaving room:', err);
      }
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    setCurrentRoom(null);
  }, [currentRoom]);

  // 4. ゲームステートの直接更新（Firestoreのアトミック更新）
  const syncGameState = useCallback(
    async (updater: (prev: ResourceGameState) => ResourceGameState) => {
      if (!currentRoom || !currentRoom.resourceGameState) return;
      const { db } = getFirebaseInstance();
      if (!db) return;

      try {
        const roomRef = doc(db, 'rooms', currentRoom.id);
        const snapshot = await getDoc(roomRef);
        if (!snapshot.exists()) return;
        const roomData = snapshot.data() as OnlineRoom;
        if (!roomData.resourceGameState) return;

        const latestState = roomData.resourceGameState;
        const newGameState = updater(latestState);

        if (newGameState === latestState) return;

        await updateDoc(roomRef, {
          resourceGameState: newGameState,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.error('Error syncing resource battle game state:', err);
      }
    },
    [currentRoom]
  );

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
          targetPlayerId: targetOpponent ? targetOpponent.id : undefined,
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

  // 5. オンラインゲーム開始（ホストが実行）
  const startOnlineGame = useCallback(async () => {
    if (!currentRoom || currentRoom.hostId !== myPlayerId) return;
    const { db } = getFirebaseInstance();
    if (!db) return;

    const players: BattlePlayer[] = currentRoom.players.map((rp, index) => {
      const config = PLAYER_CONFIGS[index % PLAYER_CONFIGS.length];
      return {
        id: rp.id,
        name: rp.name,
        isCpu: !!rp.isCpu,
        colorBadge: config.colorBadge,
        resources: { WOOD: 0, RICE: 0, IRON: 0 },
        locationCards: [...ALL_LOCATIONS],
        eventCards: getRandomEvents(),
        selectedCard: null,
        lastGainedResources: { WOOD: 0, RICE: 0, IRON: 0 },
      };
    });

    const startLog: ActionLog = {
      id: `log-init-${Date.now()}`,
      round: 1,
      message: `🃏 オンライン対戦スタート！全プレイヤーに「森・畑・鉱山」とイベントカードを配布しました。（参加: ${players.length}人）`,
      type: 'INFO',
      timestamp: new Date().toLocaleTimeString(),
    };

    const initialGameState: ResourceGameState = {
      round: 1,
      maxRounds: MAX_ROUNDS,
      phase: 'ROUND_START',
      players,
      currentSelectingPlayerIndex: 0,
      activeCombats: [],
      currentCombatIndex: 0,
      activeEventsQueue: [],
      currentEventIndex: 0,
      logs: [startLog],
      finalScores: [],
      winnerPlayerId: null,
    };

    try {
      const roomRef = doc(db, 'rooms', currentRoom.id);
      await updateDoc(roomRef, {
        status: 'PLAYING',
        resourceGameState: initialGameState,
        updatedAt: Date.now(),
      });
      soundManager.playRoundStart();
    } catch (err: any) {
      console.error('Error starting resource online game:', err);
      setErrorMessage('ゲーム開始に失敗しました: ' + err.message);
    }
  }, [currentRoom, myPlayerId]);

  // 6. ラウンド開始 -> 各自カード選択フェーズへ
  const startCardSelection = useCallback(() => {
    syncGameState((prev) => {
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

      return {
        ...prev,
        phase: 'CARD_SELECT',
        players: resetPlayers,
        activeCombats: [],
        currentCombatIndex: 0,
        activeEventsQueue: [],
        currentEventIndex: 0,
      };
    });
  }, [syncGameState]);

  // 7. 各プレイヤーによるカード提出（非同期・全員提出で自動REVEAL_ALLへ）
  const selectCard = useCallback(
    (
      playerIndex: number,
      card: GameCardType,
      targetPlayerId?: string,
      targetResource?: ResourceType
    ) => {
      soundManager.playCardFlip();

      syncGameState((prev) => {
        if (prev.phase !== 'CARD_SELECT') return prev;
        const updatedPlayers = [...prev.players];
        const curPlayer = { ...updatedPlayers[playerIndex] };
        if (!curPlayer) return prev;

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

        // 全ての人間プレイヤーがカードを選択完了したかチェック
        const allHumansSelected = updatedPlayers
          .filter((p) => !p.isCpu)
          .every((p) => p.selectedCard !== null);

        if (!allHumansSelected) {
          // まだ提出していない人間プレイヤーがいる場合、状態更新のみ
          return {
            ...prev,
            players: updatedPlayers,
          };
        }

        // 全員の人間が提出完了！ CPUプレイヤーも自動選択して一斉公開（REVEAL_ALL）へ
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
    [syncGameState]
  );

  // 8. 一斉公開後の処理（イベント先制実行 ➔ 森/畑/鉱山の獲得 or 戦闘）
  const resolveReveals = useCallback(() => {
    syncGameState((prev) => {
      if (prev.phase !== 'REVEAL_ALL') return prev;

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

          if (isTie) {
            const highestRollers = group.filter((p) => finalRolls[p.id] === maxFinalRoll);
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
  }, [syncGameState]);

  // 9. 次の戦闘へ進む / 完了
  const nextCombatOrFinish = useCallback(() => {
    syncGameState((prev) => {
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
  }, [syncGameState]);

  // 10. ポイント計算
  const calculateFinalScores = (
    players: BattlePlayer[]
  ): { scores: ScoreSummary[]; winnerId: string } => {
    const maxWood = Math.max(...players.map((p) => p.resources.WOOD), 1);
    const maxRice = Math.max(...players.map((p) => p.resources.RICE), 1);
    const maxIron = Math.max(...players.map((p) => p.resources.IRON), 1);

    const breakdowns: ScoreSummary[] = players.map((p) => {
      const { WOOD, RICE, IRON } = p.resources;
      const setCount = Math.min(WOOD, RICE, IRON);
      const setPoints = setCount * 1;

      const majorityWood = WOOD === maxWood && WOOD > 0;
      const majorityRice = RICE === maxRice && RICE > 0;
      const majorityIron = IRON === maxIron && IRON > 0;

      let majorityPoints = 0;
      if (majorityWood) majorityPoints += 2;
      if (majorityRice) majorityPoints += 2;
      if (majorityIron) majorityPoints += 2;

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

  // 11. 次のターンへ / 最終結果へ
  const nextRound = useCallback(() => {
    syncGameState((prev) => {
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
  }, [syncGameState]);

  // 12. 再戦
  const restartOnlineGame = useCallback(async () => {
    if (!currentRoom || currentRoom.hostId !== myPlayerId) return;
    await startOnlineGame();
  }, [currentRoom, myPlayerId, startOnlineGame]);

  return {
    myPlayerId,
    currentRoom,
    isLoading,
    errorMessage,
    createRoom,
    joinRoom,
    addCpuPlayer,
    removeCpuPlayer,
    leaveRoom,
    startOnlineGame,
    startCardSelection,
    selectCard,
    resolveReveals,
    nextCombatOrFinish,
    nextRound,
    restartOnlineGame,
  };
}
