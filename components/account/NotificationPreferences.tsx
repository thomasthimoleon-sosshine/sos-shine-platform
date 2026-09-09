'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ShineIcon, { type ShineIconName } from '@/components/icons/ShineIcon'
import PushNotificationButton from '@/components/PushNotificationButton'
import type { NotificationPreferences as Prefs } from '@/types/database'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  RÉGLAGE DES NOTIFICATIONS
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Deux familles — l'Encyclopédie (ce que la plateforme publie) et la
 *  Communauté (ce que les autres membres font) — plus un interrupteur général
 *  au-dessus.
 *
 *  Couper l'interrupteur général n'efface pas les réglages fins : ils restent
 *  mémorisés et grisés. Quelqu'un qui coupe tout pendant ses vacances retrouve
 *  ses choix intacts au retour.
 */

type Key = keyof Omit<Prefs, 'user_id' | 'updated_at' | 'all_enabled'>

const DEFAULTS: Omit<Prefs, 'user_id' | 'updated_at'> = {
  all_enabled: true,
  new_protocols: true,
  new_media: true,
  shines_received: true,
  messages: true,
  friend_requests: true,
  comments: true,
}

const GROUPS: {
  title: string
  hint: string
  icon: ShineIconName
  color: string
  items: { key: Key; label: string; desc: string }[]
}[] = [
  {
    title: 'Encyclopédie',
    hint: 'Ce que SOS Shine publie',
    icon: 'texte',
    color: '#C9A961',
    items: [
      { key: 'new_protocols', label: 'Nouveaux protocoles', desc: "Quand un protocole est mis en ligne dans l'encyclopédie" },
      { key: 'new_media', label: 'Nouveaux contenus', desc: 'Vidéos Shine TV, Shorts, audios et lectures' },
    ],
  },
  {
    title: 'Communauté',
    hint: 'Ce que les autres membres font',
    icon: 'parole',
    color: '#D2536A',
    items: [
      { key: 'shines_received', label: 'Shines reçus', desc: 'Quand quelqu’un donne un Shine à une de vos publications' },
      { key: 'messages', label: 'Messages', desc: 'Quand vous recevez un message privé' },
      { key: 'friend_requests', label: 'Demandes de proches', desc: 'Quand quelqu’un souhaite vous ajouter à ses proches' },
      { key: 'comments', label: 'Commentaires', desc: 'Quand quelqu’un répond à une de vos publications' },
    ],
  },
]

function Switch({ on, onChange, disabled, label }: {
  on: boolean
  onChange: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className="relative w-[46px] h-[26px] rounded-full shrink-0 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
      style={{
        background: on ? 'linear-gradient(135deg,#E3C77E,#C9A961)' : 'rgba(255,255,255,0.09)',
        border: `1px solid ${on ? 'transparent' : 'var(--border)'}`,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      <span
        className="absolute top-[2px] w-[20px] h-[20px] rounded-full transition-all duration-200"
        style={{
          left: on ? 'calc(100% - 22px)' : '2px',
          background: on ? '#0A0806' : 'var(--text-muted)',
        }}
      />
    </button>
  )
}

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Omit<Prefs, 'user_id' | 'updated_at'>>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  /** La table n'existe pas encore en base : on affiche un message honnête. */
  const [unavailable, setUnavailable] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) { setUnavailable(true); setLoading(false); return }

    if (data) {
      const { user_id: _u, updated_at: _d, ...rest } = data
      setPrefs(rest)
    } else {
      // Première visite : on crée la ligne avec tout activé.
      await supabase.from('notification_preferences').insert({ user_id: user.id, ...DEFAULTS })
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  /**
   * On bascule à l'écran tout de suite : un interrupteur qui attend le réseau
   * donne l'impression de n'avoir pas été touché, et l'utilisateur reclique.
   */
  async function toggle(key: Key | 'all_enabled') {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })

    if (error) {
      setPrefs(prefs) // retour en arrière
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1600)
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="h-4 w-40 rounded bg-white/[0.06] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>

      {/* ── Interrupteur général ── */}
      <div className="flex items-start justify-between gap-6 mb-1">
        <div>
          <h3 className="font-semibold text-base text-[var(--text-primary)]">Notifications</h3>
          <p className="text-xs mt-1 text-[var(--text-muted)]">
            Choisissez ce dont vous voulez être prévenu. Rien n&apos;est perdu si vous coupez tout :
            vos réglages restent en mémoire.
          </p>
        </div>
        {saved && <span className="text-xs shrink-0 mt-1" style={{ color: 'var(--success)' }}>Enregistré</span>}
      </div>

      {/* ── Autorisation de l'appareil ──
          Sans elle, aucune alerte ne peut arriver quand l'application est fermée,
          quels que soient les réglages ci-dessous. D'où sa place, en tête. */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-5 p-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">Sur cet appareil</p>
          <p className="text-xs mt-0.5 text-[var(--text-muted)]">
            À autoriser pour être prévenu même quand SOS Shine est fermé.
          </p>
        </div>
        <PushNotificationButton />
      </div>

      {unavailable ? (
        <p className="mt-5 text-sm text-[var(--text-muted)]">
          Le réglage des notifications n&apos;est pas encore actif : la table
          <code className="mx-1 text-[var(--brand)]">notification_preferences</code>
          doit être créée en base (migration <code className="text-[var(--brand)]">20260822_notification_preferences.sql</code>).
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-6 mt-5 pb-5 border-b border-[var(--border)]">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Toutes les notifications</p>
              <p className="text-xs mt-0.5 text-[var(--text-muted)]">
                {prefs.all_enabled ? 'Activées' : 'Coupées, vous ne recevrez plus rien'}
              </p>
            </div>
            <Switch on={prefs.all_enabled} onChange={() => toggle('all_enabled')} label="Toutes les notifications" />
          </div>

          {/* ── Réglages par famille ── */}
          <div className="mt-6 space-y-7">
            {GROUPS.map(group => (
              <div key={group.title}>
                <div className="flex items-center gap-2.5 mb-3.5">
                  <ShineIcon name={group.icon} className="w-4 h-4" color={group.color} />
                  <h4 className="text-[13px] font-semibold" style={{ color: group.color }}>{group.title}</h4>
                  <span className="text-[11px] text-[var(--text-muted)]">· {group.hint}</span>
                </div>

                <div className="space-y-1">
                  {group.items.map(item => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-6 py-2.5 px-3 rounded-xl transition-colors"
                      style={{ background: 'rgba(255,255,255,0.015)' }}
                    >
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-medium text-[var(--text-primary)]">{item.label}</p>
                        <p className="text-[11.5px] mt-0.5 text-[var(--text-muted)]">{item.desc}</p>
                      </div>
                      <Switch
                        on={prefs.all_enabled && prefs[item.key]}
                        disabled={!prefs.all_enabled}
                        onChange={() => toggle(item.key)}
                        label={item.label}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
