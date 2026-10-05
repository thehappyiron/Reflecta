/**
 * Reflecta — Zod Validation Schemas
 *
 * All external inputs (user form fields, API request bodies, Gemini responses)
 * are validated here before use. This is the authoritative validation layer —
 * never rely on frontend-only validation.
 */
import { z } from 'zod';

// ─── Input Limits (matching spec §10) ────────────────────────────────────────

export const INPUT_LIMITS = {
  DECISION_TITLE_MAX: 300,
  REASONING_MAX: 5000,
  CHALLENGE_RESPONSE_MAX: 5000,
  REFLECTION_MAX: 5000,
} as const;

// ─── User Input Schemas ───────────────────────────────────────────────────────

export const DecisionTitleSchema = z
  .string()
  .trim()
  .min(1, 'Please enter what you are deciding.')
  .max(INPUT_LIMITS.DECISION_TITLE_MAX, `Decision must be under ${INPUT_LIMITS.DECISION_TITLE_MAX} characters.`);

export const ReasoningTextSchema = z
  .string()
  .trim()
  .min(1, 'Please share your reasoning before continuing.')
  .max(INPUT_LIMITS.REASONING_MAX, `Reasoning must be under ${INPUT_LIMITS.REASONING_MAX} characters.`);

export const ChallengeResponseSchema = z
  .string()
  .trim()
  .min(1, 'Please write your thoughts before continuing.')
  .max(INPUT_LIMITS.CHALLENGE_RESPONSE_MAX, `Response must be under ${INPUT_LIMITS.CHALLENGE_RESPONSE_MAX} characters.`);

/** Validates the body sent to POST /api/analyze */
export const AnalyzeRequestSchema = z.object({
  title: DecisionTitleSchema,
  reasoning: ReasoningTextSchema,
});

/** Validates the body sent to POST /api/challenge */
export const ChallengeRequestSchema = z.object({
  title: DecisionTitleSchema,
  reasoning: ReasoningTextSchema,
  analysis: z.object({
    known: z.array(z.string()),
    beliefs: z.array(z.string()),
    assumptions: z.array(z.string()),
    predictions: z.array(z.string()),
    unclear: z.array(z.string()),
    evidenceGaps: z.array(z.string()),
    contradictions: z.array(z.string()),
    priorityChanges: z.array(z.string()),
    opportunityCost: z.string().nullable(),
    reversibility: z.string().nullable(),
    bestNextQuestion: z.string(),
    reasonForQuestion: z.string(),
  }),
  previousResponses: z.array(
    z.object({
      question: z.string(),
      userResponse: z.string(),
    })
  ).max(10), // prevent sending unlimited conversation history
});

/** Validates the body sent to POST /api/reflect */
export const ReflectRequestSchema = z.object({
  title: DecisionTitleSchema,
  reasoning: ReasoningTextSchema,
  analysis: z.object({
    known: z.array(z.string()),
    beliefs: z.array(z.string()),
    assumptions: z.array(z.string()),
    predictions: z.array(z.string()),
    unclear: z.array(z.string()),
    evidenceGaps: z.array(z.string()),
    contradictions: z.array(z.string()),
    priorityChanges: z.array(z.string()),
    opportunityCost: z.string().nullable(),
    reversibility: z.string().nullable(),
    bestNextQuestion: z.string(),
    reasonForQuestion: z.string(),
  }),
  challengeExchanges: z.array(
    z.object({
      question: z.string(),
      userResponse: z.string(),
    })
  ).max(10),
  oppositeResponse: z.string().max(INPUT_LIMITS.CHALLENGE_RESPONSE_MAX),
});

// ─── Gemini Response Schemas ──────────────────────────────────────────────────
// AI output is UNTRUSTED external data — always validate before use.

/** Schema for Gemini's structured reasoning analysis output */
export const ReasoningAnalysisSchema = z.object({
  known: z.array(z.string().max(500)).max(10),
  beliefs: z.array(z.string().max(500)).max(10),
  assumptions: z.array(z.string().max(500)).max(10),
  predictions: z.array(z.string().max(500)).max(10),
  unclear: z.array(z.string().max(500)).max(10),
  evidenceGaps: z.array(z.string().max(500)).max(5),
  contradictions: z.array(z.string().max(500)).max(5),
  priorityChanges: z.array(z.string().max(500)).max(5),
  opportunityCost: z.string().max(500).nullable(),
  reversibility: z.string().max(500).nullable(),
  bestNextQuestion: z.string().min(1).max(500),
  reasonForQuestion: z.string().min(1).max(500),
});

/** Schema for Gemini's challenge question output */
export const ChallengeQuestionSchema = z.object({
  question: z.string().min(1).max(500),
  reasonForQuestion: z.string().min(1).max(500),
  categoryTag: z.enum(['ASSUMPTION TO EXPLORE', 'MISSING INFORMATION', 'POSSIBLE BLIND SPOT']).optional(),
});

/** Schema for Gemini's final reflection output */
export const ReflectionSummarySchema = z.object({
  whatMatters: z.array(z.string().max(200)).min(1).max(5),
  keyQuestion: z.string().min(1).max(500),
  mainUncertainties: z.array(z.string().max(200)).min(1).max(3),
  newPerspective: z.string().min(1).max(500),
});
