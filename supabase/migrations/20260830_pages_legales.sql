-- ═══════════════════════════════════════════════════════════════════════════
-- PAGES LÉGALES — mentions légales, et politique de confidentialité complétée
--
-- ⚠️  DEUX CHOSES À FAIRE AVANT D'EXÉCUTER CE FICHIER
--
--  1. Remplacer les quatre mentions « À COMPLÉTER » ci-dessous. Elles
--     n'existent nulle part dans le dépôt et personne d'autre que vous ne
--     les connaît.
--  2. Faire relire par un juriste. Ce texte est rédigé à partir de ce que
--     fait réellement le code — c'est sa force — mais rédiger n'est pas
--     conseiller, et le produit touche au deuil et au trauma.
--
-- La page /mentions-legales n'avait jamais reçu de contenu : contrairement
-- aux CGV et à la confidentialité, aucun texte source n'existait, et son
-- contenu par défaut était une chaîne vide. Le visiteur lisait « Cette page
-- n'a pas encore été renseignée ».
--
-- La politique de confidentialité, elle, existait mais décrivait une collecte
-- bien plus étroite que la réalité : elle ne nommait ni Supabase, ni Resend,
-- ni Anthropic, ne mentionnait aucun transfert hors UE, aucune base légale,
-- et ignorait la mesure d'audience comme les réponses aux questionnaires
-- émotionnels. Ce qui suit décrit ce que le code fait vraiment.
-- ═══════════════════════════════════════════════════════════════════════════

-- La contrainte d'unicité porte sur (section_key, variant) depuis la migration
-- d'avril sur l'A/B testing, et non sur section_key seul : un ON CONFLICT
-- (section_key) échouerait. La variante 'julia' est celle par défaut.

-- ── 1. Mentions légales ────────────────────────────────────────────────────

INSERT INTO public.landing_sections (section_key, variant, label, position, is_visible, content, styles)
VALUES (
  'legal_mentions',
  'julia',
  'Page - Mentions légales',
  60,
  true,
  jsonb_build_object(
    'title', 'Mentions légales',
    'html_content', $HTML$
<h2>Éditeur du site</h2>
<p>
  <strong>Julia LAUREAU</strong> — Entrepreneuse individuelle (EI)<br>
  Nom commercial : SOS Shine®<br>
  Siège social : 1 bis rue du Lac, 83440 Montauroux, France<br>
  SIRET : 750 721 805 00026<br>
  RCS : À COMPLÉTER (numéro et ville d'immatriculation)<br>
  TVA intracommunautaire : À COMPLÉTER (ou mentionner la franchise en base de TVA)<br>
  Contact : julialaureau@sosshine.com
</p>

<h2>Directeur de la publication</h2>
<p>À COMPLÉTER (nom de la personne responsable du contenu publié).</p>

<h2>Hébergement</h2>
<p>
  Le site est hébergé par <strong>Vercel Inc.</strong><br>
  340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br>
  Téléphone : +1 559 288 7060 — <a href="https://vercel.com">vercel.com</a>
</p>
<p>
  Les données sont stockées par <strong>Supabase Inc.</strong>, 970 Toa Payoh North,
  #07-04, Singapour 318992 — <a href="https://supabase.com">supabase.com</a>
</p>

<h2>Propriété intellectuelle</h2>
<p>
  L'ensemble des contenus du site — textes, vidéos, enregistrements audio,
  cahiers, illustrations, marque et logo SOS Shine® — est protégé par le droit
  d'auteur et le droit des marques. Toute reproduction ou diffusion, même
  partielle, sans autorisation écrite est interdite.
</p>

<h2>Médiation de la consommation</h2>
<p>
  Conformément à l'article L612-1 du Code de la consommation, tout consommateur
  a le droit de recourir gratuitement à un médiateur en vue de la résolution
  amiable d'un litige.<br>
  Médiateur désigné : À COMPLÉTER (nom, adresse postale et site du médiateur —
  l'adhésion à un service de médiation est obligatoire pour toute entreprise
  vendant à des particuliers).
</p>
<p>
  Plateforme européenne de règlement en ligne des litiges :
  <a href="https://ec.europa.eu/consumers/odr">ec.europa.eu/consumers/odr</a>
</p>

<h2>Avertissement</h2>
<p>
  Les contenus de SOS Shine ont une vocation éducative et d'accompagnement.
  Ils ne constituent ni un diagnostic, ni un traitement, ni un suivi médical,
  psychologique ou psychiatrique, et ne remplacent en aucun cas l'avis d'un
  professionnel de santé. En cas de détresse, contactez le 3114 (numéro
  national de prévention du suicide, gratuit, 24 h/24) ou le 15.
</p>
$HTML$
  ),
  '{}'::jsonb
)
ON CONFLICT (section_key, variant) DO UPDATE
  SET content = EXCLUDED.content,
      is_visible = true;

-- ── 2. Politique de confidentialité ────────────────────────────────────────

INSERT INTO public.landing_sections (section_key, variant, label, position, is_visible, content, styles)
VALUES (
  'legal_privacy',
  'julia',
  'Page - Confidentialité',
  61,
  true,
  jsonb_build_object(
    'title', 'Politique de confidentialité',
    'html_content', $HTML$
<p><em>Dernière mise à jour : 30 août 2026</em></p>

<h2>Qui traite vos données</h2>
<p>
  <strong>Julia LAUREAU</strong> — Entrepreneuse individuelle, nom commercial SOS Shine®<br>
  1 bis rue du Lac, 83440 Montauroux, France — SIRET 750 721 805 00026<br>
  Contact pour toute question relative à vos données : julialaureau@sosshine.com
</p>

<h2>Ce que nous collectons, pourquoi, et sur quelle base</h2>

<h3>Votre compte</h3>
<p>
  Prénom, pseudonyme, adresse e-mail, mot de passe (chiffré, nous ne le voyons
  jamais), photo de profil, biographie et date de naissance si vous les
  renseignez.<br>
  <em>Finalité :</em> vous donner accès à la plateforme.
  <em>Base légale :</em> l'exécution du contrat qui nous lie.
  <em>Conservation :</em> tant que votre compte existe, puis effacement.
</p>

<h3>Votre abonnement</h3>
<p>
  Formule, statut, dates, identifiants de paiement Stripe. <strong>Nous ne
  stockons aucune donnée bancaire</strong> : votre carte n'est connue que de Stripe.<br>
  <em>Finalité :</em> gérer votre accès et votre facturation.
  <em>Base légale :</em> le contrat, et nos obligations comptables.
  <em>Conservation :</em> 10 ans pour les pièces comptables, comme la loi l'impose.
</p>

<h3>Vos réponses aux questionnaires</h3>
<p>
  Le questionnaire de Signature Émotionnelle et le questionnaire approfondi
  recueillent vos réponses, vos scores et la dimension qui vous correspond.
  Ces réponses portent sur votre vécu émotionnel — deuil, rupture, épuisement,
  parfois violences subies. <strong>Nous les considérons comme des données
  sensibles</strong> et les traitons comme telles.<br>
  <em>Finalité :</em> vous proposer le protocole qui correspond à votre situation.
  <em>Base légale :</em> votre consentement explicite, que vous pouvez retirer
  à tout moment en supprimant votre compte ou en nous écrivant.
</p>

<h3>Vos contenus</h3>
<p>
  Publications, commentaires, journal personnel (« Mon Éclat »), messages
  privés, messages vocaux, courrier anonyme, progression dans les protocoles.<br>
  <em>Finalité :</em> faire fonctionner la communauté et votre parcours.
  <em>Base légale :</em> le contrat.
  <em>Le courrier anonyme est réellement anonyme :</em> aucun identifiant n'y
  est enregistré, nous ne pouvons pas savoir de qui il vient.
</p>

<h3>Mesure de fréquentation</h3>
<p>
  Si — et seulement si — vous l'avez accepté : pages consultées, page d'origine,
  navigateur, type d'appareil, campagne d'origine, et une empreinte de votre
  adresse IP (elle n'est jamais conservée en clair). Cette mesure est la nôtre :
  elle n'est transmise à aucun tiers, et le site ne contient aucun traceur
  publicitaire.<br>
  <em>Base légale :</em> votre consentement. <em>Conservation :</em> 25 mois.
</p>

<h3>E-mails</h3>
<p>
  Si vous l'avez accepté, nous vous envoyons des conseils et parfois une offre.
  Nous mesurons l'ouverture de ces messages pour ne pas vous écrire dans le
  vide.<br>
  <em>Base légale :</em> votre consentement, dont nous conservons la date.
  Vous pouvez vous désinscrire en un clic depuis n'importe lequel de nos
  e-mails. Les messages liés à votre compte — confirmation, facture, résultat
  que vous avez demandé — continuent de vous parvenir.
</p>

<h2>Qui d'autre voit vos données</h2>
<p>Nous faisons appel à des prestataires, chacun pour une tâche précise :</p>
<ul>
  <li><strong>Supabase</strong> — hébergement de la base de données et des fichiers. Reçoit l'ensemble des données ci-dessus.</li>
  <li><strong>Vercel</strong> (États-Unis) — hébergement du site. Reçoit les requêtes techniques et les adresses IP.</li>
  <li><strong>Stripe</strong> (États-Unis) — paiement. Reçoit vos coordonnées de facturation et vos données bancaires, que nous ne voyons pas.</li>
  <li><strong>Resend</strong> (États-Unis) — envoi des e-mails. Reçoit votre adresse, votre prénom et le contenu du message.</li>
  <li><strong>Anthropic</strong> (États-Unis) — rédaction de votre fiche personnalisée à l'issue du questionnaire approfondi. Reçoit votre prénom, votre date de naissance et vos réponses. Vos données ne servent pas à entraîner de modèle.</li>
  <li><strong>Apple et Google</strong> — acheminement des notifications, si vous les avez activées.</li>
</ul>
<p>
  <strong>Transferts hors Union européenne.</strong> Plusieurs de ces
  prestataires sont établis aux États-Unis. Ces transferts reposent sur les
  clauses contractuelles types de la Commission européenne et, le cas échéant,
  sur le Data Privacy Framework.
</p>
<p>Nous ne vendons vos données à personne, et nous ne les cédons à aucun publicitaire.</p>

<h2>Combien de temps nous les gardons</h2>
<ul>
  <li>Compte et contenus : tant que le compte existe.</li>
  <li>Pièces comptables : 10 ans (obligation légale).</li>
  <li>Mesure de fréquentation : 25 mois.</li>
  <li>Questionnaires abandonnés sans adresse ni compte : 12 mois.</li>
  <li>Prospects : 3 ans après le dernier contact.</li>
</ul>

<h2>Vos droits</h2>
<p>Vous pouvez, à tout moment :</p>
<ul>
  <li><strong>Consulter et emporter vos données</strong> — depuis « Mon compte », le bouton « Télécharger mes données » vous remet un fichier complet, immédiatement.</li>
  <li><strong>Corriger</strong> ce qui est inexact, depuis votre profil.</li>
  <li><strong>Tout effacer</strong> — depuis « Mon compte », « Supprimer mon compte ». C'est définitif et immédiat.</li>
  <li><strong>Vous opposer</strong> à la prospection, en un clic depuis n'importe quel e-mail.</li>
  <li><strong>Retirer votre consentement</strong> à la mesure de fréquentation, en vidant les données du site dans votre navigateur.</li>
  <li><strong>Demander la limitation</strong> d'un traitement, en nous écrivant.</li>
</ul>
<p>
  Pour tout le reste : julialaureau@sosshine.com. Nous répondons sous un mois.
</p>
<p>
  Si notre réponse ne vous satisfait pas, vous pouvez saisir la CNIL —
  3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 —
  <a href="https://www.cnil.fr">www.cnil.fr</a>
</p>

<h2>Âge minimum</h2>
<p>
  SOS Shine est réservé aux personnes majeures. Nos contenus abordent le deuil,
  l'abus et le traumatisme.
</p>

<h2>Sécurité</h2>
<p>
  Les échanges sont chiffrés, les mots de passe ne sont jamais stockés en clair,
  et l'accès à chaque donnée est cloisonné au niveau de la base : vous ne pouvez
  lire que ce qui vous appartient. Si un incident affectait vos données, vous en
  seriez informé, ainsi que la CNIL, dans les délais prévus par le RGPD.
</p>
$HTML$
  ),
  '{}'::jsonb
)
ON CONFLICT (section_key, variant) DO UPDATE
  SET content = EXCLUDED.content,
      is_visible = true;

NOTIFY pgrst, 'reload schema';
