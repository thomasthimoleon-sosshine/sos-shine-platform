import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'SOS Meet — Rencontres conscientes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6B4E9B 0%, #9B7EC8 60%, #C9A96E 130%)',
          color: '#FAF7F2',
          fontFamily: 'Georgia, serif',
          padding: 80,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 8, textTransform: 'uppercase', opacity: 0.85, marginBottom: 28 }}>
          Par l&apos;équipe SOS Shine
        </div>
        <div style={{ fontSize: 92, fontWeight: 600, lineHeight: 1.05, marginBottom: 26 }}>
          Rencontrez en conscience.
        </div>
        <div style={{ fontSize: 34, opacity: 0.9, maxWidth: 900, lineHeight: 1.35 }}>
          L&apos;app de rencontres pour celles et ceux qui ont déjà commencé le chemin.
        </div>
      </div>
    ),
    { ...size }
  )
}
