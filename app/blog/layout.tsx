import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog SOS Shine - Emotions, Transformation & Bien-etre',
  description:
    'Articles experts sur l\'intelligence emotionnelle, la transformation personnelle et le bien-etre. Guides pratiques bases sur les neurosciences par les fondateurs de SOS Shine.',
  openGraph: {
    title: 'Blog SOS Shine - Emotions, Transformation & Bien-etre',
    description:
      'Articles experts sur l\'intelligence emotionnelle, la transformation personnelle et le bien-etre. Guides pratiques bases sur les neurosciences.',
    type: 'website',
    siteName: 'SOS Shine',
    locale: 'fr_FR',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
