'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { fetchLeaderboards } from '@/lib/storage';
import { LeaderboardEntry } from '@/types';
import { Trophy, Heart, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { WashiTape } from '@/components/card/WashiTape';

type TimeFrame = 'This Week' | 'This Month' | 'All Time';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<TimeFrame>('This Week');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboards(timeframe).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [timeframe]);

  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];
  const restEntries = entries.slice(3);

  const userEntryIndex = user
    ? entries.findIndex(
        (e) =>
          (user.username && e.username === user.username) ||
          e.displayName === user.displayName
      )
    : -1;

  const currentUserRank = user
    ? {
        rank: userEntryIndex >= 0 ? userEntryIndex + 1 : '—',
        displayName: user.displayName || 'mulearn Student',
        username: user.username || 'student',
        avatarUrl: user.avatarUrl || '',
        likes: userEntryIndex >= 0 ? entries[userEntryIndex].likeCount : 0,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#FAF6F0] py-6 md:py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center relative mb-8">
          <h1 className="font-script-accent text-3xl md:text-4xl font-bold text-stone-900 inline-flex items-center justify-center gap-2">
            <span>Leaderboards</span>
          </h1>
          <p className="font-script-accent text-stone-600 text-lg md:text-xl mt-1">
            Create, share and spread smiles
          </p>

          {/* Timeframe Filter Pills */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {(['This Week', 'This Month', 'All Time'] as TimeFrame[]).map((tab) => {
              const isActive = timeframe === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setTimeframe(tab)}
                  className={`px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition shadow-sm ${
                    isActive
                      ? 'bg-[#7A1F1F] text-white ring-2 ring-[#7A1F1F] ring-offset-2'
                      : 'bg-[#FFFDF9] text-stone-700 hover:bg-stone-100 border border-stone-300'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 rounded-full border-3 border-[#7A1F1F] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="font-script-accent text-stone-600 text-lg">Loading leaderboard rankings...</p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFFDF9] rounded-3xl p-10 md:p-14 border border-stone-200 shadow-xl text-center max-w-lg mx-auto my-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 washi-tape-gold w-32 h-6 rounded-[1px] shadow-sm -rotate-1" />
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="font-serif-heading text-2xl font-bold text-stone-900">
              No cards ranked yet
            </h3>
            <p className="font-script-accent text-stone-600 text-lg mt-2 mb-6">
              Be the first to create and share a Teacher&apos;s Day tribute card to claim the #1 spot!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#7A1F1F] hover:bg-[#5C1515] text-white rounded-full font-bold text-sm shadow-xl transition transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Create a Card</span>
            </Link>
          </div>
        ) : (
          <>
            {/* TOP 3 PODIUM SECTION */}
            <div className="relative mt-8 mb-12 pt-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto">
                {/* Rank 2 (Silver / Left) */}
                {top2 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      {top2.avatarUrl ? (
                        <img
                          src={top2.avatarUrl}
                          alt={top2.displayName}
                          className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover border-3 border-[#93C5FD] shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-sky-200 text-sky-900 flex items-center justify-center font-bold text-lg">
                          {top2.displayName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-[#93C5FD] text-white flex items-center justify-center text-xs font-bold shadow">
                        2
                      </div>
                    </div>

                    <div className="w-full bg-[#BFDBFE] rounded-t-2xl p-3 sm:p-4 text-center shadow-md border-t-2 border-x-2 border-white/60 min-h-[140px] sm:min-h-[170px] flex flex-col justify-between">
                      <div className="bg-[#EFF6FF] rounded-xl p-2 shadow-sm">
                        <p className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                          {top2.displayName}
                        </p>
                        <p className="text-[10px] text-stone-500">@{top2.username}</p>
                      </div>
                      <div className="bg-white/80 py-1.5 px-2 rounded-full inline-flex items-center justify-center gap-1 mt-2 text-xs font-bold text-stone-800 shadow-xs">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        <span>{top2.likeCount}</span>
                      </div>
                      <span className="font-serif-heading font-black text-white text-3xl sm:text-4xl opacity-50 mt-1">
                        2
                      </span>
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                {/* Rank 1 (Gold / Center / Crown) */}
                {top1 ? (
                  <div className="flex flex-col items-center z-10 -mt-6">
                    <div className="relative mb-2">
                      <Crown className="w-8 h-8 text-amber-500 fill-amber-400 absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce" />
                      {top1.avatarUrl ? (
                        <img
                          src={top1.avatarUrl}
                          alt={top1.displayName}
                          className="w-18 h-18 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-amber-400 shadow-xl ring-4 ring-amber-100"
                        />
                      ) : (
                        <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-amber-300 text-amber-950 flex items-center justify-center font-bold text-xl border-4 border-amber-400 shadow-xl">
                          {top1.displayName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center text-xs font-black shadow">
                        1
                      </div>
                    </div>

                    <div className="w-full bg-[#FDE68A] rounded-t-2xl p-3 sm:p-4 text-center shadow-xl border-t-2 border-x-2 border-white/80 min-h-[180px] sm:min-h-[220px] flex flex-col justify-between">
                      <div className="bg-[#FEF3C7] rounded-xl p-2.5 shadow-sm">
                        <p className="font-bold text-stone-900 text-xs sm:text-base truncate">
                          {top1.displayName}
                        </p>
                        <p className="text-[10px] sm:text-xs text-stone-600">@{top1.username}</p>
                      </div>
                      <div className="bg-white/90 py-1.5 px-3 rounded-full inline-flex items-center justify-center gap-1.5 mt-2 text-xs sm:text-sm font-extrabold text-stone-900 shadow-xs">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>{top1.likeCount}</span>
                      </div>
                      <span className="font-serif-heading font-black text-amber-600/40 text-4xl sm:text-5xl mt-1">
                        1
                      </span>
                    </div>
                  </div>
                ) : (
                  <div />
                )}

                {/* Rank 3 (Bronze / Pink / Right) */}
                {top3 ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-2">
                      {top3.avatarUrl ? (
                        <img
                          src={top3.avatarUrl}
                          alt={top3.displayName}
                          className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover border-3 border-[#FCA5A5] shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-rose-200 text-rose-950 flex items-center justify-center font-bold text-lg">
                          {top3.displayName.charAt(0)}
                        </div>
                      )}
                      <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-[#FCA5A5] text-white flex items-center justify-center text-xs font-bold shadow">
                        3
                      </div>
                    </div>

                    <div className="w-full bg-[#FECDD3] rounded-t-2xl p-3 sm:p-4 text-center shadow-md border-t-2 border-x-2 border-white/60 min-h-[120px] sm:min-h-[150px] flex flex-col justify-between">
                      <div className="bg-[#FFF1F2] rounded-xl p-2 shadow-sm">
                        <p className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                          {top3.displayName}
                        </p>
                        <p className="text-[10px] text-stone-500">@{top3.username}</p>
                      </div>
                      <div className="bg-white/80 py-1.5 px-2 rounded-full inline-flex items-center justify-center gap-1 mt-2 text-xs font-bold text-stone-800 shadow-xs">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                        <span>{top3.likeCount}</span>
                      </div>
                      <span className="font-serif-heading font-black text-white text-3xl sm:text-4xl opacity-50 mt-1">
                        3
                      </span>
                    </div>
                  </div>
                ) : (
                  <div />
                )}
              </div>
            </div>

            {/* REST OF RANKINGS LIST */}
            {restEntries.length > 0 && (
              <div className="relative bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 mb-8">
                <div className="space-y-3">
                  {restEntries.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-stone-50 transition border-b border-stone-100 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-serif-heading font-black text-lg text-stone-700 w-6 text-center">
                          {item.rank}
                        </span>
                        {item.avatarUrl ? (
                          <img
                            src={item.avatarUrl}
                            alt={item.displayName}
                            className="w-11 h-11 rounded-full object-cover border border-stone-300 shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm">
                            {item.displayName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm">{item.displayName}</h4>
                          <p className="text-xs text-stone-500">@{item.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span>{item.likeCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PINNED "YOUR RANK" ROW */}
            {currentUserRank && (
              <div className="mb-8">
                <div className="relative bg-[#F3E8FF] p-4 rounded-2xl border-2 border-purple-300 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4 pl-2">
                    <div className="text-center">
                      <span className="font-script-accent text-[11px] font-bold text-purple-800 block leading-none">
                        Your Rank
                      </span>
                      <span className="font-serif-heading font-black text-xl text-purple-900">
                        {currentUserRank.rank}
                      </span>
                    </div>

                    {currentUserRank.avatarUrl ? (
                      <img
                        src={currentUserRank.avatarUrl}
                        alt={currentUserRank.displayName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-purple-400 shadow-sm"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#7A1F1F] text-white flex items-center justify-center font-bold text-sm">
                        {currentUserRank.displayName.charAt(0)}
                      </div>
                    )}

                    <div>
                      <h4 className="font-bold text-purple-950 text-sm">
                        {currentUserRank.displayName}
                      </h4>
                      <p className="text-xs text-purple-700">@{currentUserRank.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-purple-900">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>{currentUserRank.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom Footer */}
        <div className="mt-8 text-center">
          <p className="font-script-accent text-stone-600 text-lg">
            Keep creating and sharing to climb the leaderboard!
          </p>
          <div className="mt-4">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7A1F1F] hover:bg-[#5C1515] text-white rounded-full font-bold text-sm shadow-md transition active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Create Another Card</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
