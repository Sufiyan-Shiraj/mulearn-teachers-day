'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchCardBySlug, incrementCardLike } from '@/lib/storage';
import { CardData } from '@/types';
import { FlippableCard } from '@/components/card/FlippableCard';
import { Heart, Sparkles, Share2, Copy, Check, MessageCircle, ArrowRight, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WashiTape } from '@/components/card/WashiTape';

export default function PublicCardViewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [card, setCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCardBySlug(slug).then((data) => {
        if (data) {
          setCard(data);
          setLikes(data.likeCount || 0);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  const handleLike = async () => {
    if (hasLiked || !slug) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#E11D48', '#FF6B6B', '#F43F5E'],
      });
    } catch {}

    await incrementCardLike(slug);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#FAF6F0]">
        <div className="w-12 h-12 rounded-full border-4 border-[#7A1F1F] border-t-transparent animate-spin mb-4" />
        <p className="font-script-accent text-stone-600 text-xl">Opening your card...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF6F0]">
        <div className="max-w-md bg-[#FFFDF9] p-8 rounded-3xl border border-stone-200 shadow-xl">
          <h1 className="font-serif-heading text-2xl font-bold text-stone-900 mt-3">
            Card Not Found
          </h1>
          <p className="font-script-accent text-stone-600 text-lg mt-2 mb-6">
            This card link might have expired or has not been published yet.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A1F1F] text-white rounded-full font-semibold text-sm shadow transition active:scale-95"
          >
            <span>Create a New Card</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Header */}
        <div className="text-center mb-6 relative">
          <span className="font-script-accent text-[#7A1F1F] text-2xl font-bold block">
            A special Teacher&apos;s Day tribute
          </span>
          <h1 className="font-serif-heading text-3xl md:text-4xl font-extrabold text-stone-900 mt-0.5">
            For {card.teacherName}
          </h1>
          {card.ownerName && (
            <p className="font-script-accent text-stone-500 text-lg mt-1">
              Created with love by{' '}
              <Link
                href={`/u/${card.ownerUsername || 'user'}`}
                className="text-stone-800 font-bold hover:underline"
              >
                @{card.ownerUsername || card.ownerName}
              </Link>
            </p>
          )}
        </div>

        {/* The 3D Flippable Card */}
        <div className="relative my-4 flex flex-col items-center">
          <FlippableCard
            photoUrl={card.photoUrl}
            teacherName={card.teacherName}
            message={card.message}
            customConfig={card.customConfig}
            templateId={card.templateId}
          />

          <p className="font-script-accent text-stone-500 text-base mt-4 flex items-center gap-1.5 animate-pulse">
            <span>Tap or click card to flip open and read inside letter</span>
          </p>
        </div>

        {/* Card Interactions: Like, Share & Copy */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`px-5 py-2.5 rounded-full flex items-center gap-2 shadow-md transition transform active:scale-90 font-semibold text-sm ${
              hasLiked
                ? 'bg-red-500 text-white shadow-red-200'
                : 'bg-white hover:bg-red-50 text-stone-800 border border-stone-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : 'text-red-500 fill-red-500/30'}`} />
            <span>{likes} {likes === 1 ? 'Heart' : 'Hearts'}</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.href : '';
              const text = encodeURIComponent(`Look at this Teacher's Day Card for ${card.teacherName}: ${url}`);
              window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
            }}
            className="px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-sm shadow flex items-center gap-2 transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-sm shadow-sm flex items-center gap-2 transition active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Bottom Call to Action for Visitors */}
        <div className="mt-14 w-full max-w-lg bg-[#FFFDF9] p-6 rounded-3xl border border-stone-200 shadow-xl text-center relative overflow-hidden">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape-gold w-32 h-5 rounded-[1px]" />
          <h3 className="font-serif-heading text-xl font-bold text-stone-900 mt-1">
            Want to make a card for your favorite teacher?
          </h3>
          <p className="font-script-accent text-stone-600 text-lg mt-1 mb-5">
            It takes only a minute to design and share your appreciation.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#7A1F1F] hover:bg-[#5C1515] text-white rounded-full font-bold text-sm shadow-lg transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Make Your Own Card</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
