'use client';

import React from 'react';
import { useSengokuEngine } from '../../hooks/useSengokuEngine';
import { SengokuSetupModal } from './SengokuSetupModal';
import { SengokuTabletop } from './SengokuTabletop';
import { SengokuBattleModal } from './SengokuBattleModal';
import { SengokuRoundSummaryModal } from './SengokuRoundSummaryModal';
import { SengokuScoreModal } from './SengokuScoreModal';

export const SengokuArena: React.FC = () => {
  const engine = useSengokuEngine();
  const { state } = engine;

  // 1. セットアップ画面
  if (state.phase === 'SETUP' || state.players.length === 0) {
    return <SengokuSetupModal onStart={engine.initGame} />;
  }

  const currentBattle = state.activeBattles[state.currentBattleIndex];

  return (
    <div className="w-full relative min-h-screen bg-[#06080e] text-slate-100 flex flex-col items-center justify-start p-1 sm:p-3 overflow-x-hidden">
      {/* Background Cyber Japanese Grid & Neon Sakura Petals Texture */}
      <div className="fixed inset-0 bg-[radial-gradient(#f59e0b0d_1px,transparent_1px)] bg-[size:1.75rem_1.75rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#f59e0b10_0%,transparent_60%)] pointer-events-none" />

      {/* Main Tabletop Arena */}
      <SengokuTabletop
        state={state}
        onStartCardSelection={engine.startCardSelection}
        onSelectCard={engine.selectCard}
        onResolveReveals={engine.resolveReveals}
        onResetGame={engine.resetGame}
      />

      {/* ── MODALS ── */}

      {/* A. Battle Resolution Modal */}
      {state.phase === 'BATTLE_RESOLUTION' && currentBattle && (
        <SengokuBattleModal
          battle={currentBattle}
          currentBattleIndex={state.currentBattleIndex}
          totalBattles={state.activeBattles.length}
          players={state.players}
          onNext={engine.nextBattleOrFinish}
        />
      )}

      {/* B. Round Summary Modal */}
      {state.phase === 'ROUND_SUMMARY' && (
        <SengokuRoundSummaryModal
          round={state.round}
          maxRounds={state.maxRounds}
          players={state.players}
          onNext={engine.nextRound}
        />
      )}

      {/* C. Game Over & Winner Modal */}
      {state.phase === 'GAME_OVER_SUMMARY' && (
        <SengokuScoreModal
          scores={state.finalScores}
          winnerPlayerId={state.winnerPlayerId}
          onRestart={engine.resetGame}
        />
      )}
    </div>
  );
};
