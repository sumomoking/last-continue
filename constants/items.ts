import { ItemInfo, ItemType } from '../types/game';

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
    description: '手札から1枚セット。GAME OVER時にそのカードを手札に戻し残機1で復活します。',
    timing: '自分のターン（PLAY前）',
    canUseInTurn: true,
  },
  '1UP': {
    id: '1UP',
    name: '1UP',
    icon: '❤️',
    description: '自分の残機を1増やします（最大3まで）。',
    timing: '自分のターン（いつでも）',
    canUseInTurn: true,
  },
  CONTINUE: {
    id: 'CONTINUE',
    name: 'CONTINUE',
    icon: '🕹️',
    description: 'BAD STAGEを引いた時に使用。残機減少を無効にし、ターンを続行します。',
    timing: '自分がBADを引いた直後',
    canUseInTurn: false,
  },
  GLITCH: {
    id: 'GLITCH',
    name: 'GLITCH',
    icon: '👾',
    description: 'ステージカードを引いた直後に使用。引いたカードの効果を無効化して捨てます。',
    timing: 'ステージカードめくり直後',
    canUseInTurn: false,
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
