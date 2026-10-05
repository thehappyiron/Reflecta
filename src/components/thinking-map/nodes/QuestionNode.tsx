import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NodeData } from '@/lib/reasoning/buildThinkingMap';
import { Compass } from 'lucide-react';

export const QuestionNode = memo(function QuestionNode({
  data,
  selected,
}: NodeProps<Node<NodeData>>) {
  return (
    <div
      className={`relative px-6 py-4.5 rounded-3xl bg-blue-50 text-blue-950 border-2 transition-all duration-300 max-w-[320px] shadow-md ${
        selected ? 'ring-4 ring-blue-300 border-blue-400 scale-105 bg-blue-100' : 'border-blue-300 hover:border-blue-400 hover:shadow-lg'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !w-3.5 !h-3.5 !border-2 !border-white"
      />
      <div className="flex items-center gap-1.5 mb-1.5 text-xs font-extrabold tracking-wider text-blue-800 uppercase">
        <Compass size={14} className="text-blue-600" />
        NEW QUESTION DISCOVERED
      </div>
      <p className="text-sm font-bold leading-relaxed text-blue-950">
        "{data.label}"
      </p>
    </div>
  );
});
