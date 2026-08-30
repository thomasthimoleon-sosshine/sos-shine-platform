'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ShineIcon, { type ShineIconName } from '@/components/icons/ShineIcon'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  ENVOYER UNE NOTIFICATION
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  La route d'envoi existait depuis toujours, mais aucun écran ne l'appelait :
 *  il n'y avait aucun moyen d'envoyer une notification depuis le back-office,
 *  ni de savoir pourquoi rien n'arrivait.
 *
 *  D'où l'état affiché en haut. Trois causes se ressemblent de l'extérieur —
 *  clés absentes, aucun abonné, table injoignable — et sans ce panneau on ne
 *  peut pas les distinguer.
 */

type Etat = { vapid: boolean; abonnes: number; notifications: number }
type Resultat = {
  sent?: number; failed?: number; expired?: number
  enregistree?: boolean; vapid?: boolean; message?: string; error?: string
}

const TYPES: { id: string; label: string; icone: ShineIconName }[] = [
  { id: 'new_post', label: 'Annonce', icone: 'parole' },
  { id: 'new_protocol', label: 'Nouveau protocole', icone: 'protocole' },
  { id: 'new_event', label: 'Événement', icone: 'calendrier' },
  { id: 'new_video', label: 'Vidéo', icone: 'video' },
  { id: 'new_audio', label: 'Audio', icone: 'audio' },
  { id: 'new_book', label: 'Lecture', icone: 'livre' },
  { id: 'new_soin', label: 'Soin collectif', icone: 'eclat' },
  { id: 'warning', label: 'Avertissement', icone: 'alerte' },
]

const DESTINATIONS = [
  { valeur: '', label: 'Aucune — le message se dépliera sur place' },
  { valeur: '/dashboard/encyclopedie', label: 'Encyclopédie' },
  { valeur: '/dashboard/mediatheque', label: 'Médiathèque' },
  { valeur: '/dashboard/communaute', label: 'Communauté' },
  { valeur: '/dashboard/evenements', label: 'Événements' },
  { valeur: '/dashboard/shine-tv', label: 'Shine TV' },
  { valeur: '/dashboard/shine-audible', label: 'Shine Audible' },
  { valeur: '/dashboard/shine-librairie', label: 'Shine Librairie' },
]

const champ = {
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

export default function AdminNotifications() {
  const [etat, setEtat] = useState<Etat | null>(null)
  const [titre, setTitre] = useState('')
  const [message, setMessage] = useState('')
  const [lien, setLien] = useState('')
  const [type, setType] = useState('new_post')
  const [moiSeul, setMoiSeul] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [resultat, setResultat] = useState<Resultat | null>(null)
  const [cles, setCles] = useState<{ publicKey: string; privateKey: string } | null>(null)
  const [fabrique, setFabrique] = useState(false)
  const [copie, setCopie] = useState<string | null>(null)

  const jeton = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }, [])

  const lireEtat = useCallback(async () => {
    const t = await jeton()
    if (!t) return
    try {
      const r = await fetch('/api/push/send', { headers: { 'x-user-token': t } })
      if (r.ok) setEtat(await r.json())
    } catch { /* l'état n'est qu'indicatif */ }
  }, [jeton])

  useEffect(() => { lireEtat() }, [lireEtat])

  async function fabriquerCles() {
    if (fabrique) return
    setFabrique(true)
    try {
      const t = await jeton()
      const r = await fetch('/api/push/vapid', { method: 'POST', headers: { 'x-user-token': t || '' } })
      if (r.ok) setCles(await r.json())
    } catch { /* silencieux : le bouton reste disponible */ }
    setFabrique(false)
  }

  async function copier(valeur: string, nom: string) {
    try {
      await navigator.clipboard.writeText(valeur)
      setCopie(nom)
      setTimeout(() => setCopie(null), 1800)
    } catch { /* certains navigateurs refusent le presse-papiers */ }
  }

  async function envoyer() {
    if (!titre.trim() || !message.trim() || envoi) return
    setEnvoi(true)
    setResultat(null)
    try {
      const t = await jeton()
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const r = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-token': t || '' },
        body: JSON.stringify({
          title: titre.trim(),
          body: message.trim(),
          url: lien || undefined,
          type,
          // L'essai ne s'adresse qu'à soi : on ne teste pas sur les membres.
          user_ids: moiSeul && user ? [user.id] : undefined,
        }),
      })
      setResultat(await r.json())
      lireEtat()
    } catch {
      setResultat({ error: "L'envoi n'a pas abouti. Réessayez dans un instant." })
    }
    setEnvoi(false)
  }

  const pret = titre.trim().length > 0 && message.trim().length > 0

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Notifications
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Envoyez une annonce aux membres, ou faites un essai sur vous seul.
        </p>
      </div>

      {/* ── L'état de la chaîne ── */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>État</h2>
        {!etat ? (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Lecture…</p>
        ) : (
          <div className="space-y-3 text-[13px]">
            <Ligne
              ok={etat.vapid}
              titre="Envoi push (téléphone, hors application)"
              oui="Configuré"
              non="Clés VAPID absentes — à renseigner dans les variables d'environnement"
            />
            <Ligne
              ok={etat.abonnes > 0}
              titre="Membres ayant activé les notifications push"
              oui={`${etat.abonnes} abonné${etat.abonnes > 1 ? 's' : ''}`}
              non="Aucun — chacun les active depuis Mon compte"
            />
            <Ligne
              ok
              titre="Notifications dans l'application (la cloche)"
              oui={`Opérationnel · ${etat.notifications} enregistrée${etat.notifications > 1 ? 's' : ''}`}
              non=""
            />
            {!etat.vapid && (
              <div className="pt-3 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Sans les clés VAPID, la cloche fonctionne quand même : la notification s&apos;enregistre
                  et la pastille rouge apparaît. Seul l&apos;envoi vers le téléphone, application fermée,
                  est impossible.
                </p>
                <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Ces clés ne se récupèrent nulle part : ce sont deux nombres tirés au hasard qui
                  prouvent aux serveurs d&apos;Apple et de Google que les notifications viennent bien
                  de SOS Shine. On les fabrique une fois, et on n&apos;y revient plus.
                </p>

                {!cles ? (
                  <button onClick={fabriquerCles} disabled={fabrique}
                    className="px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #74C0FC, #4DA3E8)',
                      color: '#0a0a0a',
                      cursor: fabrique ? 'wait' : 'pointer',
                    }}>
                    {fabrique ? 'Fabrication…' : 'Fabriquer mes clés'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[12.5px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      Copiez ces deux valeurs dans Vercel → Settings → Environment Variables,
                      puis redéployez.
                    </p>
                    <Cle nom="NEXT_PUBLIC_VAPID_PUBLIC_KEY" valeur={cles.publicKey}
                      copie={copie === 'pub'} onCopier={() => copier(cles.publicKey, 'pub')} />
                    <Cle nom="VAPID_PRIVATE_KEY" valeur={cles.privateKey} secrete
                      copie={copie === 'priv'} onCopier={() => copier(cles.privateKey, 'priv')} />
                    <Cle nom="VAPID_EMAIL" valeur="mailto:contact@sosshine.com"
                      copie={copie === 'mail'} onCopier={() => copier('mailto:contact@sosshine.com', 'mail')} />
                    <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      Elles ne sont enregistrées nulle part : si vous quittez cette page sans les
                      copier, il faudra en fabriquer d&apos;autres. La clé privée ne se partage avec
                      personne — ni par message, ni par e-mail.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Le message ── */}
      <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div>
          <label className="block text-[12px] mb-1.5" style={{ color: 'var(--text-muted)' }}>Titre</label>
          <input value={titre} onChange={e => setTitre(e.target.value)} maxLength={80}
            placeholder="Nouveau protocole disponible"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none" style={champ} />
        </div>

        <div>
          <label className="block text-[12px] mb-1.5" style={{ color: 'var(--text-muted)' }}>Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} maxLength={280}
            placeholder="Après le deuil — le cahier de travail est en ligne."
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none" style={champ} />
          <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>{message.length} / 280</p>
        </div>

        <div>
          <label className="block text-[12px] mb-1.5" style={{ color: 'var(--text-muted)' }}>Type</label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(t => {
              const actif = type === t.id
              return (
                <button key={t.id} type="button" onClick={() => setType(t.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] cursor-pointer transition-all"
                  style={{
                    background: actif ? 'rgba(116,192,252,0.12)' : 'rgba(255,255,255,0.03)',
                    color: actif ? '#74C0FC' : 'var(--text-muted)',
                    border: `1px solid ${actif ? 'rgba(116,192,252,0.3)' : 'var(--border)'}`,
                  }}>
                  <ShineIcon name={t.icone} className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-[12px] mb-1.5" style={{ color: 'var(--text-muted)' }}>
            Où mène le clic
          </label>
          <select value={lien} onChange={e => setLien(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none cursor-pointer" style={champ}>
            {DESTINATIONS.map(d => (
              <option key={d.valeur} value={d.valeur} style={{ background: '#0a0a0a' }}>{d.label}</option>
            ))}
          </select>
          <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Sans destination, la notification n&apos;emmène nulle part : le membre la déplie sur place
            pour lire le message en entier.
          </p>
        </div>

        <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
          <input type="checkbox" checked={moiSeul} onChange={e => setMoiSeul(e.target.checked)}
            className="mt-0.5 cursor-pointer" />
          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Essai sur moi seul
            <span className="block text-[11.5px]" style={{ color: 'var(--text-muted)' }}>
              Décochez pour envoyer à tous les membres. À faire seulement une fois l&apos;essai concluant.
            </span>
          </span>
        </label>

        <button onClick={envoyer} disabled={!pret || envoi}
          className="w-full py-3 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: pret && !envoi ? 'linear-gradient(135deg, #74C0FC, #4DA3E8)' : 'rgba(255,255,255,0.05)',
            color: pret && !envoi ? '#0a0a0a' : 'var(--text-muted)',
            cursor: pret && !envoi ? 'pointer' : 'not-allowed',
          }}>
          {envoi ? 'Envoi…' : moiSeul ? 'Envoyer l’essai' : 'Envoyer à tous les membres'}
        </button>
      </div>

      {resultat && (
        <div className="rounded-xl p-5 text-[13px] leading-relaxed"
          style={{
            background: resultat.error ? 'rgba(212,106,106,0.08)' : 'rgba(201,169,97,0.06)',
            border: `1px solid ${resultat.error ? 'rgba(212,106,106,0.25)' : 'rgba(201,169,97,0.2)'}`,
            color: 'var(--text-secondary)',
          }}>
          {resultat.error ? (
            <p style={{ color: 'var(--danger)' }}>{resultat.error}</p>
          ) : (
            <>
              <p style={{ color: 'var(--text-primary)' }}>
                {resultat.enregistree
                  ? 'Notification enregistrée : elle apparaît dans la cloche.'
                  : "La notification n'a pas pu être enregistrée en base."}
              </p>
              {resultat.message && <p className="mt-1.5">{resultat.message}</p>}
              {(resultat.sent ?? 0) + (resultat.failed ?? 0) > 0 && (
                <p className="mt-1.5">
                  Push : {resultat.sent} envoyée{(resultat.sent ?? 0) > 1 ? 's' : ''}
                  {(resultat.failed ?? 0) > 0 && `, ${resultat.failed} échouée${(resultat.failed ?? 0) > 1 ? 's' : ''}`}
                  {(resultat.expired ?? 0) > 0 && `, ${resultat.expired} abonnement${(resultat.expired ?? 0) > 1 ? 's' : ''} expiré${(resultat.expired ?? 0) > 1 ? 's' : ''} retiré${(resultat.expired ?? 0) > 1 ? 's' : ''}`}.
                </p>
              )}
              <p className="mt-2.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Ouvrez la cloche, en haut de l&apos;espace membre, pour la voir arriver.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Ligne({ ok, titre, oui, non }: { ok: boolean; titre: string; oui: string; non: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 shrink-0" style={{ color: ok ? 'var(--brand)' : 'var(--danger)' }}>
        <ShineIcon name={ok ? 'valide' : 'alerte'} className="w-4 h-4" />
      </span>
      <span>
        <span className="block" style={{ color: 'var(--text-primary)' }}>{titre}</span>
        <span className="block text-[12px]" style={{ color: ok ? 'var(--text-muted)' : 'var(--danger)' }}>
          {ok ? oui : non}
        </span>
      </span>
    </div>
  )
}

function Cle({ nom, valeur, secrete, copie, onCopier }: {
  nom: string; valeur: string; secrete?: boolean; copie: boolean; onCopier: () => void
}) {
  return (
    <div className="rounded-lg p-3" style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-[11px] font-mono" style={{ color: secrete ? 'var(--danger)' : 'var(--text-muted)' }}>
          {nom}{secrete && ' · à garder secrète'}
        </span>
        <button onClick={onCopier}
          className="text-[11px] font-medium px-2.5 py-1 rounded-md cursor-pointer shrink-0"
          style={{ background: 'rgba(116,192,252,0.12)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.25)' }}>
          {copie ? 'Copié' : 'Copier'}
        </button>
      </div>
      <p className="text-[11.5px] font-mono break-all leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {valeur}
      </p>
    </div>
  )
}
