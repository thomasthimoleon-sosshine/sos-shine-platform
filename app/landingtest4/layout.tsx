import { Fraunces, Figtree } from 'next/font/google'

const fraunces = Fraunces({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-fraunces', display: 'swap' })
const figtree = Figtree({ subsets: ['latin'], weight: ['300', '400', '500', '600'], variable: '--font-figtree', display: 'swap' })

export default function Landing4Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} ${figtree.variable}`}>{children}</div>
}
