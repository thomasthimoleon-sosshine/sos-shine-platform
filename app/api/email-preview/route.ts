import { NextResponse } from 'next/server'
import { generateEmail02 } from '@/lib/email-templates/quiz-v2/email-02-result'

export async function GET() {
  const { html } = generateEmail02({
    firstName: 'Marie',
    email: 'marie@example.com',
    dominant: '3',
    q15Response: 'Tu n\'es pas obligée de tout porter. Tu as le droit d\'être juste une enfant.',
  })

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
