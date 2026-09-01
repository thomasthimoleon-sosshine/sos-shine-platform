'use client'

import { useRef, useState } from 'react'

type SmartVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  /** URL de la vidéo. */
  src: string
  /** Image de secours (affichée pendant le chargement et en cas d'échec). */
  poster?: string
}

/**
 * Lecteur vidéo robuste : chargement léger par défaut (`metadata`), lecture
 * inline mobile, et — surtout — un message clair au lieu de l'icône « lecture
 * barrée » du navigateur quand la source ne peut pas être décodée (typiquement
 * une ancienne vidéo iPhone HEVC/.MOV).
 */
export default function SmartVideo({
  src,
  poster,
  preload = 'metadata',
  playsInline = true,
  className,
  children,
  ...rest
}: SmartVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={className}
        role="alert"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          minHeight: 140,
          padding: '1.5rem',
          textAlign: 'center',
          background: poster ? `center/cover no-repeat url("${poster}")` : 'rgba(10,8,6,0.9)',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,8,6,0.78)' }} />
        <span style={{ position: 'relative', fontSize: 24 }}>⌛</span>
        <p style={{ position: 'relative', color: '#F5EFE3', fontSize: 14, maxWidth: 320, lineHeight: 1.5 }}>
          Cette vidéo n’a pas pu se charger.
        </p>
        <button
          type="button"
          onClick={() => { setFailed(false); ref.current?.load() }}
          style={{
            position: 'relative', color: '#C9A961', background: 'transparent',
            border: '1px solid rgba(201,169,97,0.5)', borderRadius: 999,
            padding: '0.4rem 1.1rem', fontSize: 12, letterSpacing: '0.08em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      preload={preload}
      playsInline={playsInline}
      className={className}
      {...rest}
      onError={() => setFailed(true)}
    >
      {children}
    </video>
  )
}
