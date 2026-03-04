-- ══════════════════════════════════════════════════════════════
-- SOS Shine — Approuver Julia + Données de simulation Leila
-- À exécuter dans Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════

-- ── 1. APPROUVER LA CANDIDATURE DE JULIA ──
-- Approuve la candidature de Julia (julialaureau@sosshine.com) au programme d'affiliation
UPDATE public.affiliates
SET
  status = 'approved',
  approved_at = now(),
  rejected_at = NULL,
  rejection_reason = NULL
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'julialaureau@sosshine.com' LIMIT 1
)
AND status = 'pending';

-- Vérifier que ça a marché
SELECT a.id, a.status, a.referral_code, a.approved_at, p.prenom, p.email
FROM public.affiliates a
JOIN public.profiles p ON p.id = a.user_id
WHERE p.email = 'julialaureau@sosshine.com';


-- ══════════════════════════════════════════════════════════════
-- ── 2. DONNÉES DE SIMULATION : LEILA (25 affiliés, cagnotte, clics, etc.) ──
-- Créer un profil fictif "Leila" pour tester/visualiser le dashboard affilié
-- ══════════════════════════════════════════════════════════════

-- Note : Si vous voulez simuler avec un vrai compte existant,
-- remplacez l'INSERT par un UPDATE sur le profil existant.
-- Ci-dessous on simule directement sur le compte affilié existant ou
-- on utilise les données de Julia pour la démo.

-- Option A : Mettre à jour les stats de Julia pour simuler 25 filleuls
-- (décommentez si vous voulez simuler sur Julia)
/*
UPDATE public.affiliates
SET
  total_clicks = 847,
  total_referrals = 25,
  total_earnings = 312.50,
  pending_earnings = 162.50,
  paid_earnings = 150.00,
  current_tier = 'silver'
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'julialaureau@sosshine.com' LIMIT 1
);
*/

-- Option B : Simulation via insertion de clics et conversions fictifs
-- (fonctionne si l'affilié de Julia existe et est approuvé)

-- Injecter des clics de simulation
DO $$
DECLARE
  v_affiliate_id UUID;
  v_user_id UUID;
  i INT;
BEGIN
  -- Récupérer l'affilié de Julia
  SELECT a.id, a.user_id INTO v_affiliate_id, v_user_id
  FROM public.affiliates a
  JOIN public.profiles p ON p.id = a.user_id
  WHERE p.email = 'julialaureau@sosshine.com'
  LIMIT 1;

  IF v_affiliate_id IS NULL THEN
    RAISE NOTICE 'Affilié Julia non trouvé, simulation annulée';
    RETURN;
  END IF;

  -- Mettre à jour les stats globales (simulation 25 filleuls)
  UPDATE public.affiliates
  SET
    total_clicks = 847,
    total_referrals = 25,
    total_earnings = 312.50,
    pending_earnings = 162.50,
    paid_earnings = 150.00,
    current_tier = 'silver'
  WHERE id = v_affiliate_id;

  -- Injecter 25 conversions fictives (inscriptions et abonnements)
  FOR i IN 1..15 LOOP
    INSERT INTO public.affiliate_conversions (
      affiliate_id, referred_user_id, conversion_type, plan,
      amount, commission_rate, commission_amount, status, created_at
    ) VALUES (
      v_affiliate_id,
      gen_random_uuid(),  -- utilisateur fictif
      'signup',
      CASE WHEN i <= 5 THEN 'essential' WHEN i <= 12 THEN 'serenite' ELSE 'premium' END,
      CASE WHEN i <= 5 THEN 14.90 WHEN i <= 12 THEN 24.90 ELSE 39.90 END,
      0.15,
      CASE WHEN i <= 5 THEN 2.24 WHEN i <= 12 THEN 3.74 ELSE 5.99 END,
      CASE WHEN i <= 10 THEN 'confirmed' WHEN i <= 13 THEN 'paid' ELSE 'pending' END,
      now() - (i * interval '3 days')
    );
  END LOOP;

  -- 10 conversions supplémentaires (renouvellements)
  FOR i IN 1..10 LOOP
    INSERT INTO public.affiliate_conversions (
      affiliate_id, referred_user_id, conversion_type, plan,
      amount, commission_rate, commission_amount, status, created_at
    ) VALUES (
      v_affiliate_id,
      gen_random_uuid(),
      'renewal',
      CASE WHEN i <= 4 THEN 'essential' WHEN i <= 8 THEN 'serenite' ELSE 'premium' END,
      CASE WHEN i <= 4 THEN 14.90 WHEN i <= 8 THEN 24.90 ELSE 39.90 END,
      0.15,
      CASE WHEN i <= 4 THEN 2.24 WHEN i <= 8 THEN 3.74 ELSE 5.99 END,
      'confirmed',
      now() - (i * interval '5 days')
    );
  END LOOP;

  -- Injecter un historique de paiements
  INSERT INTO public.affiliate_payouts (affiliate_id, amount, payment_method, status, created_at, paid_at)
  VALUES
    (v_affiliate_id, 75.00, 'bank_transfer', 'completed', now() - interval '30 days', now() - interval '28 days'),
    (v_affiliate_id, 75.00, 'bank_transfer', 'completed', now() - interval '15 days', now() - interval '13 days');

  RAISE NOTICE 'Simulation terminée : 25 conversions + 2 paiements injectés pour Julia';
END $$;

-- Vérification finale
SELECT
  a.referral_code,
  a.total_clicks,
  a.total_referrals,
  a.total_earnings,
  a.pending_earnings,
  a.paid_earnings,
  a.current_tier,
  a.status,
  p.prenom,
  p.email
FROM public.affiliates a
JOIN public.profiles p ON p.id = a.user_id
WHERE p.email = 'julialaureau@sosshine.com';
