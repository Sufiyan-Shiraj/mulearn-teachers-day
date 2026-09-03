'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchUserCards, deleteLocalCard } from '@/lib/storage';
import { CardData } from '@/types';
import { FlippableCard } from '@/components/card/FlippableCard';
import {
  Heart,
  Sparkles,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  PlusCircle,
  ArrowRight,
  User,
} from 'lucide-react';
import { WashiTape } from '@/components/card/WashiTape';

export default function MyCardsPage() {
  const { user, signInWithGoogle } = useAuth();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const loadCards = async () => {
    setLoading(true);
    const data = await fetchUserCards(user?.id || 'demo-user-123');
    setCards(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCards();
  }, [user]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteLocalCard(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleCopy = (slug: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/c/${slug}`);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <p className="font-script-accent text-[#7A1F1F] text-2xl font-bold">
              Your scrapbook collection
            </p>
            <h1 className="font-serif-heading text-3xl md:text-4xl font-extrabold text-stone-900 mt-0.5">
              My Cards Dashboard
            </h1>
          </div>

          <Link
            href="/create"
            className="px-6 py-3 bg-[#7A1F1F] hover:bg-[#5C1515] text-white rounded-full font-bold text-sm shadow-lg flex items-center gap-2 transition transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Create New Card</span>
          </Link>
        </div>

        {/* User Status Bar */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div>
                <p className="text-sm font-bold text-stone-800">You are browsing in guest mode</p>
                <p className="text-xs text-stone-600">Sign in with Google to sync your cards across devices and save your username.</p>
              </div>
            </div>
            <button
              onClick={() => signInWithGoogle()}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs shrink-0"
            >
              Sign In with Google
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-[#7A1F1F] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="font-script-accent text-stone-600 text-lg">Fetching your cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-3xl p-12 border border-stone-200 shadow-xl text-center max-w-lg mx-auto my-12 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape-purple w-28 h-5 rounded-[1px]" />
            <h3 className="font-serif-heading text-2xl font-bold text-stone-900 mt-3">
              No cards created yet
            </h3>
            <p className="font-script-accent text-stone-600 text-xl mt-1 mb-6">
              Create your very first Teacher&apos;s Day tribute card!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#7A1F1F] text-white rounded-full font-bold text-sm shadow-xl transition transform active:scale-95"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card) => (
              <div
                key={card.id}
                className="bg-[#FFFDF9] rounded-3xl p-5 border border-stone-200 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-between"
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
                      title="Copy Public Link"
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
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => handleDelete(card.id)}
                      title="Delete card"
                      className="p-2 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
