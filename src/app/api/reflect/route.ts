/**
 * Reflecta — API Route: POST /api/reflect
 * Generates the final reflection summary synthesizing all stages.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ReflectRequestSchema } from '@/lib/validation/schemas';
import { generateReflection } from '@/lib/gemini/service';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // reflection is more expensive — lower limit
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

  const parsed = ReflectRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 }
    );
  }

  const { title, reasoning, analysis, challengeExchanges, oppositeResponse } = parsed.data;

  try {
    const reflection = await generateReflection(
      title, reasoning, analysis, challengeExchanges, oppositeResponse
    );
    return NextResponse.json({ reflection }, { status: 200 });
  } catch (error) {
    console.error('[/api/reflect] Gemini error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json(
      { error: 'I couldn\'t process that just now. Your thoughts are safe. Try again.' },
      { status: 503 }
    );
  }
}
