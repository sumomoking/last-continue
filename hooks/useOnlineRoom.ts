'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseInstance, isFirebaseConfigured } from '../lib/firebase';
import { OnlineRoom, RoomPlayer } from '../types/online';
import { GameState, ItemType, CardType, GameLog, Player } from '../types/game';
import { createInitialItemDeck, MAX_ITEM_COUNT, shuffle } from '../constants/items';

const INITIAL_LIVES = 3;

// プレイヤーIDの取得または生成（セッション単位）
const getMyPlayerId = (): string => {
  if (typeof window === 'undefined') return 'p-client';
  let id = sessionStorage.getItem('last_continue_player_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('last_continue_player_id', id);
  }
  return id;
};

// 4桁の読みやすいルームコード生成 (例: LC-4821)
const generateRoomCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LC-${code}`;
};

// ダイスと初期デッキ生成
const generateRoundDeck = (): { dice: [number, number]; deck: CardType[]; goodCount: number; badCount: number } => {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const totalCount = d1 + d2;

  const base12: CardType[] = [
    'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD',
    'BAD', 'BAD', 'BAD', 'BAD', 'BAD', 'BAD',
  ];
  const shuffled12 = shuffle(base12);
  const selectedCards = shuffled12.slice(0, totalCount);
  const finalDeck = shuffle(selectedCards);

  return {
    dice: [d1, d2],
    deck: finalDeck,
    goodCount: finalDeck.filter((c) => c === 'GOOD').length,
    badCount: finalDeck.filter((c) => c === 'BAD').length,
  };
};

const drawItems = (count: number, currentItemDeck: ItemType[]): { drawn: ItemType[]; remaining: ItemType[] } => {
  let deck = [...currentItemDeck];
  const drawn: ItemType[] = [];
  for (let i = 0; i < count; i++) {
    if (deck.length === 0) {
      deck = createInitialItemDeck();
    }
    drawn.push(deck.pop()!);
  }
  return { drawn, remaining: deck };
};

const getNextAlivePlayerIndex = (fromIndex: number, playersList: Player[]): number => {
  const total = playersList.length;
  for (let i = 1; i <= total; i++) {
    const idx = (fromIndex + i) % total;
    if (!playersList[idx].isGameOver) {
      return idx;
    }
  }
  return fromIndex;
};

const getAlivePlayers = (playersList: Player[]): Player[] => {
  return playersList.filter((p) => !p.isGameOver);
};

export function useOnlineRoom() {
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [currentRoom, setCurrentRoom] = useState<OnlineRoom | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setMyPlayerId(getMyPlayerId());
  }, []);

  // ルームの購読解除のクリーンアップ
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
            // ゲーム進行中に誰かが退出したため強制終了
            setErrorMessage(
              data.terminatedReason || 'プレイヤーがルームを退出したため、ゲームが強制終了されました。'
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
    async (hostName: string, maxPlayers: 3 | 4) => {
      setIsLoading(true);
      setErrorMessage(null);

      const { db } = getFirebaseInstance();
      if (!db) {
        setIsLoading(false);
        setErrorMessage('Firebaseの設定が完了していません。設定を行ってください。');
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
        status: 'WAITING',
        maxPlayers,
        hostId: playerId,
        players: [hostPlayer],
        gameState: null,
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

  // 3. ルームから退出（ゲーム進行中の場合はゲーム強制終了）
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
        const isDead = currentRoom.gameState?.players.find((p) => p.id === playerId)?.isGameOver || false;

        if (remainingPlayers.length === 0) {
          // 誰もいなくなったら削除
          await deleteDoc(roomRef);
        } else if (isGamePlaying && !isDead) {
          // 生存プレイヤーが対戦途中で抜けた場合のみ、ゲームを強制終了
          await updateDoc(roomRef, {
            status: 'ABORTED',
            terminatedReason: `生存プレイヤー「${leavingName}」が対戦途中でルームを退出したため、ゲームが強制終了されました。`,
            players: remainingPlayers,
            updatedAt: Date.now(),
          });
        } else {
          // ロビー待機中、または敗退済みプレイヤーの退出（ゲームは継続）
          let nextHostId = currentRoom.hostId;
          if (currentRoom.hostId === playerId && remainingPlayers.length > 0) {
            nextHostId = remainingPlayers[0].id;
            remainingPlayers[0].isHost = true;
          }

          let updatedGameState = currentRoom.gameState;
          if (isGamePlaying && updatedGameState) {
            updatedGameState = {
              ...updatedGameState,
              logs: [
                {
                  id: Math.random().toString(36).substring(2, 9),
                  text: `👋 敗退した ${leavingName} が観戦を終了してルームを退出しました。`,
                  timestamp: new Date().toLocaleTimeString('ja-JP'),
                  type: 'system',
                },
                ...updatedGameState.logs,
              ],
            };
          }

          await updateDoc(roomRef, {
            players: remainingPlayers,
            hostId: nextHostId,
            ...(updatedGameState ? { gameState: updatedGameState } : {}),
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

  // 4. ゲームステートの直接更新（Firestoreの最新データを取得してアトミックに適用）
  const syncGameState = useCallback(
    async (updater: (prev: GameState) => GameState) => {
      if (!currentRoom || !currentRoom.gameState) return;
      const { db } = getFirebaseInstance();
      if (!db) return;

      try {
        const roomRef = doc(db, 'rooms', currentRoom.id);
        const snapshot = await getDoc(roomRef);
        if (!snapshot.exists()) return;
        const roomData = snapshot.data() as OnlineRoom;
        if (!roomData.gameState) return;

        const latestState = roomData.gameState;
        const newGameState = updater(latestState);

        // 状態に変更がない（フェーズ不一致等でガードされた）場合は更新をスキップ
        if (newGameState === latestState) return;

        await updateDoc(roomRef, {
          gameState: newGameState,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.error('Error syncing game state:', err);
      }
    },
    [currentRoom]
  );

  // 5. オンラインゲーム開始（ホストが実行）
  const startOnlineGame = useCallback(async () => {
    if (!currentRoom || currentRoom.hostId !== myPlayerId) return;
    const { db } = getFirebaseInstance();
    if (!db) return;

    let itemDeck = createInitialItemDeck();
    const players: Player[] = currentRoom.players.map((rp, index) => {
      const { drawn, remaining } = drawItems(2, itemDeck);
      itemDeck = remaining;
      return {
        id: rp.id,
        name: rp.name,
        lives: INITIAL_LIVES,
        items: drawn,
        savedItem: null,
        isGameOver: false,
      };
    });

    const { dice, deck, goodCount, badCount } = generateRoundDeck();
    const firstPlayerIndex = Math.floor(Math.random() * players.length);

    const initialGameState: GameState = {
      phase: 'ROUND_START',
      players,
      currentTurnPlayerIndex: firstPlayerIndex,
      targetPlayerIndex: null,
      actorPlayerIndex: firstPlayerIndex,
      round: 1,
      stageDeck: deck,
      initialRoundGoodCount: goodCount,
      initialRoundBadCount: badCount,
      diceResults: dice,
      revealedCard: null,
      glitchedCard: false,
      continuedCard: false,
      itemDeck,
      logs: [
        {
          id: 'init-1',
          text: `🎮 オンライン対戦スタート！ 参加者: ${players.map((p) => p.name).join(', ')}`,
          timestamp: new Date().toLocaleTimeString('ja-JP'),
          type: 'system',
        },
        {
          id: 'init-2',
          text: `🎲 ROUND 1 開始！ ダイス出目: ${dice[0]} + ${dice[1]} = ${deck.length}枚 (GOOD: ${goodCount}, BAD: ${badCount})`,
          timestamp: new Date().toLocaleTimeString('ja-JP'),
          type: 'round',
        },
        {
          id: 'init-3',
          text: `👑 最初のターン: ${players[firstPlayerIndex].name}`,
          timestamp: new Date().toLocaleTimeString('ja-JP'),
          type: 'system',
        },
      ],
      debugPeekCard: null,
      saveModalPlayerIndex: null,
    };

    try {
      const roomRef = doc(db, 'rooms', currentRoom.id);
      await updateDoc(roomRef, {
        status: 'PLAYING',
        gameState: initialGameState,
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      console.error('Error starting game:', err);
      setErrorMessage('ゲーム開始に失敗しました: ' + err.message);
    }
  }, [currentRoom, myPlayerId]);

  // 6. ラウンド開始確認（重複防止ガード付き）
  const confirmRoundStart = useCallback(() => {
    syncGameState((prev) => {
      if (prev.phase !== 'ROUND_START') return prev;
      return {
        ...prev,
        phase: 'TURN_ACTION',
      };
    });
  }, [syncGameState]);

  // 7. カードを引くアクション（PLAY）
  const playCard = useCallback(
    (targetIndex: number) => {
      syncGameState((prev) => {
        if (prev.phase !== 'TURN_ACTION') return prev;
        if (prev.stageDeck.length === 0) return prev;

        const actor = prev.players[prev.currentTurnPlayerIndex];
        const target = prev.players[targetIndex];
        const isSelf = targetIndex === prev.currentTurnPlayerIndex;

        const newDeck = [...prev.stageDeck];
        const drawnCard = newDeck.shift()!;

        const logText = isSelf
          ? `👉 ${actor.name} が【自分でPLAY】を選択しました！`
          : `👉 ${actor.name} が【${target.name} にPLAYさせる】を選択しました！`;

        return {
          ...prev,
          phase: 'CARD_REVEALING',
          targetPlayerIndex: targetIndex,
          actorPlayerIndex: prev.currentTurnPlayerIndex,
          stageDeck: newDeck,
          revealedCard: drawnCard,
          glitchedCard: prev.glitchedCard,
          continuedCard: prev.continuedCard,
          logs: [
            {
              id: Math.random().toString(36).substring(2, 9),
              text: logText,
              timestamp: new Date().toLocaleTimeString('ja-JP'),
              type: 'system',
            },
            ...prev.logs,
          ],
        };
      });
    },
    [syncGameState]
  );

  // 8. カードめくり完了（重複防止ガード付き）
  const finishCardReveal = useCallback(() => {
    syncGameState((prev) => {
      if (prev.phase !== 'CARD_REVEALING') return prev;
      return {
        ...prev,
        phase: 'CARD_RESULT',
      };
    });
  }, [syncGameState]);

  // 9. 結果確定（重複防止ガード付き）
  const resolveCard = useCallback(() => {
    syncGameState((prev) => {
      if (prev.phase !== 'CARD_RESULT') return prev;
      if (!prev.revealedCard || prev.targetPlayerIndex === null) return prev;

      const card = prev.revealedCard;
      const targetIdx = prev.targetPlayerIndex;
      const actorIdx = prev.actorPlayerIndex;
      const isSelf = targetIdx === actorIdx;
      const targetPlayer = prev.players[targetIdx];
      const actorPlayer = prev.players[actorIdx];
      let playersList = prev.players.map((p) => ({ ...p, items: [...p.items] }));
      const currentLogs = [...prev.logs];

      const addInternalLog = (text: string, type: GameLog['type'] = 'system') => {
        currentLogs.unshift({
          id: Math.random().toString(36).substring(2, 9),
          text,
          timestamp: new Date().toLocaleTimeString('ja-JP'),
          type,
        });
      };

      let nextTurnPlayerIndex = prev.currentTurnPlayerIndex;

      // GLITCH発動
      if (prev.glitchedCard) {
        addInternalLog(`👾 GLITCH発動！ ${targetPlayer.name} が引いたカードは無効化され捨てられました。`, 'item');
        nextTurnPlayerIndex = getNextAlivePlayerIndex(actorIdx, playersList);
      }
      // CONTINUE発動
      else if (prev.continuedCard && card === 'BAD') {
        if (isSelf) {
          addInternalLog(`🕹️ CONTINUE発動！ ${targetPlayer.name} の残機減少は無効化され、ターンを続行します！`, 'item');
          nextTurnPlayerIndex = actorIdx;
        } else {
          addInternalLog(`🕹️ CONTINUE発動！ ${targetPlayer.name} の残機減少は無効化されました。`, 'item');
          nextTurnPlayerIndex = getNextAlivePlayerIndex(actorIdx, playersList);
        }
      }
      // 通常の GOOD STAGE
      else if (card === 'GOOD') {
        if (isSelf) {
          addInternalLog(`🟦 GOOD STAGE！ ${targetPlayer.name} のターンが継続します！`, 'good');
          nextTurnPlayerIndex = actorIdx;
        } else {
          addInternalLog(`🟦 GOOD STAGE！ ${targetPlayer.name} はセーフ！ ${actorPlayer.name} のターンが終了しました。`, 'good');
          nextTurnPlayerIndex = getNextAlivePlayerIndex(actorIdx, playersList);
        }
      }
      // 通常の BAD STAGE
      else {
        addInternalLog(`🟥 BAD STAGE！ ${targetPlayer.name} の残機が 1 減少しました！`, 'bad');
        const newLives = targetPlayer.lives - 1;

        if (newLives <= 0) {
          if (targetPlayer.savedItem) {
            const restoredItem = targetPlayer.savedItem;
            const currentHand = playersList[targetIdx].items;
            const newHand = currentHand.length < MAX_ITEM_COUNT ? [...currentHand, restoredItem] : currentHand;
            playersList[targetIdx] = {
              ...playersList[targetIdx],
              lives: 1,
              savedItem: null,
              items: newHand,
            };
            addInternalLog(`💾 SAVE発動！ ${targetPlayer.name} は残機 1 で復活し、セットされていた「${restoredItem}」を手札に戻しました！`, 'item');
          } else {
            playersList[targetIdx] = {
              ...playersList[targetIdx],
              lives: 0,
              isGameOver: true,
            };
            addInternalLog(`💀 ${targetPlayer.name} は残機が0になり GAME OVER（脱落）しました！`, 'bad');
          }
        } else {
          playersList[targetIdx] = {
            ...playersList[targetIdx],
            lives: newLives,
          };
        }

        nextTurnPlayerIndex = getNextAlivePlayerIndex(actorIdx, playersList);
      }

      // ── SAVEの1周有効期限チェック ──
      // 手番が他プレイヤーから移行し、次手番プレイヤーが未発動のSAVEを保持している場合、1周経過として手札に戻す
      if (nextTurnPlayerIndex !== actorIdx && playersList[nextTurnPlayerIndex]?.savedItem) {
        const expiredItem = playersList[nextTurnPlayerIndex].savedItem!;
        const currentHand = playersList[nextTurnPlayerIndex].items;
        const newHand = currentHand.length < MAX_ITEM_COUNT ? [...currentHand, expiredItem] : currentHand;
        playersList[nextTurnPlayerIndex] = {
          ...playersList[nextTurnPlayerIndex],
          savedItem: null,
          items: newHand,
        };
        addInternalLog(`💾 ${playersList[nextTurnPlayerIndex].name} のSAVE効果が1周経過して終了しました。セットカード「${expiredItem}」が手札に戻りました。`, 'item');
      }

      // 勝者判定
      const alivePlayers = getAlivePlayers(playersList);
      if (alivePlayers.length <= 1) {
        const winner = alivePlayers[0];
        if (winner) {
          addInternalLog(`🏆 WINNER!! 勝者は ${winner.name} です！`, 'system');
        }
        return {
          ...prev,
          players: playersList,
          phase: 'GAME_OVER_SUMMARY',
          revealedCard: null,
          glitchedCard: false,
          continuedCard: false,
          targetPlayerIndex: null,
          logs: currentLogs,
        };
      }

      // ラウンド終了チェック
      if (prev.stageDeck.length === 0) {
        addInternalLog(`✨ ROUND ${prev.round} CLEAR!! ステージデッキが空になりました。`, 'round');
        return {
          ...prev,
          players: playersList,
          phase: 'ROUND_CLEAR',
          currentTurnPlayerIndex: nextTurnPlayerIndex,
          revealedCard: null,
          glitchedCard: false,
          continuedCard: false,
          targetPlayerIndex: null,
          logs: currentLogs,
        };
      }

      return {
        ...prev,
        players: playersList,
        phase: 'TURN_ACTION',
        currentTurnPlayerIndex: nextTurnPlayerIndex,
        revealedCard: null,
        glitchedCard: false,
        continuedCard: false,
        targetPlayerIndex: null,
        logs: currentLogs,
      };
    });
  }, [syncGameState]);

  // 10. 次ラウンドへ（重複防止ガード付き）
  const nextRound = useCallback(() => {
    syncGameState((prev) => {
      if (prev.phase !== 'ROUND_CLEAR') return prev;

      let currentItemDeck = [...prev.itemDeck];
      const nextRoundNum = prev.round + 1;

      const updatedPlayers = prev.players.map((player) => {
        if (player.isGameOver) return player;
        let newItems = [...player.items];
        // もし未発動のSAVEが残っていたら手札に戻す
        if (player.savedItem) {
          if (newItems.length < MAX_ITEM_COUNT) {
            newItems.push(player.savedItem);
          }
        }
        const availableSlots = Math.max(0, MAX_ITEM_COUNT - newItems.length);
        const drawCount = Math.min(2, availableSlots);
        if (drawCount > 0) {
          const { drawn, remaining } = drawItems(drawCount, currentItemDeck);
          currentItemDeck = remaining;
          newItems = [...newItems, ...drawn];
        }
        return {
          ...player,
          savedItem: null,
          items: newItems,
        };
      });

      const { dice, deck, goodCount, badCount } = generateRoundDeck();

      return {
        ...prev,
        phase: 'ROUND_START',
        players: updatedPlayers,
        round: nextRoundNum,
        stageDeck: deck,
        initialRoundGoodCount: goodCount,
        initialRoundBadCount: badCount,
        diceResults: dice,
        revealedCard: null,
        glitchedCard: false,
        continuedCard: false,
        itemDeck: currentItemDeck,
        logs: [
          {
            id: Math.random().toString(36).substring(2, 9),
            text: `🎲 ROUND ${nextRoundNum} 開始！ 生存者にアイテム補充（最大${MAX_ITEM_COUNT}枚）。ダイス: ${dice[0]} + ${dice[1]} = ${deck.length}枚 (GOOD: ${goodCount}, BAD: ${badCount})`,
            timestamp: new Date().toLocaleTimeString('ja-JP'),
            type: 'round',
          },
          ...prev.logs,
        ],
        debugPeekCard: null,
        saveModalPlayerIndex: null,
      };
    });
  }, [syncGameState]);

  // 11. アイテム使用
  const useItem = useCallback(
    (item: ItemType, playerIndex: number, extraData?: { saveItemType?: ItemType }) => {
      syncGameState((prev) => {
        if (prev.phase !== 'TURN_ACTION') return prev;
        const player = prev.players[playerIndex];
        if (!player || player.isGameOver) return prev;
        if (playerIndex !== prev.currentTurnPlayerIndex) return prev;

        const itemIdx = player.items.indexOf(item);
        if (itemIdx === -1) return prev;

        const updatedItems = [...player.items];
        updatedItems.splice(itemIdx, 1);

        let playersList = [...prev.players];
        let newDeck = [...prev.stageDeck];
        let debugPeek: CardType | null = prev.debugPeekCard;
        let glitched = prev.glitchedCard;
        let continued = prev.continuedCard;
        const logs = [...prev.logs];

        const logItem = (msg: string) => {
          logs.unshift({
            id: Math.random().toString(36).substring(2, 9),
            text: msg,
            timestamp: new Date().toLocaleTimeString('ja-JP'),
            type: 'item',
          });
        };

        let currentItemDeck = [...prev.itemDeck];

        let itemAnnouncementMsg = '';
        switch (item) {
          case 'DEBUG': {
            if (newDeck.length > 0) {
              debugPeek = newDeck[0];
              playersList[playerIndex] = { ...player, items: updatedItems };
              itemAnnouncementMsg = '一番上のステージカードを覗き見中...';
              logItem(`🔍 ${player.name} が「DEBUG」を使用しました。一番上のカードを確認中...`);
            }
            break;
          }
          case 'RESET': {
            const redrawCount = Math.max(1, updatedItems.length);
            let pool = [...currentItemDeck, ...updatedItems];
            pool = shuffle(pool);
            const { drawn, remaining } = drawItems(redrawCount, pool);
            currentItemDeck = remaining;
            playersList[playerIndex] = { ...player, items: drawn };
            itemAnnouncementMsg = `手札のアイテムを全入れ替え！ 新しいアイテム（${redrawCount}枚）を引き直しました！`;
            logItem(`🔄 ${player.name} が「RESET」を使用！ 手札を山札に戻し、${redrawCount}枚の新しいアイテムを引き直しました！`);
            break;
          }
          case '1UP': {
            const currentLives = player.lives;
            const newLives = Math.min(3, currentLives + 1);
            playersList[playerIndex] = { ...player, lives: newLives, items: updatedItems };
            itemAnnouncementMsg = `ライフが1回復しました！（❤️ ${currentLives} ➔ ${newLives}）`;
            logItem(`❤️ ${player.name} が「1UP」を使用しました！ 残機: ${newLives}`);
            break;
          }
          case 'SAVE': {
            if (player.lives === 1 && !player.savedItem && extraData?.saveItemType) {
              const setToSave = extraData.saveItemType;
              const saveItemIdx = updatedItems.indexOf(setToSave);
              if (saveItemIdx !== -1) {
                updatedItems.splice(saveItemIdx, 1);
              }
              playersList[playerIndex] = {
                ...player,
                items: updatedItems,
                savedItem: setToSave,
              };
              itemAnnouncementMsg = `「${setToSave}」をSAVEスロットにセット！ (ライフ0時に全回復)`;
              logItem(`💾 ${player.name} が「SAVE」を使用し、「${setToSave}」をセットしました。GAME OVER時に復活します。`);
            }
            break;
          }
          case 'CONTINUE': {
            continued = true;
            playersList[playerIndex] = { ...player, items: updatedItems };
            itemAnnouncementMsg = 'BADカードの残機減少を無効化するバリアを展開！';
            logItem(`🕹️ ${player.name} が「CONTINUE」を発動！ このターン、BADを引いても無効化してターン継続します！`);
            break;
          }
          case 'GLITCH': {
            glitched = true;
            playersList[playerIndex] = { ...player, items: updatedItems };
            itemAnnouncementMsg = '次に引くカードの効果を無効化して破棄するグリッチを展開！';
            logItem(`👾 ${player.name} が「GLITCH」を発動！ 次に引くカードを無効化して破棄します！`);
            break;
          }
        }

        return {
          ...prev,
          players: playersList,
          stageDeck: newDeck,
          itemDeck: currentItemDeck,
          debugPeekCard: debugPeek,
          glitchedCard: glitched,
          continuedCard: continued,
          logs,
          saveModalPlayerIndex: null,
          lastUsedItemAnnouncement: {
            id: Math.random().toString(36).substring(2, 9),
            playerIndex,
            playerName: player.name,
            item,
            message: itemAnnouncementMsg,
            timestamp: Date.now(),
          },
        };
      });
    },
    [syncGameState]
  );

  const closeDebugPeek = useCallback(() => {
    syncGameState((prev) => ({ ...prev, debugPeekCard: null }));
  }, [syncGameState]);

  const openSaveModal = useCallback(
    (playerIndex: number | null) => {
      syncGameState((prev) => {
        if (playerIndex !== null) {
          if (prev.phase !== 'TURN_ACTION') return prev;
          const player = prev.players[playerIndex];
          if (!player || player.lives !== 1 || player.savedItem || player.items.length <= 1) {
            return prev;
          }
        }
        return { ...prev, saveModalPlayerIndex: playerIndex };
      });
    },
    [syncGameState]
  );

  // 再戦（ゲームリセット）
  const restartOnlineGame = useCallback(() => {
    if (currentRoom?.hostId === myPlayerId) {
      startOnlineGame();
    }
  }, [currentRoom, myPlayerId, startOnlineGame]);

  return {
    myPlayerId,
    currentRoom,
    isLoading,
    errorMessage,
    setErrorMessage,
    createRoom,
    joinRoom,
    leaveRoom,
    startOnlineGame,
    confirmRoundStart,
    playCard,
    finishCardReveal,
    resolveCard,
    nextRound,
    useItem,
    closeDebugPeek,
    openSaveModal,
    restartOnlineGame,
  };
}
