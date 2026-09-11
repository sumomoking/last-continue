'use client';

import React, { useState } from 'react';
import { OnlineRoom } from '../../types/online';
import { isFirebaseConfigured } from '../../lib/firebase';
import { FirebaseConfigModal } from './FirebaseConfigModal';

interface LobbyScreenProps {
  myPlayerId: string;
  currentRoom: OnlineRoom | null;
  isLoading: boolean;
  errorMessage: string | null;
  onCreateRoom: (hostName: string, maxPlayers: 3 | 4) => Promise<string | null>;
  onJoinRoom: (roomId: string, playerName: string) => Promise<boolean>;
  onLeaveRoom: () => void;
  onStartGame: () => void;
  onBackToLocal: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  myPlayerId,
  currentRoom,
  isLoading,
  errorMessage,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  onStartGame,
  onBackToLocal,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('Player');
  const [maxPlayers, setMaxPlayers] = useState<3 | 4>(3);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const hasConfig = isFirebaseConfigured();
  const isHost = currentRoom?.hostId === myPlayerId;
  const isFull = currentRoom && currentRoom.players.length >= currentRoom.maxPlayers;

  const handleCopyCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfig) {
      setShowConfigModal(true);
      return;
    }
    await onCreateRoom(playerName, maxPlayers);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfig) {
      setShowConfigModal(true);
      return;
    }
    await onJoinRoom(roomCodeInput, playerName);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 relative z-10 select-none bg-[#05070c]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-[#05070c] to-[#020306] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Bar Header */}
      <div className="w-full max-w-xl mb-4 flex items-center justify-between z-20">
        <button
          type="button"
          onClick={onBackToLocal}
          className="px-3.5 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/30 text-amber-200/90 text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer hover:border-amber-500/50"
        >
          <span>←</span>
          <span>ローカル対戦へ戻る</span>
        </button>

        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className={`text-xs font-mono px-3.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 shadow-md cursor-pointer ${
            hasConfig
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/50'
              : 'bg-amber-950/60 border-amber-500/70 text-amber-200 animate-pulse'
          }`}
        >
          <span>{hasConfig ? '🔥 Firebase 接続設定' : '⚠️ Firebase 未設定'}</span>
        </button>
      </div>

      {/* Main Tabletop Board Frame */}
      <div className="w-full max-w-xl table-wood-rail p-3 sm:p-4 rounded-[28px] shadow-2xl relative z-20 border border-amber-900/40">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        {/* Inner Tabletop Felt Surface */}
        <div className="tabletop-surface rounded-[22px] p-5 sm:p-7 table-leather-stitch text-center relative overflow-hidden">
          {/* Header Plaque */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-[11px] font-mono tracking-widest text-amber-300 mb-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>ONLINE TABLETOP MULTIPLAYER</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            LAST <span className="text-red-500">CONTINUE</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/80 mb-6 font-medium">
            リアルタイム同期・心理戦ボードゲーム対戦
          </p>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs text-left flex items-start gap-2.5 shadow-lg">
              <span className="text-lg">⚠️</span>
              <div className="flex-1 font-semibold">{errorMessage}</div>
            </div>
          )}

          {/* ── 1. ルーム待機中画面 (Waiting Room Table) ── */}
          {currentRoom ? (
            <div className="space-y-6 text-left animate-fade-in">
              {/* Embossed Brass Room Code Plaque */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#241a12] via-[#1b120c] to-[#120b08] border-2 border-amber-600/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2),0_6px_16px_rgba(0,0,0,0.6)] text-center relative">
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold mb-1">
                  — ROOM ACCESS CODE —
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {currentRoom.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-gradient-to-b from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-bold rounded-lg border border-amber-400/50 transition cursor-pointer shadow-md active:scale-95"
                    title="コードをコピー"
                  >
                    {copied ? '✓ コピー済' : '📋 コピー'}
                  </button>
                </div>
                <p className="text-[11px] text-amber-200/60 mt-2 font-medium">
                  対戦仲間にこのコードを伝えて参加してもらおう
                </p>
              </div>

              {/* Seated Players Table Grid */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-amber-300/80 mb-3 px-1">
                  <span className="flex items-center gap-1.5">
                    <span>🪑</span> 着席プレイヤー一覧
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/40 border border-amber-500/30 text-amber-300 font-mono text-[11px]">
                    {currentRoom.players.length} / {currentRoom.maxPlayers} 席
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentRoom.players.map((p, idx) => {
                    const isMe = p.id === myPlayerId;
                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition duration-200 shadow-md ${
                          isMe
                            ? 'bg-cyan-950/40 border-cyan-400/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                            : 'bg-[#0f172a]/70 border-slate-700/80 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs shadow-inner ${
                              isMe
                                ? 'bg-cyan-600 text-white border border-cyan-300/50'
                                : 'bg-slate-800 text-slate-300 border border-slate-600'
                            }`}
                          >
                            P{idx + 1}
                          </div>
                          <div className="truncate">
                            <div className="font-bold text-sm truncate flex items-center gap-1.5">
                              <span>{p.name}</span>
                              {isMe && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-normal">
                                  あなた
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {p.isHost && (
                            <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold rounded-full flex items-center gap-1">
                              👑 ホスト
                            </span>
                          )}
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Seats */}
                  {Array.from({ length: currentRoom.maxPlayers - currentRoom.players.length }).map((_, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-dashed border-amber-600/30 bg-black/20 text-amber-200/40 text-xs flex items-center justify-center gap-2 font-medium"
                    >
                      <span className="animate-spin text-amber-400/60">⏳</span>
                      <span>空席（参加待機中...）</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Actions */}
              <div className="space-y-3 pt-2">
                {isHost ? (
                  <button
                    type="button"
                    disabled={!isFull || isLoading}
                    onClick={onStartGame}
                    className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg tracking-wider rounded-2xl shadow-[0_8px_20px_rgba(225,29,72,0.4)] border border-rose-400/40 transform active:scale-98 transition duration-150 cursor-pointer"
                  >
                    {isLoading
                      ? 'ゲーム起動中...'
                      : isFull
                      ? '🎲 GAME START (全員揃いました！)'
                      : `🎲 参加待機中 (${currentRoom.players.length}/${currentRoom.maxPlayers})`}
                  </button>
                ) : (
                  <div className="p-4 bg-black/40 border border-amber-600/30 rounded-2xl text-center text-xs text-amber-200/80 flex items-center justify-center gap-2">
                    <span className="animate-spin text-amber-400">🔄</span>
                    <span>ホストがゲームを開始するのを待機しています...</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={onLeaveRoom}
                  className="w-full py-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs rounded-xl border border-slate-700/80 transition cursor-pointer"
                >
                  テーブルから退出する
                </button>
              </div>
            </div>
          ) : (
            /* ── 2. ルーム作成 / 参加 タブ画面 ── */
            <div>
              {/* Wooden Tactile Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/60 rounded-2xl border border-amber-600/30 mb-6 shadow-inner">
                <button
                  type="button"
                  onClick={() => setTab('create')}
                  className={`py-2.5 text-xs font-bold rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                    tab === 'create'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-black shadow-md border border-amber-400/60'
                      : 'text-amber-200/60 hover:text-amber-200'
                  }`}
                >
                  <span>➕</span>
                  <span>部屋を作る（ホスト）</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTab('join')}
                  className={`py-2.5 text-xs font-bold rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                    tab === 'join'
                      ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 font-black shadow-md border border-amber-400/60'
                      : 'text-amber-200/60 hover:text-amber-200'
                  }`}
                >
                  <span>🚪</span>
                  <span>部屋に入る（ゲスト）</span>
                </button>
              </div>

              {/* A. Create Room Form */}
              {tab === 'create' && (
                <form onSubmit={handleCreate} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                      プレイヤー名
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="あなたの名前"
                      className="w-full bg-[#0b101d] border border-amber-600/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                      プレイ人数の設定
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setMaxPlayers(3)}
                        className={`py-3 rounded-xl font-bold text-xs border transition duration-150 cursor-pointer ${
                          maxPlayers === 3
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-black/40 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        👥 3 人対戦
                      </button>
                      <button
                        type="button"
                        onClick={() => setMaxPlayers(4)}
                        className={`py-3 rounded-xl font-bold text-xs border transition duration-150 cursor-pointer ${
                          maxPlayers === 4
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                            : 'bg-black/40 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        👥 4 人対戦
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-3 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-sm tracking-wider rounded-xl shadow-[0_6px_16px_rgba(217,119,6,0.35)] border border-amber-300/60 transition cursor-pointer active:scale-98"
                  >
                    {isLoading ? 'ルーム作成中...' : 'テーブル（部屋）を作成する'}
                  </button>
                </form>
              )}

              {/* B. Join Room Form */}
              {tab === 'join' && (
                <form onSubmit={handleJoin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                      ルームコード
                    </label>
                    <input
                      type="text"
                      required
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="例: LC-4821"
                      className="w-full bg-[#0b101d] border border-amber-600/30 rounded-xl px-4 py-2.5 text-base font-mono text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 tracking-widest transition uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-amber-300/90 mb-1.5">
                      プレイヤー名
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="あなたの名前"
                      className="w-full bg-[#0b101d] border border-amber-600/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !roomCodeInput.trim()}
                    className="w-full mt-3 py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 disabled:opacity-40 text-slate-950 font-black text-sm tracking-wider rounded-xl shadow-[0_6px_16px_rgba(217,119,6,0.35)] border border-amber-300/60 transition cursor-pointer active:scale-98"
                  >
                    {isLoading ? '参加処理中...' : 'テーブルに着席する（部屋に入る）'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Firebase Config Modal */}
      <FirebaseConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSaved={() => {}}
      />
    </div>
  );
};
