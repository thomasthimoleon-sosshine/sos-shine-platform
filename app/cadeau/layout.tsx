import { Cormorant_Garamond } from 'next/font/google'
import type { ReactNode } from 'react'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
})

export default function CadeauLayout({ children }: { children: ReactNode }) {
  return <div className={cormorant.variable} style={{ minHeight: '100vh' }}>{children}</div>
}
