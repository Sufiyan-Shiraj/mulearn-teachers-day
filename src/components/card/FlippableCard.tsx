'use client';

import React, { useState, useRef } from 'react';
import { CardCustomConfig, FontFamilyChoice } from '@/types';
import { getTemplateById } from '@/templates/registry';
import { getQuadBoundsAndRotation } from '@/lib/perspectiveWarp';
import { WashiTape } from './WashiTape';
import { StickerRenderer } from './Stickers';
import { Heart, Sparkles, User, Move } from 'lucide-react';

interface FlippableCardProps {
  photoUrl: string;
  teacherName: string;
  message: string;
  customConfig?: Partial<CardCustomConfig>;
  templateId?: string;
  isFlipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  className?: string;
  scale?: number;
  interactive?: boolean;
  showFlipButton?: boolean;
  allowEdit?: boolean;
  allowPhotoDrag?: boolean;
  onPhotoMove?: (position: { x: number; y: number; scale: number; rotation: number }) => void;
  onTextClick?: () => void;
}

export const FlippableCard: React.FC<FlippableCardProps> = ({
  photoUrl,
  teacherName,
  message,
  customConfig = {},
  templateId = 'template-maroon-party',
  isFlipped: controlledFlipped,
  onFlip,
  className = '',
  scale = 1,
  interactive = true,
  showFlipButton = true,
  allowEdit = false,
  allowPhotoDrag = false,
  onPhotoMove,
  onTextClick,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const tplDef = getTemplateById(templateId);

  // Photo position & transform
  const photoPos = customConfig.photoPosition || { x: 0, y: 0, scale: 1, rotation: 0 };
  const [dragStart, setDragStart] = useState<{ x: number; y: number; posX: number; posY: number } | null>(null);

  const handleFlipToggle = () => {
    if (!interactive) return;
    const next = !isFlipped;
    setInternalFlipped(next);
    if (onFlip) onFlip(next);
  };

  const getFontClass = (fontFamily?: FontFamilyChoice) => {
    switch (fontFamily) {
      case 'Playful':
        return 'font-script-accent';
      case 'Elegant':
        return 'font-serif-heading italic';
      case 'Typewriter':
        return 'font-typewriter';
      case 'Handwritten':
        return 'font-handwritten';
      case 'Classic':
        return 'font-display-bold';
      case 'Bold':
        return 'font-sans font-extrabold uppercase tracking-wide';
      default:
        return 'font-script-accent';
    }
  };

  const currentFont = customConfig.fontFamily || tplDef.messagePlacement.defaultFont;
  const textColor = customConfig.textColor || tplDef.messagePlacement.defaultColor;
  const textAlign = customConfig.textAlign || tplDef.messagePlacement.align;
  const stickers = customConfig.stickers || [];
  const insideMessage = customConfig.insideMessage || message;

  // Aspect ratio styling
  const getAspectClass = () => {
    if (tplDef.aspectRatio === '9/16') return 'aspect-[9/16] w-[300px] sm:w-[340px] md:w-[380px]';
    if (tplDef.aspectRatio === '3/4') return 'aspect-[3/4] w-[320px] sm:w-[360px] md:w-[400px]';
    return 'aspect-[4/5] w-[320px] sm:w-[360px] md:w-[400px]';
  };

  // Photo Dragging Handlers (for pan repositioning)
  const handlePhotoMouseDown = (e: React.MouseEvent) => {
    if (!allowPhotoDrag) return;
    e.stopPropagation();
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      posX: photoPos.x,
      posY: photoPos.y,
    });
  };

  const handlePhotoMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !allowPhotoDrag || !onPhotoMove) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    onPhotoMove({
      ...photoPos,
      x: dragStart.posX + dx,
      y: dragStart.posY + dy,
    });
  };

  const handlePhotoMouseUp = () => {
    setDragStart(null);
  };

  // Touch handlers for mobile photo panning
  const handlePhotoTouchStart = (e: React.TouchEvent) => {
    if (!allowPhotoDrag || e.touches.length === 0) return;
    e.stopPropagation();
    setDragStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      posX: photoPos.x,
      posY: photoPos.y,
    });
  };

  const handlePhotoTouchMove = (e: React.TouchEvent) => {
    if (!dragStart || !allowPhotoDrag || !onPhotoMove || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - dragStart.x;
    const dy = e.touches[0].clientY - dragStart.y;
    onPhotoMove({
      ...photoPos,
      x: dragStart.posX + dx,
      y: dragStart.posY + dy,
    });
  };

  return (
    <div
      className={`relative inline-block perspective-1000 select-none ${className}`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <div
        onClick={allowEdit ? undefined : handleFlipToggle}
        className={`relative ${getAspectClass()} rounded-3xl transition-transform duration-700 ease-out transform-style-3d ${
          allowEdit ? '' : 'cursor-pointer'
        } scrapbook-card-shadow ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ==================================================== */}
        {/* FRONT OF CARD */}
        {/* ==================================================== */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden backface-hidden border-4 border-[#FFFDF9]/80 shadow-2xl bg-[#FAF6F0]">
          
          {/* Base Template Image Layer */}
          {tplDef.baseImageUrl ? (
            <img
              src={tplDef.baseImageUrl}
              alt={tplDef.name}
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: tplDef.insideBgColor || '#7A1F1F',
              }}
            />
          )}

          {/* Mapped Photo Window Layer */}
          {(() => {
            const quadMetrics = tplDef.photoWindow.quadPoints
              ? getQuadBoundsAndRotation(tplDef.photoWindow.quadPoints)
              : null;

            const winLeft = quadMetrics ? quadMetrics.minX : tplDef.photoWindow.left;
            const winTop = quadMetrics ? quadMetrics.minY : tplDef.photoWindow.top;
            const winWidth = quadMetrics ? quadMetrics.bboxW : tplDef.photoWindow.width;
            const winHeight = quadMetrics ? quadMetrics.bboxH : tplDef.photoWindow.height;
            const winRot = quadMetrics ? quadMetrics.rotation : tplDef.photoWindow.rotation;
            const winClip = quadMetrics ? quadMetrics.relativeClipPath : undefined;

            return (
              <div
                className="absolute overflow-hidden z-10"
                style={{
                  left: `${winLeft}%`,
                  top: `${winTop}%`,
                  width: `${winWidth}%`,
                  height: `${winHeight}%`,
                  transform: `rotate(${winRot}deg)`,
                  borderRadius: tplDef.photoWindow.borderRadius || '2px',
                  clipPath: winClip,
                }}
                onMouseDown={handlePhotoMouseDown}
                onMouseMove={handlePhotoMouseMove}
                onMouseUp={handlePhotoMouseUp}
                onTouchStart={handlePhotoTouchStart}
                onTouchMove={handlePhotoTouchMove}
                onTouchEnd={handlePhotoMouseUp}
              >
            {photoUrl ? (
              <div
                className={`relative w-full h-full ${allowPhotoDrag ? 'cursor-grab active:cursor-grabbing' : ''}`}
                style={{
                  transform: `translate(${photoPos.x}px, ${photoPos.y}px) scale(${photoPos.scale}) rotate(${photoPos.rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: dragStart ? 'none' : 'transform 0.15s ease-out',
                }}
              >
                <img
                  src={photoUrl}
                  alt="Teacher"
                  className="w-full h-full object-cover pointer-events-none"
                  draggable={false}
                />
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100/90 text-stone-400 p-2 text-center">
                <User className="w-10 h-10 mb-1 opacity-50" />
                <span className="font-handwritten text-xs">Add your photo here</span>
              </div>
            )}

            {/* Hint overlay if dragging is active */}
            {allowPhotoDrag && photoUrl && (
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white p-1 rounded-md text-[10px] flex items-center gap-1 pointer-events-none">
                <Move className="w-3 h-3" />
                <span>Drag to pan</span>
              </div>
            )}
          </div>
        );
      })()}

          {/* FOREGROUND OVERLAY OBJECTS (Rendered on top of photo) */}
          {tplDef.foregroundType === 'template_1_overlay' && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* 3D Glossy Heart over bottom-left of frame */}
              <div className="absolute left-[3%] top-[54%] w-16 h-16 transform -rotate-12 filter drop-shadow-lg">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <radialGradient id="fgHeart" cx="35%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#FF6B6B" />
                      <stop offset="40%" stopColor="#E60000" />
                      <stop offset="100%" stopColor="#660000" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M 50,88 C 20,65 5,45 5,28 C 5,12 18,3 32,3 C 41,3 47,8 50,14 C 53,8 59,3 68,3 C 82,3 95,12 95,28 C 95,45 80,65 50,88 Z"
                    fill="url(#fgHeart)"
                  />
                  <ellipse cx="32" cy="22" rx="9" ry="5" fill="#FFFFFF" opacity="0.6" transform="rotate(-30 32 22)" />
                </svg>
              </div>

              {/* 3D Balloon Silver Star over right edge of frame */}
              <div className="absolute right-[0%] top-[41%] w-18 h-18 transform rotate-15 filter drop-shadow-xl">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <radialGradient id="fgStar" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="40%" stopColor="#E2E8F0" />
                      <stop offset="85%" stopColor="#94A3B8" />
                      <stop offset="100%" stopColor="#64748B" />
                    </radialGradient>
                  </defs>
                  <polygon
                    points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36"
                    fill="url(#fgStar)"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* Martini Cocktail Glass over bottom right */}
              <div className="absolute right-[2%] bottom-[1%] w-24 h-24 transform rotate-6 filter drop-shadow-md">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon points="10,25 90,25 50,75" fill="rgba(255,255,255,0.4)" stroke="#CBD5E1" strokeWidth="1.5" />
                  <polygon points="20,32 80,32 50,70" fill="#F59E0B" opacity="0.8" />
                  <path d="M 50,75 L 50,95 M 30,95 L 70,95" stroke="#CBD5E1" strokeWidth="2.5" />
                  {/* Orange slice */}
                  <path d="M 65,15 A 18 18 0 0 1 85,35 Z" fill="#FB923C" stroke="#F97316" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          )}

          {tplDef.foregroundType === 'template_2_overlay' && (
            <div className="absolute inset-0 pointer-events-none z-20">
              {/* 3D 2*26 Numerals on the bottom chin of the frame */}
              <div className="absolute left-[26%] top-[68.5%] flex items-center gap-1 filter drop-shadow-lg">
                <span className="font-serif-heading font-black text-2xl md:text-3xl text-sky-800 bg-[#E0F2FE] px-1.5 py-0.5 rounded shadow-sm border border-sky-300">2</span>
                <span className="text-xl md:text-2xl text-red-600 font-black">★</span>
                <span className="font-serif-heading font-black text-2xl md:text-3xl text-indigo-900 bg-[#E0E7FF] px-1.5 py-0.5 rounded shadow-sm border border-indigo-300">2</span>
                <span className="font-serif-heading font-black text-2xl md:text-3xl text-amber-900 bg-[#FEF3C7] px-1.5 py-0.5 rounded shadow-sm border border-amber-300">6</span>
              </div>

              {/* Polka Dot Washi tape on bottom-right of frame */}
              <div className="absolute right-[6%] top-[69%]">
                <WashiTape pattern="polka" width={75} height={20} rotation={-8} />
              </div>

              {/* Gold Star on bottom-left */}
              <div className="absolute left-[7%] top-[53%] w-9 h-9 transform -rotate-12 filter drop-shadow">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 fill-amber-400">
                  <polygon points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36" />
                </svg>
              </div>
            </div>
          )}

          {/* Custom Foreground Cutout Mask Layer */}
          {tplDef.foregroundMaskUrl && (
            <img
              src={tplDef.foregroundMaskUrl}
              alt="Foreground Mask"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20 select-none"
            />
          )}

          {/* Teacher Name Text Placement */}
          <div
            className="absolute z-25 text-center px-2"
            style={{
              left: `${tplDef.teacherNamePlacement.left}%`,
              top: `${tplDef.teacherNamePlacement.top}%`,
              width: `${tplDef.teacherNamePlacement.width}%`,
              transform: tplDef.teacherNamePlacement.rotation ? `rotate(${tplDef.teacherNamePlacement.rotation}deg)` : undefined,
            }}
            onClick={(e) => {
              if (allowEdit && onTextClick) {
                e.stopPropagation();
                onTextClick();
              }
            }}
          >
            <p
              className={`${getFontClass(currentFont)} font-bold leading-tight line-clamp-1`}
              style={{
                color: tplDef.teacherNamePlacement.defaultColor,
                fontSize: `${customConfig.textSize ? customConfig.textSize * 0.9 : tplDef.teacherNamePlacement.defaultSize}px`,
                textAlign: textAlign as any,
              }}
            >
              {teacherName || 'Dear Teacher'}
            </p>
          </div>

          {/* Additional Custom Message Strip (if not part of base image) */}
          {(!tplDef.baseImageUrl || tplDef.id === 'template-vintage-floral') && (
            <div
              className="absolute z-25 text-center px-4"
              style={{
                left: `${tplDef.messagePlacement.left}%`,
                top: `${tplDef.messagePlacement.top}%`,
                width: `${tplDef.messagePlacement.width}%`,
              }}
              onClick={(e) => {
                if (allowEdit && onTextClick) {
                  e.stopPropagation();
                  onTextClick();
                }
              }}
            >
              <p
                className={`${getFontClass(currentFont)} leading-snug line-clamp-2`}
                style={{
                  color: textColor,
                  fontSize: `${customConfig.textSize || tplDef.messagePlacement.defaultSize}px`,
                  textAlign: textAlign as any,
                }}
              >
                &ldquo;{message}&rdquo;
              </p>
            </div>
          )}

          {/* Render Active Stickers on Front */}
          {stickers.map((stk) => (
            <StickerRenderer key={stk.id} sticker={stk} isInteractive={false} />
          ))}

          {/* Flip Hint Button */}
          {showFlipButton && (
            <div className="absolute top-3 right-3 z-30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFlipToggle();
                }}
                className="bg-white/90 hover:bg-white text-stone-800 px-3 py-1.5 rounded-full shadow-md text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition active:scale-95 border border-stone-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Open Card</span>
              </button>
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* INSIDE OF CARD (REVEALED ON FLIP) */}
        {/* ==================================================== */}
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden backface-hidden rotate-y-180 border-4 border-[#FFFDF9]/80 shadow-2xl p-6 flex flex-col justify-between"
          style={{
            backgroundColor: tplDef.insideBgColor || '#FFFDF9',
            backgroundImage: `radial-gradient(#D4C5B0 0.8px, transparent 0.8px)`,
            backgroundSize: '20px 20px',
          }}
        >
          {/* Binder Holes Detail */}
          <div className="absolute top-0 bottom-0 left-3 flex flex-col justify-around pointer-events-none">
            <div className="binder-hole" />
            <div className="binder-hole" />
            <div className="binder-hole" />
            <div className="binder-hole" />
          </div>

          {/* Inside Top Header */}
          <div className="pl-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-script-accent text-amber-400 text-lg">Dear</span>
                <h2 className="font-serif-heading font-bold text-white text-2xl leading-tight">
                  {teacherName || 'Teacher'}
                </h2>
              </div>
              <WashiTape pattern="red" width={70} height={20} rotation={5} />
            </div>
          </div>

          {/* Inside Letter Content */}
          <div className="pl-6 py-4 flex-1 flex flex-col justify-center">
            <div className="bg-[#FAF6F0]/95 p-4 rounded-xl border border-stone-300 shadow-inner">
              <p
                className={`${getFontClass(customConfig.insideFontFamily || currentFont)} text-stone-900 text-base md:text-lg leading-relaxed whitespace-pre-line`}
              >
                {insideMessage || message || 'Words cannot express our gratitude for everything you do!'}
              </p>
            </div>
          </div>

          {/* Inside Bottom Note & Signature */}
          <div className="pl-6 pt-2 border-t border-stone-200/40 flex items-center justify-between">
            <div>
              <p className="font-script-accent text-stone-300 text-xs">With love and respect,</p>
              <p className="font-handwritten text-white font-bold text-base">mulearn ASI Club</p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFlipToggle();
              }}
              className="bg-white/90 hover:bg-white text-stone-900 text-xs px-3.5 py-1.5 rounded-full font-bold transition active:scale-95 shadow"
            >
              Close Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
