'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface EmailTemplate {
  id: string
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
  created_at: string
  updated_at: string
}

interface Category {
  key: string
  label: string
  icon: string
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/email-templates')
      const data = await res.json()
      setTemplates(data.templates || [])
      setCategories(data.categories || [])
    } catch (e) {
      console.error('Load templates error:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadTemplates() }, [loadTemplates])

  async function handleSeed() {
    if (!confirm('Cela va créer les templates manquants dans la base de données. Continuer ?')) return
    setSeeding(true)
    try {
      const res = await fetch('/api/crm/email-templates/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg(data.message)
        setTimeout(() => setSuccessMsg(''), 4000)
        loadTemplates()
      } else {
        alert(`Erreur : ${data.error}`)
      }
    } catch {
      alert('Erreur lors du seed')
    }
    setSeeding(false)
  }

  async function handleSave() {
    if (!editingTemplate) return
    setSaving(true)
    try {
      const res = await fetch('/api/crm/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingTemplate.id,
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          html_content: editingTemplate.html_content,
          is_active: editingTemplate.is_active,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccessMsg('Template sauvegardé avec succès !')
        setTimeout(() => setSuccessMsg(''), 3000)
        setEditingTemplate(null)
        loadTemplates()
      } else {
        alert(`Erreur : ${data.error}`)
      }
    } catch {
      alert('Erreur lors de la sauvegarde')
    }
    setSaving(false)
  }

  async function handleToggleActive(template: EmailTemplate) {
    try {
      const res = await fetch('/api/crm/email-templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: template.id, is_active: !template.is_active }),
      })
      const data = await res.json()
      if (data.success) {
        loadTemplates()
      }
    } catch {
      alert('Erreur lors de la mise à jour')
    }
  }

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  const getCategoryInfo = (key: string): Category => {
    return categories.find(c => c.key === key) || { key, label: key, icon: '📄' }
  }

  const getTriggerLabel = (type: string, delay: number): string => {
    const labels: Record<string, string> = {
      waitlist_signup: 'Inscription liste d\'attente',
      signature_test_complete: 'Test signature complété',
      subscription_created: 'Nouvelle souscription',
      payment_success: 'Paiement réussi',
      payment_failed: 'Échec de paiement',
      renewal_reminder: 'Rappel renouvellement',
      renewal_success: 'Renouvellement réussi',
      subscription_cancelled: 'Résiliation',
      affiliate_approved: 'Affilié approuvé',
      affiliate_referral: 'Nouveau filleul',
      affiliate_payout: 'Virement affilié',
      event_registration: 'Inscription événement',
      event_reminder: 'Rappel événement',
      manual: 'Envoi manuel',
    }
    const label = labels[type] || type
    if (delay === 0) return `${label} (immédiat)`
    if (delay > 0) return `${label} (J+${delay})`
    return `${label} (J${delay})`
  }

  // ======= EDITING MODAL =======
  if (editingTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setEditingTemplate(null)}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors mb-2"
            >
              &larr; Retour aux templates
            </button>
            <h1 className="font-display text-2xl font-light" style={{ color: 'var(--gold)' }}>
              Modifier le template
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Clé : <code style={{ color: 'var(--gold)', opacity: 0.7 }}>{editingTemplate.template_key}</code>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewTemplate(previewTemplate ? null : editingTemplate)}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={{ border: '1px solid var(--dark-border)', color: 'var(--text-secondary)' }}
            >
              {previewTemplate ? 'Fermer apercu' : 'Apercu'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#050505' }}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(80,200,120,0.1)', color: '#50C878', border: '1px solid rgba(80,200,120,0.2)' }}>
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Edit form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Nom du template
              </label>
              <input
                type="text"
                value={editingTemplate.name}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                className="w-full p-3 rounded-lg text-sm"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Objet de l&apos;email
              </label>
              <input
                type="text"
                value={editingTemplate.subject}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                className="w-full p-3 rounded-lg text-sm"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
              />
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Variables disponibles : {editingTemplate.variables.map(v => `{${v}}`).join(', ')}
              </p>
            </div>

            {/* HTML Content */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Contenu HTML
              </label>
              <textarea
                value={editingTemplate.html_content}
                onChange={(e) => setEditingTemplate({ ...editingTemplate, html_content: e.target.value })}
                rows={18}
                className="w-full p-3 rounded-lg text-sm font-mono"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)', resize: 'vertical' }}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditingTemplate({ ...editingTemplate, is_active: !editingTemplate.is_active })}
                className="relative w-12 h-6 rounded-full transition-all"
                style={{ background: editingTemplate.is_active ? 'var(--gold)' : 'rgba(255,255,255,0.1)' }}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ transform: editingTemplate.is_active ? 'translateX(24px)' : 'translateX(0)' }}
                />
              </button>
              <span className="text-sm" style={{ color: editingTemplate.is_active ? '#50C878' : 'var(--text-muted)' }}>
                {editingTemplate.is_active ? 'Actif' : 'Inactif'}
              </span>
            </div>

            {/* Info */}
            <div
              className="p-4 rounded-lg space-y-2"
              style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <div className="text-xs text-[var(--text-muted)]">
                <strong style={{ color: 'var(--gold)' }}>Déclencheur :</strong>{' '}
                {getTriggerLabel(editingTemplate.trigger_type, editingTemplate.trigger_delay_days)}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                <strong style={{ color: 'var(--gold)' }}>Description :</strong>{' '}
                {editingTemplate.description}
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                <strong style={{ color: 'var(--gold)' }}>Dernière modification :</strong>{' '}
                {new Date(editingTemplate.updated_at).toLocaleString('fr-FR')}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Apercu de l&apos;email
            </label>
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--dark-border)', background: '#050505' }}
            >
              {/* Mini header preview */}
              <div className="text-center py-4" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                <span className="text-xs text-[var(--text-muted)]">De :</span>{' '}
                <span className="text-xs" style={{ color: 'var(--gold)' }}>SOS Shine® &lt;noreply@sosshine.com&gt;</span>
              </div>
              <div className="text-center py-2" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                <span className="text-xs text-[var(--text-muted)]">Objet :</span>{' '}
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                  {editingTemplate.subject.replace(/\{firstName\}/g, 'Julia').replace(/\{planName\}/g, 'Premium')}
                </span>
              </div>
              {/* Content preview */}
              <div
                className="p-6"
                style={{ maxHeight: '500px', overflow: 'auto' }}
              >
                <div className="text-center mb-6">
                  <span style={{ fontSize: '20px', fontWeight: 300, letterSpacing: '0.15em', color: '#D4AF37', fontFamily: 'Georgia, serif' }}>
                    SOS SHINE®
                  </span>
                </div>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: editingTemplate.html_content
                      .replace(/\{firstName\}/g, 'Julia')
                      .replace(/\{email\}/g, 'julialaureau@sosshine.com')
                      .replace(/\{planName\}/g, 'Premium')
                      .replace(/\{planAmount\}/g, '99,90€')
                      .replace(/\{site_url\}/g, '#')
                      .replace(/\{eventName\}/g, 'Atelier Lumière')
                      .replace(/\{eventDate\}/g, '25 mars 2026')
                      .replace(/\{eventTime\}/g, '18h00')
                      .replace(/\{payoutAmount\}/g, '150,00€')
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ======= MAIN LIST VIEW =======
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin/crm" className="text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
              CRM
            </Link>
            <span className="text-[var(--text-muted)]">/</span>
          </div>
          <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
            Templates Email
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Modifiez les emails automatiques de Julia directement depuis le CRM.
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#050505' }}
        >
          {seeding ? 'Initialisation...' : 'Initialiser les templates'}
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(80,200,120,0.1)', color: '#50C878', border: '1px solid rgba(80,200,120,0.2)' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📬</div>
          <p className="text-[var(--text-muted)] mb-2">Aucun template email en base de données.</p>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Cliquez sur &quot;Initialiser les templates&quot; pour créer les 23 templates automatiques.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--gold)', color: '#050505' }}
          >
            {seeding ? 'Initialisation...' : 'Initialiser maintenant'}
          </button>
        </div>
      ) : (
        <>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className="px-4 py-2 rounded-full text-xs font-medium transition-all"
              style={{
                background: activeCategory === 'all' ? 'var(--gold)' : 'var(--dark-card)',
                color: activeCategory === 'all' ? '#050505' : 'var(--text-muted)',
                border: `1px solid ${activeCategory === 'all' ? 'var(--gold)' : 'var(--dark-border)'}`,
              }}
            >
              Tous ({templates.length})
            </button>
            {categories.map((cat) => {
              const count = templates.filter(t => t.category === cat.key).length
              if (count === 0) return null
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className="px-4 py-2 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: activeCategory === cat.key ? 'var(--gold)' : 'var(--dark-card)',
                    color: activeCategory === cat.key ? '#050505' : 'var(--text-muted)',
                    border: `1px solid ${activeCategory === cat.key ? 'var(--gold)' : 'var(--dark-border)'}`,
                  }}
                >
                  {cat.icon} {cat.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <div className="text-2xl font-display" style={{ color: 'var(--gold)' }}>{templates.length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Templates</div>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <div className="text-2xl font-display" style={{ color: '#50C878' }}>{templates.filter(t => t.is_active).length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Actifs</div>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <div className="text-2xl font-display" style={{ color: '#E8A87C' }}>{categories.length}</div>
              <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">Catégories</div>
            </div>
          </div>

          {/* Template list */}
          <div className="space-y-3">
            {filteredTemplates.map((template) => {
              const catInfo = getCategoryInfo(template.category)
              return (
                <div
                  key={template.id}
                  className="p-5 rounded-xl transition-all hover:scale-[1.002]"
                  style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg">{catInfo.icon}</span>
                        <h3 className="font-display text-base truncate" style={{ color: 'var(--text-primary)' }}>
                          {template.name}
                        </h3>
                        <span
                          className="flex-shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
                          style={{
                            background: template.is_active ? 'rgba(80,200,120,0.12)' : 'rgba(239,68,68,0.12)',
                            color: template.is_active ? '#50C878' : '#ef4444',
                          }}
                        >
                          {template.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-muted)] mb-1 truncate">
                        Objet : {template.subject}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                        <span>{catInfo.label}</span>
                        <span>·</span>
                        <span>{getTriggerLabel(template.trigger_type, template.trigger_delay_days)}</span>
                        <span>·</span>
                        <span>Variables : {template.variables.map(v => `{${v}}`).join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(template)}
                        className="px-3 py-1.5 rounded-full text-xs transition-all"
                        style={{
                          border: '1px solid var(--dark-border)',
                          color: template.is_active ? '#ef4444' : '#50C878',
                        }}
                      >
                        {template.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => setPreviewTemplate(previewTemplate?.id === template.id ? null : template)}
                        className="px-3 py-1.5 rounded-full text-xs transition-all"
                        style={{ border: '1px solid var(--dark-border)', color: 'var(--text-muted)' }}
                      >
                        {previewTemplate?.id === template.id ? 'Fermer' : 'Apercu'}
                      </button>
                      <button
                        onClick={() => { setEditingTemplate(template); setPreviewTemplate(null) }}
                        className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#050505' }}
                      >
                        Modifier
                      </button>
                    </div>
                  </div>

                  {/* Inline preview */}
                  {previewTemplate?.id === template.id && (
                    <div
                      className="mt-4 p-4 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}
                    >
                      <h4 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">Apercu du contenu</h4>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: template.html_content
                            .replace(/\{firstName\}/g, 'Julia')
                            .replace(/\{email\}/g, 'julialaureau@sosshine.com')
                            .replace(/\{planName\}/g, 'Premium')
                            .replace(/\{planAmount\}/g, '99,90€')
                            .replace(/\{site_url\}/g, '#')
                            .replace(/\{eventName\}/g, 'Atelier Lumière')
                            .replace(/\{eventDate\}/g, '25 mars 2026')
                            .replace(/\{eventTime\}/g, '18h00')
                            .replace(/\{payoutAmount\}/g, '150,00€')
                        }}
                        style={{ maxHeight: '300px', overflow: 'auto' }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
