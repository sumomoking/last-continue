import { SengokuCard, SengokuCardType, LocationCardType, EventCardType, ResourceType } from '../types/sengoku';

export const SENGOKU_MAX_ROUNDS = 5;

export const RESOURCE_CONFIG: Record<ResourceType, { name: string; kanji: string; icon: string; color: string; bgBadge: string; textBadge: string; borderBadge: string }> = {
  RICE: {
    name: '電脳米',
    kanji: '米',
    icon: '🌾',
    color: '#eab308', // yellow-500
    bgBadge: 'bg-amber-500/20',
    textBadge: 'text-amber-300',
    borderBadge: 'border-amber-500/50',
  },
  WOOD: {
    name: '神木材',
    kanji: '木',
    icon: '🪵',
    color: '#22c55e', // green-500
    bgBadge: 'bg-emerald-500/20',
    textBadge: 'text-emerald-300',
    borderBadge: 'border-emerald-500/50',
  },
  IRON: {
    name: '重金属',
    kanji: '鉄',
    icon: '⚙️',
    color: '#06b6d4', // cyan-500
    bgBadge: 'bg-cyan-500/20',
    textBadge: 'text-cyan-300',
    borderBadge: 'border-cyan-500/50',
  },
};

export const SENGOKU_CARDS: Record<SengokuCardType, SengokuCard> = {
  // ── 場所カード（常時手札・使い捨てではない） ──
  SAKURA: {
    id: 'sakura',
    type: 'SAKURA',
    category: 'LOCATION',
    name: '桜花郷 (桜)',
    kanji: '桜',
    targetResource: 'RICE',
    description: '単独なら【米】を1個獲得。他者と被れば【戦】が発生し勝者が2個総取り！',
    flavor: '舞い散るネオン桜の下、兵糧たる高純度電脳米を収穫する聖域。',
    neonColor: '#f43f5e', // rose-500
    borderColor: 'border-rose-500',
    bgGradient: 'from-rose-950/80 via-purple-950/60 to-slate-950',
    icon: '🌸',
  },
  PINE: {
    id: 'pine',
    type: 'PINE',
    category: 'LOCATION',
    name: '常緑森 (松)',
    kanji: '松',
    targetResource: 'WOOD',
    description: '単独なら【木】を1個獲得。他者と被れば【戦】が発生し勝者が2個総取り！',
    flavor: '千年の樹齢を誇る神木。防壁や要塞の建造に欠かせぬ要資源。',
    neonColor: '#10b981', // emerald-500
    borderColor: 'border-emerald-500',
    bgGradient: 'from-emerald-950/80 via-teal-950/60 to-slate-950',
    icon: '🌲',
  },
  MINE: {
    id: 'mine',
    type: 'MINE',
    category: 'LOCATION',
    name: '霊峰鉱 (鉱山)',
    kanji: '鉱',
    targetResource: 'IRON',
    description: '単独なら【鉄】を1個獲得。他者と被れば【戦】が発生し勝者が2個総取り！',
    flavor: '雷光放つ深層鉱脈。サイバー甲冑と刀剣を鍛え上げる重金属。',
    neonColor: '#06b6d4', // cyan-500
    borderColor: 'border-cyan-500',
    bgGradient: 'from-cyan-950/80 via-blue-950/60 to-slate-950',
    icon: '⛏️',
  },

  // ── イベントカード（使い捨ての特殊戦術札） ──
  RAID: {
    id: 'raid',
    type: 'RAID',
    category: 'EVENT',
    name: '奇襲略奪 (RAID)',
    kanji: '襲',
    description: '【先制発動】指定した相手1人から任意の資源を1つ強奪する。',
    flavor: '影を纏いし電脳忍びが敵陣に潜入、物資を奪取する。',
    neonColor: '#a855f7', // purple-500
    borderColor: 'border-purple-500',
    bgGradient: 'from-purple-950/90 via-fuchsia-950/60 to-slate-950',
    icon: '⚡',
  },
  DUEL: {
    id: 'duel',
    type: 'DUEL',
    category: 'EVENT',
    name: '果たし状 (DUEL)',
    kanji: '闘',
    description: '【先制発動】指定した相手と一騎打ちダイス勝負！勝者が相手から資源を1つ奪取。',
    flavor: '電脳武士道に基づき一騎打ちを宣告。サイコロのみが勝敗を分かつ。',
    neonColor: '#ef4444', // red-500
    borderColor: 'border-red-500',
    bgGradient: 'from-red-950/90 via-orange-950/60 to-slate-950',
    icon: '⚔️',
  },
  DOMINATION: {
    id: 'domination',
    type: 'DOMINATION',
    category: 'EVENT',
    name: '天下布武 (DOMINATION)',
    kanji: '覇',
    description: '【先制発動】このターン、桜・松・鉱山の全3エリアから資源を1つずつ総取り！',
    flavor: '圧倒的な威光をもって天下の富を掌握する覇者の特権。',
    neonColor: '#eab308', // yellow-500
    borderColor: 'border-amber-400',
    bgGradient: 'from-amber-950/90 via-yellow-950/60 to-slate-950',
    icon: '🏯',
  },
  AEGIS: {
    id: 'aegis',
    type: 'AEGIS',
    category: 'EVENT',
    name: '不可侵条約 (AEGIS)',
    kanji: '結',
    description: '【先制発動】戦闘を完全回避し、指定したエリアの資源を確実に2個無傷で獲得！',
    flavor: '絶対防壁の結界を展開し、他者の干渉を断ち切る不可侵協定。',
    neonColor: '#3b82f6', // blue-500
    borderColor: 'border-blue-500',
    bgGradient: 'from-blue-950/90 via-sky-950/60 to-slate-950',
    icon: '🛡️',
  },
  BLACK_MARKET: {
    id: 'black_market',
    type: 'BLACK_MARKET',
    category: 'EVENT',
    name: '闇商人 (MARKET)',
    kanji: '商',
    description: '【先制発動】手持ちの資源1つを差し出し、欲しい任意の資源2つと交換・獲得！',
    flavor: '裏通りの電脳密輸商人と取引し、余剰物資を戦略物資へ変換する。',
    neonColor: '#14b8a6', // teal-500
    borderColor: 'border-teal-500',
    bgGradient: 'from-teal-950/90 via-emerald-950/60 to-slate-950',
    icon: '💱',
  },
};

export const ALL_LOCATION_TYPES: LocationCardType[] = ['SAKURA', 'PINE', 'MINE'];

export const ALL_EVENT_TYPES: EventCardType[] = [
  'RAID',
  'DUEL',
  'DOMINATION',
  'AEGIS',
  'BLACK_MARKET',
];

export const PLAYER_PRESETS = [
  {
    name: '織田ノブナガ (あなた)',
    avatarColor: 'from-rose-600 to-red-900',
    monPattern: '織田木瓜',
    tag: 'P1',
  },
  {
    name: '武田シンゲン (CPU)',
    avatarColor: 'from-amber-600 to-yellow-900',
    monPattern: '武田菱',
    tag: 'P2',
  },
  {
    name: '上杉ケンシン (CPU)',
    avatarColor: 'from-cyan-600 to-blue-900',
    monPattern: '上杉笹',
    tag: 'P3',
  },
  {
    name: '伊達マサムネ (CPU)',
    avatarColor: 'from-purple-600 to-indigo-900',
    monPattern: '伊達三引両',
    tag: 'P4',
  },
];
