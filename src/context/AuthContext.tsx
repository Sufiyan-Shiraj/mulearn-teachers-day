'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { supabase, isSupabaseConfigured, signInWithGoogle as doSignInWithGoogle, signOut as doSignOut } from '@/lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUsername: (newUsername: string) => Promise<boolean>;
  showUsernamePrompt: boolean;
  setShowUsernamePrompt: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);

  // Sync user session
  const checkSession = async () => {
    setIsLoading(true);

    if (typeof window !== 'undefined') {
      const demoUserStr = localStorage.getItem('mulearn_demo_user');
      if (demoUserStr) {
        try {
          const parsed = JSON.parse(demoUserStr);
          setUser(parsed);
          setIsLoading(false);
          return;
        } catch {}
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              displayName: profile.display_name || session.user.user_metadata?.full_name || 'Student',
              avatarUrl: profile.avatar_url || session.user.user_metadata?.avatar_url || '',
              username: profile.username || '',
              createdAt: profile.created_at,
            });
            if (!profile.username) {
              setShowUsernamePrompt(true);
            }
          } else {
            // New user signed in
            const defaultUsername = (session.user.email?.split('@')[0] || 'student').replace(/[^a-z0-9_]/gi, '').toLowerCase();
            const newUser: UserProfile = {
              id: session.user.id,
              email: session.user.email || '',
              displayName: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Student',
              avatarUrl: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
              username: defaultUsername,
              createdAt: new Date().toISOString(),
            };
            setUser(newUser);
            setShowUsernamePrompt(true);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Session check error:', e);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    checkSession();

    // Listen for custom auth events or Supabase auth state change
    const handleCustomAuthChange = () => {
      checkSession();
    };

    window.addEventListener('mulearn_auth_change', handleCustomAuthChange);

    let authListener: any = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          checkSession();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      window.removeEventListener('mulearn_auth_change', handleCustomAuthChange);
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await doSignInWithGoogle();
      setIsAuthModalOpen(false);
    } catch (e) {
      console.error('Sign in failed:', e);
    }
  };

  const signOut = async () => {
    await doSignOut();
    setUser(null);
  };

  const updateUsername = async (newUsername: string): Promise<boolean> => {
    const clean = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!clean || !user) return false;

    const updatedUser = { ...user, username: clean };
    setUser(updatedUser);

    if (typeof window !== 'undefined') {
      localStorage.setItem('mulearn_demo_user', JSON.stringify(updatedUser));
    }

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('users')
          .update({ username: clean })
          .eq('id', user.id);
      } catch (e) {
        console.error('Error updating username:', e);
      }
    }

    setShowUsernamePrompt(false);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        signInWithGoogle,
        signOut,
        updateUsername,
        showUsernamePrompt,
        setShowUsernamePrompt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
