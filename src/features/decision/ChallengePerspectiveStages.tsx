/**
 * Reflecta — Challenge Stage (Page 4, spec §27) & Perspective Stage (Page 5, spec §28)
 *
 * Rich modern UI with explicit Tailwind styling.
 */
'use client';

import { useState, useId } from 'react';
import { Companion } from '@/components/Companion';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';

// ─── Challenge Stage ──────────────────────────────────────────────────────────
interface ChallengeStageProps {
  question: string;
  reasonForQuestion?: string;
  categoryTag?: 'ASSUMPTION TO EXPLORE' | 'MISSING INFORMATION' | 'POSSIBLE BLIND SPOT';
  decisionContext: string;
  onSubmit: (response: string) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export function ChallengeStage({
  question, reasonForQuestion, categoryTag = 'ASSUMPTION TO EXPLORE', decisionContext, onSubmit, onBack,
  loading = false, error,
}: ChallengeStageProps) {
  const [response, setResponse] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaId = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = response.trim();
    if (!trimmed) {
      setValidationError('Please write your thoughts before continuing.');
      return;
    }
    setValidationError(null);
    onSubmit(trimmed);
  }

  const displayError = validationError ?? error;

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-[65vh]">
      <div className="max-w-2xl w-full">

        {/* Heading */}
        <div className="mb-6 animate-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-pink-100 text-pink-900 border border-pink-200 shadow-2xs">
              <Sparkles size={12} className="text-pink-600" />
              {categoryTag}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Here's a question worth exploring
          </h1>
          {reasonForQuestion && (
            <p className="text-base text-stone-500 mt-1.5 leading-relaxed">{reasonForQuestion}</p>
          )}
        </div>

        {/* Context reminder */}
        <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4 animate-fade-up delay-100">
          You mentioned: <span className="text-stone-700 italic font-medium">"{decisionContext}"</span>
        </p>

        {/* The question — highlighted special card (spec §8) */}
        <div
          className="bg-gradient-to-br from-pink-50/90 via-purple-50/40 to-pink-50/90 border border-pink-200/90 p-7 rounded-3xl mb-8 shadow-xs animate-fade-up delay-200 relative overflow-hidden"
          role="region"
          aria-label="Challenge question"
        >
          <div className="text-[10px] font-extrabold tracking-widest text-pink-700 uppercase mb-2">
            A Question Worth Exploring
          </div>
          <div className="flex items-start gap-4">
            <Companion expression="curious" size={68} className="flex-shrink-0 mt-1" />
            <blockquote className="text-lg sm:text-xl font-extrabold leading-snug text-purple-950">
              "{question}"
            </blockquote>
          </div>
        </div>

        {/* Response form (with subtle pause spacing spec §9) */}
        <form onSubmit={handleSubmit} noValidate className="animate-fade-up delay-300">
          <label htmlFor={textareaId} className="sr-only">
            Your response to the challenge question
          </label>
          <div className="mb-2">
            <textarea
              id={textareaId}
              className="w-full px-5 py-4 text-base rounded-2xl border-2 border-stone-200/90 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 shadow-xs transition-all duration-200 min-h-[150px] resize-y"
              placeholder="Just write what you're thinking… there's no right answer here."
              value={response}
              onChange={(e) => { setResponse(e.target.value); setValidationError(null); }}
              maxLength={5000}
              rows={5}
              disabled={loading}
              aria-describedby={displayError ? `${textareaId}-error` : undefined}
              aria-invalid={displayError ? 'true' : undefined}
            />
            <div className="flex justify-between items-center mt-1.5">
              <span className="text-[11px] text-stone-400 italic">No rush. Take a moment to reflect.</span>
              <span className="text-xs text-stone-400 font-medium">{response.length} / 5000</span>
            </div>
          </div>

          {displayError && (
            <p id={`${textareaId}-error`} role="alert" className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl font-medium">
              {displayError.includes('interrupted') ? displayError : 'Something interrupted the reflection. Your thoughts are still here. Try again.'}
            </p>
          )}

          {/* Psychological Pause Space */}
          <div className="py-2 text-center">
            <p className="text-xs text-stone-500 font-medium">
              That's interesting. Let me incorporate your insight.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 mt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer"
              disabled={loading}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="group inline-flex items-center gap-2 bg-purple-950 hover:bg-purple-900 text-white font-semibold text-sm py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !response.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Finding one thing worth questioning...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Perspective Stage (Page 5, spec §28) ─────────────────────────────────────
interface PerspectiveStageProps {
  decision: string;
  onSubmit: (response: string) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export function PerspectiveStage({
  decision, onSubmit, onBack, loading = false, error,
}: PerspectiveStageProps) {
  const [response, setResponse] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaId = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = response.trim();
    if (!trimmed) {
      setValidationError('Please write your thoughts before continuing.');
      return;
    }
    setValidationError(null);
    onSubmit(trimmed);
  }

  const displayError = validationError ?? error;

  return (
    <div className="flex flex-col items-center px-4 py-8 min-h-[65vh]">
      <div className="max-w-2xl w-full">

        {/* Heading */}
        <div className="mb-6 animate-fade-up text-center">
          <Companion expression="surprised" size="clamp(96px, 15vw, 130px)" className="mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Try seeing it from the other side
          </h1>
          <p className="text-base text-stone-500 mt-1.5">
            You've explored why this option might work. Now imagine choosing differently.
          </p>
        </div>

        {/* Card */}
        <div className="bg-purple-50/80 border border-purple-200 p-5 rounded-3xl mb-6 shadow-xs animate-fade-up delay-100">
          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-1">
            Opposite Perspective Experiment
          </p>
          <p className="text-sm font-medium text-purple-950">
            What's the strongest reason you might choose the alternative to <span className="font-bold">"{decision}"</span>?
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="animate-fade-up delay-200">
          <label htmlFor={textareaId} className="sr-only">
            Argument for the opposite choice
          </label>
          <textarea
            id={textareaId}
            className="w-full px-5 py-4 text-base rounded-2xl border-2 border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 shadow-sm transition-all duration-200 min-h-[140px] mb-2 resize-y"
            placeholder="Write the alternative perspective here..."
            value={response}
            onChange={(e) => { setResponse(e.target.value); setValidationError(null); }}
            maxLength={5000}
            rows={5}
            disabled={loading}
            aria-describedby={displayError ? `${textareaId}-error` : undefined}
            aria-invalid={displayError ? 'true' : undefined}
          />
          <p className="text-xs text-stone-400 text-right mb-2 font-medium">{response.length} / 5000</p>

          {displayError && (
            <p id={`${textareaId}-error`} role="alert" className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl font-medium">
              {displayError.includes('interrupted') ? displayError : 'Something interrupted the reflection. Your thoughts are still here. Try again.'}
            </p>
          )}

          <p className="text-center text-xs text-stone-500 mb-6 font-medium italic">
            Good. You found a reason your original thinking didn't give much attention to.
          </p>

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full text-sm font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 transition-all cursor-pointer"
              disabled={loading}
            >
              ← Back
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-purple-950 hover:bg-purple-900 text-white font-semibold text-sm py-3 px-8 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !response.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Mapping your clearer view...</span>
                </>
              ) : (
                <>
                  <span>Generate Clearer View</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
