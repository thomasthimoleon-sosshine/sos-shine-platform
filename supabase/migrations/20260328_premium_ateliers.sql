-- Table pour les 48 ateliers Premium (programme annuel)
CREATE TABLE IF NOT EXISTS premium_ateliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_index INT NOT NULL CHECK (month_index BETWEEN 1 AND 12), -- 1=Avril 2026, 12=Mars 2027
  week INT NOT NULL CHECK (week BETWEEN 1 AND 4),
  arc_number INT NOT NULL CHECK (arc_number BETWEEN 1 AND 4),
  arc_label TEXT NOT NULL, -- ex: "Comprendre"
  month_theme TEXT NOT NULL, -- ex: "L'Identité Profonde"
  month_icon TEXT DEFAULT '💎',
  title TEXT NOT NULL, -- ex: "Le masque social — Qui es-tu quand personne ne regarde ?"
  description TEXT,
  video_url TEXT,
  live_url TEXT,
  replay_url TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(month_index, week)
);

-- Activer RLS
ALTER TABLE premium_ateliers ENABLE ROW LEVEL SECURITY;

-- Lecture pour les utilisateurs authentifiés
CREATE POLICY "Authenticated users can read ateliers"
  ON premium_ateliers FOR SELECT
  TO authenticated
  USING (true);

-- Écriture pour les admins (via service role ou policies personnalisées)
CREATE POLICY "Admins can manage ateliers"
  ON premium_ateliers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('founder', 'admin_content')
    )
  );

-- Seed des 48 ateliers
INSERT INTO premium_ateliers (month_index, week, arc_number, arc_label, month_theme, month_icon, title, is_live) VALUES
-- MOIS 1 : Avril 2026 — Arc I : Comprendre
(1, 1, 1, 'Comprendre', 'L''Identité Profonde', '🪞', 'Le masque social — Qui es-tu quand personne ne regarde ?', false),
(1, 2, 1, 'Comprendre', 'L''Identité Profonde', '🪞', 'Le vrai soi vs le soi conditionné', false),
(1, 3, 1, 'Comprendre', 'L''Identité Profonde', '🪞', 'Les rôles que tu joues — Mère, fille, professionnelle, amie', false),
(1, 4, 1, 'Comprendre', 'L''Identité Profonde', '🪞', 'Live d''intégration — Ta signature émotionnelle profonde', true),

-- MOIS 2 : Mai 2026 — Arc I : Comprendre
(2, 1, 1, 'Comprendre', 'Les Blessures Invisibles', '🩹', 'Les 5 blessures fondamentales — Rejet, abandon, humiliation, trahison, injustice', false),
(2, 2, 1, 'Comprendre', 'Les Blessures Invisibles', '🩹', 'Comment ton corps stocke la mémoire émotionnelle', false),
(2, 3, 1, 'Comprendre', 'Les Blessures Invisibles', '🩹', 'Reconnaître tes mécanismes de protection automatiques', false),
(2, 4, 1, 'Comprendre', 'Les Blessures Invisibles', '🩹', 'Live d''intégration — Cartographier tes blessures pour les transcender', true),

-- MOIS 3 : Juin 2026 — Arc I : Comprendre
(3, 1, 1, 'Comprendre', 'Le Langage des Émotions', '🌊', 'Pourquoi tes émotions ne sont pas le problème, mais la solution', false),
(3, 2, 1, 'Comprendre', 'Le Langage des Émotions', '🌊', 'Décoder la colère, la tristesse, la peur et la joie', false),
(3, 3, 1, 'Comprendre', 'Le Langage des Émotions', '🌊', 'L''intelligence émotionnelle au quotidien', false),
(3, 4, 1, 'Comprendre', 'Le Langage des Émotions', '🌊', 'Live d''intégration — Ton dialogue intérieur émotionnel', true),

-- MOIS 4 : Juillet 2026 — Arc II : Apaiser
(4, 1, 2, 'Apaiser', 'La Régulation Nerveuse', '🧘', 'Comprendre ton système nerveux — Sympathique vs parasympathique', false),
(4, 2, 2, 'Apaiser', 'La Régulation Nerveuse', '🧘', 'Techniques de respiration pour calmer l''orage intérieur', false),
(4, 3, 2, 'Apaiser', 'La Régulation Nerveuse', '🧘', 'Le corps comme ancrage — exercices somatiques', false),
(4, 4, 2, 'Apaiser', 'La Régulation Nerveuse', '🧘', 'Live d''intégration — Pratique guidée de régulation', true),

-- MOIS 5 : Août 2026 — Arc II : Apaiser
(5, 1, 2, 'Apaiser', 'Les Relations Toxiques', '🔗', 'Identifier les schémas relationnels qui te détruisent', false),
(5, 2, 2, 'Apaiser', 'Les Relations Toxiques', '🔗', 'Poser des limites sans culpabiliser', false),
(5, 3, 2, 'Apaiser', 'Les Relations Toxiques', '🔗', 'Se libérer de la dépendance affective', false),
(5, 4, 2, 'Apaiser', 'Les Relations Toxiques', '🔗', 'Live d''intégration — Réécrire tes contrats relationnels', true),

-- MOIS 6 : Septembre 2026 — Arc II : Apaiser
(6, 1, 2, 'Apaiser', 'Le Pardon et le Lâcher-prise', '🕊️', 'Pardonner n''est pas oublier — comprendre le vrai pardon', false),
(6, 2, 2, 'Apaiser', 'Le Pardon et le Lâcher-prise', '🕊️', 'Se pardonner soi-même — l''étape la plus difficile', false),
(6, 3, 2, 'Apaiser', 'Le Pardon et le Lâcher-prise', '🕊️', 'Rituels de libération émotionnelle', false),
(6, 4, 2, 'Apaiser', 'Le Pardon et le Lâcher-prise', '🕊️', 'Live d''intégration — Cérémonie de lâcher-prise collectif', true),

-- MOIS 7 : Octobre 2026 — Arc III : Transformer
(7, 1, 3, 'Transformer', 'La Puissance de l''Intention', '🎯', 'De la réaction à la création — reprendre le pouvoir', false),
(7, 2, 3, 'Transformer', 'La Puissance de l''Intention', '🎯', 'Visualisation créatrice et neurosciences', false),
(7, 3, 3, 'Transformer', 'La Puissance de l''Intention', '🎯', 'Reprogrammer tes croyances limitantes', false),
(7, 4, 3, 'Transformer', 'La Puissance de l''Intention', '🎯', 'Live d''intégration — Créer ta vision transformée', true),

-- MOIS 8 : Novembre 2026 — Arc III : Transformer
(8, 1, 3, 'Transformer', 'L''Alchimie Émotionnelle', '⚗️', 'Transformer la douleur en force — l''art de l''alchimie intérieure', false),
(8, 2, 3, 'Transformer', 'L''Alchimie Émotionnelle', '⚗️', 'Les rituels de transformation au quotidien', false),
(8, 3, 3, 'Transformer', 'L''Alchimie Émotionnelle', '⚗️', 'De victime à créateur — changer de posture', false),
(8, 4, 3, 'Transformer', 'L''Alchimie Émotionnelle', '⚗️', 'Live d''intégration — Ton protocole personnel de transformation', true),

-- MOIS 9 : Décembre 2026 — Arc III : Transformer
(9, 1, 3, 'Transformer', 'La Résilience Profonde', '💎', 'La résilience n''est pas résister — c''est se reconstruire', false),
(9, 2, 3, 'Transformer', 'La Résilience Profonde', '💎', 'Trouver du sens dans l''épreuve', false),
(9, 3, 3, 'Transformer', 'La Résilience Profonde', '💎', 'Bilan de transformation — où en es-tu ?', false),
(9, 4, 3, 'Transformer', 'La Résilience Profonde', '💎', 'Live d''intégration — Célébrer ton chemin parcouru', true),

-- MOIS 10 : Janvier 2027 — Arc IV : Rayonner
(10, 1, 4, 'Rayonner', 'L''Authenticité Assumée', '✨', 'Vivre sans masque — oser être soi dans un monde qui normalise', false),
(10, 2, 4, 'Rayonner', 'L''Authenticité Assumée', '✨', 'Exprimer tes besoins sans peur du rejet', false),
(10, 3, 4, 'Rayonner', 'L''Authenticité Assumée', '✨', 'Construire des relations authentiques et nourrissantes', false),
(10, 4, 4, 'Rayonner', 'L''Authenticité Assumée', '✨', 'Live d''intégration — Ton manifeste d''authenticité', true),

-- MOIS 11 : Février 2027 — Arc IV : Rayonner
(11, 1, 4, 'Rayonner', 'La Mission de Vie', '🌟', 'Trouver ta mission — au-delà du métier, ta raison d''être', false),
(11, 2, 4, 'Rayonner', 'La Mission de Vie', '🌟', 'Aligner tes actions avec tes valeurs profondes', false),
(11, 3, 4, 'Rayonner', 'La Mission de Vie', '🌟', 'Devenir un phare pour les autres — l''effet papillon', false),
(11, 4, 4, 'Rayonner', 'La Mission de Vie', '🌟', 'Live d''intégration — Dessiner la carte de ta mission', true),

-- MOIS 12 : Mars 2027 — Arc IV : Rayonner
(12, 1, 4, 'Rayonner', 'Le Diamant Intérieur', '💠', 'Tu es le diamant — intégrer toutes les facettes de ton être', false),
(12, 2, 4, 'Rayonner', 'Le Diamant Intérieur', '💠', 'Ton héritage émotionnel — ce que tu transmets au monde', false),
(12, 3, 4, 'Rayonner', 'Le Diamant Intérieur', '💠', 'Le cercle de la vie — boucler le cycle pour en ouvrir un nouveau', false),
(12, 4, 4, 'Rayonner', 'Le Diamant Intérieur', '💠', 'Live d''intégration — Cérémonie de graduation SOS Shine', true);
