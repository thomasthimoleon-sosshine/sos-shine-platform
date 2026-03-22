import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'

const DEFAULT_SEQUENCES = [
  {
    name: 'Bienvenue — Test Signature Émotionnelle',
    trigger_type: 'signature_test',
    steps: [
      {
        delay_days: 2,
        subject: '{firstName}, votre Signature Émotionnelle vous a révélé quelque chose...',
        html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Bonjour {firstName},</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Il y a 2 jours, vous avez découvert votre <strong style="color:#D4AF37;">Signature Émotionnelle</strong>. Ce profil unique révèle vos forces et vos zones d'ombre.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Saviez-vous que chez <strong style="color:#D4AF37;">SOS Shine®</strong>, Julia accompagne chaque profil avec un protocole personnalisé ?</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Rejoignez la communauté et transformez votre ombre en lumière.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;margin-top:24px;">Avec bienveillance,<br/><strong style="color:#D4AF37;">Julia</strong> — Fondatrice SOS Shine®</p>`,
      },
      {
        delay_days: 5,
        subject: '{firstName}, 3 clés pour transformer votre Signature Émotionnelle',
        html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Votre lumière attend, {firstName}</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Votre Signature Émotionnelle est un point de départ. Voici <strong style="color:#D4AF37;">3 clés</strong> pour aller plus loin :</p>
<ol style="color:#E0E0E0;font-size:15px;line-height:2;">
<li><strong style="color:#D4AF37;">Acceptez votre ombre</strong> — elle fait partie de votre force</li>
<li><strong style="color:#D4AF37;">Nourrissez votre lumière</strong> — un petit geste chaque jour</li>
<li><strong style="color:#D4AF37;">Connectez-vous</strong> — la communauté SOS Shine® est là pour vous</li>
</ol>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;margin-top:24px;">Prête à briller ?<br/><strong style="color:#D4AF37;">Julia</strong></p>`,
      },
    ],
  },
  {
    name: 'Bienvenue — Inscription Membre',
    trigger_type: 'signup',
    steps: [
      {
        delay_days: 0,
        subject: 'Bienvenue dans la famille SOS Shine®, {firstName} !',
        html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Bienvenue {firstName} !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Vous venez de rejoindre <strong style="color:#D4AF37;">SOS Shine®</strong> et nous sommes ravies de vous accueillir.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Votre espace membre est prêt. Explorez les ressources, connectez-vous avec la communauté, et commencez votre transformation.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;margin-top:24px;">Avec amour et lumière,<br/><strong style="color:#D4AF37;">Julia</strong> — Fondatrice SOS Shine®</p>`,
      },
      {
        delay_days: 3,
        subject: '{firstName}, avez-vous découvert votre Signature Émotionnelle ?',
        html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Bonjour {firstName},</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Cela fait quelques jours que vous nous avez rejoints. Avez-vous déjà fait le <strong style="color:#D4AF37;">Test de Signature Émotionnelle</strong> ?</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Ce test gratuit de 5 minutes révèle votre profil émotionnel unique et vous aide à comprendre vos forces profondes.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;margin-top:24px;">À bientôt,<br/><strong style="color:#D4AF37;">Julia</strong></p>`,
      },
    ],
  },
  {
    name: 'Bienvenue — Liste d\'attente',
    trigger_type: 'waitlist',
    steps: [
      {
        delay_days: 0,
        subject: '{firstName}, vous êtes sur la liste d\'attente SOS Shine® !',
        html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Merci {firstName} !</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Vous faites désormais partie de la <strong style="color:#D4AF37;">liste d'attente</strong> de SOS Shine®.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Nous vous préviendrons en priorité dès que les portes s'ouvriront. En attendant, découvrez votre Signature Émotionnelle avec notre test gratuit.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;margin-top:24px;">Avec bienveillance,<br/><strong style="color:#D4AF37;">Julia</strong></p>`,
      },
      {
        delay_days: 5,
        subject: '{firstName}, les portes de SOS Shine® s\'ouvrent bientôt...',
        html_content: `<h2 style="color:#D4AF37;font-family:Georgia,serif;font-weight:300;margin:0 0 20px;">Patience, {firstName}...</h2>
<p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Nous préparons quelque chose de <strong style="color:#D4AF37;">magnifique</strong> pour vous. Votre place est réservée.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;">En attendant, restez connecté(e) à votre lumière intérieure. Chaque jour est une opportunité de briller.</p>
<p style="color:#a1a1aa;font-size:14px;line-height:1.8;margin-top:24px;">À très bientôt,<br/><strong style="color:#D4AF37;">Julia</strong></p>`,
      },
    ],
  },
]

export async function POST() {
  try {
    const isAdmin = await verifyAdminAccess()
    if (!isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    let created = 0
    let skipped = 0

    for (const seqDef of DEFAULT_SEQUENCES) {
      // Check if a sequence with same trigger_type already exists
      const { data: existing } = await supabase
        .from('crm_sequences')
        .select('id')
        .eq('trigger_type', seqDef.trigger_type)
        .limit(1)

      if (existing && existing.length > 0) {
        skipped++
        continue
      }

      const { data: sequence, error } = await supabase
        .from('crm_sequences')
        .insert({ name: seqDef.name, trigger_type: seqDef.trigger_type, status: 'active' })
        .select()
        .single()

      if (error) {
        console.error(`Failed to create sequence ${seqDef.name}:`, error)
        continue
      }

      const stepsToInsert = seqDef.steps.map((step, i) => ({
        sequence_id: sequence.id,
        step_order: i,
        delay_days: step.delay_days,
        subject: step.subject,
        html_content: step.html_content,
      }))

      await supabase.from('crm_sequence_steps').insert(stepsToInsert)
      created++
    }

    return NextResponse.json({
      success: true,
      message: `${created} séquences créées, ${skipped} déjà existantes`,
      total: DEFAULT_SEQUENCES.length,
    })
  } catch (err) {
    console.error('Seed sequences error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
