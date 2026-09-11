'use client';

import React, { useState, useEffect } from 'react';
import {
  FirebaseConfig,
  getEffectiveFirebaseConfig,
  saveFirebaseConfig,
} from '../../lib/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });
  const [rawJson, setRawJson] = useState('');

  useEffect(() => {
    if (isOpen) {
      const current = getEffectiveFirebaseConfig();
      setConfig(current);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleJsonPaste = (val: string) => {
    setRawJson(val);
    try {
      const jsonMatch = val.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sanitized = jsonMatch[0]
          .replace(/(\w+):/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}');
        const parsed = JSON.parse(sanitized);
        setConfig({
          apiKey: parsed.apiKey || '',
          authDomain: parsed.authDomain || '',
          projectId: parsed.projectId || '',
          storageBucket: parsed.storageBucket || '',
          messagingSenderId: parsed.messagingSenderId || '',
          appId: parsed.appId || '',
        });
      }
    } catch {
      // ignore parse error
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(config);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg table-wood-rail p-3 sm:p-4 rounded-[26px] shadow-2xl relative border border-amber-900/50 max-h-[92vh] overflow-y-auto">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        {/* Inner Surface */}
        <div className="tabletop-surface rounded-[20px] p-5 sm:p-7 table-leather-stitch">
          <div className="flex items-center justify-between border-b border-amber-600/30 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🔥</span>
              <h3 className="text-base font-bold text-amber-200">Firebase 接続設定</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-amber-400/70 hover:text-white transition text-sm font-mono cursor-pointer px-2 py-1 rounded bg-black/40 border border-amber-600/30"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300/80 mb-4 leading-relaxed">
            オンライン対戦には Firebase (Firestore) を使用します。<br />
            Firebaseコンソールの「プロジェクトの設定」➔「マイアプリ」から構成情報を貼り付けてください。
          </p>

          {/* Quick Paste Box */}
          <div className="mb-4">
            <label className="block text-[11px] font-mono text-amber-300/90 mb-1 font-bold">
              📋 Firebase設定オブジェクトを一括ペースト:
            </label>
            <textarea
              rows={3}
              placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  projectId: "..."\n};`}
              value={rawJson}
              onChange={(e) => handleJsonPaste(e.target.value)}
              className="w-full bg-[#0b101d] border border-amber-600/30 rounded-xl p-2.5 text-xs font-mono text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-amber-300/90 mb-0.5">apiKey</label>
              <input
                type="text"
                required
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full bg-[#0b101d] border border-amber-600/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-amber-300/90 mb-0.5">projectId</label>
              <input
                type="text"
                required
                value={config.projectId}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                className="w-full bg-[#0b101d] border border-amber-600/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono text-amber-300/90 mb-0.5">authDomain</label>
                <input
                  type="text"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full bg-[#0b101d] border border-amber-600/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-amber-300/90 mb-0.5">appId</label>
                <input
                  type="text"
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full bg-[#0b101d] border border-amber-600/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl border border-amber-400/60 shadow-md cursor-pointer"
              >
                設定を保存する
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
