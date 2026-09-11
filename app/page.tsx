'use client';

import React from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { SetupScreen } from '../components/game/SetupScreen';
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

export default function GamePage() {
  const {
    state,
    startGame,
    confirmRoundStart,
    playCard,
    finishCardReveal,
    resolveCard,
    nextRound,
    useItem,
    closeDebugPeek,
    openSaveModal,
    resetGame,
  } = useGameEngine();

  // 1. セットアップ画面
  if (state.phase === 'SETUP' || state.players.length === 0) {
    return <SetupScreen onStart={startGame} />;
  }

  const currentTurnPlayer = state.players[state.currentTurnPlayerIndex];
  const targetPlayer =
    state.targetPlayerIndex !== null ? state.players[state.targetPlayerIndex] : null;
  const actorPlayer = state.players[state.actorPlayerIndex] || currentTurnPlayer;

  // 生存している勝者
  const winner = state.players.find((p) => !p.isGameOver);

  const handleUseItem = (item: ItemType, playerIndex: number) => {
    useItem(item, playerIndex);
  };

  const handleConfirmSave = (selectedItem: ItemType) => {
    if (state.saveModalPlayerIndex !== null) {
      useItem('SAVE', state.saveModalPlayerIndex, { saveItemType: selectedItem });
    }
  };

  return (
    <main className="min-h-screen bg-[#08090d] text-slate-100 p-3 sm:p-6 flex flex-col items-center justify-between relative selection:bg-cyan-500 selection:text-white">
      {/* Background Cyber Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-2xl text-center pt-2 pb-4 relative z-10">
        <div className="inline-block px-3 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono tracking-widest text-slate-400 mb-1">
          PSYCHOLOGICAL CARD BATTLE
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>LAST</span>
          <span className="text-red-500 underline decoration-red-500/50 decoration-4">
            CONTINUE
          </span>
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-400 mt-0.5">
          「次の1PLAY、誰が挑戦する？」
        </p>
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
          onPlaySelf={() => playCard(state.currentTurnPlayerIndex)}
          onPlayTarget={(targetIndex) => playCard(targetIndex)}
          disabled={state.phase !== 'TURN_ACTION'}
        />

        {/* 4. My Items */}
        <ItemInventory
          players={state.players}
          currentTurnPlayerIndex={state.currentTurnPlayerIndex}
          glitchedCard={state.glitchedCard}
          continuedCard={state.continuedCard}
          onUseItem={handleUseItem}
          onOpenSaveModal={openSaveModal}
          disabled={state.phase !== 'TURN_ACTION'}
        />

        {/* 5. Game Logs Drawer */}
        <ActionLogDrawer logs={state.logs} />

        {/* Bottom Menu Buttons */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={resetGame}
            className="text-xs font-mono text-slate-500 hover:text-slate-400 transition cursor-pointer"
          >
            ↺ ゲームを最初からやり直す
          </button>
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
          onConfirm={confirmRoundStart}
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
            onRevealComplete={finishCardReveal}
            onConfirmResult={resolveCard}
            isRevealing={state.phase === 'CARD_REVEALING'}
          />
        )}

      {/* C. DEBUG Peek Modal */}
      {state.debugPeekCard && (
        <DebugPeekModal card={state.debugPeekCard} onClose={closeDebugPeek} />
      )}

      {/* D. SAVE Select Modal */}
      {state.saveModalPlayerIndex !== null && (
        <SaveSelectModal
          player={state.players[state.saveModalPlayerIndex]}
          playerIndex={state.saveModalPlayerIndex}
          onConfirm={handleConfirmSave}
          onCancel={() => openSaveModal(null)}
        />
      )}

      {/* E. Round Clear Modal */}
      {state.phase === 'ROUND_CLEAR' && (
        <RoundClearModal round={state.round} onNextRound={nextRound} />
      )}

      {/* F. Game Over / Winner Modal */}
      {state.phase === 'GAME_OVER_SUMMARY' && (
        <GameOverModal
          winner={winner}
          players={state.players}
          round={state.round}
          onRestart={resetGame}
        />
      )}
    </main>
  );
}
