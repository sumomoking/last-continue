'use client';

import React from 'react';

interface CardBackViewProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CardBackView: React.FC<CardBackViewProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-12 h-16 rounded-lg text-[9px]',
    md: 'w-24 h-36 sm:w-28 sm:h-40 rounded-xl text-xs',
    lg: 'w-52 h-72 sm:w-60 sm:h-80 rounded-2xl text-sm',
  };

  return (
    <div
      className={`relative select-none overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-[#05070d] border-2 border-slate-700/80 shadow-2xl flex flex-col items-center justify-between p-2 sm:p-3 text-center transition-all ${sizeClasses[size]} ${className}`}
    >
      {/* Outer Golden/Cyan Border Trim */}
      <div className="absolute inset-1 rounded-md border border-cyan-500/30 pointer-events-none" />

      {/* Cyber Grid Pattern Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#00e5ff12_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />

      {/* Top Emblem / Corner Accents */}
      <div className="w-full flex justify-between items-center z-10 opacity-70">
        <span className="font-mono text-[8px] sm:text-[10px] text-cyan-400 font-bold tracking-tighter">LC</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
        <span className="font-mono text-[8px] sm:text-[10px] text-cyan-400 font-bold tracking-tighter">LC</span>
      </div>

      {/* Center Hex / Cyber Core Emblem */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto">
        <div className="relative w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center">
          {/* Rotating Halo */}
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/40 animate-[spin_12s_linear_infinite]" />
          <div className="absolute inset-1.5 rounded-full bg-gradient-to-tr from-cyan-950/80 to-slate-900 border border-cyan-400/50 flex items-center justify-center shadow-inner">
            <span className="text-base sm:text-xl font-mono text-cyan-300 font-black">?</span>
          </div>
        </div>
        {size !== 'sm' && (
          <div className="mt-1.5 font-mono text-[9px] sm:text-[11px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400">
            LAST CONTINUE
          </div>
        )}
      </div>

      {/* Bottom Trim */}
      <div className="w-full flex justify-between items-center z-10 opacity-70">
        <span className="font-mono text-[8px] sm:text-[10px] text-cyan-400 font-bold tracking-tighter">LC</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff]" />
        <span className="font-mono text-[8px] sm:text-[10px] text-cyan-400 font-bold tracking-tighter">LC</span>
      </div>

      {/* Holographic light sweep overlay */}
      <div className="absolute inset-0 holo-shimmer opacity-40 pointer-events-none" />
    </div>
  );
};
