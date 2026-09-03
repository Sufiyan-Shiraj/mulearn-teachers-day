-- =========================================================
-- Teacher's Day Cards — Supabase Schema & RLS Policies
-- mulearn ASI student club project
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'All',
  preview_image_url TEXT NOT NULL,
  background_config JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CARDS TABLE
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL,
  teacher_name TEXT NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  photo_public_id TEXT,
  share_slug TEXT UNIQUE NOT NULL,
  like_count INTEGER DEFAULT 0 NOT NULL,
  custom_config JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CARD_VIEWS TABLE (Lightweight Analytics)
CREATE TABLE IF NOT EXISTS public.card_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_cards_owner_id ON public.cards(owner_id);
CREATE INDEX IF NOT EXISTS idx_cards_share_slug ON public.cards(share_slug);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_card_views_card_id ON public.card_views(card_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_views ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- USERS
-- Anyone can view public user profiles
CREATE POLICY "Public users can view safe user profile fields"
  ON public.users FOR SELECT
  USING (true);

-- Authenticated users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- TEMPLATES
-- Public can view active templates
CREATE POLICY "Public can view active templates"
  ON public.templates FOR SELECT
  USING (is_active = true);

-- CARDS
-- Public can view all cards (by share_slug or on public profiles)
CREATE POLICY "Public can view cards"
  ON public.cards FOR SELECT
  USING (true);

-- Authenticated users can create cards
CREATE POLICY "Authenticated users can create cards"
  ON public.cards FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Card owners can update their cards
CREATE POLICY "Owners can update their cards"
  ON public.cards FOR UPDATE
  USING (auth.uid() = owner_id);

-- Card owners can delete their cards
CREATE POLICY "Owners can delete their cards"
  ON public.cards FOR DELETE
  USING (auth.uid() = owner_id);

-- Public can increment card likes (via RPC or controlled update)
CREATE OR REPLACE FUNCTION public.increment_card_likes(target_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE public.cards
  SET like_count = like_count + 1
  WHERE share_slug = target_slug
  RETURNING like_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CARD VIEWS
CREATE POLICY "Public can insert card views"
  ON public.card_views FOR INSERT
  WITH CHECK (true);

-- AUTH TRIGGER: automatically create or update users row when Google auth succeeds
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  raw_username TEXT;
  clean_username TEXT;
BEGIN
  raw_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  clean_username := REGEXP_REPLACE(raw_username, '[^a-z0-9_]', '', 'g');
  
  INSERT INTO public.users (id, email, display_name, avatar_url, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Student'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    clean_username
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP IF EXISTS and RECREATE TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED INITIAL TEMPLATES
INSERT INTO public.templates (id, name, category, preview_image_url, background_config, is_active)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Maroon Party Polaroid',
    'Bold',
    '/templates/template_1.png',
    '{"theme": "maroon", "accent": "#D49B4B", "layout": "polaroid_party"}'::jsonb,
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '2026 Vintage Collage',
    'Vintage',
    '/templates/template_2.png',
    '{"theme": "navy_denim", "accent": "#E5A83B", "layout": "collage_2026"}'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;
