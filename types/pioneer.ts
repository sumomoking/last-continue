// Types for RESOURCIA: Pioneer Resource Battling Game (Catan Style)

export type ResourceType = 'WHEAT' | 'LUMBER' | 'ORE'; // 小麦 (米相当), 木材 (木相当), 鉱石 (鉄相当)

export type TerrainCardType = 'FIELD' | 'FOREST' | 'MOUNTAIN'; // 麦畑 (小麦), 森林 (木材), 鉱山 (鉱石)

export type DevCardType = 
  | 'ROBBER'        // 盗賊の襲撃: 指定開拓者から任意の資源を1つ強奪
  | 'KNIGHT'        // 騎士の派遣: 指定開拓者とダイス勝負！勝者が相手から資源を奪う
  | 'MONOPOLY'      // 資源の独占: 全3エリア（麦畑・森林・鉱山）から資源を1つずつ総取り
  | 'ROADS'         // 街道整備 / 安全開拓: 競争を回避し、指定エリアの資源を安全に2個獲得
  | 'HARBOR_TRADE'; // 港湾貿易: 港の商人と取引し、欲しい資源2個を獲得

export type PioneerCardType = TerrainCardType | DevCardType;

export interface PioneerCard {
  id: string;
  type: PioneerCardType;
  category: 'TERRAIN' | 'DEV';
  name: string;
  japaneseName: string;
  targetResource?: ResourceType;
  description: string;
  flavor: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  icon: string;
}

export interface PioneerPlayer {
  id: string;
  name: string;
  isCpu: boolean;
  colorName: string; // 'RED' | 'BLUE' | 'YELLOW' | 'GREEN'
  colorClass: string;
  meepleIcon: string;
  resources: {
    WHEAT: number;  // 小麦
    LUMBER: number; // 木材
    ORE: number;    // 鉱石
  };
  terrainCards: TerrainCardType[];
  devCards: DevCardType[];
  selectedCard: PioneerCardType | null;
  devTargetPlayerId?: string;
  devTargetResource?: ResourceType;
  diceRoll?: number;
  lastGainedResources?: { WHEAT: number; LUMBER: number; ORE: number };
}

export type PioneerPhase = 
  | 'SETUP'              // 人数・CPU設定
  | 'ROUND_START'        // ラウンド開始
  | 'CARD_SELECT'        // 各開拓者のカード選択（パス＆プレイ / CPU即決）
  | 'REVEAL_ALL'         // 全員一斉オープン
  | 'EVENT_RESOLUTION'   // 発展カード先制処理
  | 'BATTLE_RESOLUTION'  // バッティング「資源争奪」ダイス対決
  | 'ROUND_SUMMARY'      // ラウンド結果・資源獲得まとめ
  | 'GAME_OVER_SUMMARY'; // 最終集計・筆頭開拓者（勝者）決定

export interface ContestGroup {
  terrain: TerrainCardType;
  resource: ResourceType;
  participantPlayerIds: string[];
  rolls: Record<string, number>;
  winnerPlayerId: string | null;
  isTie: boolean;
}

export interface PioneerScoreBreakdown {
  playerId: string;
  playerName: string;
  colorClass: string;
  wheatCount: number;
  lumberCount: number;
  oreCount: number;
  settlementCount: number; // 3種1セット（開拓地完成）
  settlementPoints: number; // 開拓地得点 (+5 VP / 組)
  rawResourcePoints: number; // 余剰資源得点 (+1 VP / 個)
  majorityBonuses: {
    wheat: boolean; // 小麦王 (+3 VP)
    lumber: boolean; // 木材王 (+3 VP)
    ore: boolean; // 鉱石王 (+3 VP)
  };
  majorityPoints: number;
  totalPoints: number; // 合計勝利点 (Victory Points)
  rank: number;
}

export interface PioneerLog {
  id: string;
  round: number;
  message: string;
  type: 'INFO' | 'DEV' | 'CONTEST' | 'WIN' | 'SCORE';
  timestamp: string;
}

export interface PioneerGameState {
  round: number;
  maxRounds: number;
  phase: PioneerPhase;
  players: PioneerPlayer[];
  currentSelectingPlayerIndex: number;
  activeContests: ContestGroup[];
  currentContestIndex: number;
  activeDevsQueue: {
    playerId: string;
    card: DevCardType;
    targetPlayerId?: string;
    targetResource?: ResourceType;
  }[];
  currentDevIndex: number;
  roundLogs: PioneerLog[];
  finalScores: PioneerScoreBreakdown[];
  winnerPlayerId: string | null;
}
