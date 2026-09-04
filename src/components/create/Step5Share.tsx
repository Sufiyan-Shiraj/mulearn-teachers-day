'use client';

import React, { useState, useRef } from 'react';
import { CardCustomConfig, CardTemplate, CardData } from '@/types';
import { FlippableCard } from '../card/FlippableCard';
import {
  MessageCircle,
  Printer,
  Share2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Edit2,
  Heart,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WashiTape } from '../card/WashiTape';
import Link from 'next/link';

interface Step5ShareProps {
  template: CardTemplate;
  photoUrl: string;
  config: CardCustomConfig;
  publishedCard: CardData | null;
  isPublishing: boolean;
  onPublishAndShare: () => Promise<CardData>;
  onEdit: () => void;
}

export const Step5Share: React.FC<Step5ShareProps> = ({
  template,
  photoUrl,
  config,
  publishedCard,
  isPublishing,
  onPublishAndShare,
  onEdit,
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(publishedCard);
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  const getShareUrl = (slug?: string) => {
    const s = slug || cardData?.shareSlug || 'my-teacher-card';
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/c/${s}`;
    }
    return `https://mulearn-teachers-day.vercel.app/c/${s}`;
  };

  const handleShareCardClick = async () => {
    let current = cardData;
    if (!current) {
      current = await onPublishAndShare();
      setCardData(current);
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7A1F1F', '#D49B4B', '#F59E0B', '#F3EBDD'],
      });
    } catch {}

    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const text = encodeURIComponent(
      `Dear ${config.teacherName || 'Teacher'}, I made a special Teacher's Day card for you! Open it here: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadImage = async () => {
    try {
      const { toPng } = await import('html-to-image');
      if (cardContainerRef.current) {
        const dataUrl = await toPng(cardContainerRef.current, { quality: 0.95 });
        const link = document.createElement('a');
        link.download = `teachers-day-card-${config.teacherName || 'card'}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (e) {
      console.error('Download error:', e);
      alert('Generating high-res print export...');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-serif-heading text-3xl md:text-5xl font-extrabold text-stone-900">
          It&apos;s ready to make someone <span className="font-script-accent text-[#7A1F1F]">smile!</span>
        </h1>
        <p className="font-script-accent text-stone-600 text-lg md:text-xl mt-2 max-w-xl mx-auto">
          Your card is all set. Share it digitally or print it out for a more personal touch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: WHAT'S NEXT CARDS */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#FFFDF9] p-6 rounded-3xl border border-stone-200 shadow-xl space-y-4">
            <h3 className="font-serif-heading text-xl font-bold text-stone-900">
              What&apos;s next?
            </h3>

            {/* Primary Share Action */}
            <button
              onClick={handleShareCardClick}
              disabled={isPublishing}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#7A1F1F] hover:bg-[#5C1515] text-white font-bold text-base shadow-lg flex items-center justify-center gap-3 transition transform active:scale-98"
            >
              <Share2 className="w-5 h-5 text-amber-300" />
              <span>{isPublishing ? 'Publishing...' : 'Share Card Now'}</span>
            </button>

            {/* Option 1: Share Digitally */}
            <div
              onClick={handleShareCardClick}
              className="p-4 rounded-2xl bg-[#FAF6F0] hover:bg-amber-50/60 border border-stone-200 hover:border-amber-400 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm">Share Digitally</h4>
                  <p className="text-xs text-stone-500">Send it instantly to your teacher.</p>
                </div>
              </div>
              <span className="text-stone-400 group-hover:text-stone-800 text-sm font-bold">›</span>
            </div>

            {/* Option 2: Print Your Card */}
            <div
              onClick={handleDownloadImage}
              className="p-4 rounded-2xl bg-[#FAF6F0] hover:bg-amber-50/60 border border-stone-200 hover:border-amber-400 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center group-hover:scale-110 transition">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 text-sm">Print Your Card</h4>
                  <p className="text-xs text-stone-500">Download high quality image or print it.</p>
                </div>
              </div>
              <span className="text-stone-400 group-hover:text-stone-800 text-sm font-bold">›</span>
            </div>
          </div>

          {/* Memo Scrapbook Note */}
          <div className="relative bg-[#FFFDF9] p-5 rounded-[2px] shadow-md border border-amber-200 transform rotate-1 max-w-sm">
            <div className="absolute -top-3 left-6">
              <WashiTape pattern="red" width={80} height={22} rotation={3} />
            </div>
            <p className="font-script-accent text-stone-800 text-lg font-bold leading-snug">
              Thank you teachers for everything!
            </p>
          </div>
        </div>

        {/* CENTER CARD FINAL PREVIEW */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center py-4">
          <div ref={cardContainerRef} className="p-2">
            <FlippableCard
              photoUrl={photoUrl}
              teacherName={config.teacherName}
              message={config.message}
              customConfig={config}
              templateId={template.id}
            />
          </div>

          {/* Action Row */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={onEdit}
              className="px-6 py-3.5 rounded-full border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-sm flex items-center gap-2 transition"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Card</span>
            </button>

            <button
              onClick={handleShareCardClick}
              disabled={isPublishing}
              className="px-10 py-4 rounded-full bg-[#7A1F1F] hover:bg-[#5C1515] text-white font-bold text-base shadow-xl flex items-center gap-3 transition transform active:scale-95 hover:shadow-2xl"
            >
              <Share2 className="w-5 h-5 text-amber-300" />
              <span>{isPublishing ? 'Publishing...' : 'Share Card'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#FAF6F0] rounded-3xl p-6 md:p-8 border-4 border-[#FFFDF9] shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 font-bold text-xl">
                ✓
              </div>
              <h2 className="font-serif-heading text-2xl md:text-3xl font-bold text-stone-900 mt-2">
                Card Published!
              </h2>
              <p className="font-script-accent text-stone-600 text-lg mt-1">
                Anyone with the link can open and flip your card
              </p>
            </div>

            {/* Share URL Box */}
            <div className="p-3 bg-white rounded-2xl border border-stone-300 flex items-center justify-between gap-2 mb-5">
              <span className="text-xs font-mono text-stone-600 truncate flex-1">
                {getShareUrl()}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            {/* Share Channels */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={handleWhatsAppShare}
                className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <Link
                href={getShareUrl()}
                target="_blank"
                className="py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open View</span>
              </Link>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full py-3 rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
