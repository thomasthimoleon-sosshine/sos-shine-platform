-- ══════════════════════════════════════════════════════════════
-- FIX: Auto-count shines via database triggers
-- Previously, shine counting relied on client-side RPC calls
-- which could fail silently. This trigger ensures shines_given
-- and shines_received are always accurate.
-- ══════════════════════════════════════════════════════════════

-- ── Trigger function: on INSERT into post_likes ──
CREATE OR REPLACE FUNCTION public.on_shine_given()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.post_id;

  -- Increment shines_given for the user who gave the shine (+5 XP)
  INSERT INTO public.user_xp (user_id, total_xp, level, shines_given, shines_received)
  VALUES (NEW.user_id, 5, 1, 1, 0)
  ON CONFLICT (user_id) DO UPDATE SET
    total_xp = user_xp.total_xp + 5,
    shines_given = user_xp.shines_given + 1,
    updated_at = now();

  -- Increment shines_received for the post author (+3 XP), if different from giver
  IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
    INSERT INTO public.user_xp (user_id, total_xp, level, shines_received, shines_given)
    VALUES (v_author_id, 3, 1, 1, 0)
    ON CONFLICT (user_id) DO UPDATE SET
      total_xp = user_xp.total_xp + 3,
      shines_received = user_xp.shines_received + 1,
      updated_at = now();
  END IF;

  -- Recalculate levels
  UPDATE public.user_xp SET level = CASE
    WHEN total_xp >= 4000 THEN 10
    WHEN total_xp >= 3000 THEN 9
    WHEN total_xp >= 2200 THEN 8
    WHEN total_xp >= 1500 THEN 7
    WHEN total_xp >= 1000 THEN 6
    WHEN total_xp >= 600 THEN 5
    WHEN total_xp >= 350 THEN 4
    WHEN total_xp >= 150 THEN 3
    WHEN total_xp >= 50 THEN 2
    ELSE 1
  END
  WHERE user_id = NEW.user_id;

  IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
    UPDATE public.user_xp SET level = CASE
      WHEN total_xp >= 4000 THEN 10
      WHEN total_xp >= 3000 THEN 9
      WHEN total_xp >= 2200 THEN 8
      WHEN total_xp >= 1500 THEN 7
      WHEN total_xp >= 1000 THEN 6
      WHEN total_xp >= 600 THEN 5
      WHEN total_xp >= 350 THEN 4
      WHEN total_xp >= 150 THEN 3
      WHEN total_xp >= 50 THEN 2
      ELSE 1
    END
    WHERE user_id = v_author_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Trigger function: on DELETE from post_likes (un-shine) ──
CREATE OR REPLACE FUNCTION public.on_shine_removed()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Get the post author
  SELECT author_id INTO v_author_id FROM public.posts WHERE id = OLD.post_id;

  -- Decrement shines_given for the user who removed the shine (-5 XP)
  UPDATE public.user_xp SET
    total_xp = GREATEST(0, total_xp - 5),
    shines_given = GREATEST(0, shines_given - 1),
    updated_at = now()
  WHERE user_id = OLD.user_id;

  -- Decrement shines_received for the post author (-3 XP)
  IF v_author_id IS NOT NULL AND v_author_id != OLD.user_id THEN
    UPDATE public.user_xp SET
      total_xp = GREATEST(0, total_xp - 3),
      shines_received = GREATEST(0, shines_received - 1),
      updated_at = now()
    WHERE user_id = v_author_id;
  END IF;

  -- Recalculate levels
  UPDATE public.user_xp SET level = CASE
    WHEN total_xp >= 4000 THEN 10
    WHEN total_xp >= 3000 THEN 9
    WHEN total_xp >= 2200 THEN 8
    WHEN total_xp >= 1500 THEN 7
    WHEN total_xp >= 1000 THEN 6
    WHEN total_xp >= 600 THEN 5
    WHEN total_xp >= 350 THEN 4
    WHEN total_xp >= 150 THEN 3
    WHEN total_xp >= 50 THEN 2
    ELSE 1
  END
  WHERE user_id = OLD.user_id;

  IF v_author_id IS NOT NULL AND v_author_id != OLD.user_id THEN
    UPDATE public.user_xp SET level = CASE
      WHEN total_xp >= 4000 THEN 10
      WHEN total_xp >= 3000 THEN 9
      WHEN total_xp >= 2200 THEN 8
      WHEN total_xp >= 1500 THEN 7
      WHEN total_xp >= 1000 THEN 6
      WHEN total_xp >= 600 THEN 5
      WHEN total_xp >= 350 THEN 4
      WHEN total_xp >= 150 THEN 3
      WHEN total_xp >= 50 THEN 2
      ELSE 1
    END
    WHERE user_id = v_author_id;
  END IF;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── Create triggers ──
DROP TRIGGER IF EXISTS trg_shine_given ON public.post_likes;
CREATE TRIGGER trg_shine_given
  AFTER INSERT ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_shine_given();

DROP TRIGGER IF EXISTS trg_shine_removed ON public.post_likes;
CREATE TRIGGER trg_shine_removed
  AFTER DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.on_shine_removed();
