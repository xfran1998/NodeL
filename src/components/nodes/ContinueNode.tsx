import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';

export default function ContinueNode({ id, selected }: NodeProps<Node<BlueprintNodeData>>) {
  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Continue"
      headerColor="#f59e0b"
      icon="↷"
      pinsLeft={[{ id: 'exec-in', kind: 'exec' }]}
      pinsRight={[]}
      selected={selected}
    />
  );
}
