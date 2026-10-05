/**
 * Reflecta — Explore Stage (Page 3, spec §26)
 *
 * Shows Gemini's classification of user reasoning into:
 * - What you know (green)
 * - What you believe (lavender)
 * - What's unclear (yellow/peach)
 *
 * Loading skeleton shown while Gemini processes.
 * Compact display — max 3-5 items per category.
 * One action: "Let's look deeper →"
 */
'use client';

import { Companion } from '@/components/Companion';
import type { ReasoningAnalysis } from '@/types';
import { Loader2, ArrowRight, CheckCircle, Sparkles, HelpCircle } from 'lucide-react';

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function SkeletonCard({ color }: { color: string }) {
  return (
    <div
      className="rounded-2xl p-5 border animate-pulse"
      style={{ backgroundColor: color, borderColor: 'transparent', opacity: 0.5 }}
    >
      <div className="h-4 bg-current rounded opacity-20 w-24 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-current rounded opacity-15 w-full" />
        <div className="h-3 bg-current rounded opacity-15 w-4/5" />
        <div className="h-3 bg-current rounded opacity-10 w-3/5" />
      </div>
    </div>
  );
}

// ─── Reasoning Card ───────────────────────────────────────────────────────────
interface ReasoningCardProps {
  categoryBadge: 'KNOWN' | 'BELIEF' | 'UNCLEAR';
  title: string;
  items: string[];
  textColor: string;
  borderColor: string;
  bgColor: string;
  accentBorder: string;
  whyItMatters?: string;
  delay: string;
}

function ReasoningCard({
  categoryBadge, title, items, textColor, borderColor, bgColor, accentBorder, whyItMatters, delay,
}: ReasoningCardProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={`rounded-2xl p-5 border ${accentBorder} shadow-xs animate-fade-up ${delay} flex flex-col justify-between`}
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div>
        {/* Category badge & Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md"
            style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: textColor }}
          >
            {categoryBadge}
          </span>
          <span className="opacity-80">
            {categoryBadge === 'KNOWN' && <CheckCircle size={14} style={{ color: textColor }} />}
            {categoryBadge === 'BELIEF' && <Sparkles size={14} style={{ color: textColor }} />}
            {categoryBadge === 'UNCLEAR' && <HelpCircle size={14} style={{ color: textColor }} />}
          </span>
        </div>
        <h3 className="font-bold text-sm mb-3" style={{ color: textColor }}>
          {title}
        </h3>

        {/* Items */}
        <ul className="space-y-2 mb-2" aria-label={`${title} items`}>
          {items.slice(0, 5).map((item, i) => (
            <li
              key={i}
              className="text-sm leading-snug flex items-start gap-2 font-medium"
              style={{ color: textColor }}
            >
              <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full opacity-70" style={{ backgroundColor: textColor }} aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Why this matters microcopy (spec §7) */}
        {whyItMatters && (
          <div className="mt-3 pt-2.5 border-t border-black/5">
            <p className="text-[11px] font-medium italic opacity-85 leading-tight" style={{ color: textColor }}>
              💡 {whyItMatters}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Explore Stage ─────────────────────────────────────────────────────────────
interface ExploreStageProps {
  analysis: ReasoningAnalysis | null;
  loading: boolean;
  error?: string | null;
  onContinue: () => void;
  onBack: () => void;
  continueLoading?: boolean;
}

export function ExploreStage({
  analysis, loading, error, onContinue, onBack, continueLoading = false,
}: ExploreStageProps) {
  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-[70vh]">
      <div className="content-width w-full">

        {/* Heading */}
        <div className="mb-6 animate-fade-up text-center sm:text-left">
          <h1 className="stage-heading">Here's what I found in your thinking</h1>
          <p className="stage-subtext">I've grouped your reasons into facts, beliefs, and uncertainties.</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div aria-live="polite" aria-busy="true">
            <div className="flex items-center gap-2 mb-6 animate-pulse-gentle justify-center sm:justify-start">
              <Loader2 size={16} className="animate-spin text-violet-600" aria-hidden="true" />
              <span className="loading-text font-medium text-violet-900">Mapping your thinking...</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <SkeletonCard color="var(--color-known)" />
              <SkeletonCard color="var(--color-believed)" />
              <SkeletonCard color="var(--color-unclear)" />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div role="alert" className="error-message mb-6">
            <p>{error.includes('interrupted') ? error : 'Something interrupted the reflection. Your thoughts are still here. Try again.'}</p>
            <button onClick={onBack} className="mt-2 text-sm underline cursor-pointer">
              Go back and try again
            </button>
          </div>
        )}

        {/* Analysis cards */}
        {analysis && !loading && (
          <>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <ReasoningCard
                categoryBadge="KNOWN"
                title="What you know"
                items={analysis.known}
                textColor="var(--color-known-text)"
                borderColor="var(--color-known-border)"
                bgColor="var(--color-known)"
                accentBorder="border-l-4 border-l-emerald-500"
                delay="delay-100"
              />
              <ReasoningCard
                categoryBadge="BELIEF"
                title="What you think is true"
                items={analysis.beliefs}
                textColor="var(--color-believed-text)"
                borderColor="var(--color-believed-border)"
                bgColor="var(--color-believed)"
                accentBorder="border-l-4 border-l-purple-500"
                whyItMatters={analysis.beliefs.length > 0 ? "This belief is strongly influencing your outlook." : undefined}
                delay="delay-200"
              />
              <ReasoningCard
                categoryBadge="UNCLEAR"
                title="What you haven't established yet"
                items={analysis.unclear}
                textColor="var(--color-unclear-text)"
                borderColor="var(--color-unclear-border)"
                bgColor="var(--color-unclear)"
                accentBorder="border-l-4 border-l-amber-500"
                whyItMatters={analysis.unclear.length > 0 ? "Establishing this will reduce your overall uncertainty." : undefined}
                delay="delay-300"
              />
            </div>

            {/* Spec Footnote */}
            <p className="text-center text-xs text-stone-500 italic mb-6 animate-fade-up delay-350">
              Some of your reasons are facts. Others are beliefs waiting for evidence.
            </p>

            {/* Companion hint */}
            <div className="flex items-center gap-3.5 px-5 py-4 rounded-2xl mb-6 animate-fade-up delay-400"
              style={{ backgroundColor: 'var(--bg-muted)' }}>
              <Companion expression="thoughtful" size={52} className="flex-shrink-0" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {analysis.reasonForQuestion
                  ? `I noticed something worth exploring: ${analysis.reasonForQuestion}`
                  : "Here's something worth exploring."}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 animate-fade-up delay-500">
              <button onClick={onBack} className="btn-secondary">
                ← Back
              </button>
              <button
                onClick={onContinue}
                className="btn-primary"
                disabled={continueLoading}
              >
                {continueLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Preparing question...
                  </>
                ) : (
                  <>
                    Let's look deeper
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
