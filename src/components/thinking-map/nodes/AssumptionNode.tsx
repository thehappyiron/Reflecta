import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NodeData } from '@/lib/reasoning/buildThinkingMap';
import { AlertCircle } from 'lucide-react';

export const AssumptionNode = memo(function AssumptionNode({
  data,
  selected,
}: NodeProps<Node<NodeData>>) {
  return (
    <div
      className={`relative px-5 py-4 rounded-2xl bg-orange-50 text-orange-950 border-2 border-dashed transition-all duration-300 max-w-[300px] shadow-sm ${
        selected ? 'ring-4 ring-orange-300 border-orange-400 bg-orange-100 scale-105' : 'border-orange-300 hover:border-orange-400 hover:shadow-md'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-orange-500 !w-3 !h-3 !border-2 !border-white"
      />
      <div className="flex items-center gap-1.5 mb-1 text-xs font-extrabold tracking-wider text-orange-800 uppercase">
        <AlertCircle size={14} className="text-orange-600" />
        ASSUMPTION
      </div>
      <p className="text-sm font-semibold leading-relaxed text-orange-950 italic">
        "{data.label}"
      </p>
    </div>
  );
});
