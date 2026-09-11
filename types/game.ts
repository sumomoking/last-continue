export type CardType = 'GOOD' | 'BAD';

export type ItemType = 'DEBUG' | 'RESET' | 'SAVE' | '1UP' | 'CONTINUE' | 'GLITCH';

export interface ItemInfo {
  id: ItemType;
  name: string;
  icon: string;
  description: string;
  timing: string;
  canUseInTurn: boolean;
}

export interface Player {
  id: string;
  name: string;
  lives: number; // 0~3
  items: ItemType[];
  savedItem: ItemType | null; // SAVEでセットしたアイテム
  isGameOver: boolean;
}

export type GamePhase =
  | 'SETUP' // プレイヤー人数・名前設定
  | 'ROUND_START' // ダイスロール演出・デッキ生成確認
  | 'TURN_ACTION' // 自分がPLAY or 他人にPLAY
  | 'CARD_REVEALING' // カードめくり演出中
  | 'CARD_RESULT' // 結果表示（アイテム割り込み可能: CONTINUE / GLITCH）
  | 'ROUND_CLEAR' // ラウンドクリア演出
  | 'GAME_OVER_SUMMARY'; // 勝者決定

export interface GameLog {
  id: string;
  text: string;
  timestamp: string;
  type?: 'good' | 'bad' | 'item' | 'system' | 'round';
}

export interface ItemAnnouncement {
  id: string;
  playerIndex: number;
  playerName: string;
  item: ItemType;
  message: string;
  timestamp: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentTurnPlayerIndex: number;
  targetPlayerIndex: number | null; // 他人にPLAYさせた場合の対象プレイヤー
  actorPlayerIndex: number; // アクションを起こしたプレイヤー（手番プレイヤー）
  round: number;
  stageDeck: CardType[];
  initialRoundGoodCount: number;
  initialRoundBadCount: number;
  diceResults: [number, number];
  revealedCard: CardType | null;
  glitchedCard: boolean; // GLITCHで無効化されたか
  continuedCard: boolean; // CONTINUEで無効化されたか
  itemDeck: ItemType[];
  logs: GameLog[];
  debugPeekCard: CardType | null; // DEBUGアイテムで覗き見たカード
  saveModalPlayerIndex: number | null; // SAVE使用時に手札から選ぶモード
  lastUsedItemAnnouncement?: ItemAnnouncement | null; // アイテム使用時のカットイン通知
}
