'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/create';

  useEffect(() => {
    const handleAuth = async () => {
      // 1. Check if session already exists
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace(next);
        return;
      }

      // 2. Listen for auth state change
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          router.replace(next);
        }
      });

      // 3. Fallback redirect after 1.5s
      const timer = setTimeout(() => {
        router.replace(next);
      }, 1500);

      return () => {
        authListener?.subscription.unsubscribe();
        clearTimeout(timer);
      };
    };

    handleAuth();
  }, [router, next]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF6F0] p-4">
      <div className="w-12 h-12 rounded-full border-4 border-[#7A1F1F] border-t-transparent animate-spin mb-4" />
      <h2 className="font-serif-heading text-2xl font-bold text-stone-900">
        Signing you in...
      </h2>
      <p className="font-script-accent text-stone-600 text-lg mt-1">
        Redirecting to your cards studio
      </p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
          <div className="w-10 h-10 rounded-full border-3 border-[#7A1F1F] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
