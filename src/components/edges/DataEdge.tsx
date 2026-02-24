import { getBezierPath, type EdgeProps } from '@xyflow/react';
import { TYPE_COLORS } from '../../constants';
import type { DataType } from '../../types';

interface DataEdgeData {
  dataType?: DataType;
  [key: string]: unknown;
}

export default function DataEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps & { data?: DataEdgeData }) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const color = TYPE_COLORS[(data?.dataType as string) || 'any'];

  return (
    <>
      {/* Invisible wider path for easier click/hover detection */}
      <path d={edgePath} style={{ stroke: 'transparent', strokeWidth: 20, fill: 'none' }} />
      <path
        id={id}
        className="data-edge-path"
        d={edgePath}
        style={{ stroke: color }}
      />
    </>
  );
}
