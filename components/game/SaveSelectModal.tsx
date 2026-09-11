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
  const availableItems = player.items.filter((item) => {
    const saveCount = player.items.filter((i) => i === 'SAVE').length;
    if (item === 'SAVE' && saveCount <= 1) return false;
    return true;
  });

  const [selectedItem, setSelectedItem] = useState<ItemType | null>(availableItems[0] || null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md table-wood-rail border-2 border-amber-600/60 rounded-3xl p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center relative overflow-hidden">
        {/* Brass Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-500/60 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-500/60 rounded-br-sm pointer-events-none" />

        <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-xs font-mono font-bold text-amber-300 mb-3 shadow-inner">
          💾 SAVE ITEM（残機1専用・1周有効）
        </div>
        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          SAVEの下にセットするアイテムを1枚選んでください。<br />
          <strong className="text-amber-300">自分の手番が1周する間</strong>にGAME OVER（残機0）になった瞬間、そのアイテムが手札に戻り<strong>残機1で復活</strong>します。<br />
          <span className="text-amber-200/80 text-[11px]">※発動せず1周経過した場合はセットカードは<strong>消失</strong>します。また他プレイヤーがSAVEを使うと効果が上書きされ消滅します。</span>
        </p>

        {availableItems.length === 0 ? (
          <div className="py-6 text-slate-400 text-xs bg-black/40 rounded-xl border border-amber-600/30 mb-4">
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
                      ? 'bg-amber-950/60 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-900/70 border-slate-700 text-slate-300 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{info.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-amber-200">{info.name}</div>
                      <div className="text-[11px] text-slate-400">{info.description}</div>
                    </div>
                  </div>
                  {isSelected && <span className="text-amber-300 font-black text-base">✓</span>}
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
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            disabled={!selectedItem}
            onClick={() => selectedItem && onConfirm(selectedItem)}
            className="flex-1 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-950/60 border border-amber-200 transition cursor-pointer active:scale-98"
          >
            SAVEをセットする
          </button>
        </div>
      </div>
    </div>
  );
};
