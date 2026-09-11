import { GameState } from './game';

export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED';

export interface RoomPlayer {
  id: string; // プレイヤー識別用UUID
  name: string;
  isHost: boolean;
  joinedAt: number;
}

export interface OnlineRoom {
  id: string; // ルームコード (例: LC-4821)
  status: RoomStatus;
  maxPlayers: 3 | 4;
  hostId: string;
  players: RoomPlayer[];
  gameState: GameState | null;
  updatedAt: number;
  createdAt: number;
}
