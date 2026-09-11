'use client';

import React, { useState, useEffect } from 'react';
import {
  FirebaseConfig,
  getEffectiveFirebaseConfig,
  saveFirebaseConfig,
  isFirebaseConfigured,
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
      // firebaseConfig = { ... } のようなJS形式やJSONを自動パース
      const jsonMatch = val.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // オブジェクトのキーを正規化してJSONパース
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
    } catch (e) {
      // そのまま
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
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔥</span>
            <h3 className="text-base font-bold text-white">Firebase 接続設定</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          オンライン対戦には Firebase (Firestore) を使用します。<br />
          Firebaseコンソールの「プロジェクトの設定」➔「マイアプリ」から構成情報を貼り付けてください。
        </p>

        {/* Quick Paste Box */}
        <div className="mb-4">
          <label className="block text-[11px] font-mono text-slate-400 mb-1">
            📋 Firebase設定オブジェクトを一括ペースト:
          </label>
          <textarea
            rows={3}
            placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  projectId: "..."\n};`}
            value={rawJson}
            onChange={(e) => handleJsonPaste(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-0.5">apiKey</label>
            <input
              type="text"
              required
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-0.5">projectId</label>
            <input
              type="text"
              required
              value={config.projectId}
              onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-0.5">authDomain</label>
              <input
                type="text"
                value={config.authDomain}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-0.5">appId</label>
              <input
                type="text"
                value={config.appId}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              設定を保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
