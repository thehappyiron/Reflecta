import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { NodeData } from '@/lib/reasoning/buildThinkingMap';
import { CheckCircle2 } from 'lucide-react';

export const KnownNode = memo(function KnownNode({
  data,
  selected,
}: NodeProps<Node<NodeData>>) {
  return (
    <div
      className={`relative px-5 py-4 rounded-2xl bg-emerald-50 text-emerald-950 border transition-all duration-300 max-w-[280px] shadow-sm ${
        selected ? 'ring-4 ring-emerald-300 border-emerald-400 bg-emerald-100 scale-105' : 'border-emerald-300/80 hover:border-emerald-400 hover:shadow-md'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-emerald-500 !w-3 !h-3 !border-2 !border-white"
      />
      <div className="flex items-center gap-1.5 mb-1 text-xs font-extrabold tracking-wider text-emerald-700 uppercase">
        <CheckCircle2 size={14} className="text-emerald-600" />
        KNOWN FACT
      </div>
      <p className="text-sm font-semibold leading-relaxed text-emerald-950">
        {data.label}
      </p>
    </div>
  );
});
