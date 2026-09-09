'use client'

/**
 *  CADRAGE DE LA PHOTO DE PROFIL
 *  ─────────────────────────────
 *
 *  La photo partait telle quelle vers l'avatar, qui est carré et rond.
 *  Une photo de téléphone est presque toujours en portrait : le carré
 *  la prenait par le milieu, et le visage se retrouvait coupé — c'est
 *  exactement ce qui arrivait.
 *
 *  On choisit désormais soi-même ce qui rentre dans le rond. Le cercle
 *  affiché est celui de l'avatar : ce qu'on y voit est ce qu'on aura,
 *  aux vingt-deux endroits où la plateforme montre une photo ronde.
 *
 *  Tout est dessiné dans un seul canvas — l'aperçu et l'image finale
 *  partagent le même calcul, donc l'un ne peut pas mentir sur l'autre.
 */

import React from 'react'

/** Côté de l'image produite, en pixels. Large pour rester net sur écran Retina. */
const COTE_EXPORT = 512

/** Jusqu'où on peut agrandir : au-delà, la photo devient floue. */
const ZOOM_MAX = 4

type Source = { dessin: CanvasImageSource; largeur: number; hauteur: number }

/**
 * Charge le fichier en respectant l'orientation EXIF. Sans cela une photo
 * prise en tenant le téléphone de côté arrive couchée : le cadrage serait
 * juste à l'écran et faux à l'arrivée.
 */
async function chargerSource(fichier: File): Promise<Source> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(fichier, { imageOrientation: 'from-image' })
      return { dessin: bitmap, largeur: bitmap.width, hauteur: bitmap.height }
    } catch {
      /* Navigateur sans l'option : on retombe sur la balise image. */
    }
  }
  const url = URL.createObjectURL(fichier)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Image illisible'))
      el.src = url
    })
    return { dessin: img, largeur: img.naturalWidth, hauteur: img.naturalHeight }
  } finally {
    // L'URL n'est libérée qu'après le chargement : la révoquer plus tôt
    // annulerait le décodage sur certains navigateurs.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
}

type Props = {
  fichier: File
  /** Reçoit l'image carrée prête à envoyer. */
  onValider: (image: File) => void
  onAnnuler: () => void
  /** Affiché pendant que l'envoi est en cours. */
  envoiEnCours?: boolean
}

export default function CadrageAvatar({ fichier, onValider, onAnnuler, envoiEnCours = false }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [source, setSource] = React.useState<Source | null>(null)
  const [erreur, setErreur] = React.useState<string | null>(null)

  /** Côté de la fenêtre de cadrage, en pixels d'écran. */
  const [cote, setCote] = React.useState(300)
  const [zoom, setZoom] = React.useState(1)
  /** Décalage du centre de l'image par rapport au centre du cadre. */
  const decalage = React.useRef({ x: 0, y: 0 })
  const [, redessiner] = React.useReducer((n: number) => n + 1, 0)

  /* ── Chargement ──────────────────────────────────────────────────── */
  React.useEffect(() => {
    let vivant = true
    chargerSource(fichier)
      .then(s => { if (vivant) setSource(s) })
      .catch(() => { if (vivant) setErreur("Cette image n'a pas pu être ouverte.") })
    return () => { vivant = false }
  }, [fichier])

  /* ── Taille du cadre : il suit la fenêtre, sans jamais déborder ──── */
  React.useEffect(() => {
    function mesurer() {
      const dispo = Math.min(window.innerWidth - 72, window.innerHeight - 340)
      setCote(Math.max(200, Math.min(320, dispo)))
    }
    mesurer()
    window.addEventListener('resize', mesurer)
    return () => window.removeEventListener('resize', mesurer)
  }, [])

  /** Échelle à laquelle l'image couvre tout juste le cadre. */
  const couverture = source ? cote / Math.min(source.largeur, source.hauteur) : 1
  const k = couverture * zoom

  /**
   * Cadrage de départ. Une photo de téléphone est en portrait et le visage
   * s'y trouve presque toujours dans le haut : centrer le cadre le coupait
   * d'entrée — c'est très exactement ce qui se passait avant. On remonte
   * donc aux deux tiers, ce qui tombe juste dans la plupart des cas, et la
   * personne rectifie si besoin.
   */
  const cadrageInitial = React.useRef(false)
  React.useEffect(() => {
    if (!source || cadrageInitial.current) return
    cadrageInitial.current = true
    if (source.hauteur > source.largeur) {
      const maxY = Math.max(0, (source.hauteur * couverture - cote) / 2)
      decalage.current = { x: 0, y: maxY * 0.66 }
      redessiner()
    }
  }, [source, couverture, cote])

  /**
   * Zoomer doit agrandir autour du centre du cadre, pas autour du centre de
   * la photo. Sans cela, le sujet qu'on venait de placer dans le cercle en
   * ressortait dès qu'on zoomait — le décalage suit donc l'échelle.
   */
  const zoomPrecedent = React.useRef(zoom)
  if (zoomPrecedent.current !== zoom) {
    if (zoomPrecedent.current > 0) {
      const facteur = zoom / zoomPrecedent.current
      decalage.current.x *= facteur
      decalage.current.y *= facteur
    }
    zoomPrecedent.current = zoom
  }

  /** L'image doit toujours couvrir le cadre : on borne le décalage. */
  const borner = React.useCallback(() => {
    if (!source) return
    const maxX = Math.max(0, (source.largeur * k - cote) / 2)
    const maxY = Math.max(0, (source.hauteur * k - cote) / 2)
    decalage.current.x = Math.max(-maxX, Math.min(maxX, decalage.current.x))
    decalage.current.y = Math.max(-maxY, Math.min(maxY, decalage.current.y))
  }, [source, k, cote])

  /* ── Dessin de l'aperçu ──────────────────────────────────────────── */
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !source) return
    const ratio = window.devicePixelRatio || 1
    canvas.width = cote * ratio
    canvas.height = cote * ratio
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, cote, cote)

    borner()
    const l = source.largeur * k
    const h = source.hauteur * k
    ctx.drawImage(
      source.dessin,
      cote / 2 + decalage.current.x - l / 2,
      cote / 2 + decalage.current.y - h / 2,
      l,
      h,
    )

    // Hors du cercle, on assombrit : le regard va droit à ce qui compte.
    ctx.save()
    ctx.fillStyle = 'rgba(10, 8, 6, 0.62)'
    ctx.beginPath()
    ctx.rect(0, 0, cote, cote)
    // moveTo avant l'arc : sinon il se raccorde au rectangle par un trait,
    // les deux tracés n'en font plus qu'un et le pair-impair ne creuse rien.
    ctx.moveTo(cote, cote / 2)
    ctx.arc(cote / 2, cote / 2, cote / 2, 0, Math.PI * 2)
    ctx.fill('evenodd')
    ctx.restore()

    ctx.strokeStyle = 'rgba(201, 169, 97, 0.85)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cote / 2, cote / 2, cote / 2 - 1, 0, Math.PI * 2)
    ctx.stroke()
  })

  /* ── Déplacer et zoomer ──────────────────────────────────────────── */
  const pointeurs = React.useRef(new Map<number, { x: number; y: number }>())
  const pince = React.useRef<{ distance: number; zoom: number } | null>(null)

  function distanceEntrePointeurs() {
    const [a, b] = [...pointeurs.current.values()]
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointeurs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointeurs.current.size === 2) pince.current = { distance: distanceEntrePointeurs(), zoom }
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    const precedent = pointeurs.current.get(e.pointerId)
    if (!precedent) return
    pointeurs.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointeurs.current.size >= 2 && pince.current) {
      const d = distanceEntrePointeurs()
      if (pince.current.distance > 0) {
        setZoom(bornerZoom(pince.current.zoom * (d / pince.current.distance)))
      }
      return
    }
    decalage.current.x += e.clientX - precedent.x
    decalage.current.y += e.clientY - precedent.y
    borner()
    redessiner()
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    pointeurs.current.delete(e.pointerId)
    if (pointeurs.current.size < 2) pince.current = null
  }

  function bornerZoom(valeur: number) {
    return Math.max(1, Math.min(ZOOM_MAX, valeur))
  }

  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    setZoom(z => bornerZoom(z * (e.deltaY < 0 ? 1.08 : 1 / 1.08)))
  }

  /** Flèches du clavier : le cadrage doit rester atteignable sans souris. */
  function onKeyDown(e: React.KeyboardEvent<HTMLCanvasElement>) {
    const pas = e.shiftKey ? 20 : 6
    const mouvements: Record<string, [number, number]> = {
      ArrowLeft: [pas, 0], ArrowRight: [-pas, 0], ArrowUp: [0, pas], ArrowDown: [0, -pas],
    }
    const m = mouvements[e.key]
    if (m) {
      e.preventDefault()
      decalage.current.x += m[0]
      decalage.current.y += m[1]
      borner()
      redessiner()
      return
    }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(z => bornerZoom(z * 1.12)) }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); setZoom(z => bornerZoom(z / 1.12)) }
  }

  /* ── Découpe finale ──────────────────────────────────────────────── */
  async function valider() {
    if (!source) return
    borner()
    const sortie = document.createElement('canvas')
    sortie.width = COTE_EXPORT
    sortie.height = COTE_EXPORT
    const ctx = sortie.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingQuality = 'high'

    // Coin haut-gauche du cadre, exprimé en pixels de l'image d'origine.
    const coteSource = cote / k
    const sx = source.largeur / 2 - (cote / 2 + decalage.current.x) / k
    const sy = source.hauteur / 2 - (cote / 2 + decalage.current.y) / k
    ctx.drawImage(source.dessin, sx, sy, coteSource, coteSource, 0, 0, COTE_EXPORT, COTE_EXPORT)

    const blob = await new Promise<Blob | null>(r => sortie.toBlob(r, 'image/jpeg', 0.92))
    if (!blob) { setErreur("Le cadrage n'a pas pu être enregistré."); return }
    const nom = fichier.name.replace(/\.[^/.]+$/, '') || 'photo'
    onValider(new File([blob], `${nom}.jpg`, { type: 'image/jpeg' }))
  }

  /* ── Rendu ───────────────────────────────────────────────────────── */
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(6, 5, 4, 0.82)', backdropFilter: 'blur(6px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Cadrer la photo de profil"
      onClick={e => { if (e.target === e.currentTarget && !envoiEnCours) onAnnuler() }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-7"
        style={{ background: 'var(--surface-overlay, var(--surface-card))', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)' }}
      >
        <h2 className="font-display text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Cadrez votre photo
        </h2>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
          Déplacez la photo et ajustez le zoom. Ce qui apparaît dans le cercle sera votre avatar.
        </p>

        <div className="flex justify-center">
          {source ? (
            <canvas
              ref={canvasRef}
              tabIndex={0}
              role="application"
              aria-label="Zone de cadrage : déplacez avec les flèches, zoomez avec + et -"
              className="rounded-2xl cursor-grab active:cursor-grabbing touch-none outline-none"
              style={{ width: cote, height: cote, border: '1px solid var(--border)' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              onKeyDown={onKeyDown}
            />
          ) : (
            <div
              className="rounded-2xl flex items-center justify-center"
              style={{ width: cote, height: cote, background: 'rgba(201,169,97,0.06)', border: '1px solid var(--border)' }}
            >
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {erreur || 'Ouverture de la photo…'}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button type="button" onClick={() => setZoom(z => bornerZoom(z / 1.2))} disabled={!source}
            aria-label="Réduire" className="w-8 h-8 rounded-lg text-lg leading-none cursor-pointer disabled:opacity-40"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>−</button>
          <input
            type="range"
            min={1}
            max={ZOOM_MAX}
            step={0.01}
            value={zoom}
            disabled={!source}
            onChange={e => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="flex-1 cursor-pointer"
            style={{ accentColor: 'var(--brand)' }}
          />
          <button type="button" onClick={() => setZoom(z => bornerZoom(z * 1.2))} disabled={!source}
            aria-label="Agrandir" className="w-8 h-8 rounded-lg text-lg leading-none cursor-pointer disabled:opacity-40"
            style={{ color: 'var(--brand)', border: '1px solid var(--border)' }}>+</button>
        </div>

        {erreur && source && (
          <p className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}>
            {erreur}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onAnnuler}
            disabled={envoiEnCours}
            className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={valider}
            disabled={!source || envoiEnCours}
            className="px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: 'var(--brand)', color: 'var(--surface)' }}
          >
            {envoiEnCours ? 'Envoi…' : 'Utiliser cette photo'}
          </button>
        </div>
      </div>
    </div>
  )
}
