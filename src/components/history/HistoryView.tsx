'use client';

import React, { useState, useEffect } from 'react';
import { getHistory, deleteFromHistory, clearHistory, HistoryItem } from '@/lib/history/storage';
import { Companion } from '@/components/Companion';
import { History, Trash2, Map, Calendar, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface HistoryViewProps {
  onSelectDecision?: (item: HistoryItem) => void;
  onOpenMap?: (item: HistoryItem) => void;
  onBackToCurrent?: () => void;
}

export function HistoryView({ onSelectDecision, onOpenMap, onBackToCurrent }: HistoryViewProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    const updated = deleteFromHistory(id);
    setItems(updated);
  };

  const handleConfirmClear = () => {
    clearHistory();
    setItems([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col min-h-[75vh] bg-[#faf8f5] text-stone-800 rounded-3xl border border-stone-200/80 shadow-md p-6 sm:p-8 relative w-full my-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Companion expression="friendly" size={46} />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
              Decision Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Your Decision History
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Revisit past decisions, explore assumptions, and view thinking maps.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 animate-fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-lg">Clear your decision history?</h3>
              </div>
            </div>
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              This will permanently remove your saved reflections and thinking maps.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-colors cursor-pointer"
              >
                Clear history
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
          <Companion expression="welcoming" size="clamp(80px, 12vw, 120px)" className="mb-4 opacity-90" />
          <h2 className="text-lg font-semibold text-stone-700 mb-1">No saved decisions yet</h2>
          <p className="text-xs text-stone-400 max-w-sm mb-6 leading-relaxed">
            As you reflect on decisions using Reflecta, your explorations will automatically appear here.
          </p>
          {onBackToCurrent && (
            <button onClick={onBackToCurrent} className="btn-primary">
              Start a new decision →
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {items.map((item) => {
            const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            const keyQuestion = item.reflection?.keyQuestion || item.analysis?.bestNextQuestion;
            const blindSpotCount = (item.analysis?.assumptions?.length || 0) + (item.analysis?.evidenceGaps?.length || 0);
            const uncertaintyCount = item.analysis?.unclear?.length || 0;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => onSelectDecision && onSelectDecision(item)}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {dateStr}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-1 transition-opacity cursor-pointer"
                      title="Delete decision"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mb-2 leading-snug line-clamp-2">
                    "{item.title}"
                  </h3>

                  {keyQuestion && (
                    <div className="bg-violet-50/70 border border-violet-100 p-3 rounded-xl mb-3 text-xs text-violet-950 italic">
                      <span className="font-semibold text-violet-700 not-italic block mb-0.5">Key Question:</span>
                      "{keyQuestion}"
                    </div>
                  )}

                  {/* Spec Metadata Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="text-[10px] font-semibold bg-violet-100 text-violet-800 px-2 py-0.5 rounded-full">
                      1 thinking map
                    </span>
                    {blindSpotCount > 0 && (
                      <span className="text-[10px] font-semibold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                        {blindSpotCount} blind spot{blindSpotCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {uncertaintyCount > 0 && (
                      <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {uncertaintyCount} uncertaint{uncertaintyCount > 1 ? 'ies' : 'y'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                  {onOpenMap && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMap(item);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer"
                    >
                      <Map size={13} />
                      <span>Thinking Map</span>
                    </button>
                  )}
                  {onSelectDecision && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDecision(item);
                      }}
                      className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer"
                    >
                      <span>Open</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
