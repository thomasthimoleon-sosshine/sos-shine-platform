-- Mise à jour des features par plan selon les specs de Julia
-- Essentielle (9,90€) : Encyclopédie + Chat + Communauté
-- Sérénité (49,90€) : + Librairie + Shine TV + Shorts + Audible + Soin collectif
-- Premium (99,90€) : + Live hebdo + Telegram + Événements physiques + Ateliers

-- ═══ ESSENTIAL : activer chat_douleur (fait partie de la communauté) ═══
UPDATE plan_features SET is_enabled = true
WHERE plan = 'essential' AND feature_key = 'chat_douleur';

-- ═══ SÉRÉNITÉ : activer librairie (était false, maintenant inclus) ═══
UPDATE plan_features SET is_enabled = true
WHERE plan = 'serenite' AND feature_key = 'shine_librairie';

-- Désactiver evenements_payants pour Sérénité (maintenant Premium only)
UPDATE plan_features SET is_enabled = false, feature_label = 'Événements physiques'
WHERE plan = 'serenite' AND feature_key = 'evenements_payants';

-- Mettre à jour le label evenements_payants pour Essential
UPDATE plan_features SET feature_label = 'Événements physiques'
WHERE plan = 'essential' AND feature_key = 'evenements_payants';

-- Mettre à jour le label evenements_payants pour Premium
UPDATE plan_features SET feature_label = 'Événements physiques'
WHERE plan = 'premium' AND feature_key = 'evenements_payants';

-- ═══ Ajouter les nouvelles features pour tous les plans ═══

-- shine_shorts
INSERT INTO plan_features (plan, feature_key, feature_label, is_enabled) VALUES
  ('essential', 'shine_shorts', 'Shine Shorts', false),
  ('serenite', 'shine_shorts', 'Shine Shorts', true),
  ('premium', 'shine_shorts', 'Shine Shorts', true)
ON CONFLICT (plan, feature_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

-- soin_collectif
INSERT INTO plan_features (plan, feature_key, feature_label, is_enabled) VALUES
  ('essential', 'soin_collectif', 'Soin collectif mensuel', false),
  ('serenite', 'soin_collectif', 'Soin collectif mensuel', true),
  ('premium', 'soin_collectif', 'Soin collectif mensuel', true)
ON CONFLICT (plan, feature_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

-- live_hebdo
INSERT INTO plan_features (plan, feature_key, feature_label, is_enabled) VALUES
  ('essential', 'live_hebdo', 'Live thématique hebdomadaire', false),
  ('serenite', 'live_hebdo', 'Live thématique hebdomadaire', false),
  ('premium', 'live_hebdo', 'Live thématique hebdomadaire', true)
ON CONFLICT (plan, feature_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

-- telegram
INSERT INTO plan_features (plan, feature_key, feature_label, is_enabled) VALUES
  ('essential', 'telegram', 'Canal privé Telegram', false),
  ('serenite', 'telegram', 'Canal privé Telegram', false),
  ('premium', 'telegram', 'Canal privé Telegram', true)
ON CONFLICT (plan, feature_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

-- ateliers_premium
INSERT INTO plan_features (plan, feature_key, feature_label, is_enabled) VALUES
  ('essential', 'ateliers_premium', 'Ateliers Premium (48 semaines)', false),
  ('serenite', 'ateliers_premium', 'Ateliers Premium (48 semaines)', false),
  ('premium', 'ateliers_premium', 'Ateliers Premium (48 semaines)', true)
ON CONFLICT (plan, feature_key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;
