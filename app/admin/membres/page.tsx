'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Profile } from '@/types/database'

type MemberSubscription = {
  status: string
  plan: string
  current_period_end: string | null
  waitlist_discount: boolean
  cancel_at_period_end: boolean
}

type EnrichedProfile = Profile & {
  subscription: MemberSubscription | null
  publish_banned_until?: string | null
}

const ROLES: { value: Profile['role']; label: string }[] = [
  { value: 'founder', label: 'Fondateur' },
  { value: 'admin_content', label: 'Admin Contenu' },
  { value: 'admin_support', label: 'Admin Support' },
  { value: 'member', label: 'Membre' },
]

const roleBadgeStyles: Record<Profile['role'], { bg: string; color: string; label: string }> = {
  founder:       { bg: 'rgba(201,169,97,0.12)',  color: '#C9A961', label: 'Fondateur' },
  admin_content: { bg: 'rgba(116,192,252,0.12)', color: '#74C0FC', label: 'Admin Contenu' },
  admin_support: { bg: 'rgba(116,185,255,0.12)', color: '#74B9FF', label: 'Admin Support' },
  member:        { bg: 'rgba(154,144,128,0.12)', color: '#9A9080', label: 'Membre' },
}

function getPlanBadge(plan: Profile['plan']) {
  if (plan === 'premium')   return { bg: 'rgba(116,192,252,0.12)', color: '#74C0FC', label: 'Premium' }
  if (plan === 'serenite')  return { bg: 'rgba(85,239,196,0.12)',  color: '#55EFC4', label: 'Sérénité' }
  if (plan === 'essential') return { bg: 'rgba(201,169,97,0.12)',  color: '#C9A961', label: 'Essentielle' }
  return { bg: 'rgba(90,83,71,0.12)', color: '#5A5347', label: 'Aucun' }
}

function getSubStatusBadge(status: string | undefined) {
  switch (status) {
    case 'active': return { bg: 'rgba(85,239,196,0.12)', color: '#55EFC4', label: 'Actif' }
    case 'trialing': return { bg: 'rgba(116,192,252,0.12)', color: '#74C0FC', label: 'Essai' }
    case 'past_due': return { bg: 'rgba(225,112,85,0.12)', color: '#E17055', label: 'Impay\u00e9' }
    case 'canceled': return { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', label: 'Annul\u00e9' }
    case 'inactive': return { bg: 'rgba(154,144,128,0.12)', color: '#9A9080', label: 'Inactif' }
    default: return null
  }
}

function formatDateFR(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AdminMembres() {
  const [profiles, setProfiles] = useState<EnrichedProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [savingRole, setSavingRole] = useState<string | null>(null)
  const [togglingActive, setTogglingActive] = useState<string | null>(null)
  const [togglingBan, setTogglingBan] = useState<string | null>(null)
  const [banMenuOpen, setBanMenuOpen] = useState<string | null>(null)
  const [deletingMember, setDeletingMember] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/members')
        if (!res.ok) {
          setError('Impossible de charger les membres')
          setLoading(false)
          return
        }
        const json = await res.json()
        setProfiles(json.profiles || [])
      } catch {
        setError('Erreur de connexion')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleRoleChange(memberId: string, newRole: Profile['role']) {
    setSavingRole(memberId)
    setError(null)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role: newRole }),
      })
      if (res.ok) {
        setProfiles((prev) => prev.map((p) => p.id === memberId ? { ...p, role: newRole } : p))
      } else {
        const json = await res.json()
        setError(json.error || 'Erreur lors du changement de r\u00f4le')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setSavingRole(null)
    setEditingRole(null)
  }

  async function handleToggleActive(memberId: string, currentActive: boolean) {
    setTogglingActive(memberId)
    setError(null)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, is_active: !currentActive }),
      })
      if (res.ok) {
        setProfiles((prev) => prev.map((p) => p.id === memberId ? { ...p, is_active: !currentActive } : p))
      } else {
        const json = await res.json()
        setError(json.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setTogglingActive(null)
  }

  async function handleBanPublish(memberId: string, days: number) {
    setTogglingBan(memberId)
    setBanMenuOpen(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, action: 'ban', days }),
      })
      if (res.ok) {
        const json = await res.json()
        setProfiles((prev) => prev.map((p) => p.id === memberId ? { ...p, publish_banned_until: json.publish_banned_until } : p))
      } else {
        const json = await res.json()
        setError(json.error || 'Erreur lors du blocage')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setTogglingBan(null)
  }

  async function handleUnbanPublish(memberId: string) {
    setTogglingBan(memberId)
    setBanMenuOpen(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, action: 'unban' }),
      })
      if (res.ok) {
        setProfiles((prev) => prev.map((p) => p.id === memberId ? { ...p, publish_banned_until: null } : p))
      } else {
        const json = await res.json()
        setError(json.error || 'Erreur lors du d\u00e9blocage')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setTogglingBan(null)
  }

  async function handleDeleteMember(memberId: string) {
    setDeletingMember(memberId)
    setError(null)
    try {
      const res = await fetch('/api/admin/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      })
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== memberId))
      } else {
        const json = await res.json()
        setError(json.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setDeletingMember(null)
    setConfirmDelete(null)
  }

  function isBanned(member: EnrichedProfile): boolean {
    return !!member.publish_banned_until && new Date(member.publish_banned_until) > new Date()
  }

  // Stats
  const stats = useMemo(() => {
    const total = profiles.length
    const active = profiles.filter(p => p.subscription?.status === 'active' || p.subscription?.status === 'trialing').length
    const pastDue = profiles.filter(p => p.subscription?.status === 'past_due').length
    const inactive = profiles.filter(p => !p.subscription || p.subscription.status === 'inactive' || p.subscription.status === 'canceled').length
    const withDiscount = profiles.filter(p => p.subscription?.waitlist_discount).length
    return { total, active, pastDue, inactive, withDiscount }
  }, [profiles])

  const filtered = useMemo(() => {
    let list = profiles
    if (filterStatus !== 'all') {
      list = list.filter(p => {
        if (filterStatus === 'active') return p.subscription?.status === 'active' || p.subscription?.status === 'trialing'
        if (filterStatus === 'past_due') return p.subscription?.status === 'past_due'
        if (filterStatus === 'inactive') return !p.subscription || p.subscription.status === 'inactive' || p.subscription.status === 'canceled'
        if (filterStatus === 'deactivated') return p.is_active === false
        if (filterStatus === 'banned') return !!p.publish_banned_until && new Date(p.publish_banned_until) > new Date()
        return true
      })
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim()
      list = list.filter(p => p.prenom.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
    }
    return list
  }, [profiles, search, filterStatus])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Membres
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Chargement...' : `${profiles.length} membre${profiles.length !== 1 ? 's' : ''} inscrit${profiles.length !== 1 ? 's' : ''} sur SOS Shine.`}
        </p>
      </div>

      {/* Stats cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'var(--text-primary)' },
            { label: 'Abonn\u00e9s actifs', value: stats.active, color: '#55EFC4' },
            { label: 'Impay\u00e9s', value: stats.pastDue, color: '#E17055' },
            { label: 'Sans abo', value: stats.inactive, color: '#9A9080' },
            { label: 'R\u00e9duc. fondateur', value: stats.withDiscount, color: '#C9A961' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <p className="font-display text-2xl font-light" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
          {error}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          <option value="all">Tous</option>
          <option value="active">Abonn&eacute;s actifs</option>
          <option value="past_due">Impay&eacute;s</option>
          <option value="inactive">Sans abonnement</option>
          <option value="deactivated">D&eacute;sactiv&eacute;s</option>
          <option value="banned">Bloqu&eacute;s (publication)</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {search.trim() ? 'Aucun membre ne correspond \u00e0 votre recherche.' : 'Aucun membre pour le moment.'}
          </p>
        </div>
      ) : (
        <>
          {search.trim() && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} r&eacute;sultat{filtered.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Table (desktop) */}
          <div className="hidden md:block rounded-xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Membre', 'Email', 'R\u00f4le', 'Plan', 'Statut abo', 'Publication', 'Actif', 'Inscription', ''].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, i) => {
                  const role = roleBadgeStyles[member.role]
                  const plan = getPlanBadge(member.plan)
                  const subBadge = getSubStatusBadge(member.subscription?.status)
                  const isEditingThis = editingRole === member.id
                  const isActive = member.is_active !== false
                  return (
                    <tr key={member.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      {/* Name + avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                              style={{ background: `${role.color}18`, color: role.color }}>
                              {member.prenom?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <div>
                            <span style={{ color: 'var(--text-primary)' }}>{member.prenom || '\u2014'}</span>
                            {member.subscription?.waitlist_discount && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(201,169,97,0.1)', color: '#C9A961' }}>
                                -10&euro;
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>
                        {member.email}
                      </td>
                      {/* Role */}
                      <td className="px-4 py-3.5">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              defaultValue={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value as Profile['role'])}
                              disabled={savingRole === member.id}
                              className="rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                              style={{ background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                            >
                              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            <button onClick={() => setEditingRole(null)} className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setEditingRole(member.id)}
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
                            style={{ background: role.bg, color: role.color }} title="Changer le r\u00f4le">
                            {role.label}
                          </button>
                        )}
                      </td>
                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: plan.bg, color: plan.color }}>
                          {plan.label}
                        </span>
                      </td>
                      {/* Subscription status */}
                      <td className="px-4 py-3.5">
                        {subBadge ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: subBadge.bg, color: subBadge.color }}>
                            {subBadge.label}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>&mdash;</span>
                        )}
                      </td>
                      {/* Publish ban */}
                      <td className="px-4 py-3.5">
                        <div className="relative">
                          {isBanned(member) ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                                Bloqu&eacute;
                              </span>
                              <button
                                onClick={() => handleUnbanPublish(member.id)}
                                disabled={togglingBan === member.id}
                                className="text-xs px-2 py-1 rounded-lg cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
                                style={{ background: 'rgba(85,239,196,0.12)', color: '#55EFC4' }}
                                title="D&eacute;bloquer la publication"
                              >
                                D&eacute;bloquer
                              </button>
                            </div>
                          ) : (
                            <div className="relative inline-block">
                              <button
                                onClick={() => setBanMenuOpen(banMenuOpen === member.id ? null : member.id)}
                                disabled={togglingBan === member.id}
                                className="inline-block px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
                                style={{ background: 'rgba(85,239,196,0.12)', color: '#55EFC4' }}
                                title="Bloquer la publication"
                              >
                                Autoris&eacute;
                              </button>
                              {banMenuOpen === member.id && (
                                <div className="absolute z-50 top-full mt-1 left-0 rounded-xl py-1 shadow-lg min-w-[140px]"
                                  style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                                  <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Bloquer pour</p>
                                  {[5, 10, 15, 30].map((d) => (
                                    <button key={d}
                                      onClick={() => handleBanPublish(member.id, d)}
                                      className="w-full text-left px-3 py-1.5 text-xs cursor-pointer transition-colors hover:opacity-80"
                                      style={{ color: '#E17055' }}>
                                      {d} jours
                                    </button>
                                  ))}
                                  <button
                                    onClick={() => setBanMenuOpen(null)}
                                    className="w-full text-left px-3 py-1.5 text-xs cursor-pointer"
                                    style={{ color: 'var(--text-muted)' }}>
                                    Annuler
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Active toggle */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleActive(member.id, isActive)}
                          disabled={togglingActive === member.id}
                          className="relative w-10 h-5 rounded-full transition-all cursor-pointer disabled:opacity-50"
                          style={{ background: isActive ? 'rgba(85,239,196,0.3)' : 'rgba(154,144,128,0.2)' }}
                          title={isActive ? 'D\u00e9sactiver le compte' : 'Activer le compte'}
                        >
                          <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full"
                            style={{
                              left: isActive ? '22px' : '2px',
                              background: isActive ? '#55EFC4' : '#9A9080',
                            }} />
                        </button>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-muted)' }}>
                        {formatDateFR(member.created_at)}
                      </td>
                      {/* Delete */}
                      <td className="px-4 py-3.5">
                        {confirmDelete === member.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              disabled={deletingMember === member.id}
                              className="text-xs px-2 py-1 rounded-lg cursor-pointer disabled:opacity-50"
                              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                            >
                              {deletingMember === member.id ? '...' : 'Confirmer'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs cursor-pointer"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(member.id)}
                            className="text-xs px-2 py-1 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
                            style={{ color: '#ef4444' }}
                            title="Supprimer le membre"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Card list (mobile) */}
          <div className="md:hidden space-y-3">
            {filtered.map((member) => {
              const role = roleBadgeStyles[member.role]
              const plan = getPlanBadge(member.plan)
              const subBadge = getSubStatusBadge(member.subscription?.status)
              const isEditingThis = editingRole === member.id
              const isActive = member.is_active !== false
              return (
                <div key={member.id} className="rounded-xl p-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{ background: `${role.color}18`, color: role.color }}>
                        {member.prenom?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{member.prenom || '\u2014'}</p>
                        {member.subscription?.waitlist_discount && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(201,169,97,0.1)', color: '#C9A961' }}>-10&euro;</span>
                        )}
                      </div>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{member.email}</p>
                    </div>
                    {/* Active toggle */}
                    <button
                      onClick={() => handleToggleActive(member.id, isActive)}
                      disabled={togglingActive === member.id}
                      className="relative w-10 h-5 rounded-full transition-all cursor-pointer disabled:opacity-50 shrink-0"
                      style={{ background: isActive ? 'rgba(85,239,196,0.3)' : 'rgba(154,144,128,0.2)' }}
                    >
                      <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full"
                        style={{ left: isActive ? '22px' : '2px', background: isActive ? '#55EFC4' : '#9A9080' }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1.5">
                        <select defaultValue={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Profile['role'])}
                          disabled={savingRole === member.id}
                          className="rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                          style={{ background: 'var(--dark)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <button onClick={() => setEditingRole(null)} className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>Annuler</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingRole(member.id)}
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
                        style={{ background: role.bg, color: role.color }}>
                        {role.label}
                      </button>
                    )}
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: plan.bg, color: plan.color }}>
                      {plan.label}
                    </span>
                    {subBadge && (
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: subBadge.bg, color: subBadge.color }}>
                        {subBadge.label}
                      </span>
                    )}
                    {/* Publish ban badge (mobile) */}
                    {isBanned(member) ? (
                      <button
                        onClick={() => handleUnbanPublish(member.id)}
                        disabled={togglingBan === member.id}
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                        Bloqu&eacute;
                      </button>
                    ) : (
                      <div className="relative inline-block">
                        <button
                          onClick={() => setBanMenuOpen(banMenuOpen === member.id ? null : member.id)}
                          disabled={togglingBan === member.id}
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
                          style={{ background: 'rgba(85,239,196,0.08)', color: '#55EFC4' }}
                          title="Bloquer la publication">
                          Publie
                        </button>
                        {banMenuOpen === member.id && (
                          <div className="absolute z-50 bottom-full mb-1 left-0 rounded-xl py-1 shadow-lg min-w-[140px]"
                            style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                            <p className="px-3 py-1.5 text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Bloquer pour</p>
                            {[5, 10, 15, 30].map((d) => (
                              <button key={d}
                                onClick={() => handleBanPublish(member.id, d)}
                                className="w-full text-left px-3 py-1.5 text-xs cursor-pointer"
                                style={{ color: '#E17055' }}>
                                {d} jours
                              </button>
                            ))}
                            <button
                              onClick={() => setBanMenuOpen(null)}
                              className="w-full text-left px-3 py-1.5 text-xs cursor-pointer"
                              style={{ color: 'var(--text-muted)' }}>
                              Annuler
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateFR(member.created_at)}</span>
                  </div>
                  {/* Delete button (mobile) */}
                  <div className="mt-2 pt-2 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
                    {confirmDelete === member.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Supprimer ?</span>
                        <button
                          onClick={() => handleDeleteMember(member.id)}
                          disabled={deletingMember === member.id}
                          className="text-xs px-3 py-1 rounded-lg cursor-pointer disabled:opacity-50"
                          style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                        >
                          {deletingMember === member.id ? '...' : 'Confirmer'}
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(member.id)}
                        className="text-xs px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                        style={{ color: '#ef4444' }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
