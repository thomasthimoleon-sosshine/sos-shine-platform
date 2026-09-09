# SOS Shine — UI Components

**Location:** `/components/ui/`
**Pattern:** cva + forwardRef + var(--xxx) tokens + zero inline styles
**Dependencies:** `class-variance-authority`, `lucide-react`, `framer-motion`, `focus-trap-react`

---

## Button

```tsx
import { Button } from '@/components/ui/Button'

<Button variant="primary" size="lg">Commencer</Button>
<Button variant="secondary" size="md">En savoir plus</Button>
<Button variant="ghost" size="sm">Annuler</Button>
<Button variant="destructive" size="md">Supprimer</Button>
<Button variant="primary" loading>Envoi...</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `primary` \| `secondary` \| `ghost` \| `destructive` | `primary` | Visual style |
| size | `sm` \| `md` \| `lg` | `md` | Button size (sm=14px, md=14px, lg=17px) |
| loading | `boolean` | `false` | Shows Loader2 spinner, disables button |
| disabled | `boolean` | `false` | Disables interaction |

---

## Input

```tsx
import { Input } from '@/components/ui/Input'

<Input label="Email" placeholder="vous@email.com" />
<Input label="Nom" error="Ce champ est requis" />
<Input label="Code" state="success" hint="Code valide" />
<Input disabled placeholder="Désactivé" />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| state | `default` \| `error` \| `success` | `default` | Visual state (auto-switches to error if error prop set) |
| label | `string` | — | Label above input |
| hint | `string` | — | Hint text below input (hidden when error) |
| error | `string` | — | Error message below input (forces error state) |

**Accessibility:** `aria-invalid`, `aria-describedby` linking error/hint to input.

---

## Card

```tsx
import { Card, CardHeader, CardContent } from '@/components/ui/Card'

<Card variant="elevated">
  <CardHeader>Title</CardHeader>
  <CardContent>Body</CardContent>
</Card>

<Card variant="flat" className="p-6">Simple card</Card>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `elevated` \| `flat` | `elevated` | Elevated has shadow + stronger border |

**CardHeader / CardContent:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `sm` \| `md` \| `lg` | `md` | Padding: sm=16px, md=24px, lg=32px |

---

## Badge

```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="success">Publié</Badge>
<Badge variant="danger">Erreur</Badge>
<Badge variant="brand">Premium</Badge>
<Badge variant="outline">Tag</Badge>
```

| Prop | Type | Default |
|------|------|---------|
| variant | `default` \| `success` \| `danger` \| `brand` \| `outline` | `default` |

---

## Modal

```tsx
import { Modal } from '@/components/ui/Modal'

const [open, setOpen] = useState(false)

<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirmer" size="md">
  <p>Contenu de la modal</p>
</Modal>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isOpen | `boolean` | — | Controls visibility |
| onClose | `() => void` | — | Called on Esc, overlay click, or close button |
| title | `string` | — | Optional header with close button |
| size | `sm` \| `md` \| `lg` \| `xl` | `md` | Max width |

**Accessibility:** Focus trap (focus-trap-react), Esc to close, body scroll lock, aria-modal, returnFocusOnDeactivate.

---

## Toast

```tsx
import { Toast } from '@/components/ui/Toast'

<Toast
  message="Sauvegardé avec succès"
  variant="success"
  isVisible={show}
  onDismiss={() => setShow(false)}
  duration={4000}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| message | `string` | — | Toast content |
| variant | `success` \| `error` \| `info` | `info` | Color + icon (Check, AlertTriangle, Info) |
| isVisible | `boolean` | — | Controls visibility |
| onDismiss | `() => void` | — | Called on dismiss or timeout |
| duration | `number` | `4000` | Auto-dismiss in ms (0 = no auto) |

---

## Tooltip

```tsx
import { Tooltip } from '@/components/ui/Tooltip'

<Tooltip content="Aide contextuelle">
  <button>?</button>
</Tooltip>

<Tooltip content="En bas" position="bottom">
  <span>Hover me</span>
</Tooltip>
```

| Prop | Type | Default |
|------|------|---------|
| content | `string` | — |
| position | `top` \| `bottom` | `top` |

**Triggers:** hover + focus (keyboard accessible).

---

## Avatar

```tsx
import { Avatar } from '@/components/ui/Avatar'

<Avatar src="/images/julia.jpeg" name="Julia" size="lg" />
<Avatar name="Thomas" size="md" />  {/* Shows "TH" initials */}
<Avatar size="sm" />  {/* Shows "?" */}
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | `string \| null` | — | Image URL (falls back to initials) |
| name | `string` | — | Used for initials + alt text |
| size | `sm` \| `md` \| `lg` \| `xl` | `md` | 32/40/56/80px |

---

## Tabs

```tsx
import { Tabs } from '@/components/ui/Tabs'

<Tabs
  tabs={[
    { key: 'cockpit', label: 'Cockpit', icon: '📊' },
    { key: 'tracker', label: 'Tracker', icon: '👁️' },
  ]}
  activeTab={activeTab}
  onChange={setActiveTab}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| tabs | `{ key: string; label: string; icon?: string }[]` | Tab definitions |
| activeTab | `string` | Currently active tab key |
| onChange | `(key: string) => void` | Called when tab changes |

**Accessibility:** `role="tablist"`, `role="tab"`, `aria-selected`.

---

## Design Tokens Reference

All components use CSS variables from `/app/globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--brand` | `#C9A961` | Primary CTA, links, focus rings |
| `--brand-deep` | `#B8960F` | Gradient endpoint |
| `--brand-alpha-weak` | `rgba(201,169,97,0.08)` | Secondary backgrounds |
| `--brand-alpha-medium` | `rgba(201,169,97,0.16)` | Borders, hover states |
| `--danger` | `#E85D5D` | Error states, destructive actions |
| `--success` | `#55EFC4` | Success states, validation |
| `--surface` | `#050505` | Page background |
| `--surface-card` | `rgba(255,255,255,0.05)` | Card backgrounds |
| `--border` | `rgba(255,255,255,0.08)` | All borders |
| `--text-primary` | `#e0e0e0` | Headings, primary text |
| `--text-secondary` | `#a1a1aa` | Body text, descriptions |
| `--text-muted` | `#52525b` | Labels, hints, metadata |
| `--shadow-sm/md/lg` | box-shadow values | Card/modal shadows |
| `--radius-sm/md/lg/xl` | 6/10/16/24px | Border radius |
| `--transition-fast/base/slow` | 150/250/400ms | Transition durations |
