'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CardType, Player } from '../../types/game';
import { soundManager } from '../../lib/sound';

interface CardRevealModalProps {
  card: CardType;
  actorPlayer: Player;
  targetPlayer: Player;
  targetPlayerIndex: number;
  glitched: boolean;
  continued: boolean;
  onRevealComplete: () => void;
  onConfirmResult: () => void;
  isRevealing: boolean;
}

export const CardRevealModal: React.FC<CardRevealModalProps> = ({
  card,
  actorPlayer,
  targetPlayer,
  glitched,
  continued,
  onRevealComplete,
  onConfirmResult,
  isRevealing,
}) => {
  const [isFlipped, setIsFlipped] = useState(!isRevealing);
  const [timeLeft, setTimeLeft] = useState(3);
  const isSelf = actorPlayer.id === targetPlayer.id;

  const hasTriggeredRef = useRef(false);

  // GLITCH発動時はGOOD/BADを反転
  const effectiveCard: CardType = glitched ? (card === 'GOOD' ? 'BAD' : 'GOOD') : card;

  // 1. 自動カードめくり（少しのタメを作ってから自動でオープン & 音声再生）
  useEffect(() => {
    hasTriggeredRef.current = false;
    setTimeLeft(3);

    // 350ms 後に自動でフリップアニメーション開始 & カードフリップ音
    const flipTimer = setTimeout(() => {
      setIsFlipped(true);
      soundManager.playCardFlip();
    }, 350);

    // 700ms 後にカード表面の効果音（GOOD or BAD）を再生
    const soundTimer = setTimeout(() => {
      if (effectiveCard === 'GOOD') {
        soundManager.playGoodStage();
      } else {
        soundManager.playBadStage();
      }
    }, 700);

    // 1050ms (350ms + 700msフリップ完了後) にフェーズを CARD_RESULT へ自動更新
    const completeTimer = setTimeout(() => {
      onRevealComplete();
    }, 1050);

    return () => {
      clearTimeout(flipTimer);
      clearTimeout(soundTimer);
      clearTimeout(completeTimer);
    };
  }, [card, effectiveCard, onRevealComplete]);

  // isRevealing が false になった時（または最初からめくられている時）は確実に isFlipped = true
  useEffect(() => {
    if (!isRevealing) {
      setIsFlipped(true);
    }
  }, [isRevealing]);

  // 2. 結果オープン後、完全自動で3秒カウントダウンして進行
  useEffect(() => {
    if (isRevealing || !isFlipped) return;

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const autoAdvanceTimer = setTimeout(() => {
      if (!hasTriggeredRef.current) {
        hasTriggeredRef.current = true;
        onConfirmResult();
      }
    }, 3000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(autoAdvanceTimer);
    };
  }, [isRevealing, isFlipped, onConfirmResult]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md table-wood-rail p-3 sm:p-4 rounded-[28px] shadow-2xl relative border border-amber-900/50">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        {/* Inner Felt Surface */}
        <div className="tabletop-surface rounded-[22px] p-5 sm:p-7 table-leather-stitch flex flex-col items-center text-center relative overflow-hidden">
          {/* Top Context Header */}
          <div className="mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-[10px] font-mono tracking-widest text-amber-300 mb-1 shadow-inner">
              STAGE CARD DRAW
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white drop-shadow">
              {isSelf ? (
                <span>
                  <span className="text-amber-300 font-black">{actorPlayer.name}</span> の挑戦
                </span>
              ) : (
                <span>
                  <span className="text-slate-300">{actorPlayer.name}</span> ➔{' '}
                  <span className="text-amber-300 font-black">{targetPlayer.name}</span> に指名！
                </span>
              )}
            </h3>
          </div>

          {/* 3D Flip Card Container */}
          <div className="perspective-1000 w-52 h-72 sm:w-60 sm:h-80 my-2 pointer-events-none">
            <div
              className={`w-full h-full relative transition-transform duration-700 transform-style-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Card Back (裏面) */}
              <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#020617] border-2 border-amber-500/50 shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 shadow-inner">
                  ❓
                </div>
                <div className="text-sm font-mono tracking-widest text-amber-300 font-black mb-1">
                  LAST CONTINUE
                </div>
                <p className="text-xs text-amber-200/60 animate-pulse font-medium">OPENING...</p>
              </div>

              {/* Card Front (表面) */}
              <div
                className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl border-2 shadow-2xl flex flex-col items-center justify-center p-6 text-center select-none ${
                  effectiveCard === 'GOOD'
                    ? 'bg-gradient-to-b from-cyan-950/90 via-[#071322] to-[#020914] border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.4)]'
                    : 'bg-gradient-to-b from-red-950/90 via-[#1f080e] to-[#0d0205] border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                }`}
              >
                {/* Card Badge */}
                <div className="text-5xl sm:text-6xl mb-2 drop-shadow-md">
                  {effectiveCard === 'GOOD' ? '🟦' : '🟥'}
                </div>

                <div
                  className={`text-2xl sm:text-3xl font-black tracking-wider mb-1.5 ${
                    effectiveCard === 'GOOD'
                      ? 'text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                      : 'text-red-500 animate-glitch drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                  }`}
                >
                  {effectiveCard === 'GOOD' ? 'GOOD STAGE' : 'BAD STAGE'}
                </div>

                {/* Status override indicator */}
                {glitched && (
                  <div className="mt-1.5 px-3 py-1 bg-purple-950/90 border border-purple-400 text-purple-300 font-bold text-xs rounded-lg animate-bounce shadow-md">
                    👾 GLITCH反転発動！ ({card} ➔ {effectiveCard})
                  </div>
                )}
                {continued && effectiveCard === 'BAD' && (
                  <div className="mt-1.5 px-3 py-1 bg-amber-950/90 border border-amber-400 text-amber-300 font-bold text-xs rounded-lg animate-bounce shadow-md">
                    🕹️ CONTINUE 残機保護発動！
                  </div>
                )}

                {/* Card Effect Description */}
                <p className="text-xs text-slate-200 mt-2 font-medium leading-relaxed">
                  {effectiveCard === 'GOOD' ? (
                    isSelf ? (
                      '🎉 ターン継続！次のPLAYもあなたの番です。'
                    ) : (
                      `✨ ${targetPlayer.name} はセーフ！次のプレイヤーへ。`
                    )
                  ) : continued ? (
                    '🕹️ CONTINUE発動！ BADは無効化されターンを続行します！'
                  ) : isSelf ? (
                    '💀 残機-1！次のプレイヤーへターンが移ります。'
                  ) : (
                    `💀 ${targetPlayer.name} の残機-1！次のプレイヤーへ。`
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Auto-Advance Progress Indicator */}
          {isFlipped && !isRevealing && (
            <div className="w-full mt-3 space-y-2 animate-fade-in">
              {/* Countdown Progress Bar */}
              <div className="w-full bg-black/50 border border-amber-600/30 rounded-full h-2.5 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                    effectiveCard === 'GOOD' ? 'bg-cyan-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${(timeLeft / 3) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-center text-xs text-amber-200/90 font-mono gap-1.5 py-0.5">
                <span className="animate-spin text-amber-400">⏳</span>
                <span>{timeLeft}秒後に自動で次の手番へ進みます...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
