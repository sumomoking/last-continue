'use client';

import React from 'react';

interface PhysicalDiceProps {
  value: number; // 1 ~ 6
  size?: 'sm' | 'md' | 'lg';
  isRolling?: boolean;
  className?: string;
}

export const PhysicalDice: React.FC<PhysicalDiceProps> = ({
  value,
  size = 'md',
  isRolling = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 rounded-lg p-1',
    md: 'w-10 h-10 rounded-xl p-1.5',
    lg: 'w-14 h-14 rounded-2xl p-2',
  };

  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  // サイコロの目のドットレイアウト
  const renderDots = () => {
    switch (value) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`${size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5'} rounded-full dice-dot`} />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-start">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
            <div className="flex justify-end">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-start">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
            <div className="flex justify-end">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
            <div className="flex justify-center">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
            <div className="flex justify-between">
              <span className={`${dotSize} rounded-full dice-dot-black`} />
              <span className={`${dotSize} rounded-full dice-dot-black`} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`dice-face border border-slate-300 flex items-center justify-center select-none transform transition-transform duration-200 ${
        isRolling ? 'animate-bounce rotate-12 scale-105' : 'hover:rotate-6'
      } ${sizeMap[size]} ${className}`}
    >
      {renderDots()}
    </div>
  );
};
