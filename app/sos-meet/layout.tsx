import localFont from 'next/font/local'

// Auto-hébergé (public/fonts) — pas de dépendance réseau Google au build.
// Aligné sur la charte SOS Shine : serif = Cormorant, sans = DM Sans.
const serif = localFont({
  variable: '--font-fraunces',
  display: 'swap',
  src: [
    { path: '../../public/fonts/cormorant-garamond-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/cormorant-garamond-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../../public/fonts/cormorant-garamond-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/cormorant-garamond-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: '../../public/fonts/cormorant-garamond-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/cormorant-garamond-latin-600-italic.woff2', weight: '600', style: 'italic' },
  ],
})
const sans = localFont({
  variable: '--font-figtree',
  display: 'swap',
  src: [
    { path: '../../public/fonts/dm-sans-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: '../../public/fonts/dm-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/dm-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
})

export default function SosMeetLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${sans.variable}`}>{children}</div>
}
