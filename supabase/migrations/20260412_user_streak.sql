-- Streak calculation function + login tracking
-- Computes how many consecutive days a user has had at least one action

CREATE OR REPLACE FUNCTION get_user_streak(p_user_id UUID)
RETURNS TABLE (current_streak INT, longest_streak INT, last_action_date DATE) AS $$
DECLARE
  v_current_streak INT := 0;
  v_longest_streak INT := 0;
  v_last_date DATE;
  v_prev_date DATE;
  v_running INT := 0;
  rec RECORD;
BEGIN
  -- Distinct active days in descending order
  FOR rec IN
    SELECT DISTINCT action_date::DATE AS d
    FROM daily_user_actions
    WHERE user_id = p_user_id
    ORDER BY d DESC
  LOOP
    IF v_last_date IS NULL THEN
      v_last_date := rec.d;
    END IF;

    IF v_prev_date IS NULL THEN
      v_running := 1;
    ELSIF v_prev_date - rec.d = 1 THEN
      v_running := v_running + 1;
    ELSE
      -- streak broken — save longest and break (we only need current from top)
      IF v_running > v_longest_streak THEN
        v_longest_streak := v_running;
      END IF;
      EXIT;
    END IF;

    v_prev_date := rec.d;
  END LOOP;

  -- Current streak is only valid if the last action is today or yesterday
  IF v_last_date IS NOT NULL AND v_last_date >= CURRENT_DATE - 1 THEN
    v_current_streak := v_running;
  ELSE
    v_current_streak := 0;
  END IF;

  IF v_running > v_longest_streak THEN
    v_longest_streak := v_running;
  END IF;

  RETURN QUERY SELECT v_current_streak, v_longest_streak, v_last_date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Helper to log a daily "visit" action (called on dashboard load)
CREATE OR REPLACE FUNCTION log_user_visit(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_user_actions (user_id, action_date, action_type, count)
  VALUES (p_user_id, CURRENT_DATE, 'visit', 1)
  ON CONFLICT (user_id, action_date, action_type)
  DO UPDATE SET count = daily_user_actions.count + 1, updated_at = now();
END;
$$ LANGUAGE plpgsql;
