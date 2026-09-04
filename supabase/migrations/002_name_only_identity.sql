-- =========================================================
-- Teacher's Day Cards — drop accounts, keep names
-- =========================================================
-- There is no sign-in any more. Someone types a display name, the
-- browser mints them an id and keeps it in local storage, and that id
-- owns their cards. Nothing is authenticated, so every policy below is
-- open: this is a one-day event board where the worst case is a wrong
-- name on a card, not an account anyone can lose.
--
-- Safe to run on the existing database — it keeps the tables and the
-- rows already in them, and only unpicks the parts that needed Google.
-- Paste the whole file into the Supabase SQL editor and run it once.
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- 1. users is now its own table, not a mirror of auth.users
-- ---------------------------------------------------------
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- no Google means no email address and no profile picture
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN display_name SET DEFAULT 'Student';

-- ---------------------------------------------------------
-- 2. a card can outlive a failed profile write
-- ---------------------------------------------------------
ALTER TABLE public.cards DROP CONSTRAINT IF EXISTS cards_owner_id_fkey;
ALTER TABLE public.cards ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.cards
  ADD CONSTRAINT cards_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------
-- 3. the Google sign-up trigger has nothing left to listen to
-- ---------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ---------------------------------------------------------
-- 4. policies — auth.uid() is always null now, so every old
--    policy silently refused every write. Replace them.
-- ---------------------------------------------------------

-- USERS
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can claim a name"   ON public.users;
DROP POLICY IF EXISTS "Anyone can rename themselves" ON public.users;

CREATE POLICY "Anyone can claim a name"
  ON public.users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can rename themselves"
  ON public.users FOR UPDATE
  USING (true) WITH CHECK (true);

-- CARDS
DROP POLICY IF EXISTS "Authenticated users can create cards" ON public.cards;
DROP POLICY IF EXISTS "Owners can update their cards" ON public.cards;
DROP POLICY IF EXISTS "Owners can delete their cards" ON public.cards;
DROP POLICY IF EXISTS "Anyone can create cards" ON public.cards;
DROP POLICY IF EXISTS "Anyone can update cards" ON public.cards;

CREATE POLICY "Anyone can create cards"
  ON public.cards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update cards"
  ON public.cards FOR UPDATE
  USING (true) WITH CHECK (true);

-- deliberately no DELETE policy: nothing in the app deletes a card,
-- so leaving it out means nobody can wipe the board either.

-- ---------------------------------------------------------
-- 5. two names can be typed at the same moment — let the
--    database settle it rather than the browser
-- ---------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key_ci
  ON public.users (LOWER(username));
