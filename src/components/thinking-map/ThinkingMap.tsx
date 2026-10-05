'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Node, Edge } from '@xyflow/react';
import type { ReasoningAnalysis, ChallengeExchange, ReflectionSummary } from '@/types';
import { buildThinkingMap, ThinkingMapCategory, NodeData } from '@/lib/reasoning/buildThinkingMap';

// Custom Node Imports
import { DecisionNode } from './nodes/DecisionNode';
import { KnownNode } from './nodes/KnownNode';
import { BeliefNode } from './nodes/BeliefNode';
import { AssumptionNode } from './nodes/AssumptionNode';
import { UncertaintyNode } from './nodes/UncertaintyNode';
import { ChallengeNode } from './nodes/ChallengeNode';
import { QuestionNode } from './nodes/QuestionNode';
import { NodeDetailsPanel } from './NodeDetailsPanel';

import { Companion } from '@/components/Companion';
import { Filter, Sparkles, ArrowRight, RefreshCw, Target } from 'lucide-react';
import { useReactFlow } from '@xyflow/react';

function MapCanvasWithControls({
  nodes,
  edges,
  nodeTypes,
  onNodeClick,
}: {
  nodes: Node<NodeData>[];
  edges: Edge[];
  nodeTypes: typeof NODE_TYPES;
  onNodeClick: (_: React.MouseEvent, node: Node) => void;
}) {
  const { fitView } = useReactFlow();

  const handleFocus = () => {
    fitView({
      nodes: [
        { id: 'decision' },
        { id: 'assumption-0' },
        { id: 'challenge-0' },
        { id: 'new-question' },
      ],
      padding: 0.25,
      duration: 500,
    });
  };

  return (
    <div className="w-full h-[600px] min-h-[600px] relative bg-[#faf8f5]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#a78bfa' },
        }}
      >
        <Background color="#d6d3d1" gap={24} size={1} />
        <Controls className="!bg-white !border-stone-200 !shadow-md !rounded-xl" />

        {/* Floating Focus button (spec §17) */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleFocus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-violet-700 text-xs font-bold shadow-md border border-violet-200 hover:bg-violet-50 cursor-pointer transition-all hover:scale-105"
            title="Focus main reasoning path"
          >
            <Target size={13} />
            <span>Focus</span>
          </button>
        </div>
      </ReactFlow>
    </div>
  );
}

const NODE_TYPES = {
  decision: DecisionNode,
  known: KnownNode,
  belief: BeliefNode,
  assumption: AssumptionNode,
  uncertainty: UncertaintyNode,
  challenge: ChallengeNode,
  question: QuestionNode,
};

interface ThinkingMapProps {
  title?: string;
  reasoning?: string;
  analysis?: ReasoningAnalysis | null;
  challengeExchanges?: ChallengeExchange[];
  reflection?: ReflectionSummary | null;
  onContinueToChallenge?: () => void;
}

const FILTERS: { id: ThinkingMapCategory; label: string }[] = [
  { id: 'all', label: 'Everything' },
  { id: 'known', label: 'Known' },
  { id: 'belief', label: 'Beliefs' },
  { id: 'assumption', label: 'Assumptions' },
  { id: 'unclear', label: 'Unclear' },
  { id: 'question', label: 'Questions' },
];

export function ThinkingMap({
  title = 'Should I accept this internship?',
  reasoning = '',
  analysis = null,
  challengeExchanges = [],
  reflection = null,
  onContinueToChallenge,
}: ThinkingMapProps) {
  const [activeFilter, setActiveFilter] = useState<ThinkingMapCategory>('all');
  const [mode, setMode] = useState<'after' | 'before'>('after');
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  // Generate map data
  const mapData = useMemo(() => {
    return buildThinkingMap(title, reasoning, analysis, challengeExchanges, reflection, mode);
  }, [title, reasoning, analysis, challengeExchanges, reflection, mode]);

  // Apply filter opacity to nodes
  const filteredNodes = useMemo(() => {
    return mapData.nodes.map((node) => {
      if (activeFilter === 'all') return { ...node, style: { opacity: 1 } };
      
      const isMatch = node.type === 'decision' ||
        node.data.category === activeFilter ||
        (activeFilter === 'question' && (node.data.category === 'question' || node.data.category === 'challenge'));

      return {
        ...node,
        style: {
          opacity: isMatch ? 1 : 0.25,
          filter: isMatch ? 'none' : 'grayscale(60%)',
          transition: 'all 0.3s ease',
        },
      };
    });
  }, [mapData.nodes, activeFilter]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<NodeData>);
  }, []);

  const toggleMode = () => {
    setMode((prev) => (prev === 'after' ? 'before' : 'after'));
  };

  return (
    <div className="flex flex-col bg-[#faf8f5] text-stone-800 rounded-3xl border border-stone-200/80 shadow-md overflow-hidden relative w-full my-4">
      
      {/* ── Top Header Section ────────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm border-b border-stone-200/60 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Companion expression="thoughtful" size={48} />
            <span className="text-xs font-extrabold uppercase tracking-wider text-violet-700 bg-violet-100/80 px-3 py-1 rounded-full border border-violet-200">
              Reflecta Thinking Map
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Your Thinking Map
          </h1>
          <p className="text-base font-bold text-violet-800 mt-1">
            See how your thinking changed.
          </p>
          <p className="text-sm font-medium text-stone-600 max-w-2xl mt-2 leading-relaxed">
            This map doesn’t tell you what to choose. It shows you what you considered, what you assumed, and what you still don’t know.
          </p>
        </div>

        {/* Top Right "What Changed?" Toggle Button */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <button
            onClick={toggleMode}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-extrabold transition-all duration-300 shadow-sm cursor-pointer border ${
              mode === 'before'
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                : 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700 hover:shadow-md'
            }`}
          >
            <RefreshCw size={15} className={mode === 'before' ? 'animate-spin' : ''} />
            {mode === 'after' ? 'See what changed (Before vs After)' : 'Viewing: Initial Thinking'}
          </button>
          
          {mode === 'before' && (
            <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1.5 rounded-xl border border-amber-300">
              Showing initial surface-level factors
            </span>
          )}
        </div>
      </div>

      {/* ── Signature Moment Banner ────────────────────────────────────────── */}
      {mode === 'after' && (
        <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-pink-50 px-6 py-3 border-b border-purple-100 flex items-center justify-between text-sm text-violet-950 font-semibold">
          <div className="flex items-center gap-2.5">
            <Sparkles size={16} className="text-violet-600 flex-shrink-0" />
            <span>
              <strong>Your decision didn't change.</strong> Your view of it did.
            </span>
          </div>
          <span className="text-xs font-semibold text-violet-700 hidden sm:inline">
            Click any node to explore details
          </span>
        </div>
      )}

      {/* ── Filter Pills Bar ──────────────────────────────────────────────── */}
      <div className="px-6 py-3.5 bg-white/70 border-b border-stone-200/50 flex items-center gap-2.5 overflow-x-auto">
        <Filter size={15} className="text-stone-500 ml-1 mr-1 flex-shrink-0" />
        <span className="text-sm font-bold text-stone-700 mr-2 flex-shrink-0">Filters:</span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === f.id
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200/80 border border-stone-200/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Interactive Canvas Container (Height 650px) ─────────────── */}
      <div className="w-full h-[650px] min-h-[650px] relative bg-[#faf8f5]">
        <ReactFlowProvider>
          <MapCanvasWithControls
            nodes={filteredNodes}
            edges={mapData.edges}
            nodeTypes={NODE_TYPES}
            onNodeClick={onNodeClick}
          />
          <NodeDetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </ReactFlowProvider>
      </div>

      {/* ── Bottom Legend & Action Bar ─────────────────────────────────────── */}
      <div className="p-5 sm:p-7 bg-white/95 backdrop-blur-sm border-t border-stone-200/80 flex flex-col md:flex-row items-center justify-between gap-5">
        
        {/* Color Dots Legend */}
        <div className="flex items-center flex-wrap gap-4 sm:gap-6 text-sm font-bold text-stone-700">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
            <span>Known</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm" />
            <span>Belief</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm" />
            <span>Assumption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
            <span>Unclear</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-pink-500 shadow-sm" />
            <span>Challenge</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
            <span>New Question</span>
          </div>
        </div>

        {/* Product philosophy note & CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center md:text-right">
          <div>
            <p className="text-sm font-bold text-stone-800">
              Reflecta doesn’t choose for you.
            </p>
            <p className="text-xs font-semibold text-stone-500">
              It helps you see what your thinking might have missed.
            </p>
          </div>

          {onContinueToChallenge && (
            <button
              onClick={onContinueToChallenge}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-violet-600 text-white font-extrabold text-sm shadow-lg hover:bg-violet-700 transition-all cursor-pointer whitespace-nowrap hover:scale-105"
            >
              <span>Challenge my thinking</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
