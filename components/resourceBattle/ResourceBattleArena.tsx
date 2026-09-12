'use client';

import React, { useState } from 'react';
import { useResourceBattleEngine } from '../../hooks/useResourceBattleEngine';
import { useResourceOnlineRoom } from '../../hooks/useResourceOnlineRoom';
import { ResourceSetupModal } from './ResourceSetupModal';
import { ResourceLobbyScreen } from './ResourceLobbyScreen';
import { ResourceTabletop } from './ResourceTabletop';
import { ResourceCombatModal } from './ResourceCombatModal';
import { ResourceRoundSummaryModal } from './ResourceRoundSummaryModal';
import { ResourceScoreModal } from './ResourceScoreModal';

type PlayMode = 'LOCAL' | 'ONLINE';

export const ResourceBattleArena: React.FC = () => {
  const [playMode, setPlayMode] = useState<PlayMode>('LOCAL');

  // 1. ローカルゲーム用エンジン
  const localEngine = useResourceBattleEngine();

  // 2. オンラインゲーム用エンジン
  const onlineEngine = useResourceOnlineRoom();

  const isOnline = playMode === 'ONLINE';
  const isOnlinePlaying =
    isOnline &&
    onlineEngine.currentRoom?.status === 'PLAYING' &&
    !!onlineEngine.currentRoom.resourceGameState;

  // 現在稼働中のゲームステート
  const state =
    isOnline && onlineEngine.currentRoom?.resourceGameState
      ? onlineEngine.currentRoom.resourceGameState
      : localEngine.state;

  // ── 画面レンダリング分岐 ──

  // A. オンラインロビー画面
  if (isOnline && !isOnlinePlaying) {
    return (
      <ResourceLobbyScreen
        myPlayerId={onlineEngine.myPlayerId}
        currentRoom={onlineEngine.currentRoom}
        isLoading={onlineEngine.isLoading}
        errorMessage={onlineEngine.errorMessage}
        onCreateRoom={onlineEngine.createRoom}
        onJoinRoom={onlineEngine.joinRoom}
        onLeaveRoom={onlineEngine.leaveRoom}
        onAddCpuPlayer={onlineEngine.addCpuPlayer}
        onRemoveCpuPlayer={onlineEngine.removeCpuPlayer}
        onStartGame={onlineEngine.startOnlineGame}
        onBackToLocal={() => {
          onlineEngine.leaveRoom();
          setPlayMode('LOCAL');
        }}
      />
    );
  }

  // B. ローカルセットアップ画面
  if (!isOnline && (state.phase === 'SETUP' || state.players.length === 0)) {
    return (
      <ResourceSetupModal
        onStart={localEngine.initGame}
        onSelectOnline={() => setPlayMode('ONLINE')}
      />
    );
  }

  const currentCombat = state.activeCombats[state.currentCombatIndex];

  return (
    <div className="w-full relative min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-start p-1 sm:p-3 overflow-x-hidden">
      {/* Background Arena Texture */}
      <div className="fixed inset-0 bg-[radial-gradient(#38bdf810_1px,transparent_1px)] bg-[size:1.75rem_1.75rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#0ea5e910_0%,transparent_70%)] pointer-events-none" />

      {/* Online Room Info Top Bar */}
      {isOnline && onlineEngine.currentRoom && (
        <div className="w-full max-w-5xl mb-2 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs relative z-20 shadow-md">
          <div className="flex items-center space-x-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">ROOM:</span>
            <span className="text-amber-400 font-black tracking-wider text-sm">
              {onlineEngine.currentRoom.id}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline font-sans">
              (オンライン同期中)
            </span>
          </div>
          <button
            type="button"
            onClick={onlineEngine.leaveRoom}
            className="text-[11px] font-mono text-red-400 hover:text-red-300 transition cursor-pointer flex items-center gap-1"
          >
            <span>🚪</span>
            <span>ルーム退出</span>
          </button>
        </div>
      )}

      {/* Main Tabletop Arena */}
      <ResourceTabletop
        state={state}
        isOnline={isOnline}
        myPlayerId={isOnline ? onlineEngine.myPlayerId : undefined}
        onStartCardSelection={
          isOnline ? onlineEngine.startCardSelection : localEngine.startCardSelection
        }
        onSelectCard={
          isOnline ? onlineEngine.selectCard : localEngine.selectCard
        }
        onResolveReveals={
          isOnline ? onlineEngine.resolveReveals : localEngine.resolveReveals
        }
        onResetGame={
          isOnline ? onlineEngine.leaveRoom : localEngine.resetGame
        }
      />

      {/* ── MODALS ── */}

      {/* A. Combat Resolution Modal */}
      {state.phase === 'BATTLE_RESOLUTION' && currentCombat && (
        <ResourceCombatModal
          combat={currentCombat}
          currentCombatIndex={state.currentCombatIndex}
          totalCombats={state.activeCombats.length}
          players={state.players}
          onNext={
            isOnline ? onlineEngine.nextCombatOrFinish : localEngine.nextCombatOrFinish
          }
        />
      )}

      {/* B. Round Summary Modal */}
      {state.phase === 'ROUND_SUMMARY' && (
        <ResourceRoundSummaryModal
          round={state.round}
          maxRounds={state.maxRounds}
          players={state.players}
          onNext={isOnline ? onlineEngine.nextRound : localEngine.nextRound}
        />
      )}

      {/* C. Final Score Modal */}
      {state.phase === 'GAME_OVER_SUMMARY' && (
        <ResourceScoreModal
          scores={state.finalScores}
          winnerPlayerId={state.winnerPlayerId}
          onRestart={
            isOnline ? onlineEngine.restartOnlineGame : localEngine.resetGame
          }
        />
      )}
    </div>
  );
};
