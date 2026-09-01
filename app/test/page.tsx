import type { Metadata } from 'next'
import Test5QClient from './Test5QClient'

export const metadata: Metadata = {
  title: 'Ta signature émotionnelle · 3 minutes',
  description: 'Cinq questions sur ce que tu traverses maintenant. On nomme ton schéma, et par où commencer.',
}

export default function TestPage() {
  return <Test5QClient />
}
