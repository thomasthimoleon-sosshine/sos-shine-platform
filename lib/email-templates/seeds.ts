// =============================================
// SOS SHINE® — Seeds des 23 templates email
// Éditables depuis le BackOffice CRM
// =============================================

export interface EmailTemplateSeed {
  template_key: string
  category: string
  name: string
  subject: string
  html_content: string
  trigger_type: string
  trigger_delay_days: number
  description: string
  variables: string[]
  is_active: boolean
}

export const EMAIL_TEMPLATE_SEEDS: EmailTemplateSeed[] = [
  // ========== LISTE D'ATTENTE ==========
  {
    template_key: 'waitlist_confirmation',
    category: 'waitlist',
    name: 'Confirmation inscription liste d\'attente',
    subject: '{firstName}, bienvenue sur la liste d\'attente SOS Shine !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Bienvenue {firstName} !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Vous faites désormais partie de la liste d'attente de <strong style="color:#D4AF37;">SOS Shine®</strong>.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Nous vous préviendrons dès que les portes s'ouvriront. En attendant, restez connecté(e) à votre lumière intérieure.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;margin-top:24px;">Avec bienveillance,<br/><strong style="color:#D4AF37;">Julia</strong> — Fondatrice SOS Shine®</p>`,
    trigger_type: 'waitlist_signup',
    trigger_delay_days: 0,
    description: 'Envoyé immédiatement à l\'inscription sur la liste d\'attente',
    variables: ['firstName', 'email'],
    is_active: true,
  },
  {
    template_key: 'waitlist_reminder_j3',
    category: 'waitlist',
    name: 'Rappel J+3 — Liste d\'attente',
    subject: '{firstName}, votre place est réservée...',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Votre lumière attend, {firstName}</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Il y a quelques jours, vous avez rejoint notre liste d'attente. Nous préparons quelque chose de <strong style="color:#D4AF37;">magnifique</strong> pour vous.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">En attendant, avez-vous découvert votre <strong>Signature Émotionnelle</strong> ? Ce test gratuit vous révèle votre profil émotionnel unique.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/signature-emotionnelle" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Découvrir ma Signature</a>
</div>`,
    trigger_type: 'waitlist_signup',
    trigger_delay_days: 3,
    description: 'Envoyé 3 jours après l\'inscription à la liste d\'attente',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },
  {
    template_key: 'waitlist_opening',
    category: 'waitlist',
    name: 'Ouverture des inscriptions',
    subject: '{firstName}, les portes de SOS Shine sont ouvertes !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Le moment est venu, {firstName} !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Les inscriptions à <strong style="color:#D4AF37;">SOS Shine®</strong> sont officiellement ouvertes. Votre place sur la liste d'attente vous donne un accès prioritaire.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Rejoignez la première encyclopédie mondiale du bien-être émotionnel et commencez votre transformation dès aujourd'hui.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/rejoindre" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Rejoindre maintenant</a>
</div>`,
    trigger_type: 'manual',
    trigger_delay_days: 0,
    description: 'Envoyé manuellement lors de l\'ouverture des inscriptions',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },

  // ========== QUIZ SIGNATURE ÉMOTIONNELLE ==========
  {
    template_key: 'quiz_result',
    category: 'quiz',
    name: 'Résultat Signature Émotionnelle',
    subject: '{firstName}, votre Signature Émotionnelle est prête !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Votre Signature Émotionnelle, {firstName}</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Merci d'avoir complété le test de Signature Émotionnelle. Votre profil détaillé a été envoyé dans un email séparé.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Ce profil est votre carte de navigation émotionnelle. Conservez-le précieusement.</p>`,
    trigger_type: 'signature_test_complete',
    trigger_delay_days: 0,
    description: 'Envoyé immédiatement après la complétion du test de signature',
    variables: ['firstName', 'email'],
    is_active: true,
  },
  {
    template_key: 'quiz_followup_j2',
    category: 'quiz',
    name: 'Suivi J+2 — Après le quiz',
    subject: '{firstName}, avez-vous exploré votre Signature ?',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Comment allez-vous, {firstName} ?</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Depuis la découverte de votre Signature Émotionnelle, avez-vous pris un moment pour explorer votre profil en profondeur ?</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Chez SOS Shine®, nous proposons des protocoles personnalisés, des méditations guidées et des outils concrets pour transformer vos émotions en force.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/rejoindre" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Découvrir SOS Shine</a>
</div>`,
    trigger_type: 'signature_test_complete',
    trigger_delay_days: 2,
    description: 'Envoyé 2 jours après le test de signature',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },
  {
    template_key: 'quiz_conversion_j5',
    category: 'quiz',
    name: 'Conversion J+5 — Offre spéciale',
    subject: '{firstName}, une invitation spéciale pour vous',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Une invitation pour vous, {firstName}</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Votre Signature Émotionnelle a révélé un potentiel extraordinaire. Ne laissez pas cette découverte sans suite.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Rejoignez SOS Shine® et accédez à l'ensemble de nos ressources : vidéos, méditations, protocoles, défis et communauté bienveillante.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/rejoindre" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Commencer maintenant</a>
</div>`,
    trigger_type: 'signature_test_complete',
    trigger_delay_days: 5,
    description: 'Envoyé 5 jours après le test de signature',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },

  // ========== ABONNEMENTS ==========
  {
    template_key: 'subscription_welcome',
    category: 'subscription',
    name: 'Bienvenue — Nouvel abonné',
    subject: 'Bienvenue dans la famille SOS Shine, {firstName} !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Bienvenue {firstName} !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Vous faites maintenant partie de la famille <strong style="color:#D4AF37;">SOS Shine®</strong> avec votre abonnement <strong>{planName}</strong>.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Voici ce qui vous attend :</p>
<ul style="color:#a1a1aa;font-size:14px;line-height:2;">
  <li>Accès illimité à Shine TV (vidéos exclusives)</li>
  <li>Méditations guidées sur Shine Audible</li>
  <li>Bibliothèque de la Shine Librairie</li>
  <li>Communauté bienveillante</li>
</ul>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/espace-membre" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Accéder à mon espace</a>
</div>`,
    trigger_type: 'subscription_created',
    trigger_delay_days: 0,
    description: 'Envoyé immédiatement après la souscription',
    variables: ['firstName', 'email', 'planName', 'planAmount', 'site_url'],
    is_active: true,
  },
  {
    template_key: 'subscription_confirmation',
    category: 'subscription',
    name: 'Confirmation de paiement',
    subject: 'Confirmation de votre abonnement SOS Shine — {planAmount}/mois',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Paiement confirmé</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">{firstName}, votre abonnement <strong style="color:#D4AF37;">{planName}</strong> à {planAmount}/mois est bien actif.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Votre prochain prélèvement aura lieu le mois prochain. Vous pouvez gérer votre abonnement depuis votre espace membre à tout moment.</p>`,
    trigger_type: 'payment_success',
    trigger_delay_days: 0,
    description: 'Envoyé après chaque paiement réussi',
    variables: ['firstName', 'email', 'planName', 'planAmount', 'site_url'],
    is_active: true,
  },

  // ========== NURTURING ==========
  {
    template_key: 'nurturing_j1',
    category: 'nurturing',
    name: 'Nurturing J+1 — Premier pas',
    subject: '{firstName}, votre premier pas lumineux',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Votre premier jour, {firstName}</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Félicitations pour votre inscription ! Aujourd'hui est le premier jour de votre transformation émotionnelle.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;"><strong style="color:#D4AF37;">Suggestion du jour :</strong> Prenez 5 minutes pour explorer la section Shine TV. Commencez par une vidéo courte qui vous inspire.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/shine-tv" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Explorer Shine TV</a>
</div>`,
    trigger_type: 'subscription_created',
    trigger_delay_days: 1,
    description: 'Envoyé 1 jour après l\'inscription',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },
  {
    template_key: 'nurturing_j3',
    category: 'nurturing',
    name: 'Nurturing J+3 — Méditation',
    subject: '{firstName}, offrez-vous une pause méditative',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Pause lumineuse, {firstName}</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Après quelques jours sur SOS Shine, il est temps de plonger dans <strong style="color:#D4AF37;">Shine Audible</strong>.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Nos méditations guidées sont conçues pour apaiser, recentrer et illuminer. Essayez une session de 10 minutes aujourd'hui.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/shine-audible" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Écouter Shine Audible</a>
</div>`,
    trigger_type: 'subscription_created',
    trigger_delay_days: 3,
    description: 'Envoyé 3 jours après l\'inscription',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },
  {
    template_key: 'nurturing_j7',
    category: 'nurturing',
    name: 'Nurturing J+7 — Première semaine',
    subject: 'Déjà 1 semaine, {firstName} ! Comment vous sentez-vous ?',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Une semaine de lumière, {firstName}</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Cela fait déjà une semaine que vous avez rejoint SOS Shine®. Comment vous sentez-vous ?</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">N'oubliez pas d'explorer la <strong style="color:#D4AF37;">communauté</strong>. Partagez votre ressenti, posez vos questions, et connectez-vous avec d'autres âmes lumineuses.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/communaute" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Rejoindre la communauté</a>
</div>`,
    trigger_type: 'subscription_created',
    trigger_delay_days: 7,
    description: 'Envoyé 7 jours après l\'inscription',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },
  {
    template_key: 'nurturing_j14',
    category: 'nurturing',
    name: 'Nurturing J+14 — Défi',
    subject: '{firstName}, relevez votre premier défi Shine !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Prêt(e) pour un défi, {firstName} ?</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Après deux semaines de découverte, il est temps de passer à l'action avec nos <strong style="color:#D4AF37;">Défis SOS Shine</strong>.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Chaque défi est conçu pour transformer un aspect précis de votre vie émotionnelle. Choisissez celui qui vous parle le plus !</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/defis" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Découvrir les défis</a>
</div>`,
    trigger_type: 'subscription_created',
    trigger_delay_days: 14,
    description: 'Envoyé 14 jours après l\'inscription',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },

  // ========== RENOUVELLEMENT ==========
  {
    template_key: 'renewal_reminder_j7',
    category: 'renewal',
    name: 'Rappel renouvellement J-7',
    subject: '{firstName}, votre abonnement se renouvelle bientôt',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Renouvellement à venir</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">{firstName}, votre abonnement <strong style="color:#D4AF37;">{planName}</strong> sera renouvelé automatiquement dans 7 jours pour {planAmount}/mois.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Aucune action n'est requise de votre part. Si vous souhaitez modifier ou annuler votre abonnement, vous pouvez le faire depuis votre espace membre.</p>`,
    trigger_type: 'renewal_reminder',
    trigger_delay_days: -7,
    description: 'Envoyé 7 jours avant le renouvellement',
    variables: ['firstName', 'email', 'planName', 'planAmount', 'site_url'],
    is_active: true,
  },
  {
    template_key: 'renewal_success',
    category: 'renewal',
    name: 'Renouvellement réussi',
    subject: 'Votre abonnement SOS Shine a été renouvelé',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Renouvellement confirmé</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">{firstName}, votre abonnement <strong style="color:#D4AF37;">{planName}</strong> a été renouvelé avec succès pour un nouveau mois.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Merci de votre fidélité. Continuez à briller !</p>`,
    trigger_type: 'renewal_success',
    trigger_delay_days: 0,
    description: 'Envoyé après le renouvellement automatique',
    variables: ['firstName', 'email', 'planName', 'planAmount'],
    is_active: true,
  },
  {
    template_key: 'renewal_failed',
    category: 'renewal',
    name: 'Échec de paiement',
    subject: '{firstName}, un problème avec votre paiement',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Problème de paiement</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">{firstName}, nous n'avons pas pu renouveler votre abonnement <strong style="color:#D4AF37;">{planName}</strong>.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Veuillez vérifier vos informations de paiement dans votre espace membre. Nous réessaierons dans 3 jours.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/espace-membre/abonnement" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Mettre à jour mon paiement</a>
</div>`,
    trigger_type: 'payment_failed',
    trigger_delay_days: 0,
    description: 'Envoyé après un échec de paiement',
    variables: ['firstName', 'email', 'planName', 'planAmount', 'site_url'],
    is_active: true,
  },

  // ========== RÉSILIATION ==========
  {
    template_key: 'cancellation_confirmation',
    category: 'cancellation',
    name: 'Confirmation de résiliation',
    subject: '{firstName}, votre résiliation est confirmée',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Au revoir {firstName}...</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Votre abonnement <strong style="color:#D4AF37;">{planName}</strong> a bien été résilié. Vous conservez l'accès jusqu'à la fin de votre période en cours.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Nous espérons que SOS Shine vous a apporté de la lumière. Vous serez toujours la bienvenue si vous souhaitez revenir.</p>`,
    trigger_type: 'subscription_cancelled',
    trigger_delay_days: 0,
    description: 'Envoyé immédiatement après la résiliation',
    variables: ['firstName', 'email', 'planName'],
    is_active: true,
  },
  {
    template_key: 'cancellation_winback_j7',
    category: 'cancellation',
    name: 'Win-back J+7 — Après résiliation',
    subject: '{firstName}, la lumière vous attend toujours...',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Vous nous manquez, {firstName}</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Cela fait une semaine que vous nous avez quittés, et nous espérons que tout va bien.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Sachez que votre place est toujours réservée chez <strong style="color:#D4AF37;">SOS Shine®</strong>. Revenez quand vous le souhaitez — votre lumière intérieure ne demande qu'à briller.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/rejoindre" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Revenir chez SOS Shine</a>
</div>`,
    trigger_type: 'subscription_cancelled',
    trigger_delay_days: 7,
    description: 'Envoyé 7 jours après la résiliation',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },

  // ========== PROGRAMME AFFILIÉ ==========
  {
    template_key: 'affiliate_welcome',
    category: 'affiliate',
    name: 'Bienvenue programme affilié',
    subject: '{firstName}, bienvenue dans le programme ambassadeur SOS Shine !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Bienvenue ambassadeur(rice), {firstName} !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Vous faites maintenant partie du <strong style="color:#D4AF37;">Programme Ambassadeur SOS Shine®</strong>. Partagez votre lumière et gagnez des commissions.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Votre lien de parrainage unique est prêt dans votre espace membre. Chaque personne qui s'inscrit grâce à vous vous rapporte une commission récurrente.</p>
<div style="text-align:center;margin:32px 0;">
  <a href="{site_url}/espace-membre/parrainage" style="display:inline-block;padding:14px 36px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#D4AF37,#B8960F);">Mon espace ambassadeur</a>
</div>`,
    trigger_type: 'affiliate_approved',
    trigger_delay_days: 0,
    description: 'Envoyé quand le statut affilié est approuvé',
    variables: ['firstName', 'email', 'site_url'],
    is_active: true,
  },
  {
    template_key: 'affiliate_referral',
    category: 'affiliate',
    name: 'Notification nouveau filleul',
    subject: 'Bravo {firstName} ! Un nouveau filleul vient de s\'inscrire',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Nouveau filleul !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">{firstName}, quelqu'un vient de rejoindre SOS Shine® grâce à votre lien de parrainage ! Votre commission sera créditée automatiquement.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Continuez à partager votre lumière — chaque parrainage compte.</p>`,
    trigger_type: 'affiliate_referral',
    trigger_delay_days: 0,
    description: 'Envoyé quand un filleul s\'inscrit',
    variables: ['firstName', 'email'],
    is_active: true,
  },
  {
    template_key: 'affiliate_payout',
    category: 'affiliate',
    name: 'Notification virement affilié',
    subject: '{firstName}, votre virement SOS Shine est en route !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Virement en route !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">{firstName}, un virement de <strong style="color:#D4AF37;">{payoutAmount}</strong> vient d'être initié vers votre compte bancaire.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Le virement sera visible sur votre compte sous 2 à 5 jours ouvrés. Merci d'être un ambassadeur de lumière !</p>`,
    trigger_type: 'affiliate_payout',
    trigger_delay_days: 0,
    description: 'Envoyé lors d\'un virement de commission',
    variables: ['firstName', 'email', 'payoutAmount'],
    is_active: true,
  },

  // ========== ÉVÉNEMENTS ==========
  {
    template_key: 'event_registration',
    category: 'events',
    name: 'Confirmation inscription événement',
    subject: '{firstName}, vous êtes inscrit(e) à "{eventName}" !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Inscription confirmée</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">{firstName}, votre inscription à <strong style="color:#D4AF37;">{eventName}</strong> est confirmée.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;"><strong>Date :</strong> {eventDate}<br/><strong>Heure :</strong> {eventTime}</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Nous vous enverrons un rappel avant l'événement. À très bientôt !</p>`,
    trigger_type: 'event_registration',
    trigger_delay_days: 0,
    description: 'Envoyé lors de l\'inscription à un événement',
    variables: ['firstName', 'email', 'eventName', 'eventDate', 'eventTime'],
    is_active: true,
  },
  {
    template_key: 'event_reminder',
    category: 'events',
    name: 'Rappel événement J-1',
    subject: 'Rappel : "{eventName}" c\'est demain, {firstName} !',
    html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">C'est demain !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">{firstName}, l'événement <strong style="color:#D4AF37;">{eventName}</strong> a lieu demain.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;"><strong>Date :</strong> {eventDate}<br/><strong>Heure :</strong> {eventTime}</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Préparez-vous à vivre un moment exceptionnel. À demain !</p>`,
    trigger_type: 'event_reminder',
    trigger_delay_days: -1,
    description: 'Envoyé 1 jour avant l\'événement',
    variables: ['firstName', 'email', 'eventName', 'eventDate', 'eventTime'],
    is_active: true,
  },
]
