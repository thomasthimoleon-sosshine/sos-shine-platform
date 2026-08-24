-- ═══════════════════════════════════════════════════════════════
-- SOS SHINE — Pages légales adultes (CGU/CGV + Politique de confidentialité)
-- Contenu repris mot pour mot des documents de référence,
-- version en vigueur au 1er avril 2026. Seul le balisage a été ajouté.
--   /cgv             <- section_key 'legal_cgv'
--   /confidentialite <- section_key 'legal_privacy'
-- ═══════════════════════════════════════════════════════════════

INSERT INTO landing_sections (section_key, label, position, is_visible, content)
VALUES (
  'legal_cgv',
  'CGU / CGV',
  900,
  true,
  jsonb_build_object(
    'title', 'Conditions Générales d''Utilisation et de Vente',
    'html_content', '<p><strong>SOS Shine® — CGU / CGV</strong></p>
<p>Version en vigueur au 1er avril 2026</p>
<h2>1. Présentation de la plateforme</h2>
<p>La plateforme SOS Shine® est une application et un espace numérique dédié au bien-être émotionnel, à la compréhension des mécanismes humains, à la psychologie comportementale, au développement personnel et à l’introspection.</p>
<p>Elle propose des contenus accessibles 24h/24 et 7j/7 (vidéos, audios, textes, méditations, outils pédagogiques, espaces d’échange), dans une logique d’autonomie, de compréhension de soi et de progression personnelle.</p>
<p>La plateforme SOS Shine® est éditée et exploitée par :</p>
<p><strong>Julia LAUREAU</strong></p>
<p>Entrepreneuse individuelle — Nom commercial : SOS Shine®</p>
<ul>
  <li>SIRET : 750 721 805 00026</li>
  <li>Siège social : 1 bis rue du Lac, 83440 Montauroux, France</li>
  <li>Email : julialaureau@sosshine.com</li>
</ul>
<p>SOS Shine® est une marque déposée. Toute reproduction, exploitation ou utilisation non autorisée est strictement interdite.</p>
<h2>2. Acceptation des conditions</h2>
<p>L’accès à la plateforme SOS Shine® implique l’acceptation pleine et entière des présentes Conditions Générales d’Utilisation et de Vente (ci-après « CGU/CGV »). Toute inscription ou utilisation vaut acceptation sans réserve.</p>
<h2>3. Accès à la plateforme</h2>
<p>L’accès à SOS Shine® se fait via :</p>
<ul>
  <li>une inscription personnelle,</li>
  <li>la création d’un compte utilisateur,</li>
  <li>le choix d’une formule d’abonnement (voir section 4).</li>
</ul>
<p>L’utilisateur est responsable de la confidentialité de ses identifiants de connexion.</p>
<h2>4. Offres d’abonnement</h2>
<h3>4.1 Formules disponibles</h3>
<p>SOS Shine® propose trois formules d’abonnement mensuel :</p>
<p><strong>Formule Essentielle — 9,90 € TTC / mois</strong></p>
<p>Accès aux contenus de base de la plateforme. Sans période d’essai gratuite.</p>
<p><strong>Formule Sérénité — 49,90 € TTC / mois</strong></p>
<p>Accès élargi aux contenus et fonctionnalités de la plateforme. Bénéficie d’une période d’essai gratuite de 7 jours.</p>
<p><strong>Formule Premium — 99,90 € TTC / mois</strong></p>
<p>Accès intégral à l’ensemble des contenus, fonctionnalités et ateliers exclusifs. Bénéficie d’une période d’essai gratuite de 7 jours.</p>
<p>Des réductions sont proposées pour les engagements sur 3, 6 ou 12 mois. Les tarifs en vigueur sont disponibles sur la page tarifaire de la plateforme.</p>
<h3>4.2 Période d’essai gratuite</h3>
<p>Les formules Sérénité et Premium bénéficient d’une période d’essai gratuite de 7 jours. Pendant cette période :</p>
<ul>
  <li>l’utilisateur bénéficie d’un accès complet aux contenus de la formule souscrite,</li>
  <li>aucun prélèvement n’est effectué.</li>
</ul>
<p>À l’issue des 7 jours, l’abonnement devient automatiquement payant, sauf résiliation avant la fin de la période d’essai. La formule Essentielle ne comprend pas de période d’essai ; le premier prélèvement intervient immédiatement après la souscription.</p>
<h3>4.3 Renouvellement et résiliation</h3>
<p>L’abonnement est renouvelé automatiquement chaque mois. Il est sans engagement minimum pour les formules mensuelles.</p>
<p>L’utilisateur peut résilier à tout moment depuis son espace personnel. La résiliation prend effet à la fin de la période mensuelle en cours :</p>
<ul>
  <li>l’accès reste actif jusqu’à la date de fin du mois payé,</li>
  <li>aucun remboursement partiel n’est effectué.</li>
</ul>
<h2>5. Paiement</h2>
<p>Le paiement s’effectue en ligne par carte bancaire via un prestataire de paiement sécurisé (Stripe). SOS Shine® ne conserve aucune donnée bancaire.</p>
<p>Tout incident de paiement peut entraîner la suspension immédiate de l’accès à la plateforme.</p>
<h2>6. Droit de rétractation</h2>
<p>Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne s’applique pas aux contenus numériques fournis sur un support immatériel dont l’exécution a commencé avec l’accord préalable et exprès du consommateur, qui a reconnu perdre son droit de rétractation.</p>
<p>En validant son inscription et en accédant à la plateforme, l’utilisateur :</p>
<ul>
  <li>reconnaît avoir été informé de cette renonciation avant la confirmation de sa commande,</li>
  <li>consent exprèssément à l’exécution immédiate du service numérique,</li>
  <li>renonce exprèssément à son droit de rétractation dès lors qu’il a accédé aux contenus.</li>
</ul>
<p>Pour les formules avec période d’essai gratuite, cette dernière tient lieu de délai de découverte. L’utilisateur peut résilier sans frais pendant les 7 jours d’essai.</p>
<h2>7. Nature des contenus et responsabilité</h2>
<p>Les contenus proposés sur SOS Shine® sont éducatifs, informatifs, introspectifs et orientés bien-être émotionnel. Ils ne constituent en aucun cas :</p>
<ul>
  <li>un avis médical,</li>
  <li>un diagnostic,</li>
  <li>une prescription,</li>
  <li>un suivi psychologique ou psychiatrique.</li>
</ul>
<p>L’utilisateur demeure entièrement responsable de l’utilisation qu’il fait des contenus. SOS Shine® ne peut être tenu responsable d’interprétations personnelles ou de décisions prises sur la base des contenus.</p>
<h2>8. Utilisation de la plateforme et règles communautaires</h2>
<p>L’utilisateur s’engage à utiliser la plateforme SOS Shine® de manière respectueuse, responsable et conforme à sa vocation. Sont strictement interdits :</p>
<ul>
  <li>tout propos insultant, diffamatoire, haineux, discriminatoire ou menaçant,</li>
  <li>toute forme de harcèlement, de pression ou de manipulation,</li>
  <li>tout comportement perturbant le bon fonctionnement de la communauté,</li>
  <li>toute tentative de détournement de la plateforme à des fins personnelles, commerciales ou illicites.</li>
</ul>
<p>Les espaces d’échange sont des espaces de partage et d’expression personnelle. Chaque utilisateur demeure pleinement responsable de ses propos et interactions. SOS Shine® n’exerce aucun contrôle préalable sur les échanges entre membres.</p>
<p>Toute prise de contact, rendez-vous ou rencontre entre utilisateurs se fait sous leur responsabilité exclusive. SOS Shine® ne saurait être tenu responsable de tout incident survenu dans ce cadre.</p>
<p>En cas de non-respect des présentes règles, SOS Shine® se réserve le droit de suspendre ou supprimer l’accès à la plateforme, sans préavis ni remboursement.</p>
<h2>9. Propriété intellectuelle</h2>
<p>L’ensemble des contenus présents sur la plateforme SOS Shine® (textes, vidéos, audios, visuels, concepts, méthodes) est protégé par le droit de la propriété intellectuelle et est la propriété exclusive de Julia LAUREAU, éditrice de la marque SOS Shine®.</p>
<p>Toute reproduction, diffusion, revente ou utilisation sans autorisation écrite préalable est strictement interdite.</p>
<h2>10. Données personnelles</h2>
<p>SOS Shine® collecte et traite les données personnelles dans le respect du Règlement Général sur la Protection des Données (RGPD) et de la loi Informatique et Libertés.</p>
<p><strong>Responsable de traitement : </strong>Julia LAUREAU — julialaureau@sosshine.com</p>
<p>Les données collectées sont utilisées uniquement pour :</p>
<ul>
  <li>la gestion des comptes utilisateurs,</li>
  <li>l’accès aux services,</li>
  <li>la communication liée à la plateforme.</li>
</ul>
<p>Conformément au RGPD, l’utilisateur dispose des droits suivants :</p>
<ul>
  <li>droit d’accès,</li>
  <li>droit de rectification,</li>
  <li>droit à l’effacement (droit à l’oubli),</li>
  <li>droit à la limitation du traitement,</li>
  <li>droit à la portabilité des données,</li>
  <li>droit d’opposition.</li>
</ul>
<p>Ces droits peuvent être exercés à tout moment en contactant : julialaureau@sosshine.com</p>
<p>L’utilisateur dispose également du droit d’introduire une réclamation auprès de la Commission Nationale de l’Informatique et des Libertés (CNIL) — www.cnil.fr.</p>
<h2>11. Disponibilité du service</h2>
<p>SOS Shine® met tout en œuvre pour assurer un accès continu à la plateforme. Toutefois, l’accès peut être temporairement suspendu pour maintenance, mise à jour ou cas de force majeure, sans que cela ouvre droit à indemnisation.</p>
<h2>12. Évolution des services et des conditions</h2>
<p>SOS Shine® se réserve le droit de faire évoluer les contenus, de modifier les fonctionnalités et d’adapter les présentes CGU/CGV. Les utilisateurs seront informés des modifications majeures.</p>
<h2>13. Résiliation par SOS Shine®</h2>
<p>SOS Shine® se réserve le droit de résilier ou suspendre l’accès d’un utilisateur, sans indemnité ni remboursement, en cas de :</p>
<ul>
  <li>non-respect des présentes conditions,</li>
  <li>comportement inapproprié au sein de la communauté,</li>
  <li>propos ou actes portant atteinte à l’intégrité, à la sécurité ou à l’image de la plateforme,</li>
  <li>usage frauduleux ou détourné des services,</li>
  <li>organisation d’activités ou événements engageant la responsabilité de SOS Shine® sans autorisation écrite.</li>
</ul>
<p>Cette résiliation peut intervenir à tout moment, sans obligation de justification détaillée.</p>
<h2>14. Programme d’affiliation</h2>
<p>SOS Shine® propose un programme d’affiliation permettant à tout membre actif de recommander la plateforme et de percevoir une commission sur les abonnements souscrits via son lien personnel.</p>
<h3>14.1 Accès au programme</h3>
<p>Le programme d’affiliation est accessible à tout utilisateur titulaire d’un abonnement actif sur SOS Shine®. L’inscription se fait depuis l’espace personnel.</p>
<h3>14.2 Fonctionnement</h3>
<p>Chaque affilié dispose d’un lien de parrainage unique. Toute souscription validée via ce lien ouvre droit à une commission, sous réserve que :</p>
<ul>
  <li>l’utilisateur parrainté soit un nouveau membre (aucun compte existant),</li>
  <li>la souscription soit effective et le paiement validé,</li>
  <li>la période d’essai gratuite (le cas échéant) soit écoulée sans résiliation.</li>
</ul>
<h3>14.3 Commissions</h3>
<p>Le taux de commission et les modalités de versement sont définis dans les conditions du programme disponibles dans l’espace affilié de la plateforme. SOS Shine® se réserve le droit de modifier ces conditions avec un préavis de 30 jours.</p>
<h3>14.4 Versement</h3>
<p>Les commissions accumulées sont versées selon les modalités précisées dans l’espace affilié, sous réserve d’un seuil minimum de versement. Aucune commission n’est due en cas de remboursement ou d’annulation de la souscription ayant généré le droit à commission.</p>
<h3>14.5 Exclusions</h3>
<p>L’auto-parrainage est strictement interdit. Toute tentative de manipulation du programme (faux comptes, liens frauduleux, utilisation abusive) entraînera la résiliation immédiate du compte affilié et l’annulation des commissions en attente.</p>
<h2>15. Loi applicable, juridiction et champ d’application</h2>
<p>Les présentes conditions sont soumises au droit français. En cas de litige, une tentative de résolution amiable sera privilégiée. À défaut, les tribunaux compétents seront ceux du ressort du siège social de SOS Shine®.</p>
<p>Les présentes CGU/CGV s’appliquent à l’ensemble des services proposés sous la marque SOS Shine®, incluant notamment :</p>
<ul>
  <li>la plateforme numérique et ses abonnements,</li>
  <li>les contenus en ligne,</li>
  <li>les événements et retraites,</li>
  <li>le programme d’affiliation.</li>
</ul>
<p>Les prestations d’accompagnement individuel ou collectif (coaching, analyses, ateliers privés) font l’objet de contrats distincts et de conditions commerciales spécifiques communiquées lors de la réservation. Ces présentes CGU/CGV ne s’y substituent pas.</p>
<h2>16. Contact</h2>
<p>Pour toute question relative aux présentes conditions, l’utilisateur peut contacter SOS Shine® à l’adresse suivante :</p>
<p><strong>julialaureau@sosshine.com</strong></p>
<p>SOS Shine® — CGU/CGV — Version en vigueur au 1er avril 2026</p>'
  )
)
ON CONFLICT (section_key) DO UPDATE
  SET content = landing_sections.content || EXCLUDED.content,
      updated_at = now();

INSERT INTO landing_sections (section_key, label, position, is_visible, content)
VALUES (
  'legal_privacy',
  'Politique de confidentialité',
  901,
  true,
  jsonb_build_object(
    'title', 'Politique de Confidentialité',
    'html_content', '<p><strong>SOS Shine® — RGPD</strong></p>
<p>Version en vigueur au 1er avril 2026</p>
<h2>1. Responsable du traitement</h2>
<p>Le responsable du traitement des données personnelles collectées via la plateforme SOS Shine® est :</p>
<p><strong>Julia LAUREAU</strong></p>
<p>Entrepreneuse individuelle — Nom commercial : SOS Shine®</p>
<ul>
  <li>SIRET : 750 721 805 00026</li>
  <li>Siège social : 1 bis rue du Lac, 83440 Montauroux, France</li>
  <li>Contact RGPD : julialaureau@sosshine.com</li>
</ul>
<h2>2. Collecte des données</h2>
<p>Dans le cadre de l’utilisation de la plateforme SOS Shine®, les données suivantes peuvent être collectées :</p>
<ul>
  <li>nom et prénom,</li>
  <li>adresse email,</li>
  <li>informations de connexion,</li>
  <li>données nécessaires au paiement (traitées via prestataire sécurisé),</li>
  <li>échanges effectués dans les espaces communautaires.</li>
</ul>
<p>Ces données sont collectées uniquement dans le cadre de la gestion des abonnements, de l’accès aux services et de l’amélioration de l’expérience utilisateur.</p>
<h2>3. Finalité du traitement</h2>
<p>Les données sont utilisées pour :</p>
<ul>
  <li>gérer les comptes utilisateurs,</li>
  <li>assurer l’accès aux contenus,</li>
  <li>traiter les paiements,</li>
  <li>communiquer des informations relatives à la plateforme,</li>
  <li>assurer la sécurité des échanges communautaires.</li>
</ul>
<p>Aucune donnée n’est vendue à des tiers.</p>
<h2>4. Durée de conservation</h2>
<p>Les données sont conservées pendant la durée de l’abonnement et pour la durée légalement nécessaire à des fins comptables et administratives (en général 5 ans après la fin de la relation commerciale, conformément au Code de commerce).</p>
<p>Après résiliation, les données de compte sont supprimées ou anonymisées à l’issue de la période de conservation légale.</p>
<h2>5. Sécurité des données</h2>
<p>SOS Shine® met en œuvre des mesures techniques et organisationnelles raisonnables afin d’assurer la protection des données personnelles contre tout accès non autorisé, perte ou divulgation.</p>
<p>Les paiements sont traités via Stripe, prestataire de paiement sécurisé certifié PCI-DSS. SOS Shine® ne conserve aucune information bancaire.</p>
<h2>6. Droits des utilisateurs</h2>
<p>Conformément au Règlement Général sur la Protection des Données (RGPD), l’utilisateur dispose des droits suivants :</p>
<ul>
  <li>droit d’accès — obtenir une copie des données détenues,</li>
  <li>droit de rectification — corriger des données inexactes ou incomplètes,</li>
  <li>droit à l’effacement — demander la suppression des données (droit à l’oubli),</li>
  <li>droit à la limitation du traitement,</li>
  <li>droit à la portabilité — recevoir ses données dans un format structuré et lisible,</li>
  <li>droit d’opposition au traitement.</li>
</ul>
<p>Ces droits peuvent être exercés à tout moment en contactant : julialaureau@sosshine.com</p>
<p>En l’absence de réponse satisfaisante, l’utilisateur dispose du droit d’introduire une réclamation auprès de la Commission Nationale de l’Informatique et des Libertés (CNIL) :</p>
<p>www.cnil.fr — 3 Place de Fontenoy, 75007 Paris</p>
<h2>7. Cookies</h2>
<p>La plateforme SOS Shine® utilise des cookies relevant de trois catégories :</p>
<p><strong>Cookies techniques (indispensables) :</strong></p>
<p>Nécessaires au fonctionnement de la plateforme (authentification, session, sécurité). Ils ne peuvent pas être désactivés sans altérer le service.</p>
<p><strong>Cookies de paiement :</strong></p>
<p>Déposés par Stripe dans le cadre du traitement sécurisé des paiements. Soumis à la politique de confidentialité de Stripe.</p>
<p><strong>Cookies d’hébergement :</strong></p>
<p>Déposés par Vercel (hébergeur) à des fins techniques de performance et de sécurité.</p>
<p>L’utilisateur peut paramétrer son navigateur afin de refuser ou limiter l’usage des cookies, étant précisé que la désactivation des cookies techniques peut affecter le fonctionnement de la plateforme.</p>
<h2>8. Évolution de la politique</h2>
<p>La présente politique de confidentialité peut être modifiée afin de rester conforme à l’évolution de la législation ou des services proposés. Les utilisateurs seront informés de toute modification substantielle.</p>
<h2>9. Contact</h2>
<p>Pour toute question relative à la présente politique ou à vos données personnelles :</p>
<p><strong>julialaureau@sosshine.com</strong></p>
<p>SOS Shine® — Politique de confidentialité — Version en vigueur au 1er avril 2026</p>'
  )
)
ON CONFLICT (section_key) DO UPDATE
  SET content = landing_sections.content || EXCLUDED.content,
      updated_at = now();

-- Vérification
SELECT section_key,
       content->>'title' AS titre,
       length(content->>'html_content') AS taille_html
FROM landing_sections
WHERE section_key IN ('legal_cgv','legal_privacy');
