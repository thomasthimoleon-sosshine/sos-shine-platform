export function calculateMatchScores(
  scores: Record<string, number>,
  weights: Record<string, number>
): number {
  if (!scores || !weights) return 0
  let total = 0
  let weightSum = 0
  for (const [dim, weight] of Object.entries(weights)) {
    const score = scores[dim] ?? 0
    total += score * weight
    weightSum += weight
  }
  return weightSum === 0 ? 0 : Math.round((total / weightSum) * 100)
}

export function getDominantDimensions(
  scores: Record<string, number>
): { dominant: string; secondary: string } {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return {
    dominant: sorted[0]?.[0] ?? '1',
    secondary: sorted[1]?.[0] ?? '2',
  }
}
