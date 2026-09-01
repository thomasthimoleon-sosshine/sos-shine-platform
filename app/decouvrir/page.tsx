import type { Metadata } from 'next'
import DecouvrirClient from './DecouvrirClient'

export const metadata: Metadata = {
  title: 'Découvrir SOS Shine, La plateforme de déconditionnement émotionnel',
  description:
    'Comprenez pourquoi vous répétez les mêmes schémas émotionnels, et sortez-en. Une méthode en 3 étapes par Julia Laureau, auteure du Déconditionnement. Commencez par le test gratuit.',
  openGraph: {
    title: 'Découvrir SOS Shine, Déconditionnement émotionnel',
    description:
      'Pas du développement personnel. Du déconditionnement. Décodez vos schémas émotionnels et reprenez les commandes. Test gratuit en quelques minutes.',
  },
}

export default function DecouvrirPage() {
  return <DecouvrirClient />
}
