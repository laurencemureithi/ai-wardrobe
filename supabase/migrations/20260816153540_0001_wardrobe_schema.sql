/*
# Wardrobe Assistant — initial schema

## Overview
Creates the core MVP tables for the AI wardrobe assistant: profiles,
clothing items, outfits, outfit items, and wear events. All tables are
owner-scoped (multi-user with Supabase auth) and protected with row level
security so each user can only ever see their own data.

## New Tables
1. `profiles` — extends auth.users with wardrobe-specific preferences
   - id (uuid, PK, references auth.users)
   - display_name (text)
   - gender (text)
   - location (text)
   - lifestyle (text[]) — e.g. ["student","office"]
   - style_preferences (text[]) — e.g. ["smart casual","minimal"]
   - color_preferences (text[])
   - onboarding_complete (boolean, default false)
   - created_at / updated_at
2. `clothing_items` — individual wardrobe pieces
   - id (uuid PK)
   - user_id (uuid, defaults to auth.uid())
   - name (text)
   - category (text) — tops | bottoms | dresses | outerwear | shoes | accessories | other
   - subcategory (text)
   - color (text)
   - pattern (text)
   - material (text)
   - style (text)
   - formality (text) — casual | smart casual | formal
   - weather_suitability (text[])
   - season (text[])
   - brand (text)
   - image_url (text) — public URL to the item photo
   - status (text, default 'clean') — clean | worn | needs_washing | washing | drying | ready | unknown
   - wear_count (int, default 0)
   - last_worn (date)
   - notes (text)
   - created_at / updated_at
3. `outfits` — assembled looks (saved or generated)
   - id (uuid PK)
   - user_id (uuid, defaults to auth.uid())
   - name (text)
   - occasion (text)
   - style (text)
   - weather (text)
   - ai_confidence (int)
   - reason (text) — why the AI recommended it
   - is_saved (boolean, default false)
   - is_favorite (boolean, default false)
   - created_at / updated_at
4. `outfit_items` — join table linking outfits to clothing items
   - id (uuid PK)
   - outfit_id (uuid FK → outfits, cascade delete)
   - clothing_item_id (uuid FK → clothing_items)
   - slot (text) — top | bottom | dress | outerwear | shoes | accessory
5. `wear_events` — record of what the user actually wore on a given day
   - id (uuid PK)
   - user_id (uuid, defaults to auth.uid())
   - outfit_id (uuid FK → outfits, nullable)
   - worn_at (date)
   - occasion (text)
   - weather (text)
   - feedback (text) — loved | good | okay | not_for_me
   - notes (text)
   - created_at

## Security
- RLS enabled on every table.
- Four policies per table (select/insert/update/delete), scoped to `authenticated`,
  using `auth.uid() = user_id` ownership checks.
- `profiles` is keyed by `id = auth.uid()` (1:1 with auth.users).
- Owner columns default to `auth.uid()` so frontend inserts that omit user_id succeed.
- A private storage bucket `wardrobe` is created for user clothing images, with
  storage policies limiting access to the owning authenticated user's folder.

## Notes
1. `outfit_items` has no direct user_id column; access is scoped through the
   parent outfit via an EXISTS subquery against `outfits.user_id`.
2. All timestamps are timestamptz with sensible defaults.
3. Indexes added for user_id and frequently filtered columns.
*/

-- Profiles (1:1 with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  gender text,
  location text,
  lifestyle text[] DEFAULT '{}',
  style_preferences text[] DEFAULT '{}',
  color_preferences text[] DEFAULT '{}',
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Clothing items
CREATE TABLE IF NOT EXISTS clothing_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  subcategory text,
  color text,
  pattern text,
  material text,
  style text,
  formality text DEFAULT 'casual',
  weather_suitability text[] DEFAULT '{}',
  season text[] DEFAULT '{}',
  brand text,
  image_url text,
  status text NOT NULL DEFAULT 'clean',
  wear_count integer NOT NULL DEFAULT 0,
  last_worn date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_clothing_items" ON clothing_items;
CREATE POLICY "select_own_clothing_items" ON clothing_items FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_clothing_items" ON clothing_items;
CREATE POLICY "insert_own_clothing_items" ON clothing_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_clothing_items" ON clothing_items;
CREATE POLICY "update_own_clothing_items" ON clothing_items FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_clothing_items" ON clothing_items;
CREATE POLICY "delete_own_clothing_items" ON clothing_items FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);

-- Outfits
CREATE TABLE IF NOT EXISTS outfits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  occasion text,
  style text,
  weather text,
  ai_confidence integer,
  reason text,
  is_saved boolean NOT NULL DEFAULT false,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_outfits" ON outfits;
CREATE POLICY "select_own_outfits" ON outfits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_outfits" ON outfits;
CREATE POLICY "insert_own_outfits" ON outfits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_outfits" ON outfits;
CREATE POLICY "update_own_outfits" ON outfits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_outfits" ON outfits;
CREATE POLICY "delete_own_outfits" ON outfits FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);

-- Outfit items (join table)
CREATE TABLE IF NOT EXISTS outfit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id uuid NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  clothing_item_id uuid NOT NULL REFERENCES clothing_items(id) ON DELETE CASCADE,
  slot text NOT NULL
);

ALTER TABLE outfit_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_outfit_items" ON outfit_items;
CREATE POLICY "select_own_outfit_items" ON outfit_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_own_outfit_items" ON outfit_items;
CREATE POLICY "insert_own_outfit_items" ON outfit_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_outfit_items" ON outfit_items;
CREATE POLICY "update_own_outfit_items" ON outfit_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_outfit_items" ON outfit_items;
CREATE POLICY "delete_own_outfit_items" ON outfit_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM outfits WHERE outfits.id = outfit_items.outfit_id AND outfits.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON outfit_items(outfit_id);

-- Wear events
CREATE TABLE IF NOT EXISTS wear_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id uuid REFERENCES outfits(id) ON DELETE SET NULL,
  worn_at date NOT NULL DEFAULT CURRENT_DATE,
  occasion text,
  weather text,
  feedback text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE wear_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_wear_events" ON wear_events;
CREATE POLICY "select_own_wear_events" ON wear_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_wear_events" ON wear_events;
CREATE POLICY "insert_own_wear_events" ON wear_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_wear_events" ON wear_events;
CREATE POLICY "update_own_wear_events" ON wear_events FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_wear_events" ON wear_events;
CREATE POLICY "delete_own_wear_events" ON wear_events FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wear_events_user_id ON wear_events(user_id);
CREATE INDEX IF NOT EXISTS idx_wear_events_worn_at ON wear_events(worn_at);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_clothing_items_updated_at ON clothing_items;
CREATE TRIGGER trg_clothing_items_updated_at BEFORE UPDATE ON clothing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_outfits_updated_at ON outfits;
CREATE TRIGGER trg_outfits_updated_at BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Private storage bucket for wardrobe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe', 'wardrobe', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can only access their own folder
DROP POLICY IF EXISTS "wardrobe_read_own" ON storage.objects;
CREATE POLICY "wardrobe_read_own" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "wardrobe_insert_own" ON storage.objects;
CREATE POLICY "wardrobe_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "wardrobe_update_own" ON storage.objects;
CREATE POLICY "wardrobe_update_own" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "wardrobe_delete_own" ON storage.objects;
CREATE POLICY "wardrobe_delete_own" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'wardrobe' AND (storage.foldername(name))[1] = auth.uid()::text
  );
