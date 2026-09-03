'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Trophy, User, LogOut, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/90 backdrop-blur-md border-b border-stone-200/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 transition hover:opacity-90">
          <img src="/logo.svg" alt="mulearn ASI" className="h-9 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/#how-it-works"
            className="font-script-accent text-stone-700 hover:text-[#7A1F1F] text-xl font-bold transition"
          >
            How it works
          </Link>
          <Link
            href="/leaderboard"
            className="font-script-accent text-stone-700 hover:text-[#7A1F1F] text-xl font-bold flex items-center gap-1.5 transition"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Leaderboard</span>
          </Link>

          {/* My Cards Pill Button */}
          <Link
            href="/my-cards"
            className="px-5 py-2 rounded-full border border-stone-300 bg-[#FFFDF9] hover:bg-[#FAF6F0] text-stone-800 font-script-accent text-xl font-bold shadow-sm transition hover:shadow active:scale-95"
          >
            My Cards
          </Link>

          {/* Direct Google Sign In Button or User Avatar */}
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/u/${user.username || 'user'}`}
                className="flex items-center gap-2 p-1 pl-2 bg-stone-100/80 rounded-full border border-stone-200 hover:border-stone-400 transition"
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#7A1F1F] text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-semibold text-stone-800 pr-2 max-w-[100px] truncate">
                  @{user.username || user.displayName}
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                title="Sign out"
                className="text-stone-400 hover:text-stone-700 p-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="px-4 py-2 bg-[#7A1F1F] hover:bg-[#5C1515] text-white text-sm font-semibold rounded-full shadow-sm transition transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}
        </nav>

        {/* Mobile Header Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-700 hover:text-stone-900 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF6F0] border-b border-stone-300 px-6 py-4 space-y-3 shadow-lg animate-fade-in">
          <Link
            href="/create"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-lg font-script-accent font-bold text-[#7A1F1F]"
          >
            Create a Card
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-lg font-script-accent font-bold text-stone-800"
          >
            Leaderboard
          </Link>
          <Link
            href="/my-cards"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-lg font-script-accent font-bold text-stone-800"
          >
            My Cards
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-lg font-script-accent font-bold text-stone-800"
          >
            How it works
          </Link>

          <div className="pt-3 border-t border-stone-200">
            {user ? (
              <div className="flex items-center justify-between">
                <Link
                  href={`/u/${user.username || 'user'}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-[#7A1F1F] text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-stone-800">@{user.username || user.displayName}</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-semibold px-3 py-1 bg-red-50 rounded-full"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  signInWithGoogle();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#7A1F1F] text-white text-center font-semibold rounded-xl"
              >
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
