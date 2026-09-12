import {
  PioneerCard,
  PioneerCardType,
  TerrainCardType,
  DevCardType,
  ResourceType,
} from '../types/pioneer';

export const PIONEER_MAX_ROUNDS = 5;

export const RESOURCE_CONFIG: Record<
  ResourceType,
  {
    name: string;
    japaneseName: string;
    icon: string;
    color: string;
    bgBadge: string;
    textBadge: string;
    borderBadge: string;
    description: string;
  }
> = {
  WHEAT: {
    name: 'Wheat',
    japaneseName: '小麦',
    icon: '🌾',
    color: '#eab308', // gold / yellow
    bgBadge: 'bg-amber-500/20',
    textBadge: 'text-amber-300',
    borderBadge: 'border-amber-500/50',
    description: '開拓民の命を支える黄金の穀物。',
  },
  LUMBER: {
    name: 'Lumber',
    japaneseName: '木材',
    icon: '🪵',
    color: '#16a34a', // lush forest green
    bgBadge: 'bg-emerald-600/20',
    textBadge: 'text-emerald-300',
    borderBadge: 'border-emerald-500/50',
    description: '開拓地や街道の建築に必須の木材。',
  },
  ORE: {
    name: 'Ore',
    japaneseName: '鉱石',
    icon: '⛏️',
    color: '#64748b', // slate / iron ore
    bgBadge: 'bg-slate-500/20',
    textBadge: 'text-slate-200',
    borderBadge: 'border-slate-400/50',
    description: '都市の発展や頑丈な道具を生む鉱石。',
  },
};

export const PIONEER_CARDS: Record<PioneerCardType, PioneerCard> = {
  // ── 地形カード（常時手札・使い捨てではない） ──
  FIELD: {
    id: 'field',
    type: 'FIELD',
    category: 'TERRAIN',
    name: '黄金の麦畑 (FIELD)',
    japaneseName: '麦畑',
    targetResource: 'WHEAT',
    description: '単独なら【小麦】を1個収穫。他者と被れば【資源争奪】が発生しダイス勝者が2個総取り！',
    flavor: '風にそよぐ肥沃な麦畑。豊かな実りが開拓地を満たす。',
    accentColor: '#f59e0b',
    borderColor: 'border-amber-500',
    bgGradient: 'from-amber-950/80 via-yellow-950/40 to-stone-900',
    icon: '🌾',
  },
  FOREST: {
    id: 'forest',
    type: 'FOREST',
    category: 'TERRAIN',
    name: '深緑の森林 (FOREST)',
    japaneseName: '森林',
    targetResource: 'LUMBER',
    description: '単独なら【木材】を1個伐採。他者と被れば【資源争奪】が発生しダイス勝者が2個総取り！',
    flavor: '巨木が生い茂る原生林。強固な木材を供給する。',
    accentColor: '#10b981',
    borderColor: 'border-emerald-600',
    bgGradient: 'from-emerald-950/80 via-teal-950/40 to-stone-900',
    icon: '🌲',
  },
  MOUNTAIN: {
    id: 'mountain',
    type: 'MOUNTAIN',
    category: 'TERRAIN',
    name: '険峰の鉱山 (MOUNTAIN)',
    japaneseName: '鉱山',
    targetResource: 'ORE',
    description: '単独なら【鉱石】を1個採掘。他者と被れば【資源争奪】が発生しダイス勝者が2個総取り！',
    flavor: '雲を突く岩山。深層から重厚な鉱石を産出する。',
    accentColor: '#60a5fa',
    borderColor: 'border-sky-600',
    bgGradient: 'from-slate-900 via-blue-950/40 to-stone-900',
    icon: '⛰️',
  },

  // ── 発展カード（使い捨ての特殊戦術札） ──
  ROBBER: {
    id: 'robber',
    type: 'ROBBER',
    category: 'DEV',
    name: '盗賊の襲撃 (ROBBER)',
    japaneseName: '盗賊',
    description: '【先制発動】指定した開拓者1人から任意の資源を1つ強奪する。',
    flavor: '荒野の盗賊団を雇い、ライバルの保管庫から物資を奪い去る。',
    accentColor: '#ef4444',
    borderColor: 'border-red-500',
    bgGradient: 'from-red-950/90 via-stone-900 to-stone-950',
    icon: '🏴‍☠️',
  },
  KNIGHT: {
    id: 'knight',
    type: 'KNIGHT',
    category: 'DEV',
    name: '騎士の派遣 (KNIGHT)',
    japaneseName: '騎士',
    description: '【先制発動】指定した開拓者とダイス勝負！勝者が相手から資源を1つ奪取。',
    flavor: '領地の騎士を派遣し、開拓境界で決闘を挑む。',
    accentColor: '#8b5cf6',
    borderColor: 'border-purple-500',
    bgGradient: 'from-purple-950/90 via-indigo-950/40 to-stone-950',
    icon: '⚔️',
  },
  MONOPOLY: {
    id: 'monopoly',
    type: 'MONOPOLY',
    category: 'DEV',
    name: '独占宣言 (MONOPOLY)',
    japaneseName: '独占',
    description: '【先制発動】このターン、麦畑・森林・鉱山の全3エリアから資源を1つずつ総取り！',
    flavor: '島全体の市場を独占し、すべての特産品を一度に手中に収める。',
    accentColor: '#f59e0b',
    borderColor: 'border-amber-400',
    bgGradient: 'from-amber-950/90 via-yellow-950/40 to-stone-950',
    icon: '🏛️',
  },
  ROADS: {
    id: 'roads',
    type: 'ROADS',
    category: 'DEV',
    name: '街道の整備 (ROADS)',
    japaneseName: '街道',
    description: '【先制発動】争奪を完全回避し、指定したエリアの資源を安全に2個獲得！',
    flavor: '新たな街道を開通させ、安全かつ迅速に大量の物資を輸送する。',
    accentColor: '#3b82f6',
    borderColor: 'border-blue-500',
    bgGradient: 'from-blue-950/90 via-sky-950/40 to-stone-950',
    icon: '🛡️',
  },
  HARBOR_TRADE: {
    id: 'harbor_trade',
    type: 'HARBOR_TRADE',
    category: 'DEV',
    name: '港湾貿易 (HARBOR)',
    japaneseName: '港湾',
    description: '【先制発動】港の商人と取引し、欲しい任意の資源2個を獲得！',
    flavor: '海外から寄港した貿易船と有利なレートで交易を行う。',
    accentColor: '#06b6d4',
    borderColor: 'border-cyan-500',
    bgGradient: 'from-cyan-950/90 via-teal-950/40 to-stone-950',
    icon: '⛵',
  },
};

export const ALL_TERRAIN_TYPES: TerrainCardType[] = ['FIELD', 'FOREST', 'MOUNTAIN'];

export const ALL_DEV_TYPES: DevCardType[] = [
  'ROBBER',
  'KNIGHT',
  'MONOPOLY',
  'ROADS',
  'HARBOR_TRADE',
];

export const PIONEER_PRESETS = [
  {
    name: '青の開拓団 (あなた)',
    colorName: 'BLUE',
    colorClass: 'from-blue-600 to-indigo-800 border-blue-400 text-blue-400',
    meepleIcon: '🔵',
  },
  {
    name: '赤の開拓団 (CPU)',
    colorName: 'RED',
    colorClass: 'from-red-600 to-rose-800 border-red-400 text-red-400',
    meepleIcon: '🔴',
  },
  {
    name: '黄の開拓団 (CPU)',
    colorName: 'YELLOW',
    colorClass: 'from-amber-500 to-yellow-700 border-amber-400 text-amber-400',
    meepleIcon: '🟡',
  },
  {
    name: '緑の開拓団 (CPU)',
    colorName: 'GREEN',
    colorClass: 'from-emerald-600 to-green-800 border-emerald-400 text-emerald-400',
    meepleIcon: '🟢',
  },
];
