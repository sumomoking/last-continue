// Types for Sengoku Protocol: Resource Battling Game

export type ResourceType = 'RICE' | 'WOOD' | 'IRON'; // 米, 木, 鉄

export type LocationCardType = 'SAKURA' | 'PINE' | 'MINE'; // 桜 (米), 松 (木), 鉱山 (鉄)

export type EventCardType = 
  | 'RAID'          // 奇襲略奪: 指定した相手から任意の資源を1つ強奪
  | 'DUEL'          // 果たし状: 指定した相手とタイマンダイス勝負。勝者が相手の資源を奪う
  | 'DOMINATION'    // 天下布武: 全エリアの資源を1つずつ総取り
  | 'AEGIS'         // 不可侵条約: 戦闘を回避し、指定エリアの資源を安全に2個獲得
  | 'BLACK_MARKET'; // 闇商人: 手持ちの資源を任意の欲しい資源2つと交換

export type SengokuCardType = LocationCardType | EventCardType;

export interface SengokuCard {
  id: string;
  type: SengokuCardType;
  category: 'LOCATION' | 'EVENT';
  name: string;
  kanji: string;
  targetResource?: ResourceType;
  description: string;
  flavor: string;
  neonColor: string;
  borderColor: string;
  bgGradient: string;
  icon: string;
}

export interface SengokuPlayer {
  id: string;
  name: string;
  isCpu: boolean;
  avatarColor: string;
  monPattern: string; // 家紋デザイン名
  resources: {
    RICE: number; // 米
    WOOD: number; // 木
    IRON: number; // 鉄
  };
  // 手札（場所カードは毎ターン何度でも使える、イベントカードは使い捨て）
  locationCards: LocationCardType[];
  eventCards: EventCardType[];
  // 今ターン選んだカード
  selectedCard: SengokuCardType | null;
  // 今ターンのイベントターゲット（必要な場合）
  eventTargetPlayerId?: string;
  eventTargetResource?: ResourceType;
  // 今ターンのダイス目（戦闘時）
  diceRoll?: number;
  // 前ターンの獲得資源
  lastGainedResources?: { RICE: number; WOOD: number; IRON: number };
}

export type SengokuPhase = 
  | 'SETUP'              // 人数・CPU設定
  | 'ROUND_START'        // ラウンド開始アナウンス
  | 'CARD_SELECT'        // 各プレイヤーの札選択（パス＆プレイ / CPU即決）
  | 'REVEAL_ALL'         // 全員オープン・演出
  | 'EVENT_RESOLUTION'   // イベントカード先制処理
  | 'BATTLE_RESOLUTION'  // バッティング「戦」ダイスバトル処理
  | 'ROUND_SUMMARY'      // ラウンド結果・資源獲得まとめ
  | 'GAME_OVER_SUMMARY'; // 最終集計・天下統一者決定

export interface BattleGroup {
  location: LocationCardType;
  resource: ResourceType;
  participantPlayerIds: string[];
  rolls: Record<string, number>; // playerId -> dice roll
  winnerPlayerId: string | null;
  isTie: boolean;
}

export interface SengokuScoreBreakdown {
  playerId: string;
  playerName: string;
  riceCount: number;
  woodCount: number;
  ironCount: number;
  setCount: number; // 3種1セットの数
  setPoints: number; // セット点 (+5 / set)
  rawResourcePoints: number; // 余り資源 (+1 / item)
  majorityBonuses: {
    rice: boolean; // 最多米 (+3)
    wood: boolean; // 最多木 (+3)
    iron: boolean; // 最多鉄 (+3)
  };
  majorityPoints: number;
  totalPoints: number;
  rank: number;
}

export interface SengokuLog {
  id: string;
  round: number;
  message: string;
  type: 'INFO' | 'EVENT' | 'BATTLE' | 'WIN' | 'SCORE';
  timestamp: string;
}

export interface SengokuGameState {
  round: number;
  maxRounds: number;
  phase: SengokuPhase;
  players: SengokuPlayer[];
  currentSelectingPlayerIndex: number; // 札選択中の人間プレイヤーのインデックス（パス＆プレイ用）
  activeBattles: BattleGroup[];
  currentBattleIndex: number;
  activeEventsQueue: {
    playerId: string;
    card: EventCardType;
    targetPlayerId?: string;
    targetResource?: ResourceType;
  }[];
  currentEventIndex: number;
  roundLogs: SengokuLog[];
  finalScores: SengokuScoreBreakdown[];
  winnerPlayerId: string | null;
}
