import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';

export default function ExecEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: EdgeProps) {
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
      {/* Solid base path */}
      <path id={id} className="exec-edge-path" d={edgePath} />
      {/* Animated particle overlay */}
      <path
        d={edgePath}
        className="exec-edge-path exec-edge-animated"
        style={{ opacity: 0.6 }}
      />
    </>
  );
}
