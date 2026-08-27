import type { Metadata } from 'next'
import CarteClient from './CarteClient'

export const metadata: Metadata = {
  title: 'Notre lecture — SOS Meet',
  description: 'La carte de votre relation.',
  robots: { index: false, follow: false },
}

export default function CartePage() { return <CarteClient /> }
