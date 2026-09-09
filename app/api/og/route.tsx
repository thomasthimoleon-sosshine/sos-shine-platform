import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') || 'Briller Comme un Diamant'
  const subtitle =
    searchParams.get('subtitle') ||
    'Communauté bienveillante de transformation personnelle'

  // Load the logo from the public directory
  const logoUrl = new URL('/images/og-logo.png', req.nextUrl.origin)
  const logoData = await fetch(logoUrl).then((r) => r.arrayBuffer())
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoData).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1510 40%, #0d0d0d 100%)',
          position: 'relative',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Subtle gold radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '800px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(201,169,97,0.08) 0%, rgba(201,169,97,0.02) 50%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top gold line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
            display: 'flex',
          }}
        />

        {/* Logo */}
        <img
          src={logoBase64}
          width={200}
          height={200}
          style={{ marginBottom: '24px' }}
          alt=""
        />

        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#d4af37',
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            display: 'flex',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '22px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            marginTop: '16px',
            maxWidth: '700px',
            lineHeight: 1.4,
            display: 'flex',
          }}
        >
          {subtitle}
        </div>

        {/* Bottom tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'rgba(201,169,97,0.4)',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: '14px',
              color: 'rgba(201,169,97,0.6)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Corps &bull; Emotion &bull; Action
          </div>
          <div
            style={{
              width: '40px',
              height: '1px',
              background: 'rgba(201,169,97,0.4)',
              display: 'flex',
            }}
          />
        </div>

        {/* Bottom gold line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
