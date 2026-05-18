-- Fix 1: SECURITY DEFINER missing SET search_path (CRITICAL)
-- Also fixes trigger to only fire for Google OAuth sign-ins, not trainer magic-link sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new.app_metadata->>'provider' = 'google' THEN
    INSERT INTO public.users (id, email, display_name, avatar_url, google_id)
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'sub'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

-- Fix 2: clubs INSERT policy needs WITH CHECK
DROP POLICY IF EXISTS "Trainer can manage own clubs" ON clubs;
CREATE POLICY "Trainer can manage own clubs"
  ON clubs FOR ALL
  USING (trainer_id IN (SELECT id FROM trainers WHERE email = auth.jwt()->>'email'))
  WITH CHECK (trainer_id IN (SELECT id FROM trainers WHERE email = auth.jwt()->>'email'));

-- Fix 3: Add is_free / price_cents consistency constraint
ALTER TABLE clubs ADD CONSTRAINT clubs_free_price_consistent
  CHECK (
    (is_free = TRUE AND price_cents IS NULL) OR
    (is_free = FALSE AND price_cents IS NOT NULL)
  );
