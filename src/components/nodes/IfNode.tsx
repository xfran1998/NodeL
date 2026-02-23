import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';

export default function IfNode({ id, selected }: NodeProps<Node<BlueprintNodeData>>) {
  return (
    <BlueprintNodeShell
      nodeId={id}
      label="If"
      headerColor="#f59e0b"
      icon="◇"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'condition', kind: 'data', label: 'condition', dataType: 'boolean' },
      ]}
      pinsRight={[
        { id: 'true', kind: 'exec', label: 'Sí' },
        { id: 'false', kind: 'exec', label: 'No' },
      ]}
      selected={selected}
    />
  );
}
