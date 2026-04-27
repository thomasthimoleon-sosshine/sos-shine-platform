'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function NewCampaignPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [segment, setSegment] = useState('all')
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [useRichEditor, setUseRichEditor] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)

  const segments = [
    { value: 'all', label: 'Tous les contacts' },
    { value: 'member', label: 'Membres inscrits uniquement' },
    { value: 'signature_test', label: 'Test Signature uniquement' },
    { value: 'waitlist', label: 'Liste d\'attente uniquement' },
  ]

  function getEditorContent(): string {
    if (useRichEditor && editorRef.current) {
      return editorRef.current.innerHTML
    }
    return htmlContent
  }

  async function handleSave(sendNow = false) {
    const content = getEditorContent()
    if (!name.trim() || !subject.trim() || !content.trim()) {
      alert('Veuillez remplir tous les champs (nom, objet, contenu)')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/crm/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          subject: subject.trim(),
          html_content: content,
          segment,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        }),
      })
      const data = await res.json()
      if (data.error) {
        alert(`Erreur : ${data.error}`)
        setSaving(false)
        return
      }

      if (scheduledAt) {
        alert(`Campagne planifiée pour le ${new Date(scheduledAt).toLocaleString('fr-FR')}`)
      } else if (sendNow && data.campaign?.id) {
        if (confirm('Envoyer cette campagne immédiatement ?')) {
          const sendRes = await fetch('/api/crm/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId: data.campaign.id }),
          })
          const sendData = await sendRes.json()
          if (sendData.error) {
            alert(`Campagne sauvegardée mais erreur d'envoi : ${sendData.error}`)
          } else {
            alert(`Campagne envoyée à ${sendData.sentCount} contacts !`)
          }
        }
      } else {
        alert('Campagne sauvegardée en brouillon')
      }

      router.push('/admin/crm/campaigns')
    } catch {
      alert('Erreur lors de la sauvegarde')
    }
    setSaving(false)
  }

  function execCommand(command: string, value?: string) {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
  }

  function insertVariable(variable: string) {
    if (useRichEditor && editorRef.current) {
      document.execCommand('insertText', false, `{${variable}}`)
      editorRef.current.focus()
    } else {
      setHtmlContent(prev => prev + `{${variable}}`)
    }
  }

  const templateButtons = [
    { label: '{firstName}', variable: 'firstName', tooltip: 'Prénom du contact' },
    { label: '{email}', variable: 'email', tooltip: 'Email du contact' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
            Nouvelle Campagne
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Créez et personnalisez votre email avant de l'envoyer.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/crm/campaigns')}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
        >
          ← Retour aux campagnes
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Nom de la campagne
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Newsletter Février 2026"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Segment de contacts
            </label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
            >
              {segments.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Planification (optionnel)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="px-4 py-3 rounded-xl text-sm outline-none flex-1"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
            />
            {scheduledAt && (
              <button
                onClick={() => setScheduledAt('')}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Annuler la planification
              </button>
            )}
          </div>
          {scheduledAt && (
            <p className="text-xs mt-1" style={{ color: '#4A90D9' }}>
              L'email sera envoyé automatiquement le {new Date(scheduledAt).toLocaleString('fr-FR')}
            </p>
          )}
          {!scheduledAt && (
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Laissez vide pour envoyer manuellement ou immédiatement
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Objet de l'email
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: {firstName}, découvrez nos nouveautés ✨"
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              Contenu de l'email
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {templateButtons.map((btn) => (
                  <button
                    key={btn.variable}
                    onClick={() => insertVariable(btn.variable)}
                    className="px-2 py-1 rounded text-xs transition-all"
                    style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--gold)', border: '1px solid rgba(201,169,97,0.2)' }}
                    title={btn.tooltip}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setUseRichEditor(!useRichEditor)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
              >
                {useRichEditor ? '< > HTML' : '✎ Éditeur visuel'}
              </button>
            </div>
          </div>

          {useRichEditor ? (
            <div>
              <div
                className="flex flex-wrap gap-1 p-2 rounded-t-xl"
                style={{ background: 'rgba(201,169,97,0.05)', border: '1px solid var(--dark-border)', borderBottom: 'none' }}
              >
                <button onClick={() => execCommand('bold')} className="px-2 py-1 rounded text-xs font-bold text-[var(--text-secondary)] hover:bg-white/10">B</button>
                <button onClick={() => execCommand('italic')} className="px-2 py-1 rounded text-xs italic text-[var(--text-secondary)] hover:bg-white/10">I</button>
                <button onClick={() => execCommand('underline')} className="px-2 py-1 rounded text-xs underline text-[var(--text-secondary)] hover:bg-white/10">U</button>
                <span className="w-px bg-[var(--dark-border)] mx-1" />
                <button onClick={() => execCommand('formatBlock', 'h2')} className="px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-white/10">H2</button>
                <button onClick={() => execCommand('formatBlock', 'h3')} className="px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-white/10">H3</button>
                <button onClick={() => execCommand('formatBlock', 'p')} className="px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-white/10">¶</button>
                <span className="w-px bg-[var(--dark-border)] mx-1" />
                <button onClick={() => execCommand('insertUnorderedList')} className="px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-white/10">• Liste</button>
                <button onClick={() => {
                  const url = prompt('URL du lien :')
                  if (url) execCommand('createLink', url)
                }} className="px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-white/10">🔗 Lien</button>
                <button onClick={() => execCommand('justifyCenter')} className="px-2 py-1 rounded text-xs text-[var(--text-secondary)] hover:bg-white/10">≡ Centrer</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                className="w-full min-h-[300px] px-6 py-4 rounded-b-xl text-sm outline-none focus:ring-1"
                style={{
                  background: 'var(--dark-card)',
                  border: '1px solid var(--dark-border)',
                  color: 'var(--text-primary)',
                  lineHeight: '1.8',
                }}
                onInput={() => {}}
              />
            </div>
          ) : (
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="<h2>Bonjour {firstName},</h2><p>Votre contenu ici...</p>"
              rows={15}
              className="w-full px-4 py-3 rounded-xl text-sm font-mono outline-none resize-y"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
            />
          )}
        </div>

        {preview && (
          <div
            className="p-6 rounded-xl"
            style={{ background: '#ffffff', color: '#333' }}
          >
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-3">Aperçu</h4>
            <div dangerouslySetInnerHTML={{ __html: getEditorContent().replace(/\{firstName\}/g, 'Thomas').replace(/\{email\}/g, 'thomas@example.com') }} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
        <button
          onClick={() => setPreview(!preview)}
          className="px-5 py-2.5 rounded-full text-sm transition-all"
          style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--gold)', border: '1px solid rgba(201,169,97,0.2)' }}
        >
          {preview ? '✕ Fermer l\'aperçu' : '👁 Aperçu'}
        </button>
        <div className="flex gap-3">
          {!scheduledAt && (
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'var(--dark-card)', color: 'var(--text-primary)', border: '1px solid var(--dark-border)' }}
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder en brouillon'}
            </button>
          )}
          <button
            onClick={() => handleSave(!scheduledAt)}
            disabled={saving}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#000000' }}
          >
            {saving ? 'Sauvegarde...' : scheduledAt ? 'Planifier l\'envoi' : 'Sauvegarder & Envoyer'}
          </button>
        </div>
      </div>
    </div>
  )
}
