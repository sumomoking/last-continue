'use client';

import React, { useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { useOnlineRoom } from '../hooks/useOnlineRoom';
import { SetupScreen } from '../components/game/SetupScreen';
import { LobbyScreen } from '../components/online/LobbyScreen';
import { StageStatusBoard } from '../components/game/StageStatusBoard';
import { PlayerList } from '../components/game/PlayerList';
import { TurnActionPanel } from '../components/game/TurnActionPanel';
import { CardRevealModal } from '../components/game/CardRevealModal';
import { ItemInventory } from '../components/game/ItemInventory';
import { DebugPeekModal } from '../components/game/DebugPeekModal';
import { SaveSelectModal } from '../components/game/SaveSelectModal';
import { RoundStartModal } from '../components/game/RoundStartModal';
import { RoundClearModal } from '../components/game/RoundClearModal';
import { GameOverModal } from '../components/game/GameOverModal';
import { ActionLogDrawer } from '../components/game/ActionLogDrawer';
import { ItemType } from '../types/game';

type PlayMode = 'LOCAL' | 'ONLINE';

export default function GamePage() {
  const [playMode, setPlayMode] = useState<PlayMode>('LOCAL');

  // 1. ローカルゲーム用エンジン
  const localEngine = useGameEngine();

  // 2. オンラインゲーム用エンジン
  const onlineEngine = useOnlineRoom();

  // ── モード別のステート＆ハンドラーの統合 ──
  const isOnline = playMode === 'ONLINE';
  const isOnlinePlaying = isOnline && onlineEngine.currentRoom?.status === 'PLAYING' && !!onlineEngine.currentRoom.gameState;

  // 現在稼働中のゲームステート
  const state = isOnline && onlineEngine.currentRoom?.gameState
    ? onlineEngine.currentRoom.gameState
    : localEngine.state;

  const currentTurnPlayer = state.players[state.currentTurnPlayerIndex];
  const targetPlayer =
    state.targetPlayerIndex !== null ? state.players[state.targetPlayerIndex] : null;
  const actorPlayer = state.players[state.actorPlayerIndex] || currentTurnPlayer;
  const winner = state.players.find((p) => !p.isGameOver);

  // 自分のプレイヤーID（オンライン時のみ）
  const myPlayerId = isOnline ? onlineEngine.myPlayerId : undefined;
  const isMyTurn = !isOnline || (currentTurnPlayer && currentTurnPlayer.id === myPlayerId);

  // アクションハンドラー
  const handlePlayCard = (targetIndex: number) => {
    if (isOnline) {
      if (!isMyTurn) return;
      onlineEngine.playCard(targetIndex);
    } else {
      localEngine.playCard(targetIndex);
    }
  };

  const handleUseItem = (item: ItemType, playerIndex: number) => {
    if (isOnline) {
      onlineEngine.useItem(item, playerIndex);
    } else {
      localEngine.useItem(item, playerIndex);
    }
  };

  const handleOpenSaveModal = (playerIndex: number | null) => {
    if (isOnline) {
      onlineEngine.openSaveModal(playerIndex);
    } else {
      localEngine.openSaveModal(playerIndex);
    }
  };

  const handleConfirmSave = (selectedItem: ItemType) => {
    if (state.saveModalPlayerIndex !== null) {
      if (isOnline) {
        onlineEngine.useItem('SAVE', state.saveModalPlayerIndex, { saveItemType: selectedItem });
      } else {
        localEngine.useItem('SAVE', state.saveModalPlayerIndex, { saveItemType: selectedItem });
      }
    }
  };

  const handleConfirmRoundStart = () => {
    if (isOnline) {
      onlineEngine.confirmRoundStart();
    } else {
      localEngine.confirmRoundStart();
    }
  };

  const handleFinishCardReveal = () => {
    if (isOnline) {
      onlineEngine.finishCardReveal();
    } else {
      localEngine.finishCardReveal();
    }
  };

  const handleResolveCard = () => {
    if (isOnline) {
      onlineEngine.resolveCard();
    } else {
      localEngine.resolveCard();
    }
  };

  const handleNextRound = () => {
    if (isOnline) {
      onlineEngine.nextRound();
    } else {
      localEngine.nextRound();
    }
  };

  const handleCloseDebugPeek = () => {
    if (isOnline) {
      onlineEngine.closeDebugPeek();
    } else {
      localEngine.closeDebugPeek();
    }
  };

  const handleRestartGame = () => {
    if (isOnline) {
      onlineEngine.restartOnlineGame();
    } else {
      localEngine.resetGame();
    }
  };

  // ── 画面レンダリング分岐 ──

  // A. オンラインロビー画面
  if (isOnline && !isOnlinePlaying) {
    return (
      <LobbyScreen
        myPlayerId={onlineEngine.myPlayerId}
        currentRoom={onlineEngine.currentRoom}
        isLoading={onlineEngine.isLoading}
        errorMessage={onlineEngine.errorMessage}
        onCreateRoom={onlineEngine.createRoom}
        onJoinRoom={onlineEngine.joinRoom}
        onLeaveRoom={onlineEngine.leaveRoom}
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
      <SetupScreen
        onStart={localEngine.startGame}
        onSelectOnline={() => setPlayMode('ONLINE')}
      />
    );
  }

  // C. ゲームプレイ画面（ローカル & オンライン共通UI）
  return (
    <main className="min-h-screen bg-[#08090d] text-slate-100 p-3 sm:p-6 flex flex-col items-center justify-between relative selection:bg-cyan-500 selection:text-white">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Online Room Info Top Bar */}
      {isOnline && onlineEngine.currentRoom && (
        <div className="w-full max-w-2xl mb-2 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs relative z-20">
          <div className="flex items-center space-x-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">ROOM:</span>
            <span className="text-cyan-400 font-bold">{onlineEngine.currentRoom.id}</span>
          </div>
          <button
            type="button"
            onClick={onlineEngine.leaveRoom}
            className="text-[11px] font-mono text-red-400 hover:text-red-300 transition cursor-pointer"
          >
            🚪 ルーム退出
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="w-full max-w-2xl text-center pt-2 pb-3 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono tracking-widest text-slate-400 mb-1">
          {isOnline ? '🌐 ONLINE MULTIPLAYER' : '👥 LOCAL PASS & PLAY'}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>LAST</span>
          <span className="text-red-500 underline decoration-red-500/50 decoration-4">
            CONTINUE
          </span>
        </h1>
      </header>

      {/* Main Game Content Area */}
      <div className="w-full max-w-2xl space-y-4 relative z-10 pb-10">
        {/* 1. Stage Info Board */}
        <StageStatusBoard
          round={state.round}
          stageDeck={state.stageDeck}
        />

        {/* 2. Player Status List */}
        <PlayerList
          players={state.players}
          currentTurnPlayerIndex={state.currentTurnPlayerIndex}
        />

        {/* 3. Turn Action Panel */}
        <TurnActionPanel
          currentTurnPlayer={currentTurnPlayer}
          currentTurnPlayerIndex={state.currentTurnPlayerIndex}
          players={state.players}
          glitchedCard={state.glitchedCard}
          continuedCard={state.continuedCard}
          myPlayerId={myPlayerId}
          onPlaySelf={() => handlePlayCard(state.currentTurnPlayerIndex)}
          onPlayTarget={(targetIndex) => handlePlayCard(targetIndex)}
          disabled={state.phase !== 'TURN_ACTION' || (isOnline && !isMyTurn)}
        />

        {/* 4. My Items */}
        <ItemInventory
          players={state.players}
          currentTurnPlayerIndex={state.currentTurnPlayerIndex}
          glitchedCard={state.glitchedCard}
          continuedCard={state.continuedCard}
          myPlayerId={myPlayerId}
          onUseItem={handleUseItem}
          onOpenSaveModal={handleOpenSaveModal}
          disabled={state.phase !== 'TURN_ACTION' || (isOnline && !isMyTurn)}
        />

        {/* 5. Game Logs Drawer */}
        <ActionLogDrawer logs={state.logs} />

        {/* Bottom Menu Buttons */}
        <div className="flex justify-center gap-4 pt-2">
          {isOnline ? (
            <button
              type="button"
              onClick={onlineEngine.leaveRoom}
              className="text-xs font-mono text-slate-500 hover:text-red-400 transition cursor-pointer"
            >
              🚪 ルームを退出してロビーに戻る
            </button>
          ) : (
            <button
              type="button"
              onClick={localEngine.resetGame}
              className="text-xs font-mono text-slate-500 hover:text-slate-400 transition cursor-pointer"
            >
              ↺ ゲームを最初からやり直す
            </button>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* A. Round Start (Dice Roll) Modal */}
      {state.phase === 'ROUND_START' && (
        <RoundStartModal
          round={state.round}
          diceResults={state.diceResults}
          goodCount={state.initialRoundGoodCount}
          badCount={state.initialRoundBadCount}
          totalDeckCount={state.stageDeck.length}
          onConfirm={handleConfirmRoundStart}
        />
      )}

      {/* B. Card Reveal Modal (Flip & Result) */}
      {(state.phase === 'CARD_REVEALING' || state.phase === 'CARD_RESULT') &&
        state.revealedCard &&
        targetPlayer && (
          <CardRevealModal
            card={state.revealedCard}
            actorPlayer={actorPlayer}
            targetPlayer={targetPlayer}
            targetPlayerIndex={state.targetPlayerIndex!}
            glitched={state.glitchedCard}
            continued={state.continuedCard}
            onRevealComplete={handleFinishCardReveal}
            onConfirmResult={handleResolveCard}
            isRevealing={state.phase === 'CARD_REVEALING'}
          />
        )}

      {/* C. DEBUG Peek Modal (オンライン時は覗いた本人のみ表示) */}
      {state.debugPeekCard && (!isOnline || isMyTurn) && (
        <DebugPeekModal card={state.debugPeekCard} onClose={handleCloseDebugPeek} />
      )}

      {/* D. SAVE Select Modal */}
      {state.saveModalPlayerIndex !== null && (!isOnline || (state.players[state.saveModalPlayerIndex]?.id === myPlayerId)) && (
        <SaveSelectModal
          player={state.players[state.saveModalPlayerIndex]}
          playerIndex={state.saveModalPlayerIndex}
          onConfirm={handleConfirmSave}
          onCancel={() => handleOpenSaveModal(null)}
        />
      )}

      {/* E. Round Clear Modal */}
      {state.phase === 'ROUND_CLEAR' && (
        <RoundClearModal round={state.round} onNextRound={handleNextRound} />
      )}

      {/* F. Game Over / Winner Modal */}
      {state.phase === 'GAME_OVER_SUMMARY' && (
        <GameOverModal
          winner={winner}
          players={state.players}
          round={state.round}
          onRestart={handleRestartGame}
        />
      )}
    </main>
  );
}

