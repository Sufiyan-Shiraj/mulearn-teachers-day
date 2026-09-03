'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchCardsByUsername } from '@/lib/storage';
import { CardData } from '@/types';
import { FlippableCard } from '@/components/card/FlippableCard';
import { Heart, Sparkles, Share2, Copy, Check, ArrowRight, User, ExternalLink } from 'lucide-react';
import { WashiTape } from '@/components/card/WashiTape';

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchCardsByUsername(username).then((data) => {
        setCards(data);
        setLoading(false);
      });
    }
  }, [username]);

  const handleCopy = (slug: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/c/${slug}`);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  const totalHearts = cards.reduce((acc, c) => acc + (c.likeCount || 0), 0);
  const userDisplayName = cards[0]?.ownerName || username.replace(/_/g, ' ');
  const userAvatar = cards[0]?.ownerAvatar;

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* User Profile Banner Header */}
        <div className="relative bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl mb-10 overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute -top-3 left-12">
            <WashiTape pattern="polka" width={100} height={24} rotation={-2} />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userDisplayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[#7A1F1F]/20 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#7A1F1F] text-white flex items-center justify-center font-serif-heading text-3xl font-bold shadow-md">
                {userDisplayName.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h1 className="font-serif-heading text-2xl sm:text-3xl font-extrabold text-stone-900">
                {userDisplayName}
              </h1>
              <p className="font-mono text-xs font-semibold text-[#7A1F1F] mt-0.5">
                @{username}
              </p>
              <p className="font-script-accent text-stone-600 text-lg mt-1">
                mulearn ASI student club member
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-4">
            <div className="bg-[#FAF6F0] p-3 sm:p-4 rounded-2xl border border-stone-200 text-center min-w-[90px]">
              <span className="font-serif-heading font-black text-2xl text-stone-900 block">
                {cards.length}
              </span>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Cards
              </span>
            </div>

            <div className="bg-[#FAF6F0] p-3 sm:p-4 rounded-2xl border border-stone-200 text-center min-w-[90px]">
              <span className="font-serif-heading font-black text-2xl text-red-600 block flex items-center justify-center gap-1">
                <Heart className="w-5 h-5 fill-red-500" />
                <span>{totalHearts}</span>
              </span>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Hearts
              </span>
            </div>
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="font-script-accent text-[#7A1F1F] text-2xl font-bold">
              Personal tributes
            </p>
            <h2 className="font-serif-heading text-2xl md:text-3xl font-bold text-stone-900">
              Teacher&apos;s Day Cards
            </h2>
          </div>

          <Link
            href="/create"
            className="px-5 py-2.5 bg-[#7A1F1F] hover:bg-[#5C1515] text-white rounded-full text-xs font-bold shadow transition flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Create Card</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-[#7A1F1F] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="font-script-accent text-stone-600 text-lg">Loading cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-3xl p-10 border border-stone-200 shadow-md text-center max-w-md mx-auto my-8">
            <h3 className="font-serif-heading text-xl font-bold text-stone-900 mt-2">
              No cards created yet
            </h3>
            <p className="font-script-accent text-stone-600 text-lg mt-1 mb-5">
              Be the first to create a card for your teachers!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A1F1F] text-white rounded-full font-bold text-sm shadow transition"
            >
              <span>Create First Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-[#FFFDF9] rounded-3xl p-5 border border-stone-200 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-between group"
              >
                <div className="w-full flex justify-center py-2">
                  <FlippableCard
                    photoUrl={card.photoUrl}
                    teacherName={card.teacherName}
                    message={card.message}
                    customConfig={card.customConfig}
                    templateId={card.templateId}
                    scale={0.82}
                  />
                </div>

                <div className="w-full pt-4 border-t border-stone-100 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>{card.likeCount || 0} Hearts</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(card.shareSlug)}
                      title="Copy Share Link"
                      className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition"
                    >
                      {copiedSlug === card.shareSlug ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <Link
                      href={`/c/${card.shareSlug}`}
                      className="px-3.5 py-1.5 bg-[#1C1917] hover:bg-stone-800 text-white rounded-full text-xs font-semibold shadow-xs flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
