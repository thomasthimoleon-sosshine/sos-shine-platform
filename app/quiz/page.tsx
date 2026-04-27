import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Découvre ta Signature Émotionnelle — Quiz gratuit | SOS Shine',
  description: 'Un test en 3 minutes pour comprendre pourquoi tu réagis comme ça. 15 questions, 10 dimensions émotionnelles, un résultat personnalisé. Gratuit, sans inscription.',
  openGraph: {
    title: 'Découvre ta Signature Émotionnelle — Quiz gratuit',
    description: 'Un test en 3 minutes pour comprendre pourquoi tu réagis comme ça. 15 questions, un résultat personnalisé.',
    url: 'https://sosshine.com/quiz',
    siteName: 'SOS Shine',
    type: 'website',
  },
}

export { default } from './QuizLandingClient'
