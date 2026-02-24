import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';

export default function WhileNode({ id, selected }: NodeProps<Node<BlueprintNodeData>>) {
  return (
    <BlueprintNodeShell
      nodeId={id}
      label="While"
      headerColor="#f97316"
      icon="↻"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'condition', kind: 'data', label: 'condition', dataType: 'boolean' },
      ]}
      pinsRight={[
        { id: 'done', kind: 'exec', label: 'Done' },
        { id: 'body', kind: 'exec', label: 'Body' },
      ]}
      selected={selected}
    />
  );
}
