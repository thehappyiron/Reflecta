/**
 * Reflecta — Decision Flow Page (/decide)
 *
 * The main interactive experience. Orchestrates all stages sequentially:
 * understand → explain → explore → challenge → perspective → reflect
 *
 * Also includes the interactive "Your Thinking Map" visual reasoning tree view
 * and the "Decision History" feature for reviewing past explorations.
 */
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Companion } from '@/components/Companion';
import { ProgressHeader } from '@/components/ProgressHeader';
import { useDecisionFlow } from '@/features/decision/useDecisionFlow';
import { UnderstandStage, ExplainStage } from '@/features/decision/UnderstandExplainStages';
import { ExploreStage } from '@/features/decision/ExploreStage';
import { ChallengeStage, PerspectiveStage } from '@/features/decision/ChallengePerspectiveStages';
import { ReflectStage } from '@/features/decision/ReflectStage';
import { ThinkingMap } from '@/components/thinking-map/ThinkingMap';
import { HistoryView } from '@/components/history/HistoryView';
import type { HistoryItem } from '@/lib/history/storage';
import { Pointer } from '@/components/ui/custom-cursor';

// Example decision titles for the ?example= query param
const EXAMPLE_TITLES: Record<string, string> = {
  internship: 'Should I accept a 6-month internship?',
  college:    'Should I choose this college?',
  abroad:     'Should I study abroad?',
  major:      'Should I switch my major?',
  job:        'Should I take this new job?',
};

// ─── Inner component (needs useSearchParams) ──────────────────────────────────
function DecideInner() {
  const searchParams = useSearchParams();
  const exampleKey = searchParams.get('example') ?? '';
  const initialTitle = EXAMPLE_TITLES[exampleKey] ?? '';
  const initialViewParam = searchParams.get('view');

  const [showMap, setShowMap] = useState(initialViewParam === 'map');
  const [showHistory, setShowHistory] = useState(initialViewParam === 'history');
  const [mapItemOverride, setMapItemOverride] = useState<HistoryItem | null>(null);

  const {
    state,
    submitDecision,
    submitReasoning,
    proceedToChallenge,
    submitChallengeResponse,
    submitOppositeResponse,
    loadDecisionFromHistory,
    goBack,
    restart,
  } = useDecisionFlow(initialTitle);

  const { stage, input, analysis, challengeExchanges, currentChallenge, currentCategoryTag, loading, error, reflection } = state;

  const handleOpenMap = (item: HistoryItem) => {
    setMapItemOverride(item);
    setShowHistory(false);
    setShowMap(true);
  };

  const handleSelectDecision = (item: HistoryItem) => {
    loadDecisionFromHistory(item);
    setShowHistory(false);
    setShowMap(false);
  };

  return (
    <Pointer name="Reflecta">
      <div className="page-container">

      {/* ── Top bar with logo and progress ────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center"
        style={{
          background: 'linear-gradient(160deg, rgba(255,255,255,0.38) 0%, rgba(237,233,254,0.22) 40%, rgba(255,255,255,0.28) 100%)',
          backdropFilter: 'blur(22px) saturate(180%) brightness(1.04)',
          WebkitBackdropFilter: 'blur(22px) saturate(180%) brightness(1.04)',
          borderBottom: '1px solid rgba(255,255,255,0.45)',
          boxShadow: '0 4px 20px rgba(59,7,100,0.08), inset 0 1.5px 0 0 rgba(255,255,255,0.80), inset 0 -1px 0 0 rgba(139,92,246,0.12)',
        }}>
        {/* Logo bar */}
        <div className="w-full flex items-center justify-between px-4 sm:px-6 py-2">
          <Link href="/" className="flex items-center gap-3 group hover:opacity-90 transition-opacity" aria-label="Back to Reflecta home">
            <Companion expression="friendly" size={64} />
            <span className="font-black text-3xl tracking-tight text-purple-950 leading-none">reflecta</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowHistory(false);
                setShowMap(false);
                restart();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm sm:text-base font-black cursor-pointer transition-all duration-200 shadow-xs border bg-stone-100/90 text-stone-800 border-stone-300 hover:bg-stone-200 hover:text-stone-950 hover:border-stone-400"
              aria-label="Start a new decision"
            >
              <span>New decision</span>
            </button>
          </div>
        </div>
        {/* Progress indicator — always visible during flow, with Thinking Map & History toggles */}
        <ProgressHeader
          currentStage={stage}
          isMapActive={showMap}
          onToggleMap={() => {
            setShowMap(!showMap);
            setShowHistory(false);
            setMapItemOverride(null);
          }}
          isHistoryActive={showHistory}
          onToggleHistory={() => {
            setShowHistory(!showHistory);
            setShowMap(false);
          }}
        />
      </div>

      {/* ── Content (padded for fixed top bar) ───────────────────────── */}
      <div className="flex-1 pt-32 pb-12 px-4 max-w-7xl mx-auto w-full">
        {showHistory ? (
          <HistoryView
            onSelectDecision={handleSelectDecision}
            onOpenMap={handleOpenMap}
            onBackToCurrent={() => setShowHistory(false)}
          />
        ) : showMap ? (
          <ThinkingMap
            title={mapItemOverride?.title || input.title || 'Should I accept a 6-month internship?'}
            reasoning={mapItemOverride?.reasoning || input.reasoning || ''}
            analysis={mapItemOverride?.analysis || analysis}
            challengeExchanges={mapItemOverride?.challengeExchanges || challengeExchanges}
            reflection={mapItemOverride?.reflection || reflection}
            onContinueToChallenge={() => {
              setShowMap(false);
              if (stage === 'explore') proceedToChallenge();
            }}
          />
        ) : (
          <>
            {stage === 'understand' && (
              <UnderstandStage
                initialValue={initialTitle}
                onSubmit={submitDecision}
              />
            )}

            {stage === 'explain' && (
              <ExplainStage
                decisionTitle={input.title ?? ''}
                onSubmit={submitReasoning}
                onBack={goBack}
                loading={loading}
                error={error?.message}
              />
            )}

            {stage === 'explore' && (
              <ExploreStage
                analysis={analysis}
                loading={loading}
                error={error?.message}
                onContinue={proceedToChallenge}
                onBack={goBack}
                continueLoading={loading}
              />
            )}

            {stage === 'challenge' && currentChallenge && (
              <ChallengeStage
                question={currentChallenge}
                reasonForQuestion={analysis?.reasonForQuestion}
                categoryTag={currentCategoryTag}
                decisionContext={input.title ?? ''}
                onSubmit={submitChallengeResponse}
                onBack={goBack}
                loading={loading}
                error={error?.message}
              />
            )}

            {stage === 'perspective' && (
              <PerspectiveStage
                decision={input.title ?? 'this option'}
                onSubmit={submitOppositeResponse}
                onBack={goBack}
                loading={loading}
                error={error?.message}
              />
            )}

            {stage === 'reflect' && (
              <ReflectStage
                reflection={reflection}
                decisionTitle={input.title ?? ''}
                loading={loading}
                error={error?.message}
                onRestart={restart}
              />
            )}
          </>
        )}
      </div>
    </div>
    </Pointer>
  );
}

// ─── Page export (wrapped in Suspense for useSearchParams) ─────────────────────
export default function DecidePage() {
  return (
    <Suspense fallback={
      <div className="page-container items-center justify-center min-h-[60vh] flex">
        <Companion expression="thinking" size="clamp(80px, 12vw, 120px)" className="animate-pulse-gentle" />
      </div>
    }>
      <DecideInner />
    </Suspense>
  );
}
