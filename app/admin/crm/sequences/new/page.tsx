'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface SequenceStep {
  subject: string
  html_content: string
  delay_days: number
}

export default function NewSequencePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [triggerType, setTriggerType] = useState('signup')
  const [steps, setSteps] = useState<SequenceStep[]>([
    { subject: '', html_content: '', delay_days: 0 },
  ])
  const [saving, setSaving] = useState(false)
  const [previewStep, setPreviewStep] = useState<number | null>(null)

  const triggers = [
    { value: 'signup', label: 'Inscription membre', desc: 'Quand quelqu\'un crée un compte' },
    { value: 'signature_test', label: 'Test Signature Émotionnelle', desc: 'Quand quelqu\'un termine le test' },
    { value: 'waitlist', label: 'Liste d\'attente', desc: 'Quand quelqu\'un rejoint la liste d\'attente' },
    { value: 'manual', label: 'Manuel', desc: 'Inscription manuelle via le CRM' },
  ]

  function addStep() {
    const lastStep = steps[steps.length - 1]
    setSteps([...steps, { subject: '', html_content: '', delay_days: (lastStep?.delay_days || 0) + 3 }])
  }

  function removeStep(index: number) {
    if (steps.length <= 1) return
    setSteps(steps.filter((_, i) => i !== index))
  }

  function updateStep(index: number, field: keyof SequenceStep, value: string | number) {
    const updated = [...steps]
    updated[index] = { ...updated[index], [field]: value }
    setSteps(updated)
  }

  async function handleSave() {
    if (!name.trim()) {
      alert('Donnez un nom à votre séquence')
      return
    }
    const hasEmptyStep = steps.some(s => !s.subject.trim() || !s.html_content.trim())
    if (hasEmptyStep) {
      alert('Chaque email doit avoir un objet et un contenu')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/crm/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), trigger_type: triggerType, steps }),
      })
      const data = await res.json()
      if (data.error) {
        alert(`Erreur : ${data.error}`)
      } else {
        alert('Séquence créée avec succès !')
        router.push('/admin/crm/sequences')
      }
    } catch {
      alert('Erreur lors de la sauvegarde')
    }
    setSaving(false)
  }

  function computeTimeline(): string[] {
    return steps.map((step, i) => {
      if (i === 0 && step.delay_days === 0) return 'Immédiatement'
      if (step.delay_days === 0) return 'Le même jour'
      if (step.delay_days === 1) return 'J+1'
      return `J+${step.delay_days}`
    })
  }

  const timeline = computeTimeline()

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
            Nouvelle Séquence
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Créez un parcours d'emails automatiques déclenché par une action.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/crm/sequences')}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
        >
          ← Retour aux séquences
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Nom de la séquence
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Bienvenue nouveaux membres"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Déclencheur
            </label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
            >
              {triggers.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {triggers.find(t => t.value === triggerType)?.desc}
            </p>
          </div>
        </div>

        <div
          className="p-4 rounded-xl flex items-center gap-4"
          style={{ background: 'rgba(201,169,97,0.05)', border: '1px solid rgba(201,169,97,0.1)' }}
        >
          <div className="text-sm" style={{ color: 'var(--gold)' }}>Timeline :</div>
          <div className="flex items-center gap-2 flex-wrap">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--gold)' }}
                >
                  {t} — Email {i + 1}
                </span>
                {i < timeline.length - 1 && (
                  <span className="text-[var(--text-muted)]">→</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-wider text-[var(--text-muted)]">
              Emails de la séquence ({steps.length})
            </h2>
            <button
              onClick={addStep}
              className="px-4 py-2 rounded-full text-xs font-medium transition-all"
              style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--gold)', border: '1px solid rgba(201,169,97,0.2)' }}
            >
              + Ajouter un email
            </button>
          </div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="p-5 rounded-xl space-y-4"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                    style={{ background: 'rgba(201,169,97,0.15)', color: 'var(--gold)' }}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    Email {index + 1}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    ({timeline[index]})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewStep(previewStep === index ? null : index)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                  >
                    {previewStep === index ? '✕ Fermer' : '👁 Aperçu'}
                  </button>
                  {steps.length > 1 && (
                    <button
                      onClick={() => removeStep(index)}
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕ Supprimer
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Délai (jours)</label>
                  <input
                    type="number"
                    min="0"
                    value={step.delay_days}
                    onChange={(e) => updateStep(index, 'delay_days', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {index === 0 ? 'Après le déclencheur' : `Après le déclencheur`}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Objet de l'email</label>
                  <input
                    type="text"
                    value={step.subject}
                    onChange={(e) => updateStep(index, 'subject', e.target.value)}
                    placeholder="Ex: Bienvenue {firstName} !"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--text-muted)]">Contenu HTML</label>
                  <div className="flex gap-1">
                    {['{firstName}', '{email}'].map((v) => (
                      <button
                        key={v}
                        onClick={() => updateStep(index, 'html_content', step.html_content + v)}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--gold)', border: '1px solid rgba(201,169,97,0.2)' }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={step.html_content}
                  onChange={(e) => updateStep(index, 'html_content', e.target.value)}
                  placeholder="<h2>Bonjour {firstName},</h2><p>Bienvenue dans la communauté SOS Shine...</p>"
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none resize-y"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                />
              </div>

              {previewStep === index && (
                <div className="p-4 rounded-lg" style={{ background: '#ffffff', color: '#333' }}>
                  <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Aperçu</h4>
                  <p className="text-sm font-semibold mb-2">Objet : {step.subject.replace(/\{firstName\}/g, 'Thomas')}</p>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: step.html_content
                        .replace(/\{firstName\}/g, 'Thomas')
                        .replace(/\{email\}/g, 'thomas@example.com')
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#000000' }}
        >
          {saving ? 'Sauvegarde...' : '✓ Créer la séquence'}
        </button>
      </div>
    </div>
  )
}
