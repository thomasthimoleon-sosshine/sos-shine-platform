-- ══════════════════════════════════════════════════════════
-- SOS Shine — Seed Data (contenu initial)
-- Exécuter dans Supabase SQL Editor APRES la création des tables
-- ══════════════════════════════════════════════════════════

-- ─── 1. DOULEURS (Encyclopédie) ─────────────────────────
-- 13 douleurs de base avec descriptions et exercices

INSERT INTO douleurs (title, slug, description, exercise_content, is_active, is_published)
VALUES
  (
    'Abandon',
    'abandon',
    'Traversez la peur de l''abandon et reconstruisez un lien sécurisant avec vous-même.',
    E'## Exercice : Lettre à mon enfant intérieur\n\n1. Installez-vous dans un endroit calme\n2. Prenez une feuille et écrivez une lettre à l''enfant que vous étiez quand vous avez ressenti l''abandon pour la première fois\n3. Dites-lui tout ce que vous auriez aimé entendre à ce moment-là\n4. Lisez-la à voix haute, lentement\n5. Respirez profondément et accueillez ce qui vient\n\n**Durée recommandée : 20 minutes**',
    true, true
  ),
  (
    'Anxiété',
    'anxiete',
    'Protocoles d''urgence et outils quotidiens pour calmer l''anxiété et retrouver votre ancrage.',
    E'## Exercice : Ancrage 5-4-3-2-1\n\nQuand l''anxiété monte, nommez :\n- **5** choses que vous voyez\n- **4** choses que vous touchez\n- **3** choses que vous entendez\n- **2** choses que vous sentez (odeurs)\n- **1** chose que vous goûtez\n\nRépétez jusqu''à ce que votre rythme cardiaque se calme.\n\n**Durée recommandée : 5 à 10 minutes**',
    true, true
  ),
  (
    'Burn-out',
    'burn-out',
    'Récupérez votre énergie vitale étape par étape. Corps, mental, reconstruction.',
    E'## Exercice : L''inventaire énergétique\n\n1. Listez tout ce qui DRAINE votre énergie (personnes, tâches, habitudes)\n2. Listez tout ce qui NOURRIT votre énergie\n3. Pour chaque élément drainant, demandez-vous : puis-je le réduire, le déléguer, ou le supprimer ?\n4. Choisissez UNE action concrète à mettre en place cette semaine\n\n**Durée recommandée : 30 minutes**',
    true, true
  ),
  (
    'Dépendance affective',
    'dependance-affective',
    'Comprenez les mécanismes et libérez-vous du besoin de l''autre pour exister.',
    E'## Exercice : Le journal de mes besoins\n\n1. Pendant 7 jours, notez chaque fois que vous ressentez un besoin urgent de l''autre\n2. Identifiez le besoin réel derrière (sécurité, validation, amour, peur de la solitude)\n3. Trouvez UNE façon de répondre vous-même à ce besoin\n4. Pratiquez l''auto-validation : "Je suis suffisant(e) tel(le) que je suis"\n\n**Durée recommandée : 15 minutes par jour pendant 7 jours**',
    true, true
  ),
  (
    'Deuil',
    'deuil',
    'Accompagnement doux pour traverser la perte d''un être cher.',
    E'## Exercice : La boîte à souvenirs\n\n1. Choisissez un objet, une photo, ou un souvenir lié à la personne partie\n2. Tenez-le dans vos mains et fermez les yeux\n3. Laissez venir un souvenir heureux — revivez-le avec tous vos sens\n4. Dites à voix haute ce que cette personne vous a apporté\n5. Remerciez. Pleurez si besoin. C''est normal, c''est sain.\n\n**Durée recommandée : 20 minutes**',
    true, true
  ),
  (
    'Humiliation',
    'humiliation',
    'Retrouvez votre dignité et votre estime après une expérience d''humiliation.',
    E'## Exercice : Réécrire la scène\n\n1. Repensez à la scène d''humiliation\n2. Écrivez-la telle qu''elle s''est passée (les faits, pas les jugements)\n3. Maintenant, réécrivez la scène en vous donnant le pouvoir : que diriez-vous ? Comment réagiriez-vous ?\n4. Lisez votre nouvelle version à voix haute\n5. Affirmation : "Personne n''a le pouvoir de définir ma valeur"\n\n**Durée recommandée : 25 minutes**',
    true, true
  ),
  (
    'Injustice',
    'injustice',
    'Transformez la colère en puissance et apprenez à lâcher ce qui vous ronge.',
    E'## Exercice : La lettre de libération\n\n1. Écrivez une lettre à la personne ou la situation injuste (vous ne l''enverrez PAS)\n2. Exprimez TOUT : colère, frustration, incompréhension\n3. Relisez-la\n4. Puis écrivez une deuxième lettre : celle où vous choisissez de vous libérer\n5. Détruisez la première lettre (déchirez, brûlez)\n6. Gardez la deuxième\n\n**Durée recommandée : 30 minutes**',
    true, true
  ),
  (
    'Manque de confiance',
    'manque-de-confiance',
    'Rebâtissez une confiance solide en vous, pas à pas.',
    E'## Exercice : Le carnet de victoires\n\n1. Chaque soir pendant 21 jours, écrivez 3 choses que vous avez réussies dans la journée\n2. Même les plus petites comptent (j''ai dit non, j''ai pris soin de moi, j''ai osé parler)\n3. Relisez vos victoires des jours précédents quand le doute revient\n4. Au bout de 21 jours, relisez tout — vous serez surpris(e)\n\n**Durée recommandée : 5 minutes par soir**',
    true, true
  ),
  (
    'Peur',
    'peur',
    'Identifiez, comprenez et désamorcez vos peurs profondes.',
    E'## Exercice : Dialogue avec la peur\n\n1. Fermez les yeux et visualisez votre peur comme un personnage\n2. À quoi ressemble-t-il ? Est-il grand, petit, menaçant, triste ?\n3. Demandez-lui : "De quoi essaies-tu de me protéger ?"\n4. Écoutez sa réponse (elle vient de votre intuition)\n5. Remerciez-le et dites : "Je t''entends. Mais je choisis d''avancer."\n\n**Durée recommandée : 15 minutes**',
    true, true
  ),
  (
    'Rejet',
    'rejet',
    'Guérissez la blessure du rejet et reconstruisez votre sentiment d''appartenance.',
    E'## Exercice : L''inventaire de mes qualités\n\n1. Demandez à 3 personnes de confiance de vous dire 3 qualités qu''elles voient en vous\n2. Notez-les toutes\n3. Pour chaque qualité, trouvez un exemple concret où vous l''avez manifestée\n4. Relisez cette liste chaque matin pendant 7 jours\n5. Affirmation : "J''ai ma place. Je suis accueilli(e) tel(le) que je suis."\n\n**Durée recommandée : 20 minutes + 2 min/jour**',
    true, true
  ),
  (
    'Rupture amoureuse',
    'rupture-amoureuse',
    'Traversez la tempête d''une séparation avec des outils concrets.',
    E'## Exercice : Le rituel de coupure\n\n1. Écrivez sur une feuille tout ce que cette relation vous a appris\n2. Sur une autre feuille, écrivez tout ce que vous voulez laisser derrière vous\n3. Gardez la première feuille précieusement\n4. La deuxième : déchirez-la, brûlez-la, laissez-la partir\n5. Affirmation : "Je choisis de me retrouver. La prochaine histoire commence avec moi."\n\n**Durée recommandée : 30 minutes**',
    true, true
  ),
  (
    'Solitude',
    'solitude',
    'Transformez la solitude subie en solitude choisie et retrouvez le lien.',
    E'## Exercice : Le rendez-vous avec soi\n\n1. Planifiez un "date" avec vous-même cette semaine\n2. Faites une activité que VOUS aimez (café, musée, balade, film)\n3. Éteignez votre téléphone pendant 1h\n4. Observez comment vous vous sentez : gêne ? liberté ? ennui ? paix ?\n5. Écrivez 3 lignes sur cette expérience\n\n**Durée recommandée : 1 à 2 heures**',
    true, true
  ),
  (
    'Trahison',
    'trahison',
    'Reconstruisez la confiance après une trahison. Protocoles émotionnels et ancrage.',
    E'## Exercice : Les cercles de confiance\n\n1. Dessinez 3 cercles concentriques sur une feuille\n2. Cercle intérieur : les personnes en qui vous avez confiance à 100%\n3. Cercle du milieu : celles que vous appréciez mais avec prudence\n4. Cercle extérieur : les connaissances, relations distantes\n5. Où se trouvait la personne qui vous a trahi ? Où la placez-vous maintenant ?\n6. Réflexion : la confiance se reconstruit par petits pas, pas par grands sauts\n\n**Durée recommandée : 20 minutes**',
    true, true
  )
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  exercise_content = EXCLUDED.exercise_content,
  is_active = EXCLUDED.is_active,
  is_published = EXCLUDED.is_published,
  updated_at = now();


-- ─── 2. LANDING SECTIONS (CMS landing page) ────────────
-- Contenu initial de la landing page

INSERT INTO landing_sections (section_key, label, position, is_visible, content, styles)
VALUES
  (
    '_global',
    'Configuration globale',
    -1,
    true,
    '{"site_name":"SOS Shine","logo_url":"","trial_days":7}'::jsonb,
    '{"color_primary":"#D4AF37","color_secondary":"#74C0FC","color_bg":"#362038","color_card":"#442B40","color_border":"#5E3E52","color_text":"#F5EDF0","color_text_secondary":"#C8A8B8","color_text_muted":"#8E6E7E","color_button":"#D4AF37","font_display":"Cormorant Garamond","font_body":"DM Sans"}'::jsonb
  ),
  (
    'hero',
    'Hero (en-tete)',
    0,
    true,
    '{"title":"L\u2019encyclopedie des schemas\nemotionnels et des\nexperiences de vie.","subtitle":"Un espace ouvert 24h/24, 7j/7, pour comprendre, apaiser et ne plus jamais etre seul.","video_url":"","image_url":"","buttons":[{"label":"Decouvrir l\u2019encyclopedie","href":"/dashboard/encyclopedie","variant":"outline"},{"label":"Acces illimite","href":"/signup","variant":"primary"}]}'::jsonb,
    '{"title_font":"Cormorant Garamond","title_size":"2xl","title_align":"left","title_color":"","text_font":"DM Sans","text_align":"left"}'::jsonb
  ),
  (
    'principe',
    'Le Principe',
    1,
    true,
    '{"label":"Le principe SOS Shine","title":"On ne change pas votre identite.\nOn eteint la douleur\npour liberer votre potentiel.","description":"Chaque douleur — abandon, trahison, burn-out, deuil, peur — possede sa propre page dans notre encyclopedie, avec un protocole en 4 etapes concu pour vous accompagner de A a Z.","image_url":"","video_url":""}'::jsonb,
    '{"title_font":"Cormorant Garamond","title_size":"xl","title_align":"center","title_color":"","text_font":"DM Sans","text_align":"center"}'::jsonb
  ),
  (
    'steps',
    'Les Etapes',
    2,
    true,
    '{"label":"Le parcours SOS Shine","title":"3 etapes pour chaque douleur","items":[{"num":"01","title":"Comprendre","description":"Video de coaching immersive. Analyse emotionnelle. Explication de votre probleme. Apaisement mental.","color":"#55EFC4"},{"num":"02","title":"Liberation Energetique","description":"Soin energetique. Activation emotionnelle. Decharge des tensions. Nettoyage des empreintes qui vous bloquent.","color":"#74C0FC"},{"num":"03","title":"Integration & Meditation","description":"Meditation guidee. Stabilisation interieure. Reconnexion a soi. Nouvelle frequence emotionnelle.","color":"#E17055"}]}'::jsonb,
    '{"title_font":"Cormorant Garamond","title_size":"lg","title_align":"center","text_font":"DM Sans"}'::jsonb
  ),
  (
    'encyclopedie',
    'L''Encyclopedie',
    3,
    true,
    '{"label":"L\u2019encyclopedie","title":"Chaque douleur a sa page dediee","description":"Abandon, trahison, burn-out, deuil, dependance affective, peur, solitude, rejet... Classees de A a Z, accessibles en un clic.","image_url":"","items":["Abandon","Anxiete","Burn-out","Dependance affective","Deuil","Manque de confiance","Peur","Rejet","Rupture","Solitude","Trahison","Et plus..."]}'::jsonb,
    '{"title_font":"Cormorant Garamond","title_size":"lg","title_align":"center","text_align":"center"}'::jsonb
  ),
  (
    'communaute',
    'Communaute',
    4,
    true,
    '{"title":"Vous n\u2019etes plus jamais seul a 3h du matin.","description":"Chat dedie par douleur, chat general, mur communautaire, soins collectifs et evenements — une vraie famille.","image_url":"","blocks":[{"title":"Le Feu de Camp","description":"Chaque douleur a son propre chat. Echangez avec ceux qui comprennent vraiment."},{"title":"Le Mur Communautaire","description":"Publications, annonces, partages. Restez informe de chaque nouvelle douleur, chaque evenement."},{"title":"Les Rencontres Reelles","description":"Soins collectifs, ateliers, lives, Shine Walks — le digital prepare, le physique transforme."}]}'::jsonb,
    '{"title_font":"Cormorant Garamond","title_size":"xl","title_align":"center","text_align":"center"}'::jsonb
  ),
  (
    'temoignages',
    'Temoignages',
    5,
    true,
    '{"label":"Ils ont traverse la tempete","items":[{"quote":"Je ne savais meme pas que j\u2019avais le droit de ne pas aller bien. SOS Shine m\u2019a donne un espace ou ma douleur avait le droit d\u2019exister.","name":"Marie, 34 ans","city":"Lyon"},{"quote":"La premiere fois que quelqu\u2019un m\u2019a dit je suis passe par la, tiens bon — c\u2019etait dans le Feu de Camp. J\u2019ai pleure. Des larmes de soulagement.","name":"Karim, 41 ans","city":"Bordeaux"},{"quote":"J\u2019ai fait ma premiere Shine Walk un samedi matin. En rentrant, j\u2019ai senti quelque chose que j\u2019avais oublie : je n\u2019etais plus seule.","name":"Sophie, 28 ans","city":"Bruxelles"},{"quote":"Grace aux 4 etapes, j\u2019ai compris ma douleur au lieu de la fuir. Aujourd\u2019hui, je suis Eclaireur et j\u2019aide les autres.","name":"Antoine, 37 ans","city":"Geneve"}]}'::jsonb,
    '{"title_font":"DM Sans","title_align":"center"}'::jsonb
  ),
  (
    'pricing',
    'Tarification',
    6,
    true,
    '{"title":"Choisissez votre accompagnement","subtitle":"Sans engagement — Annulable a tout instant","footer":"Parce que si on doit vous retenir par un contrat, c\u2019est qu\u2019on n\u2019a pas fait notre travail.","plans":[{"name":"Essentiel","price":"29,90","period":"/mois","button_label":"Commencer — 7 jours gratuits","button_href":"/signup","highlight":false,"badge":"","features":["Encyclopedie complete des douleurs","3 etapes par douleur (video, soin, meditation)","Chat dedie par douleur + Chat general","Mur communautaire","Soins collectifs & evenements","Essai gratuit 7 jours"]},{"name":"Premium","price":"99,90","period":"/mois","button_label":"Commencer maintenant","button_href":"/signup","highlight":true,"badge":"Recommande","features":["Tout l\u2019Essentiel inclus","Permanences experts 24/7","Accompagnement prioritaire","Support direct Julia, William & Thomas"]}]}'::jsonb,
    '{"title_font":"Cormorant Garamond","title_size":"lg","title_align":"center"}'::jsonb
  ),
  (
    'cta_dark',
    'CTA (fond sombre)',
    7,
    true,
    '{"title":"Rejoignez-nous.\nNe soyez plus jamais seul(e) face a vos tempetes.","image_url":""}'::jsonb,
    '{"title_font":"Cormorant Garamond","title_size":"xl","title_align":"center"}'::jsonb
  ),
  (
    'cta_light',
    'CTA (fond clair)',
    8,
    true,
    '{"description":"Que vous cherchiez une reponse a une douleur ancienne, un soutien pour traverser une crise, ou simplement un espace ou etre compris(e) — SOS Shine est la, 24h/24, 7j/7.","button_label":"Rejoindre SOS Shine","button_href":"/signup","login_text":"Deja membre ? Se connecter"}'::jsonb,
    '{"bg":"#ffffff","text_color":"#1a1a1a","muted_color":"#6b7280"}'::jsonb
  ),
  (
    'footer',
    'Pied de page',
    9,
    true,
    '{"name":"SOS Shine","copyright_year":"2026","links":[{"label":"Mentions legales","href":"/mentions-legales"},{"label":"CGV","href":"/cgv"},{"label":"Confidentialite","href":"/confidentialite"},{"label":"Contact","href":"/contact"}]}'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (section_key) DO UPDATE SET
  label = EXCLUDED.label,
  position = EXCLUDED.position,
  content = EXCLUDED.content,
  styles = EXCLUDED.styles,
  updated_at = now();


-- ─── 3. SITE SETTINGS (paramètres par défaut) ──────────

INSERT INTO site_settings (key, value)
VALUES
  ('site_name', 'SOS Shine'),
  ('site_description', 'L''encyclopedie des schemas emotionnels et des experiences de vie'),
  ('contact_email', 'contact@sosshine.fr'),
  ('signup_title', 'Rejoignez SOS Shine'),
  ('signup_subtitle', 'Commencez votre transformation avec 7 jours d''essai gratuit'),
  ('login_title', 'Bon retour parmi nous'),
  ('login_subtitle', 'Connectez-vous pour acceder a votre espace'),
  ('trial_days', '7'),
  ('color_primary', '#D4AF37'),
  ('color_bg', '#362038')
ON CONFLICT (key) DO NOTHING;
