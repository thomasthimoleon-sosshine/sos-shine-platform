-- Réordonnancement Landing Thomas — Optimisé conversion AIDA
-- Coller dans Supabase SQL Editor et Run

UPDATE landing_sections SET position = 0  WHERE variant = 'thomas' AND section_key = 'hero';
UPDATE landing_sections SET position = 1  WHERE variant = 'thomas' AND section_key = 'ticker_1';
UPDATE landing_sections SET position = 2  WHERE variant = 'thomas' AND section_key = 'stats';
UPDATE landing_sections SET position = 3  WHERE variant = 'thomas' AND section_key = 'probleme';
UPDATE landing_sections SET position = 4  WHERE variant = 'thomas' AND section_key = 'signature_cta';
UPDATE landing_sections SET position = 5  WHERE variant = 'thomas' AND section_key = 'steps';
UPDATE landing_sections SET position = 6  WHERE variant = 'thomas' AND section_key = 'encyclopedie';
UPDATE landing_sections SET position = 7  WHERE variant = 'thomas' AND section_key = 'temoignages';
UPDATE landing_sections SET position = 8  WHERE variant = 'thomas' AND section_key = 'ticker_2';
UPDATE landing_sections SET position = 9  WHERE variant = 'thomas' AND section_key = 'communaute';
UPDATE landing_sections SET position = 10 WHERE variant = 'thomas' AND section_key = 'produit';
UPDATE landing_sections SET position = 11 WHERE variant = 'thomas' AND section_key = 'histoire';
UPDATE landing_sections SET position = 12 WHERE variant = 'thomas' AND section_key = 'fondateurs';
UPDATE landing_sections SET position = 13 WHERE variant = 'thomas' AND section_key = 'manifeste';
UPDATE landing_sections SET position = 14 WHERE variant = 'thomas' AND section_key = 'pricing';
UPDATE landing_sections SET position = 15 WHERE variant = 'thomas' AND section_key = 'garantie';
UPDATE landing_sections SET position = 16 WHERE variant = 'thomas' AND section_key = 'pour_qui';
UPDATE landing_sections SET position = 17 WHERE variant = 'thomas' AND section_key = 'cta_dark';
UPDATE landing_sections SET position = 18 WHERE variant = 'thomas' AND section_key = 'faq';
UPDATE landing_sections SET position = 19 WHERE variant = 'thomas' AND section_key = 'footer';

-- Activer les sections qui doivent être visibles
UPDATE landing_sections SET is_visible = true WHERE variant = 'thomas' AND section_key IN (
  'hero', 'ticker_1', 'stats', 'probleme', 'signature_cta', 'steps', 'encyclopedie',
  'temoignages', 'ticker_2', 'communaute', 'produit', 'histoire', 'fondateurs',
  'manifeste', 'pricing', 'pour_qui', 'cta_dark', 'footer'
);

-- Garder les sections non pertinentes masquées
UPDATE landing_sections SET is_visible = false WHERE variant = 'thomas' AND section_key IN (
  'principe', 'transformation', 'cta_light', 'landing_v2'
);
