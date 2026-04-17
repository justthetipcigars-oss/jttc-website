-- =============================================================
-- Admin read access for Customer Sentiment page
-- =============================================================
-- Run this once in Supabase → SQL Editor.
-- Lets anyone with profiles.is_admin = true SELECT every row in
-- cigar_journal (not just their own). Non-admin users are
-- unaffected — their existing "own rows only" policy still applies.
--
-- Safe to run multiple times: DROP ... IF EXISTS guards it.
-- =============================================================

DROP POLICY IF EXISTS "Admins can read all journal entries" ON public.cigar_journal;

CREATE POLICY "Admins can read all journal entries"
  ON public.cigar_journal
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );
