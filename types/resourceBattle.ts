// Types for Resource Battling Card Game (Exact Rules as Specified)

export type ResourceType = 'WOOD' | 'RICE' | 'IRON'; // 木, 米, 鉄

export type LocationCardType = 'FOREST' | 'FIELD' | 'MINE'; // 森 (木), 畑 (米), 鉱山 (鉄)

export type EventCardType = 
  | 'ALL_AREAS'      // 全エリアの選択: 全てのエリアから「木・米・鉄」を1つずつ獲得
  | 'STEAL_RESOURCE' // 資源を奪う: 特定のプレイヤーを指定し、指定された資源を1つ奪う
  | 'CHALLENGE'      // 特定のプレイヤーと戦う: 指定プレイヤーとサイコロ戦闘、勝者が相手から資源を奪う
  | 'DICE_PLUS_TWO'  // 出目＋2: 戦闘時、自分の出目に＋2の補正
  | 'DICE_MINUS_TWO';// 相手の出目－2: 戦闘時、相手の出目に－2の補正

export type GameCardType = LocationCardType | EventCardType;

export interface GameCard {
  id: string;
  type: GameCardType;
  category: 'LOCATION' | 'EVENT';
  name: string;
  kanji: string;
  targetResource?: ResourceType;
  description: string;
  icon: string;
  color: string;
}

export interface BattlePlayer {
  id: string;
  name: string;
  isCpu: boolean;
  colorBadge: string;
  resources: {
    WOOD: number; // 木
    RICE: number; // 米
    IRON: number; // 鉄
  };
  locationCards: LocationCardType[]; // 「森」「畑」「鉱山」
  eventCards: EventCardType[];       // 配られたイベントカード
  selectedCard: GameCardType | null; // 今ターン選んだカード
  eventTargetPlayerId?: string;
  eventTargetResource?: ResourceType;
  diceRoll?: number;
  diceModifier?: number; // 出目補正（+2 または -2）
  finalRoll?: number;
  lastGainedResources?: { WOOD: number; RICE: number; IRON: number };
}

export type BattlePhase = 
  | 'SETUP'              // 参加人数・CPU設定
  | 'ROUND_START'        // ラウンド開始
  | 'CARD_SELECT'        // 各自カードを裏向きで選択
  | 'REVEAL_ALL'         // 全員一斉に表向きに公開
  | 'EVENT_RESOLUTION'   // イベントカードの先制実行
  | 'BATTLE_RESOLUTION'  // 被りによる「戦（戦闘）」サイコロ勝負
  | 'ROUND_SUMMARY'      // ターンの結果・資源集計
  | 'GAME_OVER_SUMMARY'; // 最終ポイント計算・勝敗判定

export interface CombatGroup {
  location: LocationCardType;
  resource: ResourceType;
  participantPlayerIds: string[];
  rawRolls: Record<string, number>;
  modifiers: Record<string, number>;
  finalRolls: Record<string, number>;
  winnerPlayerId: string | null;
  isTie: boolean;
}

export interface ScoreSummary {
  playerId: string;
  playerName: string;
  woodCount: number;
  riceCount: number;
  ironCount: number;
  setCount: number; // 「木・米・鉄」1セットにつき1P
  setPoints: number; // 1セット = 1P
  majorityBonuses: {
    wood: boolean; // 木の最多所持 (+2P)
    rice: boolean; // 米の最多所持 (+2P)
    iron: boolean; // 鉄の最多所持 (+2P)
  };
  majorityPoints: number; // 各最多 = 2P
  totalPoints: number;    // 合計ポイント = セット点 + 最多ボーナス
  rank: number;
}

export interface ActionLog {
  id: string;
  round: number;
  message: string;
  type: 'INFO' | 'EVENT' | 'BATTLE' | 'WIN' | 'SCORE';
  timestamp: string;
}

export interface ResourceGameState {
  round: number;
  maxRounds: number;
  phase: BattlePhase;
  players: BattlePlayer[];
  currentSelectingPlayerIndex: number;
  activeCombats: CombatGroup[];
  currentCombatIndex: number;
  activeEventsQueue: {
    playerId: string;
    card: EventCardType;
    targetPlayerId?: string;
    targetResource?: ResourceType;
  }[];
  currentEventIndex: number;
  logs: ActionLog[];
  finalScores: ScoreSummary[];
  winnerPlayerId: string | null;
}
