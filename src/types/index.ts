/**
 * Reflecta — Type Definitions
 *
 * Shared TypeScript types for the entire application.
 * These types mirror the Firestore data model and Gemini response schemas.
 */

// ─── Decision Stages ─────────────────────────────────────────────────────────

/** The four sequential stages of the Reflecta decision flow */
export type DecisionStage =
  | 'understand'
  | 'explain'
  | 'explore'
  | 'challenge'
  | 'perspective'
  | 'reflect';

// ─── Core Decision Data ───────────────────────────────────────────────────────

/** User's decision and reasoning collected in stage 1 & 2 */
export interface DecisionInput {
  title: string;       // max 300 chars — "Should I accept a 6-month internship?"
  reasoning: string;   // max 5000 chars — user's initial reasoning
}

/** Classification of the user's reasoning (output of Gemini Explore analysis) */
export interface ReasoningAnalysis {
  known: string[];          // facts the user directly knows
  beliefs: string[];        // things user believes but hasn't established
  assumptions: string[];    // things user's reasoning depends on being true
  predictions: string[];    // things user expects to happen in future
  unclear: string[];        // things user hasn't established
  evidenceGaps: string[];   // weak or second-hand evidence found
  contradictions: string[]; // conflicting statements detected
  priorityChanges: string[];// priority drift across the conversation
  opportunityCost: string | null;   // what is given up by choosing this
  reversibility: string | null;     // how difficult to undo the decision
  bestNextQuestion: string;         // the single most important blind-spot question
  reasonForQuestion: string;        // why this question was chosen
}

/** A single challenge question with user's response */
export interface ChallengeExchange {
  question: string;
  userResponse: string;
  categoryTag?: 'ASSUMPTION TO EXPLORE' | 'MISSING INFORMATION' | 'POSSIBLE BLIND SPOT';
}

/** The final reflection summary shown at the end */
export interface ReflectionSummary {
  whatMatters: string[];        // core values/priorities discovered
  keyQuestion: string;          // the most important unresolved question
  mainUncertainties: string[];  // what the user still doesn't know
  newPerspective: string;       // something worth thinking about (opp. cost)
}

/** Complete decision session stored in Firestore */
export interface Decision {
  decisionId: string;
  userId: string;
  title: string;
  initialReasoning: string;
  createdAt: Date;
  updatedAt: Date;
  currentStage: DecisionStage;
  completed: boolean;
  analysis?: ReasoningAnalysis;
  challengeExchanges?: ChallengeExchange[];
  oppositeResponse?: string;
  reflection?: ReflectionSummary;
}

// ─── Firestore Document Shapes ────────────────────────────────────────────────

/** Shape stored in Firestore (uses server timestamps, serializable) */
export interface DecisionDocument {
  userId: string;
  title: string;
  initialReasoning: string;
  createdAt: unknown; // Firestore Timestamp
  updatedAt: unknown; // Firestore Timestamp
  currentStage: DecisionStage;
  completed: boolean;
  analysis?: ReasoningAnalysis;
  challengeExchanges?: ChallengeExchange[];
  oppositeResponse?: string;
  reflection?: ReflectionSummary;
}

// ─── API Request / Response Shapes ───────────────────────────────────────────

/** POST /api/analyze — body sent by client */
export interface AnalyzeRequest {
  title: string;
  reasoning: string;
}

/** POST /api/analyze — response from server */
export interface AnalyzeResponse {
  analysis: ReasoningAnalysis;
}

/** POST /api/challenge — body sent by client */
export interface ChallengeRequest {
  title: string;
  reasoning: string;
  analysis: ReasoningAnalysis;
  previousResponses: ChallengeExchange[];
}

/** POST /api/challenge — response from server */
export interface ChallengeResponse {
  question: string;
  reasonForQuestion: string;
  categoryTag?: 'ASSUMPTION TO EXPLORE' | 'MISSING INFORMATION' | 'POSSIBLE BLIND SPOT';
}

/** POST /api/reflect — body sent by client */
export interface ReflectRequest {
  title: string;
  reasoning: string;
  analysis: ReasoningAnalysis;
  challengeExchanges: ChallengeExchange[];
  oppositeResponse: string;
}

/** POST /api/reflect — response from server */
export interface ReflectResponse {
  reflection: ReflectionSummary;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

/** Application-level error codes for predictable error handling */
export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'AI_UNAVAILABLE'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

export interface AppError {
  code: AppErrorCode;
  message: string; // user-facing message
}

/** Current state of the decision flow maintained in React state */
export interface DecisionFlowState {
  stage: DecisionStage;
  input: Partial<DecisionInput>;
  analysis: ReasoningAnalysis | null;
  challengeExchanges: ChallengeExchange[];
  currentChallenge: string | null;
  currentCategoryTag?: 'ASSUMPTION TO EXPLORE' | 'MISSING INFORMATION' | 'POSSIBLE BLIND SPOT';
  oppositeResponse: string;
  reflection: ReflectionSummary | null;
  loading: boolean;
  error: AppError | null;
  savedDecisionId: string | null;
}
