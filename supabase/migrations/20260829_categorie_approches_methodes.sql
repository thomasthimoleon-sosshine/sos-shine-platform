-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — « Soins & Thérapies » devient « Approches & Méthodes »
--
-- La catégorie d'un sujet d'encyclopédie est stockée en clair dans
-- douleurs.category. Renommer l'intitulé côté code seulement aurait
-- détaché les sujets déjà enregistrés de leur filtre.
--
-- « Soins » comme « Thérapies » relèvent du champ du soin. La plateforme
-- ne soigne pas : elle propose des approches. L'intitulé le dit maintenant.
-- ═══════════════════════════════════════════════════════════════

UPDATE douleurs
SET category = 'Approches & Méthodes'
WHERE category = 'Soins & Thérapies';

-- Contrôle : plus aucun sujet ne doit porter l'ancien intitulé.
SELECT category, count(*) AS sujets
FROM douleurs
WHERE category IS NOT NULL
GROUP BY category
ORDER BY category;
