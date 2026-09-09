import { NextResponse } from 'next/server'
import { generateEmail02 } from '@/lib/email-templates/quiz-v2/email-02-result'

export async function GET() {
  const { html } = generateEmail02({
    firstName: 'Marie',
    email: 'marie@example.com',
    dominant: '3',
    secondary: '9',
    scores: { '1': 40, '2': 20, '3': 100, '4': 60, '5': 30, '6': 50, '7': 35, '8': 25, '9': 80, '10': 45 },
    q15Response: 'Tu n\'es pas obligée de tout porter. Tu as le droit d\'être juste une enfant.',
    protocols: [
      { title: 'Déconditionnement Émotionnel', matchScore: 92, status: 'available', duration_days: 30 },
      { title: 'Confiance & Estime', matchScore: 85, status: 'coming_soon', duration_days: 21 },
    ],
  })

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
