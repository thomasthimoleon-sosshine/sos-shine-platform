import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BOT_PROFILES } from '@/lib/bots/profiles'
import { WALL_POSTS } from '@/lib/bots/messages'
import { verifyAdminSession } from '@/lib/bots/auth'

const EXTRA_WALL_POSTS: Record<string, { title: string; content: string }[]> = {
  'Cécilia': [
    { title: 'Le pouvoir de la respiration', content: 'J\'ai testé la technique de cohérence cardiaque recommandée dans le protocole et les résultats sont impressionnants. 5 minutes matin et soir suffisent pour sentir une vraie différence. Qui d\'autre pratique régulièrement ?' },
    { title: 'Un mois de transformation', content: 'Cela fait un mois que j\'ai rejoint SOS Shine et je voulais témoigner. Les protocoles sont bien structurés, la communauté est bienveillante, et je me sens soutenue à chaque étape. Merci infiniment.' },
    { title: 'Découverte du jour', content: 'J\'ai découvert dans l\'encyclopédie un article sur les schémas émotionnels liés à l\'enfance. C\'est incroyable comme certaines réactions automatiques prennent du sens quand on comprend leur origine.' },
    { title: 'Partage de gratitude', content: 'Aujourd\'hui je choisis la gratitude. Merci à Julia et à toute l\'équipe pour cette plateforme. Merci à chacun de vous qui partagez vos expériences. Ensemble, on avance. 🌸' },
    { title: 'Conseil lecture complémentaire', content: 'Pour celles et ceux qui suivent le protocole sur la confiance en soi, je recommande de compléter avec les exercices de reprogrammation. La combinaison des deux est vraiment puissante.' },
    { title: 'Mon rituel du matin', content: 'Depuis que j\'ai commencé les méditations guidées de SOS Shine chaque matin, ma journée démarre différemment. Plus de calme, plus de clarté. C\'est devenu indispensable.' },
    { title: 'Retour sur l\'événement', content: 'L\'atelier de la semaine dernière était extraordinaire. Les échanges étaient riches et authentiques. J\'ai hâte du prochain rendez-vous avec la communauté !' },
  ],
  'Loïc': [
    { title: 'Accepter ses émotions', content: 'Pendant longtemps j\'ai essayé de contrôler mes émotions. Grâce aux protocoles, j\'apprends à les accueillir. C\'est un changement de perspective qui change tout.' },
    { title: 'Le sport comme allié', content: 'J\'ai combiné les exercices de SOS Shine avec mes séances de course à pied. Le résultat est bluffant : plus de clarté mentale, moins de ruminations. La clé c\'est la régularité.' },
    { title: 'Merci la communauté', content: 'Un grand merci à tous ceux qui partagent ici. Vos témoignages me donnent du courage. Savoir qu\'on n\'est pas seul dans nos challenges, ça fait toute la différence.' },
    { title: 'Avancée personnelle', content: 'Petite victoire du jour : j\'ai réussi à identifier un schéma émotionnel qui me bloquait depuis des années. Le protocole sur la prise de conscience est remarquable.' },
    { title: 'Question à la communauté', content: 'Est-ce que quelqu\'un d\'autre a ressenti une phase de fatigue émotionnelle après avoir commencé les protocoles ? Je pense que c\'est normal mais j\'aimerais vos retours.' },
    { title: 'Le journal, mon meilleur outil', content: 'La fonctionnalité journal est devenue mon alliée quotidienne. Écrire mes pensées le soir m\'aide à prendre du recul et à mieux dormir. Essayez, vous verrez !' },
    { title: 'Progression sur 3 semaines', content: 'Trois semaines sur la plateforme et je sens déjà des changements. Plus de patience, moins de réactivité. Le chemin est long mais les progrès sont réels.' },
    { title: 'Replay à ne pas manquer', content: 'Si vous avez manqué le live de vendredi, je vous recommande vraiment le replay. Les explications sur les mécanismes émotionnels sont claires et accessibles.' },
  ],
  'Sandra': [
    { title: 'Concilier maternité et bien-être', content: 'En tant que maman, on a tendance à s\'oublier. Les protocoles de 15 minutes de SOS Shine sont parfaits pour s\'accorder un moment. Pas de culpabilité, juste du soin de soi.' },
    { title: 'Le lâcher-prise en pratique', content: 'L\'exercice de lâcher-prise de cette semaine m\'a beaucoup aidée. J\'ai réalisé que certaines choses ne dépendent pas de moi, et c\'est libérateur de l\'accepter.' },
    { title: 'Témoignage : 6 semaines après', content: 'Six semaines sur SOS Shine. Mon entourage remarque la différence. Plus de sérénité, plus de patience. Ce n\'est pas magique, c\'est du travail quotidien, mais les outils sont là.' },
    { title: 'L\'importance de la communauté', content: 'Ce qui me touche le plus sur cette plateforme, c\'est la bienveillance. Ici on ne juge pas, on soutient. C\'est rare et précieux.' },
    { title: 'Astuce bien-être', content: 'Mon astuce du jour : avant de réagir à une situation stressante, je prends 3 respirations profondes. Simple mais efficace. Merci le protocole sur la gestion du stress !' },
    { title: 'Partage d\'expérience', content: 'J\'ai utilisé les techniques de l\'encyclopédie lors d\'un conflit avec ma sœur. Pour la première fois, j\'ai pu exprimer mes sentiments calmement. Progrès immense !' },
    { title: 'Mon objectif du mois', content: 'Ce mois-ci, mon objectif est de pratiquer la méditation guidée tous les jours. J\'utilise la fonctionnalité objectifs pour suivre ma progression. Qui me rejoint dans ce défi ?' },
    { title: 'Reconnaissance', content: 'Merci à Julia, William et Thomas pour leur engagement. Créer un espace aussi sûr et bienveillant demande beaucoup de travail. Nous sommes reconnaissants.' },
  ],
  'Zoé': [
    { title: 'La signature émotionnelle : mon expérience', content: 'J\'ai fait le test de signature émotionnelle et mon résultat m\'a vraiment éclairée. Le rapport personnalisé pointe des choses que je ressentais sans pouvoir les nommer. Je recommande à 100% !' },
    { title: 'Étudier et prendre soin de soi', content: 'En période d\'examens, SOS Shine est mon refuge. Les exercices de respiration et les méditations courtes m\'aident à gérer le stress universitaire.' },
    { title: 'L\'encyclopédie, une mine d\'or', content: 'J\'ai passé des heures dans l\'encyclopédie ce week-end. Les articles sont bien documentés et accessibles. C\'est complémentaire à mes cours de psychologie.' },
    { title: 'Partage générationnel', content: 'J\'ai fait découvrir SOS Shine à ma mère. Elle a été touchée par l\'approche bienveillante. Maintenant on échange sur nos protocoles respectifs. C\'est beau !' },
    { title: 'Objectifs atteints !', content: 'J\'avais fixé 5 objectifs personnels sur la plateforme et j\'en ai déjà accompli 3 ! La fonctionnalité objectifs est super motivante pour rester engagée.' },
    { title: 'Le pouvoir du collectif', content: 'Ce que j\'aime ici, c\'est l\'énergie collective. Chaque message de soutien, chaque partage d\'expérience nous élève tous. C\'est ça la force d\'une communauté.' },
    { title: 'Coup de cœur protocole', content: 'Le protocole sur la résilience est mon coup de cœur. Les 3 étapes sont claires et progressives. J\'ai senti un vrai déclic à l\'étape 3 avec la méditation.' },
    { title: 'Bonne soirée la communauté', content: 'Juste un petit message de bonne soirée à toute la communauté. Prenez soin de vous ce soir. Vous méritez ce repos. 💛' },
  ],
  'Nicolas': [
    { title: 'Leadership et intelligence émotionnelle', content: 'En tant qu\'entrepreneur, j\'ai compris grâce à SOS Shine que le leadership commence par la connaissance de soi. Les protocoles m\'aident à être un meilleur dirigeant.' },
    { title: 'Retour sur le soin collectif', content: 'J\'étais sceptique sur les soins collectifs au départ. Après y avoir participé, je comprends l\'intérêt. L\'énergie du groupe amplifie l\'expérience individuelle.' },
    { title: 'Gestion du stress professionnel', content: 'Le protocole sur la gestion du stress m\'a donné des outils concrets pour mon quotidien d\'entrepreneur. Je les utilise avant chaque réunion importante.' },
    { title: 'Recommandation chaleureuse', content: 'J\'ai recommandé SOS Shine à mon associé. Il a commencé les protocoles la semaine dernière et me remercie déjà. C\'est gratifiant de partager cette ressource.' },
    { title: 'L\'importance des pauses', content: 'Conseil d\'entrepreneur à entrepreneur : prendre 10 minutes pour soi n\'est pas une perte de temps. C\'est un investissement. Les exercices de SOS Shine le prouvent.' },
    { title: 'Mon parcours sur la plateforme', content: 'Deux mois sur SOS Shine. Ce qui a changé : meilleure gestion de mes émotions au travail, relations plus sereines, et surtout une meilleure connaissance de moi-même.' },
    { title: 'La force de la vulnérabilité', content: 'J\'ai appris sur cette plateforme que montrer sa vulnérabilité est un acte de courage, pas de faiblesse. Cette leçon a transformé ma façon de diriger mon équipe.' },
    { title: 'Merci à tous', content: 'Un simple merci ce soir. Merci à l\'équipe fondatrice, merci à la communauté. Cet espace est unique et précieux. Continuons à avancer ensemble.' },
  ],
}

export async function POST(req: Request) {
  const isAuthed = await verifyAdminSession(req)
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const admin = createAdminClient()

    const botProfiles: { prenom: string; id: string }[] = []
    for (const bot of BOT_PROFILES) {
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .eq('email', bot.email)
        .single()
      if (profile) {
        botProfiles.push({ prenom: bot.prenom, id: profile.id })
      }
    }

    if (botProfiles.length === 0) {
      return NextResponse.json({ error: 'No bot profiles found. Run /api/bots/seed first.' }, { status: 400 })
    }

    const now = new Date()
    const endDate = new Date('2026-03-22T23:59:59+01:00')
    const totalDays = Math.ceil((endDate.getTime() - now.getTime()) / 86400000)
    const totalWeeks = Math.ceil(totalDays / 7)
    const postsPerBotPerWeek = 10

    const allPosts: {
      author_id: string
      title: string
      content: string
      post_type: 'general'
      is_published: boolean
      image_url: null
      created_at: string
    }[] = []

    for (const bot of botProfiles) {
      const basePosts = WALL_POSTS[bot.prenom] || []
      const extraPosts = EXTRA_WALL_POSTS[bot.prenom] || []
      const allBotPosts = [...basePosts, ...extraPosts]

      if (allBotPosts.length === 0) continue

      for (let week = 0; week < totalWeeks; week++) {
        for (let p = 0; p < postsPerBotPerWeek; p++) {
          const post = allBotPosts[(week * postsPerBotPerWeek + p) % allBotPosts.length]

          const dayOffset = week * 7 + Math.floor(Math.random() * 7)
          const hourOffset = 8 + Math.floor(Math.random() * 13)
          const minuteOffset = Math.floor(Math.random() * 60)

          const postDate = new Date(now)
          postDate.setDate(postDate.getDate() + dayOffset)
          postDate.setHours(hourOffset, minuteOffset, Math.floor(Math.random() * 60))

          if (postDate > endDate) continue

          allPosts.push({
            author_id: bot.id,
            title: post.title,
            content: post.content,
            post_type: 'general',
            is_published: true,
            image_url: null,
            created_at: postDate.toISOString(),
          })
        }
      }
    }

    allPosts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const batchSize = 50
    let inserted = 0
    for (let i = 0; i < allPosts.length; i += batchSize) {
      const batch = allPosts.slice(i, i + batchSize)
      const { error } = await admin.from('posts').insert(batch)
      if (error) {
        return NextResponse.json({
          error: error.message,
          inserted,
          total: allPosts.length,
        }, { status: 500 })
      }
      inserted += batch.length
    }

    const summary = botProfiles.map(b => ({
      bot: b.prenom,
      posts: allPosts.filter(p => p.author_id === b.id).length,
    }))

    return NextResponse.json({
      success: true,
      totalPosts: inserted,
      weeks: totalWeeks,
      endDate: endDate.toISOString(),
      summary,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
