import React from 'react';
import { X, Sparkles, CheckCircle2, AlertCircle, HelpCircle, MessageSquare, Compass } from 'lucide-react';
import type { Node } from '@xyflow/react';
import type { NodeData } from '@/lib/reasoning/buildThinkingMap';

interface NodeDetailsPanelProps {
  node: Node<NodeData> | null;
  onClose: () => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  all: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
    icon: <Sparkles size={16} className="text-violet-600" />,
    label: 'DECISION TOPIC',
  },
  known: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: <CheckCircle2 size={16} className="text-emerald-600" />,
    label: 'KNOWN FACT',
  },
  belief: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: <Sparkles size={16} className="text-purple-600" />,
    label: 'BELIEF',
  },
  assumption: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: <AlertCircle size={16} className="text-orange-600" />,
    label: 'ASSUMPTION',
  },
  unclear: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: <HelpCircle size={16} className="text-amber-600" />,
    label: 'UNCLEAR / MISSING INFO',
  },
  challenge: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200',
    icon: <MessageSquare size={16} className="text-pink-600" />,
    label: 'REFLECTA CHALLENGE',
  },
  question: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: <Compass size={16} className="text-blue-600" />,
    label: 'DISCOVERED QUESTION',
  },
};

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  if (!node) return null;

  const data = node.data;
  const style = CATEGORY_STYLES[data.category] || CATEGORY_STYLES.all;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-2xl border-l border-stone-200 p-7 overflow-y-auto animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold ${style.bg} ${style.text} border ${style.border}`}>
          {style.icon}
          {style.label}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X size={20} />
        </button>
      </div>

      {/* Title */}
      <h2 className="text-xl font-extrabold text-stone-900 mb-6 leading-snug">
        "{data.label}"
      </h2>

      {/* Content Blocks */}
      <div className="space-y-6 text-sm">
        {/* Why it matters */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
            Why it matters
          </h3>
          <p className="text-base text-stone-800 font-medium leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
            {data.whyItMatters || 'This thought forms a key component of your reasoning tree.'}
          </p>
        </div>

        {/* Evidence Status */}
        {data.evidence && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
              Evidence Status
            </h3>
            <p className="text-base text-stone-800 font-medium leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-100">
              {data.evidence}
            </p>
          </div>
        )}

        {/* Reflecta asked */}
        {data.reflectaAsked && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-1.5">
              Reflecta Asked
            </h3>
            <p className="text-base text-violet-950 font-semibold leading-relaxed bg-violet-50/90 p-4 rounded-2xl border border-violet-100 italic">
              "{data.reflectaAsked}"
            </p>
          </div>
        )}

        {/* Expanded details list */}
        {data.expandedDetails && data.expandedDetails.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
              Unestablished Aspects
            </h3>
            <ul className="space-y-2.5">
              {data.expandedDetails.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-stone-800 text-sm font-medium bg-amber-50/80 p-3 rounded-xl border border-amber-200/70">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer Reflection Tip */}
      <div className="mt-10 pt-5 border-t border-stone-100 text-center">
        <p className="text-xs font-medium text-stone-500 italic">
          Reflecta presents your thinking to reveal clarity, not to dictate choices.
        </p>
      </div>
    </div>
  );
}
