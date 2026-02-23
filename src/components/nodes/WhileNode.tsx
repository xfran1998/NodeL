import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';

export default function WhileNode({ id, selected }: NodeProps<Node<BlueprintNodeData>>) {
  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Mientras"
      headerColor="#f97316"
      icon="↻"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'condition', kind: 'data', label: 'condition', dataType: 'boolean' },
      ]}
      pinsRight={[
        { id: 'body', kind: 'exec', label: 'Cuerpo' },
        { id: 'done', kind: 'exec', label: 'Fin' },
      ]}
      selected={selected}
    />
  );
}
