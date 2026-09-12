import {
  GameCard,
  GameCardType,
  LocationCardType,
  EventCardType,
  ResourceType,
} from '../types/resourceBattle';

export const MAX_ROUNDS = 5;

export const RESOURCE_MAP: Record<
  ResourceType,
  {
    name: string;
    icon: string;
    color: string;
    bgBadge: string;
    textBadge: string;
    borderBadge: string;
  }
> = {
  WOOD: {
    name: '木',
    icon: '🪵',
    color: '#22c55e',
    bgBadge: 'bg-emerald-600/20',
    textBadge: 'text-emerald-300',
    borderBadge: 'border-emerald-500/50',
  },
  RICE: {
    name: '小麦',
    icon: '🌾',
    color: '#eab308',
    bgBadge: 'bg-amber-500/20',
    textBadge: 'text-amber-300',
    borderBadge: 'border-amber-500/50',
  },
  IRON: {
    name: '鉄',
    icon: '⚙️',
    color: '#06b6d4',
    bgBadge: 'bg-cyan-500/20',
    textBadge: 'text-cyan-300',
    borderBadge: 'border-cyan-500/50',
  },
};

export const GAME_CARDS: Record<GameCardType, GameCard> = {
  // ── 基本カード（全員に配布・毎ターン使用可能） ──
  FOREST: {
    id: 'forest',
    type: 'FOREST',
    category: 'LOCATION',
    name: '森',
    kanji: '森',
    targetResource: 'WOOD',
    description: '【木】を獲得する。他プレイヤーと被った場合は「戦（戦闘）」が発生！',
    icon: '🌲',
    color: '#16a34a',
  },
  FIELD: {
    id: 'field',
    type: 'FIELD',
    category: 'LOCATION',
    name: '畑',
    kanji: '畑',
    targetResource: 'RICE',
    description: '【小麦】を獲得する。他プレイヤーと被った場合は「戦（戦闘）」が発生！',
    icon: '🌾',
    color: '#f59e0b',
  },
  MINE: {
    id: 'mine',
    type: 'MINE',
    category: 'LOCATION',
    name: '鉱山',
    kanji: '鉱山',
    targetResource: 'IRON',
    description: '【鉄】を獲得する。他プレイヤーと被った場合は「戦（戦闘）」が発生！',
    icon: '⛰️',
    color: '#0284c7',
  },

  // ── イベントカード（先制処理・使い捨て） ──
  ALL_AREAS: {
    id: 'all_areas',
    type: 'ALL_AREAS',
    category: 'EVENT',
    name: '全エリアの選択',
    kanji: '全',
    description: '【先制実行】場にある全エリアから「木・小麦・鉄」を1つずつ獲得する。',
    icon: '🌟',
    color: '#eab308',
  },
  STEAL_RESOURCE: {
    id: 'steal_resource',
    type: 'STEAL_RESOURCE',
    category: 'EVENT',
    name: '資源を奪う',
    kanji: '奪',
    description: '【先制実行】特定のプレイヤーを指定し、そのプレイヤーの指定した資源を1つ奪う。',
    icon: '🥷',
    color: '#a855f7',
  },
  CHALLENGE: {
    id: 'challenge',
    type: 'CHALLENGE',
    category: 'EVENT',
    name: '特定プレイヤーと戦う',
    kanji: '戦',
    description: '【先制実行】指定したプレイヤーとサイコロで戦闘！勝者が相手から資源を1つ奪取。',
    icon: '⚔️',
    color: '#ef4444',
  },
  DICE_PLUS_TWO: {
    id: 'dice_plus_two',
    type: 'DICE_PLUS_TWO',
    category: 'EVENT',
    name: '出目＋2 (戦闘強化)',
    kanji: '＋2',
    description: '【戦闘強化】戦闘時、自分のサイコロの出目を＋2する。',
    icon: '🎲',
    color: '#3b82f6',
  },
  DICE_MINUS_TWO: {
    id: 'dice_minus_two',
    type: 'DICE_MINUS_TWO',
    category: 'EVENT',
    name: '相手の出目－2 (妨害)',
    kanji: '－2',
    description: '【戦闘妨害】戦闘時、対戦相手のサイコロの出目を－2する。',
    icon: '💥',
    color: '#f43f5e',
  },
};

export const ALL_LOCATIONS: LocationCardType[] = ['FOREST', 'FIELD', 'MINE'];

export const ALL_EVENTS: EventCardType[] = [
  'ALL_AREAS',
  'STEAL_RESOURCE',
  'CHALLENGE',
  'DICE_PLUS_TWO',
  'DICE_MINUS_TWO',
];

export const PLAYER_CONFIGS = [
  { name: 'プレイヤー1 (あなた)', colorBadge: 'border-blue-500 bg-blue-950/80 text-blue-300' },
  { name: 'プレイヤー2 (CPU)', colorBadge: 'border-red-500 bg-red-950/80 text-red-300' },
  { name: 'プレイヤー3 (CPU)', colorBadge: 'border-amber-500 bg-amber-950/80 text-amber-300' },
  { name: 'プレイヤー4 (CPU)', colorBadge: 'border-emerald-500 bg-emerald-950/80 text-emerald-300' },
];
