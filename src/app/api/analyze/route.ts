/**
 * Reflecta — API Route: POST /api/analyze
 *
 * Server-side endpoint that receives the user's decision title and reasoning,
 * calls Gemini to classify and analyze the reasoning, and returns structured data.
 *
 * Security: Gemini API key is only accessed server-side here.
 * Validation: Input is validated with Zod before reaching Gemini.
 * Rate-limiting: Basic IP-based check prevents abuse.
 */
import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/lib/validation/schemas';
import { analyzeDecision } from '@/lib/gemini/service';

// Simple in-memory rate limit store (production would use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;       // max requests per window
const WINDOW_MS = 60 * 1000; // 1 minute window

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
  // Rate limiting — never rely solely on client-side button disabling
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request format.' },
      { status: 400 }
    );
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 }
    );
  }

  const { title, reasoning } = parsed.data;

  try {
    const analysis = await analyzeDecision(title, reasoning);
    return NextResponse.json({ analysis }, { status: 200 });
  } catch (error) {
    // Log safe technical metadata — never log user content or secrets
    console.error('[/api/analyze] Gemini error:', error instanceof Error ? error.message : 'unknown');

    return NextResponse.json(
      { error: 'I couldn\'t process that just now. Your thoughts are safe. Try again.' },
      { status: 503 }
    );
  }
}
