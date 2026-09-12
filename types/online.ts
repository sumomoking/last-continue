import { GameState } from './game';
import { ResourceGameState } from './resourceBattle';

export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED' | 'ABORTED';

export interface RoomPlayer {
  id: string; // プレイヤー識別用UUID
  name: string;
  isHost: boolean;
  joinedAt: number;
  isCpu?: boolean;
}

export interface OnlineRoom {
  id: string; // ルームコード (例: LC-4821, RB-4821)
  status: RoomStatus;
  gameType?: 'LAST_CONTINUE' | 'RESOURCE_BATTLE';
  maxPlayers: 2 | 3 | 4;
  hostId: string;
  players: RoomPlayer[];
  gameState: GameState | null;
  resourceGameState?: ResourceGameState | null;
  terminatedReason?: string; // 強制終了理由（例: 〇〇が退出したため）
  updatedAt: number;
  createdAt: number;
}

