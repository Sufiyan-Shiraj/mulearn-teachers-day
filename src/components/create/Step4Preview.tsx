'use client';

import React, { useState } from 'react';
import { CardCustomConfig, CardTemplate } from '@/types';
import { FlippableCard } from '../card/FlippableCard';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Edit2,
  Type,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { WashiTape } from '../card/WashiTape';

interface Step4PreviewProps {
  template: CardTemplate;
  photoUrl: string;
  config: CardCustomConfig;
  onNext: () => void;
  onBack: () => void;
  onJumpToStep: (step: number) => void;
}

export const Step4Preview: React.FC<Step4PreviewProps> = ({
  template,
  photoUrl,
  config,
  onNext,
  onBack,
  onJumpToStep,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationAngle, setRotationAngle] = useState(0);

  const handleRotate = () => {
    setRotationAngle((prev) => (prev + 90) % 360);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(0.7, prev + delta), 1.4));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-serif-heading text-3xl md:text-4xl font-extrabold text-stone-900">
          Almost <span className="font-script-accent text-[#7A1F1F]">there</span>
        </h1>
        <p className="font-script-accent text-stone-600 text-lg mt-1">
          Preview your card and make any final touches
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT CONTROLS */}
        <div className="lg:col-span-3 space-y-5">
          {/* Page Switcher Buttons */}
          <div className="bg-[#FFFDF9] p-3 rounded-2xl border border-stone-200 shadow-md space-y-2">
            <button
              onClick={() => setIsFlipped(false)}
              className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 transition text-sm font-semibold ${
                !isFlipped
                  ? 'bg-amber-100/70 border border-[#7A1F1F] text-[#7A1F1F] shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Layers className="w-4 h-4 text-[#7A1F1F]" />
              <span>Front of card</span>
            </button>

            <button
              onClick={() => setIsFlipped(true)}
              className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 transition text-sm font-semibold ${
                isFlipped
                  ? 'bg-amber-100/70 border border-[#7A1F1F] text-[#7A1F1F] shadow-sm'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
            >
              <Layers className="w-4 h-4 text-[#7A1F1F]" />
              <span>Inside of card</span>
            </button>
          </div>

          {/* Zoom & Rotate Controls */}
          <div className="bg-[#FFFDF9] p-4 rounded-2xl border border-stone-200 shadow-md space-y-3">
            <button
              onClick={handleRotate}
              className="w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-stone-600" />
                <span>Rotate</span>
              </span>
              <span className="font-mono text-stone-500">{rotationAngle}°</span>
            </button>

            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 pt-2 border-t border-stone-200">
              <span className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-stone-600" />
                <span>Zoom</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleZoom(-0.1)}
                  className="w-6 h-6 rounded bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold"
                >
                  -
                </button>
                <span className="font-mono">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => handleZoom(0.1)}
                  className="w-6 h-6 rounded bg-stone-200 hover:bg-stone-300 flex items-center justify-center font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Left Memo Note */}
          <div className="relative bg-[#FFFDF9] p-5 rounded-[2px] shadow-md border border-amber-200 transform -rotate-2">
            <div className="absolute -top-3 left-4">
              <WashiTape pattern="gold" width={70} height={20} rotation={-5} />
            </div>
            <p className="font-script-accent text-stone-800 text-lg font-bold leading-snug">
              You are creating something special for someone who means a lot.
            </p>
          </div>
        </div>

        {/* CENTER 3D CARD DISPLAY */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center py-4">
          <div
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transition: 'transform 0.4s ease',
            }}
          >
            <FlippableCard
              photoUrl={photoUrl}
              teacherName={config.teacherName}
              message={config.message}
              customConfig={config}
              templateId={template.id}
              isFlipped={isFlipped}
              onFlip={(flipped) => setIsFlipped(flipped)}
              scale={zoomLevel}
            />
          </div>

          {/* Page Indicator Pagination */}
          <div className="mt-6 flex items-center gap-4 bg-white/90 backdrop-blur px-5 py-2 rounded-full border border-stone-300 shadow-sm">
            <button
              onClick={() => setIsFlipped(false)}
              disabled={!isFlipped}
              className={`p-1 rounded-full transition ${
                isFlipped ? 'text-stone-800 hover:bg-stone-100' : 'text-stone-300 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-mono text-xs font-bold text-stone-700">
              {isFlipped ? '2 / 2 (Inside)' : '1 / 2 (Front)'}
            </span>
            <button
              onClick={() => setIsFlipped(true)}
              disabled={isFlipped}
              className={`p-1 rounded-full transition ${
                !isFlipped ? 'text-stone-800 hover:bg-stone-100' : 'text-stone-300 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RIGHT QUICK-EDIT RAIL */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-[#FFFDF9] p-4 rounded-3xl border border-stone-200 shadow-lg space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block px-2">
              Quick Adjustments
            </span>

            <button
              onClick={() => onJumpToStep(3)}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 flex items-center gap-2.5 transition"
            >
              <Edit2 className="w-4 h-4 text-[#7A1F1F]" />
              <span>Edit Text & Style</span>
            </button>

            <button
              onClick={() => onJumpToStep(2)}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 flex items-center gap-2.5 transition"
            >
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <span>Change Photo</span>
            </button>

            <button
              onClick={() => onJumpToStep(1)}
              className="w-full py-2.5 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 flex items-center gap-2.5 transition"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Switch Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3.5 rounded-full border border-stone-400 hover:bg-stone-100 text-stone-700 font-semibold text-sm flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Edit</span>
        </button>

        <button
          onClick={onNext}
          className="px-10 py-3.5 rounded-full bg-[#7A1F1F] hover:bg-[#5C1515] text-white font-bold text-sm shadow-xl flex items-center gap-3 transition transform active:scale-95"
        >
          <span>Continue to Share</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
