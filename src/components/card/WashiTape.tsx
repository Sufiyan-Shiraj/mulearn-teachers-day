'use client';

import React from 'react';

interface WashiTapeProps {
  pattern?: 'polka' | 'red' | 'gold' | 'purple' | 'kraft';
  className?: string;
  rotation?: number;
  width?: string | number;
  height?: string | number;
}

export const WashiTape: React.FC<WashiTapeProps> = ({
  pattern = 'polka',
  className = '',
  rotation = 0,
  width = 90,
  height = 24,
}) => {
  const getPatternClass = () => {
    switch (pattern) {
      case 'polka':
        return 'washi-tape-polka';
      case 'red':
        return 'washi-tape-red';
      case 'gold':
        return 'washi-tape-gold';
      case 'purple':
        return 'washi-tape-purple';
      case 'kraft':
        return 'bg-[#E5D5BA] opacity-90';
      default:
        return 'washi-tape-polka';
    }
  };

  return (
    <div
      className={`relative z-10 select-none pointer-events-none rounded-[1px] ${getPatternClass()} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Torn jagged ends on left and right */}
      <div className="absolute inset-y-0 -left-1 w-2 bg-inherit" style={{ clipPath: 'polygon(100% 0, 0 25%, 100% 50%, 0 75%, 100% 100%)' }} />
      <div className="absolute inset-y-0 -right-1 w-2 bg-inherit" style={{ clipPath: 'polygon(0 0, 100% 25%, 0 50%, 100% 75%, 0 100%)' }} />
    </div>
  );
};
