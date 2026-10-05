import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NodeData } from '@/lib/reasoning/buildThinkingMap';
import { Sparkles } from 'lucide-react';

export const BeliefNode = memo(function BeliefNode({
  data,
  selected,
}: NodeProps<Node<NodeData>>) {
  return (
    <div
      className={`relative px-5 py-4 rounded-2xl bg-purple-50 text-purple-950 border transition-all duration-300 max-w-[280px] shadow-sm ${
        selected ? 'ring-4 ring-purple-300 border-purple-400 bg-purple-100 scale-105' : 'border-purple-300/80 hover:border-purple-400 hover:shadow-md'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-purple-500 !w-3 !h-3 !border-2 !border-white"
      />
      <div className="flex items-center gap-1.5 mb-1 text-xs font-extrabold tracking-wider text-purple-700 uppercase">
        <Sparkles size={14} className="text-purple-600" />
        BELIEF
      </div>
      <p className="text-sm font-semibold leading-relaxed text-purple-950">
        {data.label}
      </p>
    </div>
  );
});
