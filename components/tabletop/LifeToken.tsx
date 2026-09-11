"use client";

import React from "react";

interface LifeTokenProps {
  active: boolean;
  size?: "sm" | "md" | "lg";
  index?: number;
}

export const LifeToken: React.FC<LifeTokenProps> = ({
  active,
  size = "md",
  index = 0,
}) => {
  const sizeMap = {
    sm: "w-5 h-5 text-sm",
    md: "w-7 h-7 text-xl",
    lg: "w-9 h-9 text-2xl",
  };

  const svgSizeMap = {
    sm: 18,
    md: 24,
    lg: 30,
  };

  const dim = svgSizeMap[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 hover:scale-115 ${sizeMap[size]}`}
    >
      {active ? (
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 24 24"
          fill="none"
          className="filter drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] transition-all duration-300 transform hover:scale-110 cursor-default"
        >
          <defs>
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            <linearGradient id="heartHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Main Heart Shape */}
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="url(#heartGrad)"
            stroke="#fda4af"
            strokeWidth="0.8"
          />
          {/* Heart Gloss Highlight */}
          <path
            d="M7.5 4.5c-1.8 0-3.3 1.3-3.8 3.1.5-.7 1.4-1.2 2.5-1.2 1.4 0 2.6.9 3.2 2.2.4-1.8 1.4-3.1 3-3.7-1.4-.3-3.3-.4-4.9-.4z"
            fill="url(#heartHighlight)"
          />
        </svg>
      ) : (
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 24 24"
          fill="none"
          className="opacity-35 transition-all duration-300"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
        </svg>
      )}
    </div>
  );
};
