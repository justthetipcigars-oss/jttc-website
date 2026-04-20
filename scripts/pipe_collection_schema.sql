-- =============================================================
-- My Pipe Collection — schema
-- =============================================================
-- Run once in Supabase → SQL Editor. Safe to re-run (IF NOT EXISTS guards).
--
-- Also run manually in Supabase Storage UI:
--   Create bucket:  pipe-photos  (public)
-- =============================================================

-- -----------------------------------------------------------------
-- Table: user_pipes
-- One row per pipe in a user's collection. Catalog pipes carry a
-- product_id pointing back to Lightspeed; custom pipes have null.
-- Specs are stored as strings (e.g. "5.28 in. | 134 mm") exactly
-- as parsed from the Lightspeed description.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_pipes (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Catalog link (null for custom pipes)
  product_id                  text,

  -- Identity
  pipe_name                   text NOT NULL,
  brand                       text NOT NULL,        -- "Brand / Carver"
  sub_category                text,                 -- Briar / Meerschaum / Cob / Clay / Custom

  -- Acquisition
  acquisition_source          text CHECK (acquisition_source IN ('New', 'Estate')),
  date_purchased              date,
  price_paid                  numeric(10,2),
  estimated_value             numeric(10,2),

  -- Status
  status                      text DEFAULT 'Active' CHECK (status IN ('Active', 'Resting', 'Retired')),
  rotation_frequency          text CHECK (rotation_frequency IN ('Daily', 'Weekly', 'Special occasion')),

  -- Dedicated tobacco (pick from Pipe Tobacco products)
  dedicated_tobacco_product_id text,
  dedicated_tobacco_name       text,

  -- Specs (parsed from product description or user-entered)
  length                      text,
  weight                      text,
  bowl_height                 text,
  chamber_depth               text,
  chamber_diameter            text,
  outside_diameter            text,
  stem_material               text,
  filter                      text,
  shape                       text,
  finish                      text,
  material                    text,
  country                     text,

  notes                       text,

  -- Stock image from catalog (null for custom)
  stock_image_url             text,

  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_pipes_user_id       ON public.user_pipes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pipes_sub_category  ON public.user_pipes(sub_category);

ALTER TABLE public.user_pipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own pipes"   ON public.user_pipes;
DROP POLICY IF EXISTS "Users insert own pipes" ON public.user_pipes;
DROP POLICY IF EXISTS "Users update own pipes" ON public.user_pipes;
DROP POLICY IF EXISTS "Users delete own pipes" ON public.user_pipes;

CREATE POLICY "Users read own pipes"   ON public.user_pipes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pipes" ON public.user_pipes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pipes" ON public.user_pipes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own pipes" ON public.user_pipes FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- -----------------------------------------------------------------
-- Table: user_pipe_photos
-- User-uploaded photos of their pipes. Stock image is stored on
-- user_pipes.stock_image_url (not in this table).
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_pipe_photos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pipe_id     uuid NOT NULL REFERENCES public.user_pipes(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url         text NOT NULL,
  is_primary  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_pipe_photos_pipe_id ON public.user_pipe_photos(pipe_id);

ALTER TABLE public.user_pipe_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own pipe photos"   ON public.user_pipe_photos;
DROP POLICY IF EXISTS "Users insert own pipe photos" ON public.user_pipe_photos;
DROP POLICY IF EXISTS "Users update own pipe photos" ON public.user_pipe_photos;
DROP POLICY IF EXISTS "Users delete own pipe photos" ON public.user_pipe_photos;

CREATE POLICY "Users read own pipe photos"   ON public.user_pipe_photos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own pipe photos" ON public.user_pipe_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own pipe photos" ON public.user_pipe_photos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own pipe photos" ON public.user_pipe_photos FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- -----------------------------------------------------------------
-- Trigger: keep updated_at fresh on user_pipes
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_pipes_updated_at ON public.user_pipes;
CREATE TRIGGER trg_user_pipes_updated_at
  BEFORE UPDATE ON public.user_pipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
