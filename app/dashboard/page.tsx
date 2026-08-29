'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { greetingsData, GREETINGS_PER_SLOT, type TimeSlot } from '@/data/greetingsData'
import NpsWidget from '@/components/NpsWidget'
import CarteProgression from '@/components/progression/CarteProgression'
import ShineIcon from '@/components/icons/ShineIcon'
import type { UserXP } from '@/types/database'
import { resoudreProtocoleActif, CHEMIN_SIGNATURE } from '@/lib/protocole-actif'

const ease = [0.25, 0.46, 0.45, 0.94] as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: ease as unknown as [number, number, number, number] },
  }),
}

/* ─────────────────────────────────────────────
   Section: Niveau & XP (migrated from Profile)
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   Section: Mes contributions
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   Section: Badges (carrousel)
   ───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   Section: Actu - Shine (5 pillars)
   ───────────────────────────────────────────── */
function ActuShineSection() {
  const [latestContent, setLatestContent] = useState<{
    encyclopedia: { id: string; title: string; image_url: string | null } | null
    shineTV: { id: string; title: string; thumbnail_url: string | null } | null
    audible: { id: string; title: string; cover_url: string | null } | null
    shorts: { id: string; title: string; thumbnail_url: string | null } | null
    library: { id: string; title: string; cover_url: string | null } | null
  }>({
    encyclopedia: null, shineTV: null, audible: null, shorts: null, library: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const [encyclopediaRes, tvRes, audibleRes, shortsRes, libraryRes] = await Promise.all([
        supabase.from('douleurs').select('id, title, image_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('shine_tv_videos').select('id, title, thumbnail_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('shine_audible_tracks').select('id, title, cover_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('shine_shorts').select('id, title, thumbnail_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
        supabase.from('shine_library_books').select('id, title, cover_url').eq('is_published', true).order('created_at', { ascending: false }).limit(1),
      ])

      setLatestContent({
        encyclopedia: encyclopediaRes.data?.[0] || null,
        shineTV: tvRes.data?.[0] || null,
        audible: audibleRes.data?.[0] || null,
        shorts: shortsRes.data?.[0] || null,
        library: libraryRes.data?.[0] || null,
      })
      setLoading(false)
    }
    load()
  }, [])

  const pillars = [
    {
      key: 'encyclopedia',
      title: 'Encyclopédie',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      href: '/dashboard/encyclopedie',
      data: latestContent.encyclopedia,
      image: latestContent.encyclopedia?.image_url,
      gradient: 'linear-gradient(135deg, rgba(201,169,97,0.15), rgba(180,130,20,0.05))',
      accentColor: '#C9A961',
    },
    {
      key: 'shineTV',
      title: 'Shine TV',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      href: '/dashboard/shine-tv',
      data: latestContent.shineTV,
      image: latestContent.shineTV?.thumbnail_url,
      gradient: 'linear-gradient(135deg, rgba(116,192,252,0.15), rgba(70,130,200,0.05))',
      accentColor: '#74C0FC',
    },
    {
      key: 'audible',
      title: 'Audible',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ),
      href: '/dashboard/shine-audible',
      data: latestContent.audible,
      image: latestContent.audible?.cover_url,
      gradient: 'linear-gradient(135deg, rgba(201,169,97,0.15), rgba(120,100,220,0.05))',
      accentColor: '#C9A961',
    },
    {
      key: 'shorts',
      title: 'Shorts',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      ),
      href: '/dashboard/shine-shorts',
      data: latestContent.shorts,
      image: latestContent.shorts?.thumbnail_url,
      gradient: 'linear-gradient(135deg, rgba(85,239,196,0.15), rgba(50,180,140,0.05))',
      accentColor: '#55EFC4',
    },
    {
      key: 'library',
      title: 'Librairie',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      href: '/dashboard/shine-librairie',
      data: latestContent.library,
      image: latestContent.library?.cover_url,
      gradient: 'linear-gradient(135deg, rgba(253,203,110,0.15), rgba(220,160,60,0.05))',
      accentColor: '#FDCB6E',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-widest flex items-center gap-2 mb-4 text-[var(--text-muted)]">
        <svg className="w-4 h-4 text-[var(--brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        NOUVEAUTÉS À DÉCOUVRIR
      </h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-visible snap-x snap-mandatory scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
          {pillars.map((pillar) => (
            <Link
              key={pillar.key}
              href={pillar.href}
              className="group block overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-lg min-w-[130px] max-w-[160px] snap-start flex-shrink-0 sm:min-w-0 sm:max-w-none sm:flex-shrink"
              style={{
                background: pillar.image ? 'var(--surface-card)' : pillar.gradient,
                border: `1px solid rgba(${pillar.accentColor === '#C9A961' ? '201,169,97' : pillar.accentColor === '#74C0FC' ? '116,192,252' : pillar.accentColor === '#C9A961' ? '201,169,97' : pillar.accentColor === '#55EFC4' ? '85,239,196' : '253,203,110'},0.15)`,
              }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden" style={{ background: pillar.image ? 'rgba(0,0,0,0.3)' : undefined }}>
                {pillar.image ? (
                  <>
                    <img
                      src={pillar.image}
                      alt={pillar.data?.title || pillar.title}
                      className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 relative">
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage: `radial-gradient(circle at 30% 40%, ${pillar.accentColor}, transparent 60%), radial-gradient(circle at 70% 60%, ${pillar.accentColor}, transparent 60%)`,
                      }}
                    />
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${pillar.accentColor}22, ${pillar.accentColor}08)`,
                        border: `1px solid ${pillar.accentColor}30`,
                      }}
                    >
                      <span style={{ color: pillar.accentColor }}>{pillar.icon}</span>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: `${pillar.accentColor}99` }}>
                      Nouveau
                    </span>
                  </div>
                )}
              </div>
              {/* Title */}
              <div className="p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <span style={{ color: pillar.accentColor, opacity: 0.8 }} className="w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
                    {pillar.icon}
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: pillar.accentColor }}>
                    {pillar.title}
                  </h3>
                </div>
                {pillar.data && (
                  <p className="text-[10px] mt-1 truncate leading-snug text-[var(--text-muted)]">
                    {pillar.data.title}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ─────────────────────────────────────────────
   Carte rapide (présentational, simple lien)
   Ajout léger pour la grille simplifiée. Aucune logique métier.
   ───────────────────────────────────────────── */
function QuickCard({ href, title, subtitle, accent, icon }: {
  href: string
  title: string
  subtitle: string
  accent: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="glass glass-hover p-5 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.01]"
    >
      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18`, color: accent }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-[15px] text-[var(--text-primary)]">{title}</span>
        <span className="block text-[12px] text-[var(--text-muted)] truncate">{subtitle}</span>
      </span>
    </Link>
  )
}

/* ─────────────────────────────────────────────
   Main Dashboard Page: Ma Légende
   ───────────────────────────────────────────── */
function getTimeSlot(): TimeSlot {
  const hour = new Date().getHours()
  if (hour < 5) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export default function DashboardHome() {
  const { t } = useTranslation()
  const router = useRouter()
  // État purement visuel : replie les widgets secondaires (rien n'est supprimé).
  const [showMore, setShowMore] = useState(false)
  // Terme de recherche encyclopédie (simple navigation, aucune logique métier).
  const [search, setSearch] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [greeting, setGreeting] = useState('')
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({})
  const [xpData, setXpData] = useState<UserXP | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  // Le protocole actif, résolu comme partout ailleurs (lib/protocole-actif).
  const [protocole, setProtocole] = useState<{ slug: string; titre: string; douleur: { title: string; subtitle: string | null; image_url: string | null } } | null>(null)
  const [hasStartedAny, setHasStartedAny] = useState(false)
  const [affiliateStatus, setAffiliateStatus] = useState<{ exists: boolean; approved: boolean; referral_code: string | null; total_referrals: number; pending_earnings: number }>({ exists: false, approved: false, referral_code: null, total_referrals: 0, pending_earnings: 0 })
  const [streak, setStreak] = useState<{ current: number; longest: number }>({ current: 0, longest: 0 })

  useEffect(() => {
    const supabase = createClient()
    const currentSlot = getTimeSlot()

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)

      // Load custom encouragement messages from DB (fallback to hardcoded)
      let slotMessages: string[] = []
      try {
        const { data: dbMessages } = await supabase
          .from('encouragement_messages')
          .select('message')
          .eq('time_slot', currentSlot)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (dbMessages && dbMessages.length > 0) {
          slotMessages = dbMessages.map((m: { message: string }) => m.message)
        }
      } catch { /* table may not exist yet */ }
      // Fallback to hardcoded messages
      if (slotMessages.length === 0) {
        slotMessages = greetingsData[currentSlot]
      }
      const totalMessages = slotMessages.length

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)

        const progress = (data as Profile).greetings_progress || { night: 0, morning: 0, afternoon: 0, evening: 0 }
        const currentIndex = progress[currentSlot] ?? 0
        const message = slotMessages[currentIndex % totalMessages]
        setGreeting(message)

        const nextIndex = (currentIndex + 1) % totalMessages
        const updatedProgress = { ...progress, [currentSlot]: nextIndex }
        supabase.from('profiles').update({ greetings_progress: updatedProgress }).eq('id', user.id).then()
      } else {
        setProfile({
          id: user.id, prenom: user.user_metadata?.prenom || 'Membre',
          email: user.email || '', role: 'member', avatar_url: null, plan: null, created_at: user.created_at,
          pseudo: null, bio: null, video_url: null, is_bot: false,
        })
        setGreeting(slotMessages[0])
      }

      // Load XP
      const { data: xp } = await supabase.from('user_xp').select('*').eq('user_id', user.id).maybeSingle()
      if (xp) setXpData(xp as UserXP)

      // Check if user has started any protocol (has user_progress entry)
      const { count: progressCount } = await supabase
        .from('user_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setHasStartedAny((progressCount || 0) > 0)

      // Le protocole actif — même résolution que « Mon parcours guidé ».
      const actif = await resoudreProtocoleActif(supabase)
      if (actif.slug) {
        const { data: douleur } = await supabase
          .from('douleurs')
          .select('title, subtitle, image_url')
          .eq('slug', actif.slug)
          .eq('is_published', true)
          .maybeSingle()
        if (douleur) {
          const d = douleur as { title: string; subtitle: string | null; image_url: string | null }
          setProtocole({
            slug: actif.slug,
            // L'intitulé de l'objectif quand c'est lui qui a désigné le
            // protocole ; sinon le nom du protocole lui-même.
            titre: actif.titreObjectif || d.title,
            douleur: d,
          })
        }
      }

      // Log today's visit (for streak tracking) + get streak
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.rpc as any)('log_user_visit', { p_user_id: user.id }).catch(() => {})
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: streakData } = await (supabase.rpc as any)('get_user_streak', { p_user_id: user.id })
      if (streakData && Array.isArray(streakData) && streakData.length > 0) {
        const s = streakData[0] as { current_streak: number; longest_streak: number }
        setStreak({ current: s.current_streak || 0, longest: s.longest_streak || 0 })
      }

      // Affiliate status
      const { data: aff } = await supabase
        .from('affiliates')
        .select('status, referral_code, total_referrals, pending_earnings')
        .eq('user_id', user.id)
        .maybeSingle()
      if (aff) {
        const a = aff as { status: string; referral_code: string; total_referrals: number; pending_earnings: number }
        setAffiliateStatus({
          exists: true,
          approved: a.status === 'approved',
          referral_code: a.referral_code,
          total_referrals: a.total_referrals || 0,
          pending_earnings: Number(a.pending_earnings) || 0,
        })
      }
    }

    async function loadSettings() {
      try {
        const { data } = await supabase.from('site_settings').select('key, value')
        if (data) {
          const map: Record<string, string> = {}
          data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
          setSiteSettings(map)
        }
      } catch {}
    }

    loadProfile()
    loadSettings()
  }, [])

  // Recherche encyclopédie : simple navigation (aucune logique métier ajoutée).
  function handleSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const q = search.trim()
    router.push(q ? `/dashboard/encyclopedie?q=${encodeURIComponent(q)}` : '/dashboard/encyclopedie')
  }


  return (
    <div className="shine-home max-w-3xl mx-auto space-y-6">

      {/* ══════════ 1. HERO PERSO — message court + un seul gros CTA ══════════ */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
        className="text-center pt-2"
      >
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          {siteSettings.dash_welcome || t('dashboard.welcome')} <span className="text-[var(--brand)]">{profile?.prenom || 'Membre'}</span>
        </h1>
        {/* Phrase personnalisée courte (message existant déjà chargé) */}
        {greeting && (
          <p className="mt-3 text-[16px] sm:text-[18px] font-medium leading-relaxed text-[var(--brand)] max-w-xl mx-auto">
            {greeting}
          </p>
        )}
        {/* CTA principal unique, très visible. Sans protocole à reprendre, il
            disparaît : il promettait « continuer » et menait au questionnaire,
            et doublait le bouton de la carte « Par où commencer ? » juste en
            dessous, qui dit la même chose au bon moment. */}
        {protocole && (
          <Link
            href={`/dashboard/encyclopedie/${protocole.slug}`}
            className="mt-6 inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-semibold transition-all hover:scale-[1.03]"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}
          >
            Continuer mon protocole du jour →
          </Link>
        )}
        {/* Série en cours. L'activation des notifications a rejoint Mon compte,
            à côté du réglage de ce qu'on souhaite recevoir. */}
        {streak.current > 0 && (
          <div className="mt-4 flex items-center justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.3)', color: '#FF6B35' }}
              title={`Plus longue série : ${streak.longest} jours`}>
              <ShineIcon name="resilience" className="w-3.5 h-3.5 inline-block align-[-2px] mr-1" /> {streak.current} {streak.current > 1 ? 'jours' : 'jour'}
            </span>
          </div>
        )}
      </motion.section>

      {/* ══════════ 2. CARTE PRINCIPALE — Protocole du jour (mise en avant forte) ══════════ */}
      {protocole ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
          className="glass glass-hover relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(85,239,196,0.08), rgba(201,169,97,0.04))',
            border: '1px solid rgba(85,239,196,0.25)',
          }}
        >
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(85,239,196,0.15), transparent 70%)' }} />
          <div className="relative p-6 sm:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-[var(--success)]">
              {hasStartedAny ? 'Votre protocole' : 'Votre premier pas'}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-[var(--text-primary)] mb-4">
              {protocole.titre}
            </h2>
            <Link href={`/dashboard/encyclopedie/${protocole.slug}`}
              className="block rounded-xl p-4 transition-all hover:scale-[1.005]"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-4">
                {protocole.douleur.image_url && (
                  <img src={protocole.douleur.image_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[var(--brand)]">{protocole.douleur.title}</p>
                  {protocole.douleur.subtitle && (
                    <p className="text-xs mt-0.5 truncate text-[var(--text-muted)]">{protocole.douleur.subtitle}</p>
                  )}
                </div>
                <div className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
                  style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                  Commencer →
                </div>
              </div>
            </Link>
            <p className="text-[11px] mt-3 text-center text-[var(--text-muted)]">
              3 étapes. Vidéo, audio, exercice. ~25 minutes.
            </p>
          </div>
        </motion.div>
      ) : (
        /* Rien d'exprimé encore : on propose la signature émotionnelle plutôt
           qu'un protocole choisi au hasard. */
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
          className="glass relative overflow-hidden p-6 sm:p-8 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(201,169,97,0.06), var(--surface-card))', borderColor: 'rgba(201,169,97,0.15)' }}
        >
          <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] mb-2">Par où commencer ?</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-5 max-w-md mx-auto">
            Quelques questions, et nous saurons quel protocole vous correspond.
          </p>
          <Link href={CHEMIN_SIGNATURE}
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
            Découvrir ma signature émotionnelle →
          </Link>
          <Link href="/dashboard/encyclopedie"
            className="block mt-4 text-xs underline text-[var(--text-muted)]">
            ou parcourir l&apos;encyclopédie
          </Link>
        </motion.div>
      )}

      {/* ══════════ 3. GRILLE DE CARTES RAPIDES ══════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
        className="grid sm:grid-cols-2 gap-4"
      >
        {/* Encyclopédie + barre de recherche */}
        <form onSubmit={handleSearch}
          className="glass p-5 rounded-2xl flex flex-col gap-3 sm:col-span-2">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-[var(--text-primary)]">Encyclopédie</span>
            <span className="text-[12px] text-[var(--text-muted)]">· encyclopédie complète</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une émotion, une situation…"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <button type="submit"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0"
              style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)' }}>
              Chercher
            </button>
          </div>
        </form>

        {/* La Médiathèque, où l'on choisit : vidéos, shorts, audios, lectures, articles */}
        <QuickCard
          href="/dashboard/mediatheque"
          title="Médiathèque"
          subtitle="Vidéos, audios & lectures"
          accent="#74C0FC"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" /></svg>}
        />

        {/* Communauté */}
        <QuickCard
          href="/dashboard/communaute"
          title="Communauté"
          subtitle="Le fil et les discussions"
          accent="#55EFC4"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />

        {/* Le Feu de Camp — le salon du protocole en cours. Il n'était accessible
            que depuis le bas de la page du protocole : personne ne le trouvait
            depuis l'accueil, alors que la carte voisine portait son nom. */}
        <QuickCard
          href={protocole ? `/dashboard/chat/${protocole.slug}` : '/dashboard/chat'}
          title="Feu de Camp"
          subtitle={protocole ? protocole.douleur.title : 'Échanger avec la communauté'}
          accent="#FF6B35"
          icon={<ShineIcon name="resilience" className="w-5 h-5" />}
        />

        {/* Événements */}
        <QuickCard
          href="/dashboard/evenements"
          title="Événements"
          subtitle="Rencontres & ateliers"
          accent="#FDCB6E"
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>}
        />
      </motion.div>

      {/* ══════════ 4. MA PROGRESSION ══════════ */}
      {/* La bande ne disait que le nom du niveau. La place gagnée plus haut
          permet d'afficher la carte entière : niveau, points, et ce qu'il reste
          à parcourir avant le palier suivant. */}
      {xpData && (
        <CarteProgression
          totalXp={xpData.total_xp}
          pied={
            <>
              {streak.current > 0 ? (
                <span className="text-[12.5px] text-[var(--text-muted)] inline-flex items-center gap-1.5">
                  <ShineIcon name="resilience" className="w-3.5 h-3.5" />
                  Série de {streak.current} {streak.current > 1 ? 'jours' : 'jour'}
                </span>
              ) : <span />}
              <Link href="/dashboard/badges" className="text-[12.5px] font-medium text-[var(--brand)] gold-underline">
                Mes badges →
              </Link>
            </>
          }
        />
      )}

      {/* ══════════ 5. AFFICHER PLUS — widgets détaillés CONSERVÉS, masqués par défaut ══════════ */}
      {/* Rien n'est supprimé : Météo, Citation, XP détaillé, Contributions, Badges, Actu-Shine
          et Affiliation restent disponibles ici pour ne pas surcharger l'accueil. */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors cursor-pointer"
        >
          {showMore ? 'Afficher moins ▲' : 'Afficher plus ▼'}
        </button>
      </div>

      {showMore && (
        <div className="space-y-6">
          {/*
            Progression, contributions et badges ont été déplacés dans le
            profil (Communauté → Moi). Ils occupaient ici trois blocs empilés
            d'environ 700 px pour dire un niveau, quatre nombres et quelques
            badges ; ils y tiennent maintenant en trois lignes, à l'endroit
            où l'on va justement regarder qui l'on est.
            Voir components/community/ProfileHeader.tsx.
          */}

          {/* ── Actu - Shine ── */}
          <ActuShineSection />

          {/* ── Affiliation ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: ease as unknown as [number, number, number, number] }}
            className="glass glass-hover relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(201,169,97,0.08), rgba(116,192,252,0.04))', border: '1px solid rgba(201,169,97,0.2)' }}
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(201,169,97,0.15), transparent 70%)' }} />
            <div className="relative p-6 sm:p-8">
              {affiliateStatus.approved && affiliateStatus.referral_code ? (
                <>
                  <div className="flex items-start gap-3 mb-4">
                    <span className="shrink-0" style={{ color: 'var(--brand)' }}><ShineIcon name="relationships" className="w-6 h-6" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-[var(--brand)]">
                        Votre lien d&apos;affiliation
                      </p>
                      <h2 className="font-display text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
                        Partagez et gagnez 30%
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <p className="text-xs text-[var(--text-muted)]">Inscrits</p>
                      <p className="font-display text-2xl font-semibold text-[var(--brand)]">
                        {affiliateStatus.total_referrals}
                      </p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <p className="text-xs text-[var(--text-muted)]">Gains en attente</p>
                      <p className="font-display text-2xl font-semibold text-[var(--success)]">
                        {affiliateStatus.pending_earnings.toFixed(2)}€
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl p-3 mb-4 flex items-center gap-2"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)' }}>
                    <code className="flex-1 text-xs truncate text-[var(--text-secondary)]">
                      sosshine.com/signup?ref={affiliateStatus.referral_code}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://sosshine.com/signup?ref=${affiliateStatus.referral_code}`)
                      }}
                      className="text-[11px] px-3 py-1.5 rounded-lg cursor-pointer flex-shrink-0"
                      style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--brand)' }}
                    >
                      Copier
                    </button>
                  </div>

                  <Link href="/dashboard/affiliation"
                    className="block text-center py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.005]"
                    style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                    Voir mon tableau de bord →
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="shrink-0" style={{ color: 'var(--brand)' }}><ShineIcon name="relationships" className="w-6 h-6" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-[var(--brand)]">
                        Programme d&apos;affiliation
                      </p>
                      <h2 className="font-display text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
                        Recommandez, gagnez 30% à vie
                      </h2>
                    </div>
                  </div>
                  <p className="text-sm mb-5 leading-relaxed text-[var(--text-secondary)]">
                    Aidez vos proches à comprendre leurs schémas émotionnels. Pour chaque ami qui s&apos;abonne grâce à vous, vous touchez <strong className="text-[var(--brand)]">30% de commission à vie</strong>.
                  </p>

                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <p className="font-display text-lg font-semibold text-[var(--brand)]">30%</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Commission</p>
                    </div>
                    <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <p className="font-display text-lg font-semibold text-[var(--brand)]">À vie</p>
                      <p className="text-[10px] text-[var(--text-muted)]">Durée</p>
                    </div>
                    <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <p className="font-display text-lg font-semibold text-[var(--brand)]">0€</p>
                      <p className="text-[10px] text-[var(--text-muted)]">À débourser</p>
                    </div>
                  </div>

                  <Link href="/dashboard/affiliation"
                    className="block text-center py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.005]"
                    style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#000000' }}>
                    {affiliateStatus.exists ? 'Voir mon espace affilié →' : 'Devenir affilié →'}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── NPS feedback (s'auto-affiche après 7 jours) ── */}
      <NpsWidget userId={currentUserId} createdAt={profile?.created_at || null} />

      {/* ── Aide (footer léger) ── */}
      <div className="glass p-5 text-center">
        <p className="text-[13px] text-[var(--text-muted)]">
          {siteSettings.dash_help_text || t('dashboard.help')}{' '}
          <a href={`mailto:${siteSettings.dash_help_email || 'julialaureau@sosshine.com'}`} className="gold-underline font-medium text-[var(--brand)]">
            {siteSettings.dash_help_email || 'julialaureau@sosshine.com'}
          </a>
        </p>
      </div>
    </div>
  )
}
