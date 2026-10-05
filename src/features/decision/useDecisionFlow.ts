/**
 * Reflecta — Decision Flow State Management
 *
 * Manages the complete sequential flow state:
 * understand → explain → explore → challenge → perspective → reflect
 *
 * AI is called at intentional stage transitions — never on every keystroke.
 * User input is preserved locally on error so nothing is lost.
 * Automatically saves session progress to Decision History.
 */
'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  DecisionStage,
  DecisionFlowState,
  ReasoningAnalysis,
  ChallengeExchange,
  ReflectionSummary,
} from '@/types';
import { saveDecisionToHistory, HistoryItem } from '@/lib/history/storage';

const INITIAL_STATE: DecisionFlowState = {
  stage: 'understand',
  input: {},
  analysis: null,
  challengeExchanges: [],
  currentChallenge: null,
  oppositeResponse: '',
  reflection: null,
  loading: false,
  error: null,
  savedDecisionId: null,
};

export function useDecisionFlow(initialTitle?: string) {
  const [state, setState] = useState<DecisionFlowState>({
    ...INITIAL_STATE,
    input: initialTitle ? { title: initialTitle } : {},
  });

  const submittingRef = useRef(false);

  const setLoading = (loading: boolean) =>
    setState((s) => ({ ...s, loading, error: null }));

  const setError = (message: string) =>
    setState((s) => ({
      ...s,
      loading: false,
      error: { code: 'AI_UNAVAILABLE', message },
    }));

  /** Stage 1→2: User submitted their decision title */
  const submitDecision = useCallback((title: string) => {
    setState((s) => ({
      ...s,
      input: { ...s.input, title },
      stage: 'explain',
      error: null,
    }));
  }, []);

  /** Stage 2→3: User submitted their reasoning. Calls AI analyze */
  const submitReasoning = useCallback(async (reasoning: string) => {
    if (submittingRef.current) return;
    submittingRef.current = true;

    setState((s) => ({
      ...s,
      input: { ...s.input, reasoning },
      stage: 'explore',
      loading: true,
      error: null,
    }));

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.input.title ?? '',
          reasoning,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? 'Something went wrong. Please try again.');
      }

      const data = await response.json() as { analysis: ReasoningAnalysis };
      
      // Save to History
      const saved = saveDecisionToHistory({
        id: state.savedDecisionId || undefined,
        title: state.input.title ?? '',
        reasoning,
        analysis: data.analysis,
      });

      setState((s) => ({
        ...s,
        analysis: data.analysis,
        savedDecisionId: saved.id,
        loading: false,
      }));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'I couldn\'t process that just now. Your thoughts are safe. Try again.'
      );
    } finally {
      submittingRef.current = false;
    }
  }, [state.input.title, state.savedDecisionId]);

  /** Stage 3→4: Move to challenge */
  const proceedToChallenge = useCallback(async () => {
    if (submittingRef.current || !state.analysis) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch('/api/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.input.title ?? '',
          reasoning: state.input.reasoning ?? '',
          analysis: state.analysis,
          previousResponses: state.challengeExchanges,
        }),
      });

      if (!response.ok) {
        throw new Error('Could not generate a challenge question. Please try again.');
      }

      const data = await response.json() as { question: string; categoryTag?: 'ASSUMPTION TO EXPLORE' | 'MISSING INFORMATION' | 'POSSIBLE BLIND SPOT' };
      setState((s) => ({
        ...s,
        currentChallenge: data.question,
        currentCategoryTag: data.categoryTag || 'ASSUMPTION TO EXPLORE',
        stage: 'challenge',
        loading: false,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      submittingRef.current = false;
    }
  }, [state.analysis, state.input, state.challengeExchanges]);

  /** Stage 4: User responds to challenge */
  const submitChallengeResponse = useCallback((response: string) => {
    if (!state.currentChallenge) return;
    const exchange: ChallengeExchange = {
      question: state.currentChallenge,
      userResponse: response,
    };
    const updatedExchanges = [...state.challengeExchanges, exchange];
    
    // Save to History
    if (state.savedDecisionId) {
      saveDecisionToHistory({
        id: state.savedDecisionId,
        title: state.input.title ?? '',
        reasoning: state.input.reasoning,
        analysis: state.analysis,
        challengeExchanges: updatedExchanges,
      });
    }

    setState((s) => ({
      ...s,
      challengeExchanges: updatedExchanges,
      stage: 'perspective',
      error: null,
    }));
  }, [state.currentChallenge, state.challengeExchanges, state.savedDecisionId, state.input, state.analysis]);

  /** Stage 5→6: User submitted opposite perspective response */
  const submitOppositeResponse = useCallback(async (oppositeResponse: string) => {
    if (submittingRef.current || !state.analysis) return;
    submittingRef.current = true;

    setState((s) => ({
      ...s,
      oppositeResponse,
      stage: 'reflect',
      loading: true,
      error: null,
    }));

    try {
      const response = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: state.input.title ?? '',
          reasoning: state.input.reasoning ?? '',
          analysis: state.analysis,
          challengeExchanges: state.challengeExchanges,
          oppositeResponse,
        }),
      });

      if (!response.ok) {
        throw new Error('Couldn\'t generate your reflection. Try again.');
      }

      const data = await response.json() as { reflection: ReflectionSummary };

      // Save to History
      saveDecisionToHistory({
        id: state.savedDecisionId || undefined,
        title: state.input.title ?? '',
        reasoning: state.input.reasoning,
        analysis: state.analysis,
        challengeExchanges: state.challengeExchanges,
        oppositeResponse,
        reflection: data.reflection,
      });

      setState((s) => ({ ...s, reflection: data.reflection, loading: false }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      submittingRef.current = false;
    }
  }, [state.analysis, state.input, state.challengeExchanges, state.savedDecisionId]);

  /** Load a decision from history into state */
  const loadDecisionFromHistory = useCallback((item: HistoryItem) => {
    setState({
      stage: item.reflection ? 'reflect' : item.analysis ? 'explore' : 'understand',
      input: { title: item.title, reasoning: item.reasoning },
      analysis: item.analysis || null,
      challengeExchanges: item.challengeExchanges || [],
      currentChallenge: item.challengeExchanges?.[item.challengeExchanges.length - 1]?.question || null,
      oppositeResponse: item.oppositeResponse || '',
      reflection: item.reflection || null,
      loading: false,
      error: null,
      savedDecisionId: item.id,
    });
  }, []);

  /** Go back one stage */
  const goBack = useCallback(() => {
    setState((s) => {
      const stageOrder: DecisionStage[] = ['understand', 'explain', 'explore', 'challenge', 'perspective', 'reflect'];
      const idx = stageOrder.indexOf(s.stage);
      if (idx <= 0) return s;
      return { ...s, stage: stageOrder[idx - 1], error: null };
    });
  }, []);

  /** Reset to start */
  const restart = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    submitDecision,
    submitReasoning,
    proceedToChallenge,
    submitChallengeResponse,
    submitOppositeResponse,
    loadDecisionFromHistory,
    goBack,
    restart,
  };
}
