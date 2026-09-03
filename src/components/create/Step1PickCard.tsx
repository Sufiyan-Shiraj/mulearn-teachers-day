'use client';

import React, { useState } from 'react';
import { CardTemplate, TemplateCategory } from '@/types';
import { Heart, Sparkles, Check, ArrowRight, ShieldCheck, PenTool, Share2 } from 'lucide-react';
import { WashiTape } from '../card/WashiTape';

interface Step1PickCardProps {
  templates: CardTemplate[];
  selectedTemplate: CardTemplate | null;
  onSelectTemplate: (template: CardTemplate) => void;
  onNext: () => void;
}

const CATEGORIES: TemplateCategory[] = [
  'All',
  'Bold',
  'Vintage',
];

export const Step1PickCard: React.FC<Step1PickCardProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  onNext,
}) => {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('All');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTemplates = templates.filter(
    (t) => activeCategory === 'All' || t.category === activeCategory
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 animate-fade-in">
      {/* Header Titles */}
      <div className="text-center relative mb-8">
        <p className="font-script-accent text-[#7A1F1F] text-2xl md:text-3xl font-bold">
          Pick your card
        </p>
        <h1 className="font-serif-heading text-3xl md:text-5xl font-extrabold text-stone-900 mt-1">
          choose a style you love
        </h1>
        <p className="font-script-accent text-stone-600 text-lg md:text-xl mt-2 max-w-xl mx-auto">
          Each design is fully customizable. Add your photo, your words, your heart.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap shadow-sm ${
                isActive
                  ? 'bg-stone-900 text-white ring-2 ring-stone-900 ring-offset-2'
                  : 'bg-[#FFFDF9] text-stone-700 hover:bg-stone-100 border border-stone-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          const isFav = favorites[template.id];

          return (
            <div
              key={template.id}
              onClick={() => {
                onSelectTemplate(template);
              }}
              className={`group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2.5 ${
                isSelected
                  ? 'ring-4 ring-[#7A1F1F] shadow-2xl scale-[1.02]'
                  : 'hover:shadow-xl border-2 border-stone-200/80 bg-[#FFFDF9]'
              }`}
            >
              {/* Card Badge */}
              {(template.badgeText || template.isNew) && (
                <div className="absolute top-3 left-3 z-20">
                  <span className="bg-[#FAF6F0] text-stone-800 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md font-script-accent border border-stone-300">
                    {template.badgeText || 'New'}
                  </span>
                </div>
              )}

              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => toggleFavorite(e, template.id)}
                className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur hover:bg-white flex items-center justify-center shadow transition active:scale-90"
              >
                <Heart
                  className={`w-4 h-4 transition ${
                    isFav ? 'text-red-500 fill-red-500' : 'text-stone-600'
                  }`}
                />
              </button>

              {/* Template Preview Image */}
              <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden flex items-center justify-center">
                <img
                  src={template.previewImageUrl}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {isSelected && (
                  <div className="absolute inset-0 bg-[#7A1F1F]/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#7A1F1F] text-white flex items-center justify-center shadow-lg animate-bounce">
                      <Check className="w-7 h-7 stroke-[3]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Template Label */}
              <div className="p-4 bg-[#FFFDF9] flex items-center justify-between border-t border-stone-100">
                <div>
                  <h3 className="font-serif-heading font-bold text-stone-900 text-base group-hover:text-[#7A1F1F] transition">
                    {template.name}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">{template.category} style</p>
                </div>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-[#7A1F1F] text-white'
                      : 'bg-stone-100 group-hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Use'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Note */}
      <div className="mt-12 flex justify-center">
        <div className="relative bg-[#FFFDF9] px-8 py-4 rounded-[2px] shadow-md border border-amber-200/60 transform -rotate-1 text-center max-w-md">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape-purple w-28 h-5 rounded-[1px] shadow-sm" />
          <p className="font-script-accent text-stone-800 text-xl font-bold">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            More styles coming soon!
          </p>
        </div>
      </div>

      {/* Next Step Action Button */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={onNext}
          disabled={!selectedTemplate}
          className={`px-10 py-4 rounded-full font-bold text-base shadow-xl flex items-center gap-3 transition-transform active:scale-95 ${
            selectedTemplate
              ? 'bg-[#7A1F1F] hover:bg-[#5C1515] text-white cursor-pointer hover:shadow-2xl'
              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
          }`}
        >
          <span>Continue to Add Photo</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Scrapbook Footer Information Bar */}
      <div className="mt-16 relative bg-[#1C1917] text-white rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center text-center md:text-left">
          <div className="border-b md:border-b-0 md:border-r border-stone-700 pb-4 md:pb-0 md:pr-6">
            <span className="font-script-accent text-amber-300 text-xl block">Crafted with care</span>
            <span className="font-sans font-bold text-sm tracking-wide">by mulearn ASI</span>
          </div>

          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 text-stone-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Your card is private and secure</span>
            </div>
            <p className="text-[11px] text-stone-400">Only accessible via your secret share link</p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 text-stone-300 text-xs font-semibold">
              <PenTool className="w-4 h-4 text-amber-400" />
              <span>Write from the heart</span>
            </div>
            <p className="text-[11px] text-stone-400">Custom fonts, notes and stickers</p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2 text-stone-300 text-xs font-semibold">
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>Share instantly</span>
            </div>
            <p className="text-[11px] text-stone-400">WhatsApp, download and print</p>
          </div>
        </div>
      </div>
    </div>
  );
};
