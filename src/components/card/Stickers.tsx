'use client';

import React from 'react';
import { StickerElement } from '@/types';

export const StickerRenderer: React.FC<{ sticker: StickerElement; isInteractive?: boolean; onRemove?: () => void }> = ({
  sticker,
  isInteractive = false,
  onRemove,
}) => {
  const { type, size, rotation, x, y } = sticker;

  const renderContent = () => {
    switch (type) {
      case 'heart':
        return (
          <div
            style={{ width: size, height: size }}
            className="relative flex items-center justify-center filter drop-shadow-md transition-transform hover:scale-110"
          >
            {/* 3D Glossy Red Heart */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <radialGradient id="heartGrad" cx="35%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#FF6B6B" />
                  <stop offset="40%" stopColor="#E60000" />
                  <stop offset="85%" stopColor="#990000" />
                  <stop offset="100%" stopColor="#660000" />
                </radialGradient>
                <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.4" />
                </filter>
              </defs>
              <path
                d="M 50,88 C 20,65 5,45 5,28 C 5,12 18,3 32,3 C 41,3 47,8 50,14 C 53,8 59,3 68,3 C 82,3 95,12 95,28 C 95,45 80,65 50,88 Z"
                fill="url(#heartGrad)"
                filter="url(#heartShadow)"
              />
              {/* Gloss highlight */}
              <ellipse cx="32" cy="22" rx="9" ry="5" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 32 22)" />
              <ellipse cx="68" cy="20" rx="6" ry="3" fill="#FFFFFF" opacity="0.4" transform="rotate(25 68 20)" />
            </svg>
          </div>
        );

      case 'star':
        return (
          <div
            style={{ width: size, height: size }}
            className="relative flex items-center justify-center filter drop-shadow-md transition-transform hover:scale-110"
          >
            {/* 3D Metallic Silver/Gold Balloon Star */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <defs>
                <radialGradient id="starGrad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#E2E8F0" />
                  <stop offset="70%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#475569" />
                </radialGradient>
              </defs>
              <polygon
                points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36"
                fill="url(#starGrad)"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              {/* 3D Balloon Crease highlight */}
              <path d="M 50,5 L 50,77 M 98,38 L 50,50 M 80,95 L 50,50 M 20,95 L 50,50 M 2,38 L 50,50" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />
            </svg>
          </div>
        );

      case 'flower':
        return (
          <div
            style={{ width: size, height: size }}
            className="relative flex items-center justify-center filter drop-shadow transition-transform hover:scale-110"
          >
            {/* Daisy Flower */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <g fill="#FFFDF9" stroke="#E2E8F0" strokeWidth="0.8">
                <ellipse cx="50" cy="18" rx="7" ry="16" />
                <ellipse cx="50" cy="82" rx="7" ry="16" />
                <ellipse cx="18" cy="50" rx="16" ry="7" />
                <ellipse cx="82" cy="50" rx="16" ry="7" />
                <ellipse cx="27" cy="27" rx="7" ry="16" transform="rotate(-45 27 27)" />
                <ellipse cx="73" cy="73" rx="7" ry="16" transform="rotate(-45 73 73)" />
                <ellipse cx="73" cy="27" rx="7" ry="16" transform="rotate(45 73 27)" />
                <ellipse cx="27" cy="73" rx="7" ry="16" transform="rotate(45 27 73)" />
              </g>
              <circle cx="50" cy="50" r="14" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5" />
              <circle cx="47" cy="47" r="3" fill="#FCD34D" />
            </svg>
          </div>
        );

      case 'disco':
        return (
          <div
            style={{ width: size, height: size }}
            className="relative flex items-center justify-center filter drop-shadow-lg"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="44" fill="#64748B" />
              <circle cx="50" cy="50" r="44" fill="url(#discoGrid)" />
              <defs>
                <pattern id="discoGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <rect width="7.5" height="7.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.5" />
                </pattern>
              </defs>
              <ellipse cx="35" cy="30" rx="20" ry="10" fill="#FFFFFF" opacity="0.4" transform="rotate(-25 35 30)" />
            </svg>
          </div>
        );

      case 'gradcap':
        return (
          <div style={{ width: size, height: size }} className="filter drop-shadow-md">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,15 95,35 50,55 5,35" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <path d="M 25,44 L 25,70 Q 50,85 75,70 L 75,44" fill="#0F172A" />
              {/* Tassel */}
              <circle cx="50" cy="35" r="4" fill="#F59E0B" />
              <path d="M 50,35 Q 30,45 22,65" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
              <polygon points="20,65 24,65 25,82 19,82" fill="#D97706" />
            </svg>
          </div>
        );

      case 'doodle_heart':
        return (
          <div style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 50,75 C 25,55 12,38 12,25 C 12,12 24,8 35,12 C 43,15 48,22 50,26 C 52,22 57,15 65,12 C 76,8 88,12 88,25 C 88,38 75,55 50,75 Z"
                fill="none"
                stroke={sticker.color || '#991B1B'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="1 1"
              />
            </svg>
          </div>
        );

      case 'doodle_star':
        return (
          <div style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M 50,10 L 62,38 L 92,40 L 68,60 L 76,90 L 50,74 L 24,90 L 32,60 L 8,40 L 38,38 Z"
                fill="none"
                stroke={sticker.color || '#D97706'}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );

      case 'sparkle':
        return (
          <div style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500">
              <path d="M 50,0 L 55,40 L 95,50 L 55,60 L 50,100 L 45,60 L 5,50 L 45,40 Z" fill="currentColor" />
            </svg>
          </div>
        );

      case 'paperclip':
        return (
          <div style={{ width: size, height: size }}>
            <svg viewBox="0 0 40 80" className="w-full h-full text-slate-500">
              <path
                d="M 12,70 L 12,20 A 10,10 0 0,1 32,20 L 32,60 A 6,6 0 0,1 20,60 L 20,25 A 3,3 0 0,1 26,25 L 26,55"
                fill="none"
                stroke="#64748B"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="absolute select-none pointer-events-auto cursor-pointer"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      {renderContent()}
      {isInteractive && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-xs flex items-center justify-center shadow hover:bg-red-700"
        >
          ×
        </button>
      )}
    </div>
  );
};
