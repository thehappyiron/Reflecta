import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NodeData } from '@/lib/reasoning/buildThinkingMap';

export const DecisionNode = memo(function DecisionNode({
  data,
  selected,
}: NodeProps<Node<NodeData>>) {
  return (
    <div
      className={`relative group px-7 py-5 rounded-3xl bg-violet-600 text-white shadow-xl transition-all duration-300 max-w-[320px] border ${
        selected ? 'ring-4 ring-violet-300 border-violet-400 scale-105' : 'border-violet-500 hover:shadow-2xl hover:scale-[1.02]'
      }`}
    >
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-violet-300 !w-3.5 !h-3.5 !border-2 !border-white"
      />
      <div className="flex items-center gap-2 mb-1.5 text-xs font-bold tracking-wider text-violet-200 uppercase">
        <span className="w-2.5 h-2.5 rounded-full bg-violet-300 animate-pulse" />
        YOUR DECISION
      </div>
      <p className="text-base font-extrabold leading-snug tracking-tight text-white">
        {data.label}
      </p>
    </div>
  );
});
