'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Heart, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, PenTool, Share2 } from 'lucide-react';
import { TEMPLATE_REGISTRY } from '@/templates/registry';
import { WashiTape } from '@/components/card/WashiTape';
import { TemplateCategory } from '@/types';

const CATEGORIES: TemplateCategory[] = ['All', 'Bold', 'Vintage'];

export default function LandingPage() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('All');

  const filteredTemplates = TEMPLATE_REGISTRY.filter(
    (t) => activeCategory === 'All' || t.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-[#FAF6F0] overflow-hidden">
      {/* ======================================================== */}
      {/* HERO SECTION */}
      {/* ======================================================== */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 md:pt-14 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div>
              <p className="font-script-accent text-[#7A1F1F] text-2xl md:text-3xl font-bold">
                Make a
              </p>
              <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl font-black text-stone-900 tracking-tight leading-[1.08] mt-1">
                TEACHER&apos;S<br />
                <span className="text-[#7A1F1F]">DAY CARD</span>
              </h1>
              <p className="font-script-accent text-stone-800 text-2xl md:text-3xl mt-2">
                they will always remember
              </p>
            </div>

            <p className="text-stone-600 font-sans text-base md:text-lg max-w-md mx-auto lg:mx-0">
              Create a beautiful card with your photo, your words, and your appreciation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/create"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#1C1917] hover:bg-stone-800 text-white font-bold text-base shadow-xl flex items-center justify-center gap-3 transition transform active:scale-95 hover:shadow-2xl group"
              >
                <span>Create a Card</span>
                <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
              </Link>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#FFFDF9] hover:bg-stone-50 text-stone-800 font-semibold text-base border border-stone-300 shadow-sm flex items-center justify-center gap-2 transition"
              >
                <span>See How It Works</span>
                <span className="text-stone-400 font-bold">›</span>
              </a>
            </div>
          </div>

          {/* Hero Right Graphic: Scrapbook Collage */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center">
              {/* Torn Red Textured Paper Background */}
              <div className="absolute inset-x-8 inset-y-4 bg-[#7A1F1F] rounded-2xl transform rotate-3 shadow-lg overflow-hidden border border-red-900">
                <div className="absolute inset-0 bg-[radial-gradient(#9E2A2B_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />
              </div>

              {/* Grid pattern paper strip */}
              <div className="absolute left-0 top-1/4 w-16 h-40 bg-[#EFE6D5] rounded-sm transform -rotate-6 border border-stone-300/80 shadow-sm z-0" />

              {/* Central Polaroid Frame */}
              <div className="relative z-10 w-[84%] bg-[#FFFDF9] p-3 pb-8 rounded-[3px] polaroid-shadow border border-stone-200 transform -rotate-2 flex flex-col justify-between">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <WashiTape pattern="polka" width={110} height={26} rotation={1} />
                </div>

                <div className="relative aspect-[4/3] w-full rounded-[2px] overflow-hidden border border-stone-200">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80"
                    alt="Teacher and Student"
                    className="w-full h-full object-cover grayscale-[20%]"
                  />
                </div>

                <div className="mt-3 text-center">
                  <p className="font-script-accent text-stone-900 text-xl font-bold leading-tight">
                    Thank you for inspiring us every day!
                  </p>
                </div>
              </div>

              {/* 3D Balloon Silver Star */}
              <div className="absolute -left-3 bottom-14 z-20 w-16 h-16 transform -rotate-12 filter drop-shadow-xl animate-float">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <radialGradient id="heroStarGrad" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="40%" stopColor="#E2E8F0" />
                      <stop offset="85%" stopColor="#94A3B8" />
                      <stop offset="100%" stopColor="#64748B" />
                    </radialGradient>
                  </defs>
                  <polygon
                    points="50,5 64,36 98,38 72,61 80,95 50,77 20,95 28,61 2,38 36,36"
                    fill="url(#heroStarGrad)"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>

              {/* 3D Glossy Red Heart */}
              <div className="absolute -right-2 top-28 z-20 w-14 h-14 transform rotate-12 filter drop-shadow-xl animate-pulse">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <radialGradient id="heroHeartGrad" cx="35%" cy="30%" r="60%">
                      <stop offset="0%" stopColor="#FF6B6B" />
                      <stop offset="40%" stopColor="#E60000" />
                      <stop offset="100%" stopColor="#660000" />
                    </radialGradient>
                  </defs>
                  <path
                    d="M 50,88 C 20,65 5,45 5,28 C 5,12 18,3 32,3 C 41,3 47,8 50,14 C 53,8 59,3 68,3 C 82,3 95,12 95,28 C 95,45 80,65 50,88 Z"
                    fill="url(#heroHeartGrad)"
                  />
                </svg>
              </div>

              {/* Daisy Flower */}
              <div className="absolute right-4 bottom-8 z-20 w-12 h-12 transform rotate-45 filter drop-shadow">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <g fill="#FFFDF9" stroke="#E2E8F0" strokeWidth="1">
                    <ellipse cx="50" cy="18" rx="7" ry="16" />
                    <ellipse cx="50" cy="82" rx="7" ry="16" />
                    <ellipse cx="18" cy="50" rx="16" ry="7" />
                    <ellipse cx="82" cy="50" rx="16" ry="7" />
                  </g>
                  <circle cx="50" cy="50" r="14" fill="#F59E0B" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* TEMPLATE CAROUSEL PREVIEW */}
      {/* ======================================================== */}
      <section className="bg-[#FFFDF9]/80 border-y border-stone-200/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
            <div>
              <p className="font-script-accent text-[#7A1F1F] text-2xl font-bold">
                Pick a card that feels you
              </p>
              <h2 className="font-serif-heading text-2xl md:text-3xl font-bold text-stone-900 mt-0.5">
                Explore Card Templates
              </h2>
            </div>

            <Link
              href="/create"
              className="mt-4 sm:mt-0 text-stone-800 hover:text-[#7A1F1F] font-semibold text-sm flex items-center gap-1.5 transition"
            >
              <span>View all templates</span>
              <span className="font-bold">›</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-stone-900 text-white'
                    : 'bg-[#FAF6F0] text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredTemplates.slice(0, 5).map((tpl) => (
              <Link
                key={tpl.id}
                href={`/create?template=${tpl.id}`}
                className="group relative rounded-2xl overflow-hidden border border-stone-200 bg-[#FAF6F0] shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1.5"
              >
                {tpl.badgeText && (
                  <span className="absolute top-2 left-2 z-10 bg-white/90 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow font-script-accent">
                    {tpl.badgeText}
                  </span>
                )}
                <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100">
                  <img
                    src={tpl.previewImageUrl}
                    alt={tpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 bg-white border-t border-stone-100">
                  <p className="font-serif-heading font-bold text-stone-900 text-xs truncate">
                    {tpl.name}
                  </p>
                  <p className="text-[10px] text-stone-500">{tpl.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* HOW IT WORKS SECTION */}
      {/* ======================================================== */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="font-script-accent text-[#7A1F1F] text-2xl font-bold">
            Simple as 1, 2, 3
          </p>
          <h2 className="font-serif-heading text-3xl md:text-4xl font-extrabold text-stone-900 mt-1">
            How to Make Your Card
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative bg-[#FFFDF9] rounded-3xl p-8 shadow-lg border border-stone-200 text-center flex flex-col items-center">
            <div className="absolute -top-3">
              <WashiTape pattern="polka" width={80} height={22} rotation={-3} />
            </div>
            <div className="w-14 h-14 rounded-full bg-amber-100 text-[#7A1F1F] flex items-center justify-center font-serif-heading font-black text-xl mb-4">
              1
            </div>
            <h3 className="font-serif-heading text-xl font-bold text-stone-900 mb-2">
              Pick a Style
            </h3>
            <p className="text-stone-600 text-sm">
              Choose from vintage collages, retro party polaroids, or minimal botanical cards.
            </p>
          </div>

          <div className="relative bg-[#FFFDF9] rounded-3xl p-8 shadow-lg border border-stone-200 text-center flex flex-col items-center">
            <div className="absolute -top-3">
              <WashiTape pattern="red" width={80} height={22} rotation={2} />
            </div>
            <div className="w-14 h-14 rounded-full bg-red-100 text-[#7A1F1F] flex items-center justify-center font-serif-heading font-black text-xl mb-4">
              2
            </div>
            <h3 className="font-serif-heading text-xl font-bold text-stone-900 mb-2">
              Add Photo and Message
            </h3>
            <p className="text-stone-600 text-sm">
              Upload a memorable classroom photo or take an instant selfie with your teacher, then customize your note.
            </p>
          </div>

          <div className="relative bg-[#FFFDF9] rounded-3xl p-8 shadow-lg border border-stone-200 text-center flex flex-col items-center">
            <div className="absolute -top-3">
              <WashiTape pattern="gold" width={80} height={22} rotation={-2} />
            </div>
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-serif-heading font-black text-xl mb-4">
              3
            </div>
            <h3 className="font-serif-heading text-xl font-bold text-stone-900 mb-2">
              Share and Spread Joy
            </h3>
            <p className="text-stone-600 text-sm">
              Send your secret 3D flip card link via WhatsApp, or download high-res for printing.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#7A1F1F] hover:bg-[#5C1515] text-white font-bold rounded-full shadow-xl transition transform active:scale-95"
          >
            <span>Start Creating Now</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FOOTER */}
      {/* ======================================================== */}
      <footer id="about" className="bg-[#1C1917] text-white pt-12 pb-24 md:pb-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-800">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="mulearn ASI" className="h-8 brightness-0 invert" />
              <span className="font-script-accent text-amber-400 text-xl font-bold">
                Student Club Project
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-stone-400">
              <Link href="/create" className="hover:text-white transition">Create Card</Link>
              <Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link>
              <Link href="/my-cards" className="hover:text-white transition">My Cards</Link>
            </div>
          </div>

          <div className="pt-6 text-center text-xs text-stone-500 flex flex-col md:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} mulearn ASI club. Built for our teachers.</p>
            <p>Crafted with Next.js, Supabase and Cloudinary</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
