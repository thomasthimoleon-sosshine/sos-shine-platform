-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — Sortir l'encyclopédie du vocabulaire médical
--
-- À exécuter APRÈS le déploiement, et dans la foulée : le texte affiché
-- vient de cette table, pas des listes du code (douleurs.title l'emporte
-- sur la liste statique). Tant que ce script n'est pas passé, les
-- anciennes formulations restent à l'écran.
--
-- Trois règles ont guidé les reformulations :
--   · le nom propre d'une méthode ne change pas — renommer l'EMDR ou
--     l'ayurveda serait faux, et les rendrait introuvables ;
--   · un qualificatif générique (« thérapeutique ») s'enlève sans perte ;
--   · « guérir » et « guérison » laissent place au registre des cahiers :
--     traverser, se libérer, se reconstruire, s'apaiser.
--
-- Aucun des sujets renommés n'est publié : les slugs peuvent changer sans
-- casser de parcours en cours. blog_articles.douleur_slug suit en cascade.
-- ═══════════════════════════════════════════════════════════════

-- Hypnose thérapeutique → Hypnose
UPDATE douleurs SET slug = 'hypnose', title = 'Hypnose', subtitle = 'travail sur l''inconscient par l''hypnose et la transe'
 WHERE slug = 'hypnose-therapeutique';

-- Journal thérapeutique → Journal intime
UPDATE douleurs SET slug = 'journal-intime', title = 'Journal intime', subtitle = 'l''écriture quotidienne comme pratique de connexion à soi'
 WHERE slug = 'journal-therapeutique';

-- Mouvement thérapeutique → Mouvement conscient
UPDATE douleurs SET slug = 'mouvement-conscient', title = 'Mouvement conscient', subtitle = 'se libérer par le mouvement du corps'
 WHERE slug = 'mouvement-therapeutique';

-- Médecine traditionnelle chinoise → Traditions chinoises (MTC)
UPDATE douleurs SET slug = 'traditions-chinoises-mtc', title = 'Traditions chinoises (MTC)', subtitle = 'méridiens, énergie, organes et émotions'
 WHERE slug = 'medecine-traditionnelle-chinoise';

-- Guérison → Reconstruction
UPDATE douleurs SET slug = 'reconstruction', title = 'Reconstruction', subtitle = 'le processus global - étapes, spirales, rechutes'
 WHERE slug = 'guerison';

-- Cristaux & lithothérapie → Cristaux & pierres
UPDATE douleurs SET slug = 'cristaux-pierres', title = 'Cristaux & pierres', subtitle = 'propriétés vibratoires des pierres et usage traditionnel'
 WHERE slug = 'cristaux-lithotherapie';

-- Danse-thérapie → Danse & expression
UPDATE douleurs SET slug = 'danse-expression', title = 'Danse & expression', subtitle = 'le corps qui parle quand les mots ne suffisent pas'
 WHERE slug = 'danse-therapie';

-- Ayurveda (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'savoir ancien : les doshas et l''équilibre naturel'
 WHERE slug = 'ayurveda';

-- Breathwork (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'respiration consciente et holotropique : ce qu''elle libère'
 WHERE slug = 'breathwork';

-- Décodage biologique (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'ce que le corps exprime quand les mots manquent'
 WHERE slug = 'decodage-biologique';

-- EMDR (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'l''approche par les mouvements oculaires, et ce qu''elle propose'
 WHERE slug = 'emdr';

-- Son & vibrations (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'bols tibétains, mantras : ce que le son déplace'
 WHERE slug = 'son-vibrations';

-- Abus émotionnels (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'identifier, comprendre et se reconstruire'
 WHERE slug = 'abus-emotionnels';

-- Abus sexuels (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'identifier, comprendre et se reconstruire'
 WHERE slug = 'abus-sexuels';

-- Disqualification de soi (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'se minimiser, se dénigrer - origines et reconstruction'
 WHERE slug = 'disqualification-de-soi';

-- Enfant intérieur (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'se reconnecter à l''enfant blessé en soi'
 WHERE slug = 'enfant-interieur';

-- Injustice (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'blessure d''injustice - la colère du juste et l''apaisement'
 WHERE slug = 'injustice';

-- Trahison (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'après une trahison - confiance brisée et reconstruction'
 WHERE slug = 'trahison';

-- Traumatisme (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'traverser les blessures d''enfance : violence, abus, négligence'
 WHERE slug = 'traumatisme';

-- Violence verbale & psychologique (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'reconnaître les violences psychologiques et s''en libérer'
 WHERE slug = 'violence-verbale-psychologique';

-- Visualisation créatrice (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'techniques de visualisation pour manifester et se transformer'
 WHERE slug = 'visualisation-creatrice';

-- Yoga (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'yoga comme outil de transformation et de présence'
 WHERE slug = 'yoga';

-- Rituels de soin (le nom reste, c'est celui de la méthode)
UPDATE douleurs SET subtitle = 'créer des rituels personnels de reconnexion'
 WHERE slug = 'rituels-de-soin';

-- Doublon : « Médecine ayurvédique » disait la même chose qu'« Ayurveda ».
-- Il a été retiré des listes du code ; la ligne, jamais publiée, peut partir.
DELETE FROM douleurs WHERE slug = 'medecine-ayurvedique' AND is_published = false;

-- ── Contrôle : ce qui porte encore un mot du champ médical ───────────
SELECT slug, title, subtitle
FROM douleurs
WHERE title    ~* '(thérapeutique|thérapie|médecine|guéri)'
   OR subtitle ~* '(thérapeutique|thérapie|médecine|guéri|maladie|symptôme|traiter les)'
ORDER BY slug;
