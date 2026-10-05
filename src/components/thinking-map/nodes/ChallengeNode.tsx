import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NodeData } from '@/lib/reasoning/buildThinkingMap';
import { MessageSquare } from 'lucide-react';

export const ChallengeNode = memo(function ChallengeNode({
  data,
  selected,
}: NodeProps<Node<NodeData>>) {
  return (
    <div
      className={`relative px-6 py-4.5 rounded-3xl bg-pink-50 text-pink-950 border-2 transition-all duration-300 max-w-[320px] shadow-md ${
        selected ? 'ring-4 ring-pink-300 border-pink-400 scale-105 bg-pink-100' : 'border-pink-300 hover:border-pink-400 hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-pink-500 !w-3.5 !h-3.5 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-pink-500 !w-3.5 !h-3.5 !border-2 !border-white"
      />
      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-extrabold tracking-wider text-pink-800 uppercase">
        <MessageSquare size={14} className="text-pink-600" />
        REFLECTA CHALLENGE
      </div>
      <p className="text-sm font-bold leading-relaxed text-pink-950">
        "{data.label}"
      </p>
    </div>
  );
});
