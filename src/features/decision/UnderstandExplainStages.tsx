/**
 * Reflecta — Understand Stage (Page 1, spec §24) & Explain Stage (Page 2, spec §25)
 *
 * Rich modern UI with explicit Tailwind styling for input fields, textareas, and suggestion chips.
 */
'use client';

import { useState, useId } from 'react';
import { Companion } from '@/components/Companion';
import { DecisionTitleSchema } from '@/lib/validation/schemas';
import { ArrowRight, Loader2 } from 'lucide-react';

const EXAMPLE_DECISIONS = [
  'Choose a college',
  'Take an internship',
  'Switch career',
  'Move to another city',
  'Buy a laptop',
  'Nagpur to Mumbai train',
];

interface UnderstandStageProps {
  initialValue?: string;
  onSubmit: (title: string) => void;
}

export function UnderstandStage({ initialValue = '', onSubmit }: UnderstandStageProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputId = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = DecisionTitleSchema.safeParse(value);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Please enter a decision.');
      return;
    }
    setError(null);
    onSubmit(result.data);
  }

  function handleChip(example: string) {
    if (example === 'Nagpur to Mumbai train') {
      setValue('I am travelling from Nagpur to Mumbai and thinking of taking Duronto');
    } else {
      setValue(example);
    }
    setError(null);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 py-8">
      <div className="max-w-2xl w-full">

        {/* Companion + heading */}
        <div className="text-center mb-8 animate-fade-up">
          <Companion expression="listening" size="clamp(96px, 15vw, 130px)" className="mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            What are you deciding?
          </h1>
          <p className="text-base text-stone-500 mt-1.5">
            Just a short sentence is enough.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="animate-fade-up delay-100">

          {/* Input box */}
          <div className="mb-4">
            <label htmlFor={inputId} className="sr-only">
              Your decision
            </label>
            <input
              id={inputId}
              type="text"
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100 shadow-sm transition-all duration-200"
              placeholder="Should I accept a 6-month internship?"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(null); }}
              maxLength={300}
              aria-describedby={error ? `${inputId}-error` : `${inputId}-helper`}
              aria-invalid={error ? 'true' : undefined}
              autoFocus
            />
            {/* Error */}
            {error && (
              <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl font-medium">
                {error}
              </p>
            )}
          </div>

          {/* Helper text */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Companion expression="listening" size={32} />
            <p id={`${inputId}-helper`} className="text-center text-sm text-stone-500 font-medium">
              No right or wrong thoughts. Just your thoughts.
            </p>
          </div>

          {/* Example suggestion pills */}
          <div
            className="flex flex-wrap gap-2.5 justify-center mb-10"
            role="group"
            aria-label="Example decisions"
          >
            {EXAMPLE_DECISIONS.map((ex) => (
              <button
                key={ex}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white border border-stone-200/90 text-stone-700 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 shadow-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                onClick={() => handleChip(ex)}
                aria-label={`Use example: ${ex}`}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-purple-950 hover:bg-purple-900 text-white font-semibold text-base py-3.5 px-10 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              disabled={!value.trim()}
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Explain Stage (Page 2, spec §25) ─────────────────────────────────────────

interface ExplainStageProps {
  decisionTitle: string;
  onSubmit: (reasoning: string) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export function ExplainStage({
  decisionTitle, onSubmit, onBack, loading = false, error,
}: ExplainStageProps) {
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const textareaId = useId();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setValidationError('Please share your reasoning before continuing.');
      return;
    }
    if (trimmed.length > 5000) {
      setValidationError('Reasoning must be under 5000 characters.');
      return;
    }
    setValidationError(null);
    onSubmit(trimmed);
  }

  const displayError = validationError ?? error;

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 py-8">
      <div className="max-w-2xl w-full">

        {/* Heading */}
        <div className="mb-4 animate-fade-up">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Tell me more
          </h1>
          <p className="text-base text-stone-500 mt-1">
            Why are you leaning towards this option?
          </p>
        </div>

        {/* Decision title context badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 text-xs sm:text-sm font-semibold bg-violet-50 text-violet-800 border border-violet-200 animate-fade-up delay-100"
          aria-label={`Your decision: ${decisionTitle}`}
        >
          <span className="truncate">Deciding: "{decisionTitle}"</span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="animate-fade-up delay-200">

          {/* Textarea */}
          <div className="mb-3">
            <label htmlFor={textareaId} className="sr-only">
              Your reasoning
            </label>
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 pt-1 hidden sm:block">
                <Companion expression="listening" size={54} />
              </div>
              <textarea
                id={textareaId}
                className="w-full px-5 py-4 text-base rounded-2xl border-2 border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-violet-600 focus:ring-4 focus:ring-violet-100 shadow-sm transition-all duration-200 min-h-[180px] flex-1 resize-y"
                placeholder="Share your thoughts, priorities, and reasons..."
                value={value}
                onChange={(e) => { setValue(e.target.value); setValidationError(null); }}
                maxLength={5000}
                rows={6}
                disabled={loading}
                aria-describedby={displayError ? `${textareaId}-error` : undefined}
                aria-invalid={displayError ? 'true' : undefined}
                autoFocus
              />
            </div>
            <p className="text-xs text-stone-400 text-right mt-1.5 font-medium">{value.length} / 5000</p>
          </div>

          {/* Error */}
          {displayError && (
            <p id={`${textareaId}-error`} role="alert" className="mb-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl font-medium">
              {displayError.includes('interrupted') ? displayError : 'Something interrupted the reflection. Your thoughts are still here. Try again.'}
            </p>
          )}

          <p className="text-center text-xs text-stone-500 mb-8 font-medium">
            Share all your thoughts. We'll organize them together.
          </p>

          {/* Action buttons */}
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
              disabled={loading || !value.trim()}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Looking for what your reasoning leaves unsaid...</span>
                </>
              ) : (
                <>
                  <span>Organize my thoughts</span>
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
