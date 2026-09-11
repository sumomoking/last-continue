'use client';

import { useState, useCallback } from 'react';
import { CardType, GameLog, GamePhase, GameState, ItemType, Player } from '../types/game';
import { MAX_ITEM_COUNT, createInitialItemDeck, shuffle } from '../constants/items';

const INITIAL_LIVES = 3;

export function useGameEngine() {
  const [state, setState] = useState<GameState>({
    phase: 'SETUP',
    players: [],
    currentTurnPlayerIndex: 0,
    targetPlayerIndex: null,
    actorPlayerIndex: 0,
    round: 1,
    stageDeck: [],
    initialRoundGoodCount: 0,
    initialRoundBadCount: 0,
    diceResults: [1, 1],
    revealedCard: null,
    glitchedCard: false,
    continuedCard: false,
    itemDeck: [],
    logs: [],
    debugPeekCard: null,
    saveModalPlayerIndex: null,
  });

  const addLog = useCallback((text: string, type: GameLog['type'] = 'system') => {
    const newLog: GameLog = {
      id: Math.random().toString(36).substring(2, 9),
      text,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
    };
    setState((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 50),
    }));
  }, []);

  // アイテム山札から指定枚数引く
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

  // 生存している次のプレイヤーのインデックスを計算
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

  // 生存プレイヤー数を取得
  const getAlivePlayers = (playersList: Player[]): Player[] => {
    return playersList.filter((p) => !p.isGameOver);
  };

  // 新しいラウンドのステージデッキとダイスを生成
  const generateRoundDeck = (): { dice: [number, number]; deck: CardType[]; goodCount: number; badCount: number } => {
    // 6面ダイス2個
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const totalCount = d1 + d2; // 2〜12

    // GOOD × 6, BAD × 6 の12枚を用意
    const base12: CardType[] = [
      'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD', 'GOOD',
      'BAD', 'BAD', 'BAD', 'BAD', 'BAD', 'BAD',
    ];
    const shuffled12 = shuffle(base12);
    // 出目の合計枚数を使用
    const selectedCards = shuffled12.slice(0, totalCount);
    const finalDeck = shuffle(selectedCards);

    const goodCount = finalDeck.filter((c) => c === 'GOOD').length;
    const badCount = finalDeck.filter((c) => c === 'BAD').length;

    return {
      dice: [d1, d2],
      deck: finalDeck,
      goodCount,
      badCount,
    };
  };

  // 1. ゲーム開始（セットアップ完了）
  const startGame = useCallback((playerNames: string[]) => {
    let itemDeck = createInitialItemDeck();
    const players: Player[] = playerNames.map((name, index) => {
      const { drawn, remaining } = drawItems(2, itemDeck);
      itemDeck = remaining;
      return {
        id: `p-${index + 1}`,
        name: name.trim() || `Player ${index + 1}`,
        lives: INITIAL_LIVES,
        items: drawn,
        savedItem: null,
        isGameOver: false,
      };
    });

    const { dice, deck, goodCount, badCount } = generateRoundDeck();
    const firstPlayerIndex = Math.floor(Math.random() * players.length);

    setState({
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
          text: `🎮 ゲームスタート！ プレイヤー: ${players.map((p) => p.name).join(', ')}`,
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
    });
  }, []);

  // ラウンド開始確認後、ターンアクションフェーズへ
  const confirmRoundStart = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'TURN_ACTION',
    }));
  }, []);

  // 2. PLAY開始（自分がPLAY or 他人にPLAY）
  const playCard = useCallback((targetIndex: number) => {
    setState((prev) => {
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
        // 事前発動されたGLITCH/CONTINUEの状態を引き継ぐ
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
  }, []);

  // カードめくりアニメーション完了
  const finishCardReveal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: 'CARD_RESULT',
    }));
  }, []);

  // 3. カード結果の確定（アイテム発動有無を反映してターン・勝敗・ラウンド遷移）
  const resolveCard = useCallback(() => {
    setState((prev) => {
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

      // ── GLITCH判定によるカード反転 ──
      const effectiveCard: CardType = prev.glitchedCard ? (card === 'GOOD' ? 'BAD' : 'GOOD') : card;

      if (prev.glitchedCard) {
        addInternalLog(
          `👾 GLITCH反転発動！ 引いたカードは「${card}」でしたが【${effectiveCard === 'GOOD' ? 'GOOD STAGE' : 'BAD STAGE'}】に反転しました！`,
          'item'
        );
      }

      // ── A. CONTINUE発動の場合 (effectiveCard が BAD の時のみ) ──
      if (prev.continuedCard && effectiveCard === 'BAD') {
        if (isSelf) {
          addInternalLog(`🕹️ CONTINUE発動！ ${targetPlayer.name} の残機減少は無効化され、ターンを続行します！`, 'item');
          nextTurnPlayerIndex = actorIdx;
        } else {
          addInternalLog(`🕹️ CONTINUE発動！ ${targetPlayer.name} の残機減少は無効化されました。`, 'item');
          nextTurnPlayerIndex = getNextAlivePlayerIndex(actorIdx, playersList);
        }
      }
      // ── B. effectiveCard が GOOD STAGE ──
      else if (effectiveCard === 'GOOD') {
        if (isSelf) {
          addInternalLog(`🟦 GOOD STAGE！ ${targetPlayer.name} のターンが継続します！`, 'good');
          nextTurnPlayerIndex = actorIdx;
        } else {
          addInternalLog(`🟦 GOOD STAGE！ ${targetPlayer.name} はセーフ！ ${actorPlayer.name} のターンが終了しました。`, 'good');
          nextTurnPlayerIndex = getNextAlivePlayerIndex(actorIdx, playersList);
        }
      }
      // ── C. effectiveCard が BAD STAGE ──
      else {
        addInternalLog(`🟥 BAD STAGE！ ${targetPlayer.name} の残機が 1 減少しました！`, 'bad');
        const newLives = targetPlayer.lives - 1;

        if (newLives <= 0) {
          // 残機0 -> SAVE発動チェック
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

        // 手番プレイヤー（actorIdx）のターンが終了し、本来の次の生存プレイヤーへ
        nextTurnPlayerIndex = getNextAlivePlayerIndex(actorIdx, playersList);
      }

      // ── SAVEの1周有効期限チェック ──
      // 手番が他プレイヤーから移行し、次手番プレイヤーが未発動のSAVEを保持している場合、1周経過として消失
      if (nextTurnPlayerIndex !== actorIdx && playersList[nextTurnPlayerIndex]?.savedItem) {
        const expiredItem = playersList[nextTurnPlayerIndex].savedItem!;
        playersList[nextTurnPlayerIndex] = {
          ...playersList[nextTurnPlayerIndex],
          savedItem: null,
        };
        addInternalLog(`💾 ${playersList[nextTurnPlayerIndex].name} のSAVE効果が1周経過して終了しました。セットされていた「${expiredItem}」は消失しました。`, 'item');
      }

      // 勝者判定チェック（生存者1人）
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

      // ラウンド終了チェック（ステージデッキが空）
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

      // 通常のターン移行
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
  }, []);

  // 4. 次のラウンドへ進む
  const nextRound = useCallback(() => {
    setState((prev) => {
      let currentItemDeck = [...prev.itemDeck];
      const nextRoundNum = prev.round + 1;

      // 生存プレイヤー全員にアイテムを配布（最大4個まで）
      const updatedPlayers = prev.players.map((player) => {
        if (player.isGameOver) return player;
        const availableSlots = Math.max(0, MAX_ITEM_COUNT - player.items.length);
        const drawCount = Math.min(2, availableSlots);
        let newItems = [...player.items];
        if (drawCount > 0) {
          const { drawn, remaining } = drawItems(drawCount, currentItemDeck);
          currentItemDeck = remaining;
          newItems = [...newItems, ...drawn];
        }
        return {
          ...player,
          savedItem: null, // 未発動のSAVEはラウンド終了時に消失
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
  }, []);

  // 5. アイテム使用処理（カードを引く前＝TURN_ACTION時のみ使用可能）
  const useItem = useCallback((item: ItemType, playerIndex: number, extraData?: { saveItemType?: ItemType; resetTargetPlayerIndex?: number }) => {
    setState((prev) => {
      // アイテムはカードを引く前（TURN_ACTIONフェーズ）のみ使用可能
      if (prev.phase !== 'TURN_ACTION') return prev;

      const player = prev.players[playerIndex];
      if (!player || player.isGameOver) return prev;

      // 現在の手番プレイヤーのみ使用可能
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
          const targetIdx = extraData?.resetTargetPlayerIndex ?? playerIndex;
          if (targetIdx === playerIndex) {
            // 自分自身の手札入れ替え
            const redrawCount = Math.max(1, updatedItems.length);
            let pool = shuffle([...currentItemDeck, ...updatedItems]);
            const { drawn, remaining } = drawItems(redrawCount, pool);
            currentItemDeck = remaining;
            playersList[playerIndex] = { ...player, items: drawn };
            itemAnnouncementMsg = `自分自身の手札を全入れ替え！ 新しいアイテム（${redrawCount}枚）を引き直しました！`;
            logItem(`🔄 ${player.name} が自分自身に「RESET」を使用！ 手札を山札に戻し、${redrawCount}枚の新しいアイテムを引き直しました！`);
          } else {
            // 相手の手札を強制入れ替え
            playersList[playerIndex] = { ...player, items: updatedItems };
            const targetOpponent = playersList[targetIdx];
            if (targetOpponent && !targetOpponent.isGameOver) {
              const targetCount = targetOpponent.items.length;
              if (targetCount > 0) {
                let pool = shuffle([...currentItemDeck, ...targetOpponent.items]);
                const { drawn, remaining } = drawItems(targetCount, pool);
                currentItemDeck = remaining;
                playersList[targetIdx] = { ...targetOpponent, items: drawn };
                itemAnnouncementMsg = `${targetOpponent.name} の手札（${targetCount}枚）をすべて山札に戻して強制引き直し！`;
                logItem(`🔄 ${player.name} が ${targetOpponent.name} に「RESET」を使用！ ${targetOpponent.name} の手札（${targetCount}枚）を山札に戻し、強制的に引き直させました！`);
              } else {
                itemAnnouncementMsg = `${targetOpponent.name} にRESETを使用！（手札0枚）`;
                logItem(`🔄 ${player.name} が ${targetOpponent.name} に「RESET」を使用しましたが、${targetOpponent.name} は手札を持っていませんでした。`);
              }
            }
          }
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

            // 他プレイヤーが以前に使用していたSAVEがあれば消滅させる
            playersList = playersList.map((p, pIdx) => {
              if (pIdx !== playerIndex && p.savedItem) {
                logItem(`💾 ${player.name} がSAVEを発動したため、${p.name} のSAVE効果は上書きされ消滅しました！`);
                return {
                  ...p,
                  savedItem: null,
                };
              }
              return p;
            });

            playersList[playerIndex] = {
              ...player,
              items: updatedItems,
              savedItem: setToSave,
            };
            itemAnnouncementMsg = `「${setToSave}」をSAVEスロットにセット！（他者のSAVE消滅 & 1周有効）`;
            logItem(`💾 ${player.name} が「SAVE」を使用し、「${setToSave}」をセットしました。GAME OVER時に復活します（1周未発動時は消失）。`);
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
          itemAnnouncementMsg = '次に引くカードの判定を反転させるグリッチを展開！（GOOD ⇔ BAD）';
          logItem(`👾 ${player.name} が「GLITCH」を発動！ 次に引くカードの判定を反転（GOOD ⇔ BAD）させます！`);
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
  }, []);

  // DEBUGの覗き見を閉じる
  const closeDebugPeek = useCallback(() => {
    setState((prev) => ({ ...prev, debugPeekCard: null }));
  }, []);

  // SAVE選択モーダルを開く/閉じる（残機1の時のみ開ける）
  const openSaveModal = useCallback((playerIndex: number | null) => {
    setState((prev) => {
      if (playerIndex !== null) {
        if (prev.phase !== 'TURN_ACTION') return prev;
        const player = prev.players[playerIndex];
        if (!player || player.lives !== 1 || player.savedItem || player.items.length <= 1) {
          return prev;
        }
      }
      return { ...prev, saveModalPlayerIndex: playerIndex };
    });
  }, []);

  // ゲームリセット（セットアップ画面へ戻る）
  const resetGame = useCallback(() => {
    setState({
      phase: 'SETUP',
      players: [],
      currentTurnPlayerIndex: 0,
      targetPlayerIndex: null,
      actorPlayerIndex: 0,
      round: 1,
      stageDeck: [],
      initialRoundGoodCount: 0,
      initialRoundBadCount: 0,
      diceResults: [1, 1],
      revealedCard: null,
      glitchedCard: false,
      continuedCard: false,
      itemDeck: [],
      logs: [],
      debugPeekCard: null,
      saveModalPlayerIndex: null,
    });
  }, []);

  return {
    state,
    startGame,
    confirmRoundStart,
    playCard,
    finishCardReveal,
    resolveCard,
    nextRound,
    useItem,
    closeDebugPeek,
    openSaveModal,
    resetGame,
    addLog,
  };
}
