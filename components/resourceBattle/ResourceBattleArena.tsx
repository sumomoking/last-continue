'use client';

import React from 'react';
import { useResourceBattleEngine } from '../../hooks/useResourceBattleEngine';
import { ResourceSetupModal } from './ResourceSetupModal';
import { ResourceTabletop } from './ResourceTabletop';
import { ResourceCombatModal } from './ResourceCombatModal';
import { ResourceRoundSummaryModal } from './ResourceRoundSummaryModal';
import { ResourceScoreModal } from './ResourceScoreModal';

export const ResourceBattleArena: React.FC = () => {
  const engine = useResourceBattleEngine();
  const { state } = engine;

  // 1. セットアップ画面
  if (state.phase === 'SETUP' || state.players.length === 0) {
    return <ResourceSetupModal onStart={engine.initGame} />;
  }

  const currentCombat = state.activeCombats[state.currentCombatIndex];

  return (
    <div className="w-full relative min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-start p-1 sm:p-3 overflow-x-hidden">
      {/* Background Arena Texture */}
      <div className="fixed inset-0 bg-[radial-gradient(#38bdf810_1px,transparent_1px)] bg-[size:1.75rem_1.75rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#0ea5e910_0%,transparent_70%)] pointer-events-none" />

      {/* Main Tabletop Arena */}
      <ResourceTabletop
        state={state}
        onStartCardSelection={engine.startCardSelection}
        onSelectCard={engine.selectCard}
        onResolveReveals={engine.resolveReveals}
        onResetGame={engine.resetGame}
      />

      {/* ── MODALS ── */}

      {/* A. Combat Resolution Modal */}
      {state.phase === 'BATTLE_RESOLUTION' && currentCombat && (
        <ResourceCombatModal
          combat={currentCombat}
          currentCombatIndex={state.currentCombatIndex}
          totalCombats={state.activeCombats.length}
          players={state.players}
          onNext={engine.nextCombatOrFinish}
        />
      )}

      {/* B. Round Summary Modal */}
      {state.phase === 'ROUND_SUMMARY' && (
        <ResourceRoundSummaryModal
          round={state.round}
          maxRounds={state.maxRounds}
          players={state.players}
          onNext={engine.nextRound}
        />
      )}

      {/* C. Final Score Modal */}
      {state.phase === 'GAME_OVER_SUMMARY' && (
        <ResourceScoreModal
          scores={state.finalScores}
          winnerPlayerId={state.winnerPlayerId}
          onRestart={engine.resetGame}
        />
      )}
    </div>
  );
};
