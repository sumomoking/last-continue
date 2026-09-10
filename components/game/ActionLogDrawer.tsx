'use client';

import React, { useState } from 'react';
import { GameLog } from '../../types/game';

interface ActionLogDrawerProps {
  logs: GameLog[];
}

export const ActionLogDrawer: React.FC<ActionLogDrawerProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-slate-900/70 border border-slate-800/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg">
      {/* Drawer Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition cursor-pointer"
      >
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <span>📜</span>
          <span>ゲームログ履歴 ({logs.length})</span>
          {logs[0] && (
            <span className="text-[11px] text-slate-300 font-normal truncate max-w-[200px] sm:max-w-xs hidden sm:inline-block">
              : {logs[0].text}
            </span>
          )}
        </div>
        <span className="text-slate-400 text-xs font-mono">
          {isOpen ? '▲ 閉じる' : '▼ 開く'}
        </span>
      </button>

      {/* Expanded Logs */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 max-h-52 overflow-y-auto space-y-1.5 border-t border-slate-800/60 font-mono text-xs text-left">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-center py-2">ログはありません</div>
          ) : (
            logs.map((log) => {
              let colorClass = 'text-slate-400';
              if (log.type === 'good') colorClass = 'text-cyan-400 font-semibold';
              if (log.type === 'bad') colorClass = 'text-red-400 font-semibold';
              if (log.type === 'item') colorClass = 'text-purple-300';
              if (log.type === 'round') colorClass = 'text-yellow-400 font-bold';

              return (
                <div key={log.id} className="flex items-start space-x-2 py-0.5">
                  <span className="text-slate-600 text-[10px] shrink-0 pt-0.5">
                    [{log.timestamp}]
                  </span>
                  <span className={`break-all ${colorClass}`}>{log.text}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
