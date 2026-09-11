'use client';

import React, { useState, useEffect } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { useOnlineRoom } from '../hooks/useOnlineRoom';
import { SetupScreen } from '../components/game/SetupScreen';
import { LobbyScreen } from '../components/online/LobbyScreen';
import { TabletopBoard } from '../components/tabletop/TabletopBoard';
import { CardRevealModal } from '../components/game/CardRevealModal';
import { DebugPeekModal } from '../components/game/DebugPeekModal';
import { SaveSelectModal } from '../components/game/SaveSelectModal';
import { RoundStartModal } from '../components/game/RoundStartModal';
import { RoundClearModal } from '../components/game/RoundClearModal';
import { GameOverModal } from '../components/game/GameOverModal';
import { ActionLogDrawer } from '../components/game/ActionLogDrawer';
import { ItemActivationCutin } from '../components/game/ItemActivationCutin';
import { ItemType } from '../types/game';
import { soundManager } from '../lib/sound';

type PlayMode = 'LOCAL' | 'ONLINE';

export default function GamePage() {
  const [playMode, setPlayMode] = useState<PlayMode>('LOCAL');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(soundManager.isMuted());
  }, []);

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

  // C. ゲームプレイ画面（本格TCGカードゲームアリーナ）
  return (
    <main className="min-h-screen bg-[#050609] text-slate-100 p-2 sm:p-4 md:p-6 flex flex-col items-center justify-between relative selection:bg-cyan-500 selection:text-white">
      {/* Background Cyber Mat Texture */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,#00e5ff08_0%,transparent_70%)] pointer-events-none" />

      {/* Online Room Info Top Bar */}
      {isOnline && onlineEngine.currentRoom && (
        <div className="w-full max-w-4xl mb-2 flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-xs relative z-20 shadow-md">
          <div className="flex items-center space-x-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">ROOM:</span>
            <span className="text-cyan-400 font-black tracking-wider text-sm">{onlineEngine.currentRoom.id}</span>
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

      {/* Arena Header */}
      <header className="w-full max-w-4xl text-center pt-1 pb-2 relative z-10 flex flex-col items-center">
        <div className="w-full flex items-center justify-between px-2 mb-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] font-mono tracking-widest text-cyan-400">
            {isOnline ? '🌐 ONLINE MULTIPLAYER ARENA' : '🎴 LOCAL PASS & PLAY ARENA'}
          </div>

          <button
            type="button"
            onClick={() => {
              const muted = soundManager.toggleMute();
              setIsMuted(muted);
              if (!muted) soundManager.playClick();
            }}
            className="px-2.5 py-0.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-mono text-slate-300 hover:text-white transition flex items-center gap-1 shadow-sm cursor-pointer"
            title={isMuted ? '効果音をONにする' : '効果音をミュートする'}
          >
            <span>{isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON'}</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>LAST</span>
          <span className="text-red-500 underline decoration-red-500/50 decoration-4">
            CONTINUE
          </span>
        </h1>
      </header>

      {/* Main Tabletop Game Area Container */}
      <div className="w-full max-w-5xl space-y-4 relative z-10 pb-8">
        {/* ── Realistic 3D Tabletop Arena (Board, Seats, Stack Deck, Life Coins & Hand) ── */}
        <TabletopBoard
          round={state.round}
          stageDeck={state.stageDeck}
          initialGoodCount={state.initialRoundGoodCount}
          initialBadCount={state.initialRoundBadCount}
          diceResults={state.diceResults}
          players={state.players}
          currentTurnPlayerIndex={state.currentTurnPlayerIndex}
          perspectivePlayerIndex={
            isOnline
              ? Math.max(0, state.players.findIndex((p) => p.id === myPlayerId))
              : state.currentTurnPlayerIndex
          }
          phase={state.phase}
          isMyTurn={isMyTurn}
          canPlay={state.phase === 'TURN_ACTION'}
          glitchedCard={state.glitchedCard}
          continuedCard={state.continuedCard}
          isOnline={isOnline}
          lastAnnouncement={state.lastUsedItemAnnouncement}
          logs={state.logs}
          onPlaySelf={() => handlePlayCard(state.currentTurnPlayerIndex)}
          onPlayTarget={(targetIndex) => handlePlayCard(targetIndex)}
          onUseItem={(item, pIdx) => handleUseItem(item, pIdx)}
          onOpenSaveModal={(pIdx) => handleOpenSaveModal(pIdx)}
        />

        {/* Action Logs Drawer */}
        <ActionLogDrawer logs={state.logs} />

        {/* Item Activation Flash Cut-in Banner */}
        <ItemActivationCutin announcement={state.lastUsedItemAnnouncement} />

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

