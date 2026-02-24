import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import useExecutionStore from '../../hooks/useExecutionStore';

export default function ExecEdge({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
  const isActive = useExecutionStore((s) => s.executingNodeId === source);

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      {/* Invisible wider path for easier click/hover detection */}
      <path d={edgePath} style={{ stroke: 'transparent', strokeWidth: 20, fill: 'none' }} />
      {/* Solid base path */}
      <path
        id={id}
        className={`exec-edge-path${isActive ? ' exec-edge-path--active' : ''}`}
        d={edgePath}
      />
      {/* Animated particle overlay */}
      <path
        d={edgePath}
        className={`exec-edge-path exec-edge-animated${isActive ? ' exec-edge-animated--active' : ''}`}
        style={{ opacity: isActive ? 1 : 0.6 }}
      />
    </>
  );
}
