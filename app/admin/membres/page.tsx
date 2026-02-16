'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

const roleBadgeStyles: Record<Profile['role'], { bg: string; color: string; label: string }> = {
  founder:       { bg: 'rgba(212,168,67,0.12)',  color: '#D4A843', label: 'Fondatrice' },
  admin_content: { bg: 'rgba(162,155,254,0.12)', color: '#A29BFE', label: 'Admin Contenu' },
  admin_support: { bg: 'rgba(116,185,255,0.12)', color: '#74B9FF', label: 'Admin Support' },
  member:        { bg: 'rgba(154,144,128,0.12)', color: '#9A9080', label: 'Membre' },
}

function getPlanBadge(plan: Profile['plan']) {
  if (plan === 'premium')   return { bg: 'rgba(162,155,254,0.12)', color: '#A29BFE', label: 'Premium' }
  if (plan === 'essential') return { bg: 'rgba(212,168,67,0.12)',  color: '#D4A843', label: 'Essentiel' }
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

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, prenom, email, role, avatar_url, plan, created_at')
        .order('created_at', { ascending: false })

      setProfiles((data as Profile[]) || [])
      setLoading(false)
    }
    load()
  }, [])

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
          <div className="w-8 h-8 border-2 border-[#A29BFE] border-t-transparent rounded-full animate-spin" />
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
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                            style={{
                              background: `${role.color}18`,
                              color: role.color,
                            }}
                          >
                            {member.prenom?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {member.prenom || '—'}
                          </span>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>
                        {member.email}
                      </td>
                      {/* Role badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: role.bg, color: role.color }}
                        >
                          {role.label}
                        </span>
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
              return (
                <div
                  key={member.id}
                  className="rounded-xl p-4"
                  style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{
                        background: `${role.color}18`,
                        color: role.color,
                      }}
                    >
                      {member.prenom?.charAt(0).toUpperCase() || '?'}
                    </div>
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
                    <span
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: role.bg, color: role.color }}
                    >
                      {role.label}
                    </span>
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
