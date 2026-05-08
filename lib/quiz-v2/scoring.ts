/**
 * SOS Shine — Quiz V2 Scoring Engine
 * Multidimensional scoring across 10 emotional dimensions (0-100)
 */

import type { DimensionScores } from './dimensions'
import type { Question } from './questions'
import { QUESTIONS } from './questions'
import scoringKeywordsData from '@/config/scoring-keywords.json'

type ScoringKeywords = {
  dimensions: Record<string, { name: string; keywords: string[] }>
  points_per_keyword: number
}

const scoringKeywords = scoringKeywordsData as ScoringKeywords

// Response types stored in quiz_v2_responses.responses JSONB
export type QuizResponse = {
  choiceIndexes?: number[]    // for single/multi
  sliderValue?: number        // for slider
  freeText?: string           // for freetext / other field
}

export type AllResponses = Record<number, QuizResponse>

/**
 * Calculate raw scores from all responses
 */
export function calculateRawScores(responses: AllResponses): DimensionScores {
  const raw: DimensionScores = {}
  for (let i = 1; i <= 10; i++) raw[String(i)] = 0

  for (const [qIdStr, response] of Object.entries(responses)) {
    const qId = parseInt(qIdStr, 10)
    const question = QUESTIONS.find(q => q.id === qId)
    if (!question) continue

    // Score from choices (single or multi)
    if (response.choiceIndexes && question.choices) {
      for (const idx of response.choiceIndexes) {
        const choice = question.choices[idx]
        if (!choice) continue
        for (const [dim, pts] of Object.entries(choice.scores)) {
          raw[dim] = (raw[dim] || 0) + pts
        }
      }
    }

    // Score from slider
    if (response.sliderValue !== undefined && question.sliderScoring) {
      const sliderScores = question.sliderScoring(response.sliderValue)
      for (const [dim, pts] of Object.entries(sliderScores)) {
        raw[dim] = (raw[dim] || 0) + pts
      }
    }

    // Score from free text (keyword detection)
    if (response.freeText) {
      const textScores = scoreFreeText(response.freeText)
      for (const [dim, pts] of Object.entries(textScores)) {
        raw[dim] = (raw[dim] || 0) + pts
      }
    }
  }

  return raw
}

/**
 * Score free text by detecting keywords
 */
function scoreFreeText(text: string): DimensionScores {
  const scores: DimensionScores = {}
  const normalized = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const ptsPerKeyword = scoringKeywords.points_per_keyword

  for (const [dim, config] of Object.entries(scoringKeywords.dimensions)) {
    for (const keyword of config.keywords) {
      const normalizedKw = keyword.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      if (normalized.includes(normalizedKw)) {
        scores[dim] = (scores[dim] || 0) + ptsPerKeyword
      }
    }
  }

  return scores
}

// Theoretical maximum raw score per dimension, computed from all questions.
// Ensures fair comparison: dim 4 (24 pts available) vs dim 5 (12 pts available)
// are normalized independently rather than relative to each other.
const DIMENSION_MAX_SCORES: Record<string, number> = {
  '1': 20, '2': 18, '3': 19, '4': 24,
  '5': 12, '6': 12, '7': 15, '8': 13,
  '9': 14, '10': 17,
}

/**
 * Normalize raw scores to 0-100 scale
 * Uses per-dimension theoretical maxima so all 10 dimensions are comparable.
 */
export function normalizeScores(raw: DimensionScores): DimensionScores {
  const normalized: DimensionScores = {}
  for (const [dim, score] of Object.entries(raw)) {
    const maxForDim = DIMENSION_MAX_SCORES[dim] || 20
    normalized[dim] = Math.min(100, Math.round((score / maxForDim) * 100))
  }
  return normalized
}

/**
 * Get dominant and secondary dimensions
 */
export function getDominantDimensions(scores: DimensionScores): {
  dominant: string
  secondary: string
} {
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a)
  return {
    dominant: sorted[0]?.[0] || '1',
    secondary: sorted[1]?.[0] || '2',
  }
}

/**
 * Calculate protocol match scores
 */
export function calculateMatchScores(
  userScores: DimensionScores,
  protocolWeights: Record<string, number>
): number {
  let totalMatch = 0
  let totalWeight = 0

  for (const [dim, weight] of Object.entries(protocolWeights)) {
    const userScore = userScores[dim] || 0
    totalMatch += userScore * weight
    totalWeight += weight * 100
  }

  if (totalWeight === 0) return 0
  return Math.round((totalMatch / totalWeight) * 100)
}

/**
 * Full scoring pipeline: responses → normalized scores → dominant dims
 */
export function processQuizResults(responses: AllResponses) {
  const raw = calculateRawScores(responses)
  const normalized = normalizeScores(raw)
  const { dominant, secondary } = getDominantDimensions(normalized)

  return {
    raw,
    scores: normalized,
    dominant,
    secondary,
  }
}
