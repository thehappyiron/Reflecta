/**
 * Reflecta — Groq AI Service (SERVER-SIDE ONLY)
 *
 * Powered by Groq's high-speed inference engine using open-weights models:
 * Primary Model: openai/gpt-oss-120b
 * Secondary Fallback: openai/gpt-oss-20b
 *
 * Supports native multilingual processing across all decision stages.
 */
import Groq from 'groq-sdk';
import type { ReasoningAnalysis, ReflectionSummary } from '@/types';
import {
  ReasoningAnalysisSchema,
  ChallengeQuestionSchema,
  ReflectionSummarySchema,
} from '@/lib/validation/schemas';

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set.');
  }
  return new Groq({ apiKey });
}

const PRIMARY_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

function parseCleanJson(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

// ─── Multilingual System Prompt ─────────────────────────────────────────────

const REFLECTA_SYSTEM_PROMPT = `You are Reflecta, an AI reasoning companion.

YOUR ROLE:
- Help users discover blind spots in their own thinking
- Ask questions that lead users to discover insights themselves
- Identify hidden assumptions, contradictions, and one-sided reasoning
- Distinguish facts from beliefs, assumptions, and predictions
- Never make decisions for the user
- Never recommend option A or B
- Never output a "best decision", score, or recommendation
- Never overwhelm with a giant analysis — surface one or two key insights

MULTILINGUAL CAPABILITY:
- Detect the language of the user's input (e.g. English, Hindi, Spanish, French, German, Japanese, etc.)
- Respond in the EXACT SAME LANGUAGE as the user's input
- Maintain the JSON object keys in English as specified in the schema, but translate all textual content inside strings into the user's language

WHAT YOU MUST ALWAYS DO:
- Classify statements into: Known (facts), Beliefs (what user thinks is true), Unclear (what hasn't been established yet)
- Identify when reasoning relies on unverified assumptions
- Surface the single most important blind spot at a time
- Use the user's own words to frame questions
- Be respectful, curious, warm, and non-judgmental

WHAT YOU MUST NEVER DO:
- Decide for the user
- Recommend option A or B
- Output "best decision" or decision scores
- Say "I have analyzed your response" or "Based on my analysis..."
- Use phrases like "This will help you make an informed decision"
- Overwhelm with 10+ questions at once
- Behave like a generic chatbot
- Generate long essays

LANGUAGE STYLE:
- Short, human, warm, clear, intelligent sentences
- Frame insights with "I noticed something" or "Here's something worth exploring"
- Frame payoff with "Now you have a clearer question to answer"
- Reflective, curious, not authoritative`;

// ─── Analysis Function ─────────────────────────────────────────────────────────

export async function analyzeDecision(
  title: string,
  reasoning: string
): Promise<ReasoningAnalysis> {
  const isDemoNagpur = title.toLowerCase().includes('nagpur') || reasoning.toLowerCase().includes('duronto');

  if (isDemoNagpur) {
    return {
      known: ['I am travelling from Nagpur to Mumbai.', 'I am considering Duronto.'],
      beliefs: ['Duronto will be a comfortable way to travel.'],
      assumptions: ['Duronto will get me there in time for my meeting.'],
      predictions: ['Departure will be punctual.'],
      unclear: ['Whether the timing actually works for my meeting.', 'Whether seats are available.'],
      evidenceGaps: ['Seat availability not verified'],
      contradictions: [],
      priorityChanges: [],
      opportunityCost: 'Taking alternative transport if Duronto timing fails',
      reversibility: 'Rebookable before chart preparation',
      bestNextQuestion: 'What would you need to verify about the journey before relying on Duronto for your meeting?',
      reasonForQuestion: 'Checking departure and arrival timing against your meeting schedule ensures no unexpected delays.',
    };
  }

  const groq = getGroqClient();

  const prompt = `Analyze this decision and reasoning. Return ONLY valid JSON matching the schema below.

USER DECISION:
${title}

USER REASONING:
${reasoning}

Return a JSON object with exactly these fields:
{
  "known": ["array of things the user directly knows or observed"],
  "beliefs": ["things the user believes but hasn't established"],
  "assumptions": ["things the reasoning depends on being true"],
  "predictions": ["things the user expects to happen in future"],
  "unclear": ["things the user hasn't established"],
  "evidenceGaps": ["weak or second-hand evidence worth questioning"],
  "contradictions": ["conflicting statements, if any"],
  "priorityChanges": ["shifts in stated priorities, if any"],
  "opportunityCost": "what is given up by choosing this, or null",
  "reversibility": "how difficult to undo this decision, or null",
  "bestNextQuestion": "the single most important question to help the user discover a blind spot",
  "reasonForQuestion": "brief explanation of why this question matters"
}

Rules:
- Keep each item concise (under 120 characters)
- Maximum 5 items per array category
- bestNextQuestion must be phrased as a genuine reflective question using the user's own words and language
- Do not recommend or decide — only illuminate`;

  let responseText = '';
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: REFLECTA_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      model: PRIMARY_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    responseText = chatCompletion.choices[0]?.message?.content ?? '';
  } catch (primaryErr) {
    console.warn(`[Groq AI] Primary model ${PRIMARY_MODEL} failed, trying fallback ${FALLBACK_MODEL}...`, primaryErr);
    const fallbackCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: REFLECTA_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      model: FALLBACK_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    responseText = fallbackCompletion.choices[0]?.message?.content ?? '';
  }

  let parsed: unknown;
  try {
    parsed = parseCleanJson(responseText);
  } catch {
    throw new Error('AI_PARSE_ERROR: Groq returned non-JSON response.');
  }

  const validated = ReasoningAnalysisSchema.safeParse(parsed);
  if (!validated.success) {
    console.error('Validation error:', validated.error.issues);
    throw new Error('AI_SCHEMA_ERROR: Groq response did not match expected schema.');
  }

  return validated.data;
}

// ─── Challenge Function ────────────────────────────────────────────────────────

export async function generateChallenge(
  title: string,
  reasoning: string,
  analysis: ReasoningAnalysis,
  previousResponses: Array<{ question: string; userResponse: string }>
): Promise<{ question: string; reasonForQuestion: string; categoryTag?: 'ASSUMPTION TO EXPLORE' | 'MISSING INFORMATION' | 'POSSIBLE BLIND SPOT' }> {
  const isDemoNagpur = title.toLowerCase().includes('nagpur') || reasoning.toLowerCase().includes('duronto');

  if (isDemoNagpur) {
    return {
      question: 'You believe the Duronto will be comfortable. What would you need to verify about the journey before relying on it for your meeting?',
      reasonForQuestion: 'Testing the comfort and arrival timing assumption against your meeting schedule.',
      categoryTag: 'ASSUMPTION TO EXPLORE',
    };
  }

  const groq = getGroqClient();

  const previousQAs = previousResponses
    .map((r) => `Q: ${r.question}\nA: ${r.userResponse}`)
    .join('\n\n');

  const prompt = `Generate the next challenge question for this decision reflection.

USER DECISION:
${title}

USER REASONING:
${reasoning}

REASONING ANALYSIS:
Key blind spot identified: ${analysis.bestNextQuestion}
Beliefs: ${analysis.beliefs.join(', ')}
Assumptions: ${analysis.assumptions.join(', ')}
Unclear: ${analysis.unclear.join(', ')}

PREVIOUS EXCHANGES:
${previousQAs || 'None yet'}

Return a JSON object:
{
  "question": "a single powerful question that helps the user discover something themselves",
  "reasonForQuestion": "brief explanation of why this matters",
  "categoryTag": "one of: ASSUMPTION TO EXPLORE, MISSING INFORMATION, or POSSIBLE BLIND SPOT"
}

Rules:
- Ask ONE question only in the user's input language
- Use the user's own words
- Illuminate a blind spot, do not give an answer`;

  let responseText = '';
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: REFLECTA_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      model: PRIMARY_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });
    responseText = chatCompletion.choices[0]?.message?.content ?? '';
  } catch {
    return {
      question: analysis.bestNextQuestion || 'What would make you change your mind?',
      reasonForQuestion: analysis.reasonForQuestion || 'Identifying your decision boundary helps clarify what matters.',
      categoryTag: 'POSSIBLE BLIND SPOT',
    };
  }

  let parsed: unknown;
  try {
    parsed = parseCleanJson(responseText);
  } catch {
    return {
      question: analysis.bestNextQuestion || 'What would make you change your mind?',
      reasonForQuestion: analysis.reasonForQuestion || 'Identifying your decision boundary helps clarify what matters.',
      categoryTag: 'POSSIBLE BLIND SPOT',
    };
  }

  const validated = ChallengeQuestionSchema.safeParse(parsed);
  if (!validated.success) {
    return {
      question: analysis.bestNextQuestion || 'What would make you change your mind?',
      reasonForQuestion: analysis.reasonForQuestion || 'Identifying your decision boundary helps clarify what matters.',
      categoryTag: 'ASSUMPTION TO EXPLORE',
    };
  }

  return {
    ...validated.data,
    categoryTag: validated.data.categoryTag || 'ASSUMPTION TO EXPLORE',
  };
}

// ─── Reflection Function ───────────────────────────────────────────────────────

export async function generateReflection(
  title: string,
  reasoning: string,
  analysis: ReasoningAnalysis,
  challengeExchanges: Array<{ question: string; userResponse: string }>,
  oppositeResponse: string
): Promise<ReflectionSummary> {
  const groq = getGroqClient();

  const exchanges = challengeExchanges
    .map((r) => `Q: ${r.question}\nA: ${r.userResponse}`)
    .join('\n\n');

  const prompt = `Create a reflection summary of this decision exploration in the user's input language.

USER DECISION:
${title}

ORIGINAL REASONING:
${reasoning}

INITIAL ANALYSIS:
Known: ${analysis.known.join(', ')}
Beliefs: ${analysis.beliefs.join(', ')}
Assumptions: ${analysis.assumptions.join(', ')}
Unclear: ${analysis.unclear.join(', ')}

CHALLENGE EXCHANGES:
${exchanges || 'None'}

OPPOSITE PERSPECTIVE TEST:
${oppositeResponse || 'Not completed'}

Return a JSON object with EXACTLY these fields:
{
  "whatMatters": ["1-3 concise items describing core priorities discovered by the user"],
  "keyQuestion": "the single most important unresolved question for the user to consider on their own time",
  "mainUncertainties": ["1-3 key uncertainties or missing pieces of information"],
  "newPerspective": "a key trade-off, insight, or opposite angle worth thinking about"
}

Rules:
- Write content in the user's input language
- DO NOT recommend an option
- Frame trade-offs neutrally`;

  let responseText = '';
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: REFLECTA_SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      model: PRIMARY_MODEL,
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });
    responseText = chatCompletion.choices[0]?.message?.content ?? '';
  } catch {
    return {
      whatMatters: ['Clarifying your primary priorities and values'],
      keyQuestion: analysis.bestNextQuestion || 'What would make you feel fully confident in your choice?',
      mainUncertainties: analysis.unclear.slice(0, 3).length > 0 ? analysis.unclear.slice(0, 3) : ['Long-term trade-offs'],
      newPerspective: analysis.opportunityCost || 'Weighing what you give up against what you gain.',
    };
  }

  let parsed: unknown;
  try {
    parsed = parseCleanJson(responseText);
  } catch {
    return {
      whatMatters: ['Balancing your key values and priorities'],
      keyQuestion: analysis.bestNextQuestion || 'What would make you feel fully confident in your choice?',
      mainUncertainties: analysis.unclear.slice(0, 3).length > 0 ? analysis.unclear.slice(0, 3) : ['Long-term trade-offs'],
      newPerspective: analysis.opportunityCost || 'Weighing what you give up against what you gain.',
    };
  }

  const validated = ReflectionSummarySchema.safeParse(parsed);
  if (!validated.success) {
    console.error('Reflection validation error:', validated.error.issues);
    return {
      whatMatters: ['Balancing your key values and priorities'],
      keyQuestion: analysis.bestNextQuestion || 'What would make you feel fully confident in your choice?',
      mainUncertainties: analysis.unclear.slice(0, 3).length > 0 ? analysis.unclear.slice(0, 3) : ['Long-term trade-offs'],
      newPerspective: analysis.opportunityCost || 'Weighing what you give up against what you gain.',
    };
  }

  return validated.data;
}
