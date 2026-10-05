import type { ReasoningAnalysis, ChallengeExchange, ReflectionSummary } from '@/types';
import type { Node, Edge } from '@xyflow/react';

export type ThinkingMapCategory = 'all' | 'known' | 'belief' | 'assumption' | 'unclear' | 'question' | 'challenge';

export interface NodeData {
  label: string;
  category: ThinkingMapCategory;
  sublabel?: string;
  whyItMatters?: string;
  evidence?: string;
  reflectaAsked?: string;
  expandedDetails?: string[];
  [key: string]: unknown;
}

export interface ThinkingMapData {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

/**
 * Builds nodes and edges for React Flow based on user's decision data.
 * @param title Decision title
 * @param reasoning User reasoning
 * @param analysis Reasoning analysis from Explore stage
 * @param challengeExchanges Interrogations from Challenge stage
 * @param reflection Final reflection output
 * @param mode 'before' | 'after' for "What changed?" visualization
 */
export function buildThinkingMap(
  title: string = 'Should I accept this internship?',
  reasoning: string = '',
  analysis: ReasoningAnalysis | null = null,
  challengeExchanges: ChallengeExchange[] = [],
  reflection: ReflectionSummary | null = null,
  mode: 'before' | 'after' = 'after'
): ThinkingMapData {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];

  // Default demo data if input is sparse (e.g. initial landing on map)
  const defaultTitle = title || 'Should I accept this internship?';
  
  const knownItems = analysis?.known?.length
    ? analysis.known
    : ['₹20,000 stipend', '6-month commitment', 'Flexible remote hours'];
    
  const beliefItems = analysis?.beliefs?.length
    ? analysis.beliefs
    : ['Helps my career', 'Good resume value', 'Great experience'];
    
  const assumptionItems = analysis?.assumptions?.length
    ? analysis.assumptions
    : ['More experience automatically means better career growth'];

  const unclearItems = analysis?.unclear?.length
    ? analysis.unclear
    : ['Actual workload', 'College exam impact', 'Mentorship quality'];

  const challengeQuestion = challengeExchanges[0]?.question || analysis?.bestNextQuestion ||
    'What evidence tells you that this role will actually provide valuable experience?';

  const challengeAnswer = challengeExchanges[0]?.userResponse ||
    'I haven\'t spoken with past interns yet to verify mentorship.';

  const newQuestionText = reflection?.keyQuestion ||
    'What would I need to know before deciding?';

  // 1. Root Decision Node (Column 0, Y: 250)
  nodes.push({
    id: 'decision',
    type: 'decision',
    position: { x: 50, y: 220 },
    data: {
      label: defaultTitle,
      category: 'all',
      whyItMatters: 'This is the core choice you are currently examining.',
      evidence: 'Root decision topic',
    },
  });

  if (mode === 'before') {
    // BEFORE MODE: Shows initial superficial thinking
    const isNagpur = defaultTitle.toLowerCase().includes('nagpur') || defaultTitle.toLowerCase().includes('duronto');
    const initialFactors = isNagpur
      ? [
          { id: 'b-cheap', type: 'known', label: 'Cheap', category: 'known' as ThinkingMapCategory },
          { id: 'b-comfort', type: 'belief', label: 'Comfortable', category: 'belief' as ThinkingMapCategory },
          { id: 'b-convenient', type: 'belief', label: 'Convenient', category: 'belief' as ThinkingMapCategory },
        ]
      : [
          { id: 'b-stipend', type: 'known', label: 'Cheap / Stipend', category: 'known' as ThinkingMapCategory },
          { id: 'b-company', type: 'belief', label: 'Comfortable / Company', category: 'belief' as ThinkingMapCategory },
          { id: 'b-resume', type: 'belief', label: 'Convenient', category: 'belief' as ThinkingMapCategory },
        ];

    initialFactors.forEach((factor, idx) => {
      nodes.push({
        id: factor.id,
        type: factor.type,
        position: { x: 380, y: 120 + idx * 110 },
        data: {
          label: factor.label,
          category: factor.category,
          whyItMatters: 'Initial factor considered before deep reflection.',
          evidence: 'Initial surface-level thought.',
        },
      });

      edges.push({
        id: `e-decision-${factor.id}`,
        source: 'decision',
        target: factor.id,
        animated: true,
        style: { stroke: '#a78bfa', strokeWidth: 2 },
      });
    });

    return { nodes, edges };
  }

  // AFTER MODE: Full structured reasoning map

  // Column 1: KNOWN items (Top branch)
  knownItems.slice(0, 3).forEach((item, idx) => {
    const id = `known-${idx}`;
    nodes.push({
      id,
      type: 'known',
      position: { x: 380, y: 40 + idx * 90 },
      data: {
        label: item,
        category: 'known',
        whyItMatters: 'Factually established information observed directly.',
        evidence: 'Verified fact',
      },
    });
    edges.push({
      id: `e-decision-${id}`,
      source: 'decision',
      target: id,
      style: { stroke: '#10b981', strokeWidth: 2 },
    });
  });

  // Column 1: BELIEF items (Middle branch)
  const beliefNodeIds: string[] = [];
  beliefItems.slice(0, 3).forEach((item, idx) => {
    const id = `belief-${idx}`;
    beliefNodeIds.push(id);
    nodes.push({
      id,
      type: 'belief',
      position: { x: 380, y: 310 + idx * 90 },
      data: {
        label: item,
        category: 'belief',
        whyItMatters: 'This belief is strongly influencing your outlook on this decision.',
        evidence: 'Not fully established as fact yet.',
        reflectaAsked: 'What evidence supports this belief?',
      },
    });
    edges.push({
      id: `e-decision-${id}`,
      source: 'decision',
      target: id,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    });
  });

  // Column 1: UNCLEAR items (Bottom branch)
  unclearItems.slice(0, 3).forEach((item, idx) => {
    const id = `unclear-${idx}`;
    nodes.push({
      id,
      type: 'uncertainty',
      position: { x: 380, y: 580 + idx * 90 },
      data: {
        label: item,
        category: 'unclear',
        whyItMatters: 'An open piece of information that remains to be clarified.',
        evidence: 'Uncertain / missing information',
        expandedDetails: [
          'Expected weekly workload hours',
          'Exam flexibility & project deadlines',
          'Mentorship availability & feedback cadence',
        ],
      },
    });
    edges.push({
      id: `e-decision-${id}`,
      source: 'decision',
      target: id,
      style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5 5' },
    });
  });

  // Column 2: ASSUMPTION NODE (Connected to primary belief)
  const primaryBeliefId = beliefNodeIds[0] || 'decision';
  nodes.push({
    id: 'assumption-0',
    type: 'assumption',
    position: { x: 700, y: 260 },
    data: {
      label: assumptionItems[0],
      category: 'assumption',
      whyItMatters: 'An implicit premise extracted from your reasoning that warrants examination.',
      evidence: 'Assumption — needs evidence to validate.',
    },
  });
  edges.push({
    id: `e-${primaryBeliefId}-assumption-0`,
    source: primaryBeliefId,
    target: 'assumption-0',
    style: { stroke: '#f97316', strokeWidth: 2, strokeDasharray: '4 4' },
  });

  // Column 3: CHALLENGE NODE (Connected to assumption)
  nodes.push({
    id: 'challenge-0',
    type: 'challenge',
    position: { x: 1020, y: 240 },
    data: {
      label: challengeQuestion,
      category: 'challenge',
      whyItMatters: 'Reflecta generated this targeted question to test your implicit assumption.',
      evidence: challengeAnswer,
      reflectaAsked: challengeQuestion,
    },
  });
  edges.push({
    id: 'e-assumption-challenge',
    source: 'assumption-0',
    target: 'challenge-0',
    animated: true,
    style: { stroke: '#ec4899', strokeWidth: 2.5 },
  });

  // Column 4: NEW QUESTION NODE (Connected to challenge)
  nodes.push({
    id: 'new-question',
    type: 'question',
    position: { x: 1360, y: 240 },
    data: {
      label: newQuestionText,
      category: 'question',
      whyItMatters: 'A key open question emerged from your reflection to guide your next steps.',
      evidence: 'Discovered during Socratic reflection.',
    },
  });
  edges.push({
    id: 'e-challenge-question',
    source: 'challenge-0',
    target: 'new-question',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2.5 },
  });

  return { nodes, edges };
}
