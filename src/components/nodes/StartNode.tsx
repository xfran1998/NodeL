import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';

export default function StartNode({ id, selected }: NodeProps<Node<BlueprintNodeData>>) {
  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Start"
      headerColor="#22c55e"
      icon="▶"
      pinsLeft={[]}
      pinsRight={[{ id: 'exec-out', kind: 'exec' }]}
      selected={selected}
    />
  );
}
