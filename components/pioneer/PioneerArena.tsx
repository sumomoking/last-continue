'use client';

import React from 'react';
import { usePioneerEngine } from '../../hooks/usePioneerEngine';
import { PioneerSetupModal } from './PioneerSetupModal';
import { PioneerTabletop } from './PioneerTabletop';
import { PioneerBattleModal } from './PioneerBattleModal';
import { PioneerRoundSummaryModal } from './PioneerRoundSummaryModal';
import { PioneerScoreModal } from './PioneerScoreModal';

export const PioneerArena: React.FC = () => {
  const engine = usePioneerEngine();
  const { state } = engine;

  // 1. セットアップ画面
  if (state.phase === 'SETUP' || state.players.length === 0) {
    return <PioneerSetupModal onStart={engine.initGame} />;
  }

  const currentContest = state.activeContests[state.currentContestIndex];

  return (
    <div className="w-full relative min-h-screen bg-[#110d0a] text-stone-100 flex flex-col items-center justify-start p-1 sm:p-3 overflow-x-hidden">
      {/* Background Wood Table & Island Felt Texture */}
      <div className="fixed inset-0 bg-[radial-gradient(#d9770615_1px,transparent_1px)] bg-[size:1.75rem_1.75rem] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,#f59e0b12_0%,transparent_70%)] pointer-events-none" />

      {/* Main Tabletop Arena */}
      <PioneerTabletop
        state={state}
        onStartCardSelection={engine.startCardSelection}
        onSelectCard={engine.selectCard}
        onResolveReveals={engine.resolveReveals}
        onResetGame={engine.resetGame}
      />

      {/* ── MODALS ── */}

      {/* A. Contest (Battle) Resolution Modal */}
      {state.phase === 'BATTLE_RESOLUTION' && currentContest && (
        <PioneerBattleModal
          contest={currentContest}
          currentContestIndex={state.currentContestIndex}
          totalContests={state.activeContests.length}
          players={state.players}
          onNext={engine.nextContestOrFinish}
        />
      )}

      {/* B. Round Summary Modal */}
      {state.phase === 'ROUND_SUMMARY' && (
        <PioneerRoundSummaryModal
          round={state.round}
          maxRounds={state.maxRounds}
          players={state.players}
          onNext={engine.nextRound}
        />
      )}

      {/* C. Game Over & Victory Modal */}
      {state.phase === 'GAME_OVER_SUMMARY' && (
        <PioneerScoreModal
          scores={state.finalScores}
          winnerPlayerId={state.winnerPlayerId}
          onRestart={engine.resetGame}
        />
      )}
    </div>
  );
};
