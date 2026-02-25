'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Profile } from '@/types/database'

const ROLES: { value: Profile['role']; label: string }[] = [
  { value: 'founder', label: 'Fondateur' },
  { value: 'admin_content', label: 'Admin Contenu' },
  { value: 'admin_support', label: 'Admin Support' },
  { value: 'member', label: 'Membre' },
]

const roleBadgeStyles: Record<Profile['role'], { bg: string; color: string; label: string }> = {
  founder:       { bg: 'rgba(212,175,55,0.12)',  color: '#D4AF37', label: 'Fondateur' },
  admin_content: { bg: 'rgba(116,192,252,0.12)', color: '#74C0FC', label: 'Admin Contenu' },
  admin_support: { bg: 'rgba(116,185,255,0.12)', color: '#74B9FF', label: 'Admin Support' },
  member:        { bg: 'rgba(154,144,128,0.12)', color: '#9A9080', label: 'Membre' },
}

function getPlanBadge(plan: Profile['plan']) {
  if (plan === 'premium')   return { bg: 'rgba(116,192,252,0.12)', color: '#74C0FC', label: 'Premium' }
  if (plan === 'essential') return { bg: 'rgba(212,175,55,0.12)',  color: '#D4AF37', label: 'Essentiel' }
  return { bg: 'rgba(90,83,71,0.12)', color: '#5A5347', label: 'Aucun' }
}

function formatDateFR(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AdminMembres() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingRole, setEditingRole] = useState<string | null>(null)
  const [savingRole, setSavingRole] = useState<string | null>(null)
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
        setError(json.error || 'Erreur lors du changement de rôle')
      }
    } catch {
      setError('Erreur de connexion')
    }
    setSavingRole(null)
    setEditingRole(null)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return profiles
    const q = search.toLowerCase().trim()
    return profiles.filter(
      (p) =>
        p.prenom.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q)
    )
  }, [profiles, search])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1
          className="font-display text-3xl font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Membres
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          {loading
            ? 'Chargement...'
            : `${profiles.length} membre${profiles.length !== 1 ? 's' : ''} inscrit${profiles.length !== 1 ? 's' : ''} sur SOS Shine.`}
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-sm"
          style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}
        >
          {error}
        </div>
      )}

      {/* Search bar */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: 'var(--text-muted)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
          style={{
            background: 'var(--dark-card)',
            border: '1px solid var(--dark-border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {search.trim() ? 'Aucun membre ne correspond à votre recherche.' : 'Aucun membre pour le moment.'}
          </p>
        </div>
      ) : (
        <>
          {/* Results count when filtering */}
          {search.trim() && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Table (desktop) */}
          <div
            className="hidden md:block rounded-xl overflow-hidden"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  {['Membre', 'Email', 'Rôle', 'Plan', 'Inscription'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, i) => {
                  const role = roleBadgeStyles[member.role]
                  const plan = getPlanBadge(member.plan)
                  const isEditingThis = editingRole === member.id
                  return (
                    <tr
                      key={member.id}
                      style={{
                        borderBottom:
                          i < filtered.length - 1 ? '1px solid var(--dark-border)' : 'none',
                      }}
                    >
                      {/* Name + avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                              style={{
                                background: `${role.color}18`,
                                color: role.color,
                              }}
                            >
                              {member.prenom?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <span style={{ color: 'var(--text-primary)' }}>
                            {member.prenom || '—'}
                          </span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>
                        {member.email}
                      </td>
                      {/* Role badge — clickable to edit */}
                      <td className="px-5 py-3.5">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              defaultValue={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value as Profile['role'])}
                              disabled={savingRole === member.id}
                              className="rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                              style={{ background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                            >
                              {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <button onClick={() => setEditingRole(null)} className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingRole(member.id)}
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
                            style={{ background: role.bg, color: role.color }}
                            title="Cliquer pour changer le rôle"
                          >
                            {role.label}
                          </button>
                        )}
                      </td>
                      {/* Plan badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: plan.bg, color: plan.color }}
                        >
                          {plan.label}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-3.5" style={{ color: 'var(--text-muted)' }}>
                        {formatDateFR(member.created_at)}
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
              const isEditingThis = editingRole === member.id
              return (
                <div
                  key={member.id}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                        style={{
                          background: `${role.color}18`,
                          color: role.color,
                        }}
                      >
                        {member.prenom?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {member.prenom || '—'}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          defaultValue={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as Profile['role'])}
                          disabled={savingRole === member.id}
                          className="rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
                          style={{ background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                        <button onClick={() => setEditingRole(null)} className="text-xs cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRole(member.id)}
                        className="inline-block px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80"
                        style={{ background: role.bg, color: role.color }}
                      >
                        {role.label}
                      </button>
                    )}
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: plan.bg, color: plan.color }}
                    >
                      {plan.label}
                    </span>
                    <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formatDateFR(member.created_at)}
                    </span>
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
