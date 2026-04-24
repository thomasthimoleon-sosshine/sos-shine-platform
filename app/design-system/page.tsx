'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Toast } from '@/components/ui/Toast'
import { Tooltip } from '@/components/ui/Tooltip'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--text-muted)]">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
        {children}
      </div>
    </div>
  )
}

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalSize, setModalSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md')
  const [toastVisible, setToastVisible] = useState(false)
  const [toastVariant, setToastVariant] = useState<'success' | 'error' | 'info'>('success')
  const [activeTab, setActiveTab] = useState('one')
  const [loadingBtn, setLoadingBtn] = useState(false)

  function triggerLoading() {
    setLoadingBtn(true)
    setTimeout(() => setLoadingBtn(false), 2000)
  }

  return (
    <main className="min-h-screen p-6 md:p-12 space-y-12" style={{ background: 'var(--surface)' }}>
      <div>
        <h1 className="font-display text-3xl font-semibold text-[var(--brand)]">
          Design System — SOS Shine
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Phase 2 showcase — 9 composants, tous variants
        </p>
      </div>

      {/* ══════════ BUTTON ══════════ */}
      <Section title="Button">
        <Row label="Variants × Sizes">
          {(['primary', 'secondary', 'ghost', 'destructive'] as const).map(v =>
            (['sm', 'md', 'lg'] as const).map(s => (
              <Button key={`${v}-${s}`} variant={v} size={s}>
                {v} {s}
              </Button>
            ))
          )}
        </Row>
        <Row label="States">
          <Button disabled>Disabled</Button>
          <Button loading={loadingBtn} onClick={triggerLoading}>
            {loadingBtn ? '' : 'Click → Loading 2s'}
          </Button>
        </Row>
      </Section>

      {/* ══════════ INPUT ══════════ */}
      <Section title="Input">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
          <Input label="Default" placeholder="Tapez ici..." />
          <Input label="Avec hint" placeholder="Email" hint="Nous ne partagerons jamais votre email" />
          <Input label="Erreur" placeholder="Nom" error="Ce champ est requis" />
          <Input label="Succès" placeholder="Code" state="success" hint="Code valide" />
          <Input label="Disabled" placeholder="Indisponible" disabled />
        </div>
      </Section>

      {/* ══════════ CARD ══════════ */}
      <Section title="Card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Card variant="elevated">
            <CardHeader>Elevated — Header md</CardHeader>
            <CardContent>Contenu avec padding md (24px)</CardContent>
          </Card>
          <Card variant="flat">
            <CardHeader size="sm">Flat — Header sm</CardHeader>
            <CardContent size="sm">Contenu avec padding sm (16px)</CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader size="lg">Elevated — Header lg</CardHeader>
            <CardContent size="lg">Contenu avec padding lg (32px)</CardContent>
          </Card>
          <Card variant="flat" className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">Flat — sans header, padding libre</p>
          </Card>
        </div>
      </Section>

      {/* ══════════ BADGE ══════════ */}
      <Section title="Badge">
        <Row label="Variants">
          <Badge>Default</Badge>
          <Badge variant="success">Publié</Badge>
          <Badge variant="danger">Erreur</Badge>
          <Badge variant="brand">Premium</Badge>
          <Badge variant="outline">Tag</Badge>
        </Row>
      </Section>

      {/* ══════════ MODAL ══════════ */}
      <Section title="Modal">
        <Row label="Sizes (cliquez pour ouvrir)">
          {(['sm', 'md', 'lg', 'xl'] as const).map(s => (
            <Button key={s} variant="secondary" size="sm" onClick={() => { setModalSize(s); setModalOpen(true) }}>
              Modal {s}
            </Button>
          ))}
        </Row>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Modal — ${modalSize}`} size={modalSize}>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Focus trap actif. Essayez Tab — le focus reste dans la modal.
          </p>
          <div className="flex gap-3">
            <Button variant="primary" size="sm" onClick={() => setModalOpen(false)}>Confirmer</Button>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>Annuler</Button>
          </div>
        </Modal>
      </Section>

      {/* ══════════ TOAST ══════════ */}
      <Section title="Toast">
        <Row label="Variants (cliquez pour déclencher)">
          {(['success', 'error', 'info'] as const).map(v => (
            <Button key={v} variant="secondary" size="sm" onClick={() => { setToastVariant(v); setToastVisible(true) }}>
              Toast {v}
            </Button>
          ))}
        </Row>
        <Toast
          message={`Ceci est un toast ${toastVariant}`}
          variant={toastVariant}
          isVisible={toastVisible}
          onDismiss={() => setToastVisible(false)}
        />
      </Section>

      {/* ══════════ TOOLTIP ══════════ */}
      <Section title="Tooltip">
        <Row label="Positions">
          <Tooltip content="Je suis en haut" position="top">
            <Button variant="secondary" size="sm">Hover — Top</Button>
          </Tooltip>
          <Tooltip content="Je suis en bas" position="bottom">
            <Button variant="secondary" size="sm">Hover — Bottom</Button>
          </Tooltip>
        </Row>
      </Section>

      {/* ══════════ AVATAR ══════════ */}
      <Section title="Avatar">
        <Row label="Sizes + Fallback">
          <Avatar size="sm" name="Julia Laureau" />
          <Avatar size="md" name="William" />
          <Avatar size="lg" name="Thomas" />
          <Avatar size="xl" name="SOS Shine" />
          <Avatar size="md" />
        </Row>
      </Section>

      {/* ══════════ TABS ══════════ */}
      <Section title="Tabs">
        <Tabs
          tabs={[
            { key: 'one', label: 'Premier', icon: '📊' },
            { key: 'two', label: 'Deuxième', icon: '👁️' },
            { key: 'three', label: 'Troisième', icon: '💎' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        <Card variant="flat" className="p-6">
          <p className="text-sm text-[var(--text-secondary)]">
            Onglet actif : <strong className="text-[var(--brand)]">{activeTab}</strong>
          </p>
        </Card>
      </Section>

      {/* ══════════ TOKENS ══════════ */}
      <Section title="Couleurs — Tokens">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
          {[
            { name: '--brand', label: 'Brand' },
            { name: '--brand-light', label: 'Brand Light' },
            { name: '--brand-deep', label: 'Brand Deep' },
            { name: '--success', label: 'Success' },
            { name: '--danger', label: 'Danger' },
            { name: '--warning', label: 'Warning' },
            { name: '--accent-blue', label: 'Accent Blue' },
            { name: '--accent-purple', label: 'Accent Purple' },
            { name: '--step-1', label: 'Step 1' },
            { name: '--step-2', label: 'Step 2' },
            { name: '--step-3', label: 'Step 3' },
          ].map(c => (
            <div key={c.name} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)]">
              <div className="w-8 h-8 rounded-md flex-shrink-0" style={{ background: `var(${c.name})` }} />
              <div>
                <p className="text-sm text-[var(--text-primary)]">{c.label}</p>
                <p className="text-sm text-[var(--text-muted)]">{c.name}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <p className="text-sm text-[var(--text-muted)] pt-8 border-t border-[var(--border)]">
        Page jetable — Phase 2 showcase. À supprimer après Phase 3.
      </p>
    </main>
  )
}
