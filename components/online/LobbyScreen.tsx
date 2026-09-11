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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Header */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToLocal}
          className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
        >
          <span>←</span>
          <span>ローカル対戦モードへ戻る</span>
        </button>

        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className={`text-xs font-mono px-3 py-1 rounded-full border transition flex items-center gap-1.5 cursor-pointer ${
            hasConfig
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:border-emerald-400'
              : 'bg-amber-950/40 border-amber-500/60 text-amber-300 animate-pulse'
          }`}
        >
          <span>{hasConfig ? '🔥 Firebase 接続設定' : '⚠️ Firebase 未設定'}</span>
        </button>
      </div>

      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/40 text-center relative">
        {/* Title */}
        <div className="inline-block px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-mono tracking-widest text-cyan-400 mb-2">
          ONLINE MULTIPLAYER
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-1">
          LAST <span className="text-red-500">CONTINUE</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          リアルタイム通信で心理戦オンライン対戦
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs text-left flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* ── 1. ルーム待機中画面 (Waiting Room) ── */}
        {currentRoom ? (
          <div className="space-y-5 text-left animate-fade-in">
            {/* Room Code Banner */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center relative">
              <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                ROOM CODE
              </div>
              <div className="text-3xl font-black font-mono tracking-wider text-cyan-400 flex items-center justify-center gap-3">
                <span>{currentRoom.id}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-sans font-bold rounded-lg border border-slate-700 transition cursor-pointer"
                  title="コードをコピー"
                >
                  {copied ? '✓ コピー済' : 'コピー'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                他のプレイヤーにこのルームコードを共有してください
              </p>
            </div>

            {/* Players List in Room */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <span>👥 参加プレイヤー</span>
                <span>
                  {currentRoom.players.length} / {currentRoom.maxPlayers} 人
                </span>
              </div>

              <div className="space-y-2">
                {currentRoom.players.map((p, idx) => {
                  const isMe = p.id === myPlayerId;
                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition ${
                        isMe
                          ? 'bg-cyan-950/30 border-cyan-500/50 text-white'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 text-xs font-mono font-bold flex items-center justify-center">
                          P{idx + 1}
                        </span>
                        <span className="font-bold text-sm">
                          {p.name} {isMe && <span className="text-xs text-cyan-400 font-normal">（あなた）</span>}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {p.isHost && (
                          <span className="px-2 py-0.5 bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-[10px] font-bold rounded-full">
                            👑 ホスト
                          </span>
                        )}
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                    </div>
                  );
                })}

                {/* Empty Slots */}
                {Array.from({ length: currentRoom.maxPlayers - currentRoom.players.length }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs flex items-center justify-center gap-2"
                  >
                    <span className="animate-pulse">⏳</span> 参加待機中...
                  </div>
                ))}
              </div>
            </div>

            {/* Room Actions */}
            <div className="space-y-2 pt-2">
              {isHost ? (
                <button
                  type="button"
                  disabled={!isFull || isLoading}
                  onClick={onStartGame}
                  className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-lg tracking-wider rounded-xl shadow-lg shadow-red-900/50 transform active:scale-98 transition duration-150 cursor-pointer"
                >
                  {isLoading
                    ? '起動中...'
                    : isFull
                    ? 'GAME START (全員揃いました！)'
                    : `プレイヤーが集まるまで待機 (${currentRoom.players.length}/${currentRoom.maxPlayers})`}
                </button>
              ) : (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <span className="animate-spin">🔄</span>
                  <span>ホストがゲームを開始するのを待っています...</span>
                </div>
              )}

              <button
                type="button"
                onClick={onLeaveRoom}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
              >
                ルームを退出する
              </button>
            </div>
          </div>
        ) : (
          /* ── 2. ルーム作成 / 参加 タブ画面 ── */
          <div>
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setTab('create')}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  tab === 'create'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ➕ 部屋を作る（ホスト）
              </button>
              <button
                type="button"
                onClick={() => setTab('join')}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  tab === 'join'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🚪 部屋に入る（ゲスト）
              </button>
            </div>

            {/* A. Create Room Form */}
            {tab === 'create' && (
              <form onSubmit={handleCreate} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    プレイヤー名
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="あなたの名前"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    プレイ人数の設定
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMaxPlayers(3)}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                        maxPlayers === 3
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      👥 3 人対戦
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaxPlayers(4)}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                        maxPlayers === 4
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-slate-800/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      👥 4 人対戦
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-lg shadow-cyan-900/40 transition cursor-pointer"
                >
                  {isLoading ? '作成中...' : 'ルームを作成する'}
                </button>
              </form>
            )}

            {/* B. Join Room Form */}
            {tab === 'join' && (
              <form onSubmit={handleJoin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    ルームコード
                  </label>
                  <input
                    type="text"
                    required
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="例: LC-4821"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-base font-mono text-cyan-400 placeholder-slate-500 focus:outline-none focus:border-cyan-400 tracking-wider transition uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    プレイヤー名
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="あなたの名前"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !roomCodeInput.trim()}
                  className="w-full mt-2 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg shadow-cyan-900/40 transition cursor-pointer"
                >
                  {isLoading ? '参加中...' : 'ルームに参加する'}
                </button>
              </form>
            )}
          </div>
        )}
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
