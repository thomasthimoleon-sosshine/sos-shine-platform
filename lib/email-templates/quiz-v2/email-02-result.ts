interface Email02Params {
  firstName: string
  email: string
  dominant: string
  secondary: string
  scores: Record<string, number>
  q15Response: string
  protocols: Array<{ title: string; matchScore: number; status: string; duration_days: number }>
}

export function generateEmail02(params: Email02Params): { subject: string; html: string } {
  const { firstName } = params
  return {
    subject: `${firstName}, voici votre signature émotionnelle`,
    html: `<p>Bonjour ${firstName},</p><p>Merci d'avoir complété le quiz.</p>`,
  }
}
