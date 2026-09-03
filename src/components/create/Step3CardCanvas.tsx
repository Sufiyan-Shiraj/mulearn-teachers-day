'use client';

import React, { useState } from 'react';
import { CardCustomConfig, CardTemplate, FontFamilyChoice, StickerElement } from '@/types';
import { FlippableCard } from '../card/FlippableCard';
import {
  Type,
  Image as ImageIcon,
  Sparkles,
  Smile,
  Palette,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowRight,
  ArrowLeft,
  ZoomIn,
  Move,
  Check,
} from 'lucide-react';

interface Step3CardCanvasProps {
  template: CardTemplate;
  photoUrl: string;
  config: CardCustomConfig;
  onChangeConfig: (newConfig: CardCustomConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const FONTS: { id: FontFamilyChoice; label: string; sampleFont: string }[] = [
  { id: 'Playful', label: 'Playful', sampleFont: 'font-script-accent' },
  { id: 'Elegant', label: 'Elegant', sampleFont: 'font-serif-heading italic' },
  { id: 'Typewriter', label: 'Typewriter', sampleFont: 'font-typewriter' },
  { id: 'Handwritten', label: 'Handwritten', sampleFont: 'font-handwritten' },
  { id: 'Classic', label: 'Classic', sampleFont: 'font-display-bold' },
  { id: 'Bold', label: 'Bold', sampleFont: 'font-sans font-extrabold' },
];

const COLOR_SWATCHES = [
  '#FFFFFF',
  '#1C1917',
  '#7A1F1F',
  '#D49B4B',
  '#F59E0B',
  '#991B1B',
  '#1E3A8A',
  '#4C1D95',
  '#065F46',
];

export const Step3CardCanvas: React.FC<Step3CardCanvasProps> = ({
  template,
  photoUrl,
  config,
  onChangeConfig,
  onNext,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'stickers' | 'colors'>('text');
  const [history, setHistory] = useState<CardCustomConfig[]>([config]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isInsidePage, setIsInsidePage] = useState(false);

  const photoPos = config.photoPosition || { x: 0, y: 0, scale: 1, rotation: 0 };

  const updateConfigWithHistory = (updated: CardCustomConfig) => {
    onChangeConfig(updated);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updated);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const updatePhotoPos = (newPos: Partial<typeof photoPos>) => {
    updateConfigWithHistory({
      ...config,
      photoPosition: { ...photoPos, ...newPos },
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChangeConfig(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChangeConfig(next);
    }
  };

  const handleAddSticker = (type: StickerElement['type']) => {
    const newSticker: StickerElement = {
      id: `stk_${Date.now()}`,
      type,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      size: 42,
      rotation: (Math.random() - 0.5) * 30,
    };
    updateConfigWithHistory({
      ...config,
      stickers: [...config.stickers, newSticker],
    });
  };

  const handleRemoveSticker = (id: string) => {
    updateConfigWithHistory({
      ...config,
      stickers: config.stickers.filter((s) => s.id !== id),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-serif-heading text-3xl md:text-4xl font-extrabold text-stone-900">
          Make it <span className="font-script-accent text-[#7A1F1F]">yours</span>
        </h1>
        <p className="font-script-accent text-stone-600 text-lg mt-1">
          Click on the card or controls below to customize your card
        </p>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR TOOLBAR */}
        <div className="lg:col-span-4 bg-[#FFFDF9] rounded-3xl p-5 md:p-6 shadow-xl border border-stone-200">
          {/* Tool Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-stone-100/80 rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition ${
                activeTab === 'text'
                  ? 'bg-white text-[#7A1F1F] font-bold shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Type className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Text</span>
            </button>

            <button
              onClick={() => setActiveTab('photo')}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition ${
                activeTab === 'photo'
                  ? 'bg-white text-[#7A1F1F] font-bold shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <ImageIcon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Photo Fit</span>
            </button>

            <button
              onClick={() => setActiveTab('stickers')}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition ${
                activeTab === 'stickers'
                  ? 'bg-white text-[#7A1F1F] font-bold shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Smile className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Stickers</span>
            </button>

            <button
              onClick={() => setActiveTab('colors')}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition ${
                activeTab === 'colors'
                  ? 'bg-white text-[#7A1F1F] font-bold shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Palette className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">Colors</span>
            </button>
          </div>

          {/* TAB 1: TEXT TOOL CONTROLS */}
          {activeTab === 'text' && (
            <div className="space-y-5 animate-fade-in">
              {/* Teacher Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Teacher&apos;s Name
                </label>
                <input
                  type="text"
                  value={config.teacherName}
                  onChange={(e) =>
                    updateConfigWithHistory({ ...config, teacherName: e.target.value })
                  }
                  placeholder="Prof. Anjali Sharma"
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] rounded-xl border border-stone-300 font-serif-heading text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                />
              </div>

              {/* Inside Letter Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Inside Letter (Revealed on Card Flip)
                </label>
                <textarea
                  rows={4}
                  value={config.insideMessage || config.message}
                  onChange={(e) =>
                    updateConfigWithHistory({ ...config, insideMessage: e.target.value })
                  }
                  placeholder="Words cannot express our gratitude for everything you do..."
                  className="w-full px-4 py-2.5 bg-[#FAF6F0] rounded-xl border border-stone-300 font-sans text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#7A1F1F]"
                />
              </div>

              {/* Font Family 6-Box Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Font Family
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FONTS.map((font) => (
                    <button
                      key={font.id}
                      onClick={() =>
                        updateConfigWithHistory({ ...config, fontFamily: font.id })
                      }
                      className={`py-2.5 px-2 rounded-xl border text-center transition ${
                        config.fontFamily === font.id
                          ? 'bg-amber-100/70 border-[#7A1F1F] text-[#7A1F1F] font-bold ring-1 ring-[#7A1F1F]'
                          : 'bg-[#FAF6F0] border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className={`block text-lg ${font.sampleFont}`}>Aa</span>
                      <span className="text-[11px] font-sans font-medium">{font.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment Controls */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Text Alignment
                </label>
                <div className="flex items-center gap-2">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        updateConfigWithHistory({ ...config, textAlign: align })
                      }
                      className={`flex-1 py-2 rounded-xl border flex items-center justify-center transition ${
                        config.textAlign === align
                          ? 'bg-[#1C1917] text-white border-[#1C1917]'
                          : 'bg-[#FAF6F0] text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-4 h-4" />}
                      {align === 'center' && <AlignCenter className="w-4 h-4" />}
                      {align === 'right' && <AlignRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTO FIT / PAN & ZOOM */}
          {activeTab === 'photo' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-stone-500 font-medium">
                Adjust zoom and pan so your photo is centered nicely inside the frame:
              </p>
              {/* Scale / Zoom */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-[#7A1F1F]" />
                    <span>Zoom Photo</span>
                  </span>
                  <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-xs">
                    {Math.round(photoPos.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.05"
                  value={photoPos.scale}
                  onChange={(e) => updatePhotoPos({ scale: parseFloat(e.target.value) })}
                  className="w-full accent-[#7A1F1F] cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-between items-center text-xs text-stone-500">
                <span>💡 Drag photo directly on canvas to reposition</span>
                <button
                  onClick={() => updatePhotoPos({ x: 0, y: 0, scale: 1, rotation: 0 })}
                  className="text-xs text-[#7A1F1F] font-semibold hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: STICKERS PALETTE */}
          {activeTab === 'stickers' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-xs text-stone-500 font-medium">
                Click any sticker to place it onto your card:
              </p>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { type: 'heart' as const, label: 'Glossy Heart' },
                  { type: 'star' as const, label: 'Silver Star' },
                  { type: 'flower' as const, label: 'Daisy Flower' },
                  { type: 'disco' as const, label: 'Disco Ball' },
                  { type: 'gradcap' as const, label: 'Grad Cap' },
                  { type: 'sparkle' as const, label: 'Sparkle' },
                  { type: 'paperclip' as const, label: 'Paperclip' },
                  { type: 'doodle_star' as const, label: 'Star Outline' },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleAddSticker(item.type)}
                    className="p-3 rounded-2xl bg-[#FAF6F0] border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 flex flex-col items-center justify-center gap-1 transition transform active:scale-90"
                  >
                    <span className="text-xs font-semibold text-stone-800 text-center truncate w-full">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {config.stickers.length > 0 && (
                <div className="pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-600">Active Stickers ({config.stickers.length})</span>
                    <button
                      onClick={() => updateConfigWithHistory({ ...config, stickers: [] })}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {config.stickers.map((s, idx) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-stone-100 rounded-lg text-xs text-stone-700"
                      >
                        <span>{s.type} #{idx + 1}</span>
                        <button
                          onClick={() => handleRemoveSticker(s.id)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: COLORS PALETTE */}
          {activeTab === 'colors' && (
            <div className="space-y-4 animate-fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Card Accent Color Swatches
              </label>
              <div className="grid grid-cols-5 gap-3">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      updateConfigWithHistory({ ...config, textColor: color })
                    }
                    className={`w-10 h-10 rounded-full border-2 transition transform active:scale-95 flex items-center justify-center ${
                      config.textColor === color
                        ? 'border-stone-900 ring-2 ring-amber-400 scale-110'
                        : 'border-stone-300'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {config.textColor === color && (
                      <Check
                        className={`w-4 h-4 ${
                          color === '#FFFFFF' ? 'text-black' : 'text-white'
                        }`}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-200">
                <label className="block text-xs font-bold text-stone-600 mb-1.5">
                  Custom Color Picker
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) =>
                      updateConfigWithHistory({ ...config, textColor: e.target.value })
                    }
                    className="w-12 h-10 rounded-lg cursor-pointer border border-stone-300"
                  />
                  <span className="font-mono text-xs text-stone-700">{config.textColor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Undo / Redo Controls */}
          <div className="mt-8 pt-4 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className={`p-2 rounded-xl border border-stone-300 flex items-center gap-1.5 text-xs font-medium transition ${
                  historyIndex > 0
                    ? 'hover:bg-stone-100 text-stone-700'
                    : 'text-stone-300 cursor-not-allowed'
                }`}
              >
                <Undo2 className="w-4 h-4" />
                <span>Undo</span>
              </button>

              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className={`p-2 rounded-xl border border-stone-300 flex items-center gap-1.5 text-xs font-medium transition ${
                  historyIndex < history.length - 1
                    ? 'hover:bg-stone-100 text-stone-700'
                    : 'text-stone-300 cursor-not-allowed'
                }`}
              >
                <Redo2 className="w-4 h-4" />
                <span>Redo</span>
              </button>
            </div>

            <button
              onClick={() => setIsInsidePage(!isInsidePage)}
              className="text-xs font-semibold text-[#7A1F1F] hover:underline"
            >
              {isInsidePage ? 'View Front' : 'View Inside'}
            </button>
          </div>
        </div>

        {/* RIGHT LIVE CANVAS PREVIEW */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center">
          <div className="relative py-4 flex flex-col items-center">
            <FlippableCard
              photoUrl={photoUrl}
              teacherName={config.teacherName}
              message={config.message}
              customConfig={config}
              templateId={template.id}
              isFlipped={isInsidePage}
              onFlip={(flipped) => setIsInsidePage(flipped)}
              allowEdit={true}
              allowPhotoDrag={true}
              onPhotoMove={(pos) => onChangeConfig({ ...config, photoPosition: pos })}
              onTextClick={() => setActiveTab('text')}
            />

            <p className="font-script-accent text-stone-500 text-sm mt-4 flex items-center gap-1.5">
              <span>Click card to flip and preview both sides</span>
            </p>
          </div>

          {/* Action Navigation Buttons */}
          <div className="mt-8 flex items-center justify-center gap-4 w-full max-w-md">
            <button
              onClick={onBack}
              className="px-6 py-3.5 rounded-full border border-stone-400 hover:bg-stone-100 text-stone-700 font-semibold text-sm flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={onNext}
              className="flex-1 py-3.5 px-8 rounded-full bg-[#1C1917] hover:bg-stone-900 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition transform active:scale-95"
            >
              <span>Next: Preview Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
