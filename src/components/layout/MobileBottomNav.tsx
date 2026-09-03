'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, PlusSquare, Trophy, Heart, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();

  // Don't show mobile bottom nav on the editor step if it interferes with canvas keyboard
  if (pathname.includes('/create/edit')) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Templates', href: '/create', icon: LayoutGrid },
    { label: 'Create', href: '/create', icon: Sparkles, isPrimary: true },
    { label: 'My Cards', href: '/my-cards', icon: Heart },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-lg border-t border-stone-300/80 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href && !item.isPrimary;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.label}
                href="/create"
                className="relative -top-3 flex flex-col items-center group"
              >
                <div className="w-13 h-13 rounded-full bg-[#7A1F1F] text-amber-300 shadow-lg flex items-center justify-center border-4 border-[#FAF6F0] transform transition active:scale-90">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-[#7A1F1F] mt-0.5 font-script-accent">Create</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
                isActive ? 'text-[#7A1F1F]' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold text-[#7A1F1F]' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
