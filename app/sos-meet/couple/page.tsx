import type { Metadata } from 'next'
import CoupleClient from './CoupleClient'

export const metadata: Metadata = {
  title: 'Se retrouver — SOS Meet',
  description: 'Pour les couples qui veulent se re-rencontrer. Se retrouver coûte bien moins qu’une rupture.',
}

export default function CouplePage() {
  return <CoupleClient />
}
