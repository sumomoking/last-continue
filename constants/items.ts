import { ItemInfo, ItemType } from '../types/game';

export const MAX_ITEM_COUNT = 4;

export const ITEM_DEFINITIONS: Record<ItemType, ItemInfo> = {
  DEBUG: {
    id: 'DEBUG',
    name: 'DEBUG',
    icon: '🔍',
    description: 'ステージデッキの一番上のカードを確認します（カードは戻します）。',
    timing: '自分のターン（PLAY前）',
    canUseInTurn: true,
  },
  RESET: {
    id: 'RESET',
    name: 'RESET',
    icon: '🔄',
    description: '現在残っているステージデッキをすべてシャッフルします。',
    timing: '自分のターン（PLAY前）',
    canUseInTurn: true,
  },
  SAVE: {
    id: 'SAVE',
    name: 'SAVE',
    icon: '💾',
    description: '残り残機1の時のみ使用可能。手札から1枚セットし、GAME OVER時にそのカードを手札に戻して残機1で復活します。',
    timing: '残機1のターン（PLAY前）',
    canUseInTurn: true,
  },
  '1UP': {
    id: '1UP',
    name: '1UP',
    icon: '❤️',
    description: '自分の残機を1増やします（最大3まで）。',
    timing: '自分のターン（PLAY前）',
    canUseInTurn: true,
  },
  CONTINUE: {
    id: 'CONTINUE',
    name: 'CONTINUE',
    icon: '🕹️',
    description: 'カードを引く前に使用。このターンでBAD STAGEを引いても残機減少を無効化し、ターンを継続します。',
    timing: '自分のターン（PLAY前）',
    canUseInTurn: true,
  },
  GLITCH: {
    id: 'GLITCH',
    name: 'GLITCH',
    icon: '👾',
    description: 'カードを引く前に使用。このターンで引くステージカードの効果を無効化して破棄します。',
    timing: '自分のターン（PLAY前）',
    canUseInTurn: true,
  },
};

export const ALL_ITEM_TYPES: ItemType[] = ['DEBUG', 'RESET', 'SAVE', '1UP', 'CONTINUE', 'GLITCH'];

// 初期アイテム山札作成（各アイテム複数枚）
export const createInitialItemDeck = (): ItemType[] => {
  const deck: ItemType[] = [];
  // 6種 × 4枚 = 24枚
  for (let i = 0; i < 4; i++) {
    deck.push(...ALL_ITEM_TYPES);
  }
  return shuffle(deck);
};

export const shuffle = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
