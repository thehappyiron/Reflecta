/**
 * Reflecta — Reflect Stage (Page 6, spec §29)
 *
 * "Your clearer view" — the final reflection summary.
 *
 * CRITICAL: Does NOT recommend a decision.
 * Shows: what matters, key question, uncertainties, new perspective.
 * User walks away with discovered questions, not an AI answer.
 */
'use client';

import { Companion } from '@/components/Companion';
import type { ReflectionSummary } from '@/types';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

// ─── Reflection Card ──────────────────────────────────────────────────────────
interface ReflectionCardProps {
  title: string;
  items?: string[];
  singleItem?: string;
  color: string;
  textColor: string;
  borderColor: string;
  delay: string;
}

function ReflectionCard({ title, items, singleItem, color, textColor, borderColor, delay }: ReflectionCardProps) {
  return (
    <div
      className={`rounded-2xl p-5 border animate-fade-up ${delay}`}
      style={{ backgroundColor: color, borderColor }}
    >
      <h3 className="font-semibold text-sm mb-3" style={{ color: textColor }}>
        {title}
      </h3>
      {singleItem && (
        <p className="text-sm leading-relaxed" style={{ color: textColor }}>
          {singleItem}
        </p>
      )}
      {items && (
        <ul className="space-y-1.5" aria-label={title}>
          {items.map((item, i) => (
            <li key={i} className="text-sm leading-snug flex items-start gap-2" style={{ color: textColor }}>
              <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0 opacity-70" style={{ backgroundColor: textColor }} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Reflect Stage ────────────────────────────────────────────────────────────
interface ReflectStageProps {
  reflection: ReflectionSummary | null;
  decisionTitle: string;
  loading: boolean;
  error?: string | null;
  onRestart: () => void;
}

export function ReflectStage({ reflection, decisionTitle, loading, error, onRestart }: ReflectStageProps) {
  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-[70vh]">
      <div className="content-width w-full">

        {/* Loading */}
        {loading && (
          <div className="text-center py-20" aria-live="polite" aria-busy="true">
            <Companion expression="thinking" size="clamp(96px, 15vw, 130px)" className="mx-auto mb-4 animate-pulse-gentle" />
            <p className="loading-text">Building your clearer view...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div role="alert" className="error-message mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Reflection */}
        {reflection && !loading && (
          <>
            <div className="text-center mb-8 animate-fade-up">
              <Companion expression="encouraging" size="clamp(96px, 15vw, 130px)" className="mx-auto mb-4" />
              <h1 className="stage-heading">Your clearer view</h1>
              <p className="stage-subtext">You understand your own decision better now.</p>
              <p className="mt-2 text-xs font-semibold text-violet-700 bg-violet-50 px-3 py-1 rounded-full inline-block">
                Deciding: "{decisionTitle}"
              </p>
            </div>

            {/* Reflection cards */}
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <ReflectionCard
                title="What matters to you"
                items={reflection.whatMatters}
                color="var(--color-believed)"
                textColor="var(--color-believed-text)"
                borderColor="var(--color-believed-border)"
                delay="delay-100"
              />
              <ReflectionCard
                title="Key question to answer"
                singleItem={reflection.keyQuestion}
                color="var(--color-challenge)"
                textColor="var(--color-challenge-text)"
                borderColor="var(--color-challenge-border)"
                delay="delay-200"
              />
              <ReflectionCard
                title="Main uncertainty"
                items={reflection.mainUncertainties}
                color="var(--color-unclear)"
                textColor="var(--color-unclear-text)"
                borderColor="var(--color-unclear-border)"
                delay="delay-300"
              />
              <ReflectionCard
                title="Something new to think about"
                singleItem={reflection.newPerspective}
                color="var(--color-known)"
                textColor="var(--color-known-text)"
                borderColor="var(--color-known-border)"
                delay="delay-400"
              />
            </div>

            {/* Payoff Banner */}
            <div
              className="rounded-2xl p-6 mb-8 text-center animate-fade-up delay-500 bg-stone-900 text-white shadow-md"
            >
              <p className="text-base font-bold text-violet-200 mb-1">
                The decision is still yours.
              </p>
              <p className="text-xs text-stone-400 font-medium italic">
                No perfect choices. Just clearer thinking.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-up delay-500">
              <button
                onClick={onRestart}
                className="btn-primary py-3.5 px-8 text-base shadow-lg hover:shadow-xl"
              >
                Start a new decision →
              </button>
              <Link href="/" className="btn-secondary py-3.5 px-6 text-base justify-center">
                Back to home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
