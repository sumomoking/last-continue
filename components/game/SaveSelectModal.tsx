'use client';

import React, { useState } from 'react';
import { ItemType, Player } from '../../types/game';
import { ITEM_DEFINITIONS } from '../../constants/items';

interface SaveSelectModalProps {
  player: Player;
  playerIndex: number;
  onConfirm: (selectedItem: ItemType) => void;
  onCancel: () => void;
}

export const SaveSelectModal: React.FC<SaveSelectModalProps> = ({
  player,
  onConfirm,
  onCancel,
}) => {
  // SAVEカード以外の所持アイテム
  const availableItems = player.items.filter((item, index, self) => {
    // 自身が持っているSAVEのうち1枚は消費されるため、他のアイテムまたは2枚目以降のSAVEを選択可能
    const saveCount = player.items.filter((i) => i === 'SAVE').length;
    if (item === 'SAVE' && saveCount <= 1) return false;
    return true;
  });

  const [selectedItem, setSelectedItem] = useState<ItemType | null>(availableItems[0] || null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 text-center relative">
        <div className="inline-block px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-xs font-mono font-bold text-emerald-300 mb-3">
          💾 SAVE ITEM（残機1専用）
        </div>
        <h3 className="text-xl font-black text-white mb-2">保管するアイテムを選択</h3>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          SAVEの下にセットするアイテムを1枚選んでください。<br />
          次でGAME OVER（残機0）になった瞬間にそのアイテムが手札に戻り、<strong>残機1で復活</strong>します。
        </p>

        {availableItems.length === 0 ? (
          <div className="py-6 text-slate-400 text-xs bg-slate-950/60 rounded-xl border border-slate-800 mb-4">
            他にセットできる手札アイテムがありません。<br />
            （SAVEを単体で発動することはできません）
          </div>
        ) : (
          <div className="space-y-2 mb-6 text-left max-h-60 overflow-y-auto pr-1">
            {availableItems.map((item, idx) => {
              const info = ITEM_DEFINITIONS[item];
              const isSelected = selectedItem === item;

              return (
                <div
                  key={`${item}-${idx}`}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-400 text-white shadow-md ring-1 ring-emerald-400/50'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <div>
                      <div className="text-xs font-bold">{info.name}</div>
                      <div className="text-[11px] text-slate-400">{info.description}</div>
                    </div>
                  </div>
                  {isSelected && <span className="text-emerald-400 font-bold text-sm">✓</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={!selectedItem}
            onClick={() => selectedItem && onConfirm(selectedItem)}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/40 transition cursor-pointer"
          >
            SAVEをセットする
          </button>
        </div>
      </div>
    </div>
  );
};
