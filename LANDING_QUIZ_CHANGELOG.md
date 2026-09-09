# Landing Page Quiz — Changelog

**Date :** 26 avril 2026
**URL :** `/quiz`
**Objectif :** Convertir trafic froid (Pinterest, blog, réseaux) vers le quiz

---

## Fichiers créés

- `app/quiz/page.tsx` — Route + metadata SEO + OG
- `app/quiz/QuizLandingClient.tsx` — Page complète (7 sections)

## Structure

1. **Hero** — Phrase d'accroche + CTA principal + étoiles
2. **Pourquoi différent** — Positionnement vs tests classiques
3. **En 3 étapes** — Parcours utilisateur simplifié
4. **Témoignages** — 4 témoignages (Camille, Léa, Sophie, Marc)
5. **Julia Laureau** — Crédibilité auteure + livre
6. **FAQ** — 5 questions fréquentes en accordéon
7. **CTA final** — Dernier push avant footer

## CTA tracking

3 CTA trackés via `quiz_v2_events` :
- `hero` — Bouton principal hero
- `section_4` — Après témoignages
- `footer` — CTA final

Event type : `landing_quiz_cta_clicked`

## SEO

- Title : "Découvre ta Signature Émotionnelle — Quiz gratuit | SOS Shine"
- Description : "Un test en 3 minutes pour comprendre pourquoi tu réagis comme ça..."
- Open Graph configuré

## Design

- Mobile-first, 0 image lourde
- Animations fade-in au scroll (Framer Motion)
- Pas de menu navigation (focus conversion)
- Footer minimal (mentions légales uniquement)

## Tests

- [x] `npm run build` vert
- [ ] Responsive mobile (iPhone SE, 14 Pro)
- [ ] Tous CTA pointent vers /signature-emotionnelle
- [ ] Tracking events fonctionnel
