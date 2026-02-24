import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';

export default function BreakNode({ id, selected }: NodeProps<Node<BlueprintNodeData>>) {
  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Break"
      headerColor="#ef4444"
      icon="⊘"
      pinsLeft={[{ id: 'exec-in', kind: 'exec' }]}
      pinsRight={[]}
      selected={selected}
    />
  );
}
