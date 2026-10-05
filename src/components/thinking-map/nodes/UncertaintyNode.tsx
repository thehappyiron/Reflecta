import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NodeData } from '@/lib/reasoning/buildThinkingMap';
import { HelpCircle } from 'lucide-react';

export const UncertaintyNode = memo(function UncertaintyNode({
  data,
  selected,
}: NodeProps<Node<NodeData>>) {
  return (
    <div
      className={`relative px-5 py-4 rounded-2xl bg-amber-50 text-amber-950 border transition-all duration-300 max-w-[280px] shadow-sm ${
        selected ? 'ring-4 ring-amber-300 border-amber-400 bg-amber-100 scale-105' : 'border-amber-300 hover:border-amber-400 hover:shadow-md'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-amber-500 !w-3 !h-3 !border-2 !border-white"
      />
      <div className="flex items-center gap-1.5 mb-1 text-xs font-extrabold tracking-wider text-amber-800 uppercase">
        <HelpCircle size={14} className="text-amber-600" />
        UNCLEAR
      </div>
      <p className="text-sm font-semibold leading-relaxed text-amber-950">
        {data.label}
      </p>
    </div>
  );
});
