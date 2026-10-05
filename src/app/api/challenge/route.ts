/**
 * Reflecta — API Route: POST /api/challenge
 * Generates a targeted challenge question based on user's reasoning and history.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ChallengeRequestSchema } from '@/lib/validation/schemas';
import { generateChallenge } from '@/lib/gemini/service';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }

  const parsed = ChallengeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 }
    );
  }

  const { title, reasoning, analysis, previousResponses } = parsed.data;

  try {
    const result = await generateChallenge(title, reasoning, analysis, previousResponses);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('[/api/challenge] Gemini error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json(
      { error: 'I couldn\'t process that just now. Your thoughts are safe. Try again.' },
      { status: 503 }
    );
  }
}
