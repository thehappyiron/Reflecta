import type { ReasoningAnalysis, ChallengeExchange, ReflectionSummary } from '@/types';

export interface HistoryItem {
  id: string;
  title: string;
  reasoning?: string;
  analysis?: ReasoningAnalysis | null;
  challengeExchanges?: ChallengeExchange[];
  oppositeResponse?: string;
  reflection?: ReflectionSummary | null;
  createdAt: string;
}

const HISTORY_KEY = 'reflecta_decision_history_v1';

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch (err) {
    console.error('Failed to read decision history:', err);
    return [];
  }
}

export function saveDecisionToHistory(item: Omit<HistoryItem, 'id' | 'createdAt'> & { id?: string }): HistoryItem {
  if (typeof window === 'undefined') {
    return {
      id: item.id || `dec_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...item,
    };
  }

  const existing = getHistory();
  const id = item.id || `dec_${Date.now()}`;
  const createdAt = new Date().toISOString();

  const newItem: HistoryItem = {
    ...item,
    id,
    createdAt: item.id ? (existing.find((x) => x.id === item.id)?.createdAt || createdAt) : createdAt,
  };

  const filtered = existing.filter((x) => x.id !== id);
  const updated = [newItem, ...filtered];

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save decision history:', err);
  }

  return newItem;
}

export function deleteFromHistory(id: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  const existing = getHistory();
  const updated = existing.filter((x) => x.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete history item:', err);
  }
  return updated;
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}
