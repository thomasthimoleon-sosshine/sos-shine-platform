import localFont from 'next/font/local'
import type { ReactNode } from 'react'

// Auto-hébergé (public/fonts) — pas de dépendance réseau Google au build.
const cormorant = localFont({
  variable: '--font-cormorant',
  display: 'swap',
  src: [
    { path: '../../public/fonts/cormorant-garamond-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/cormorant-garamond-latin-300-italic.woff2', weight: '300', style: 'italic' },
    { path: '../../public/fonts/cormorant-garamond-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/cormorant-garamond-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../public/fonts/cormorant-garamond-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/cormorant-garamond-latin-600-italic.woff2', weight: '600', style: 'italic' },
  ],
})

export default function CadeauLayout({ children }: { children: ReactNode }) {
  return <div className={cormorant.variable} style={{ minHeight: '100vh' }}>{children}</div>
}
