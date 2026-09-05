-- =========================================================
-- Migration 003: Wipe User Data & Seed All 7 Card Templates
-- =========================================================
-- This script will:
-- 1. Wipe all user accounts, cards, clicks/views, and leaderboard data.
-- 2. Clear out outdated template seeds.
-- 3. Populate all 7 production card templates into the templates table.
-- =========================================================

-- ---------------------------------------------------------
-- 1. WIPE ALL USER DATA, CARDS, CLICKS & LEADERBOARD STATS
-- ---------------------------------------------------------
TRUNCATE TABLE public.card_views CASCADE;
TRUNCATE TABLE public.cards CASCADE;
TRUNCATE TABLE public.users CASCADE;

-- Optional: If auth.users has leftover entries from initial auth testing
-- DELETE FROM auth.users;

-- ---------------------------------------------------------
-- 2. ENSURE TEMPLATES TABLE SUPPORTS SLUG / METADATA
-- ---------------------------------------------------------
ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Clear old prototype templates
TRUNCATE TABLE public.templates CASCADE;

-- ---------------------------------------------------------
-- 3. SEED ALL 7 PRODUCTION TEMPLATES
-- ---------------------------------------------------------
INSERT INTO public.templates (id, slug, name, category, preview_image_url, background_config, is_active)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'disco',
    'Golden Hour',
    'Bold',
    '/templates/disco.jpg',
    '{
      "artKey": "disco",
      "aspect": 0.5628,
      "accent": "#6b0f0e",
      "tags": ["bold", "vintage"],
      "dark": true,
      "overlayUrl": "/templates/disco-over.webp",
      "blurb": "Velvet, gold serif and a polaroid to fill."
    }'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'scrapbook',
    'Scrapbook 2026',
    'Playful',
    '/templates/scrapbook.jpg',
    '{
      "artKey": "scrapbook",
      "aspect": 0.7064,
      "accent": "#2c3f4d",
      "tags": ["playful", "retro", "vintage"],
      "dark": true,
      "overlayUrl": "/templates/scrapbook-over.webp",
      "blurb": "Cut-paper letters, vinyl, a graduation cap."
    }'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'velvet',
    'Red Velvet',
    'Bold',
    '/templates/velvet.jpg',
    '{
      "artKey": "velvet",
      "aspect": 0.6993,
      "accent": "#7b1113",
      "tags": ["bold", "vintage"],
      "dark": true,
      "overlayUrl": "/templates/velvet-over.webp",
      "blurb": "Deep red velvet, gold foil, polaroid photo frame."
    }'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'thankyou',
    'Thank You',
    'Minimal',
    '/templates/thankyou.jpg',
    '{
      "artKey": "thankyou",
      "aspect": 0.6599,
      "accent": "#74100f",
      "tags": ["bold", "minimal"],
      "dark": true,
      "overlayUrl": "/templates/thankyou-over.webp",
      "blurb": "Big editorial serif on deep crimson with disco sparkles."
    }'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'pressed',
    'Pressed Petals',
    'Floral',
    '/templates/pressed.jpg',
    '{
      "artKey": "pressed",
      "aspect": 0.7006,
      "accent": "#c98f8a",
      "tags": ["floral", "soft"],
      "dark": false,
      "overlayUrl": "/templates/pressed-over.webp",
      "blurb": "Handmade deckle paper with real dried pressed flowers."
    }'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'grateful',
    'Grateful',
    'Floral',
    '/templates/grateful.jpg',
    '{
      "artKey": "grateful",
      "aspect": 0.6944,
      "accent": "#1a1a1a",
      "tags": ["minimal", "floral"],
      "dark": true,
      "overlayUrl": "/templates/grateful-over.webp",
      "blurb": "Minimalist charcoal fine art paper with botanical bloom."
    }'::jsonb,
    true
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'lilac',
    'Lilac Note',
    'Soft',
    '/templates/lilac.jpg',
    '{
      "artKey": "lilac",
      "aspect": 0.6905,
      "accent": "#8c63a9",
      "tags": ["playful", "soft", "floral"],
      "dark": false,
      "overlayUrl": "/templates/lilac-over.webp",
      "blurb": "Dreamy pastel lavender watercolor with cosmos flowers."
    }'::jsonb,
    true
  )
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  preview_image_url = EXCLUDED.preview_image_url,
  background_config = EXCLUDED.background_config,
  is_active = EXCLUDED.is_active;
