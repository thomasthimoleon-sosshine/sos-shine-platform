import type { Metadata } from 'next'
import MessagesClient from './MessagesClient'

export const metadata: Metadata = {
  title: 'Mes rencontres — SOS Meet',
  description: 'Vos connexions et vos conversations.',
  robots: { index: false, follow: false },
}

export default function MessagesPage() {
  return <MessagesClient />
}
