import { GameState } from './game';

export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED' | 'ABORTED';

export interface RoomPlayer {
  id: string; // プレイヤー識別用UUID
  name: string;
  isHost: boolean;
  joinedAt: number;
  isCpu?: boolean;
}

export interface OnlineRoom {
  id: string; // ルームコード (例: LC-4821)
  status: RoomStatus;
  maxPlayers: 3 | 4;
  hostId: string;
  players: RoomPlayer[];
  gameState: GameState | null;
  terminatedReason?: string; // 強制終了理由（例: 〇〇が退出したため）
  updatedAt: number;
  createdAt: number;
}
