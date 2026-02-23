import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';

export default function NotNode({ id, selected }: NodeProps<Node<BlueprintNodeData>>) {
  return (
    <BlueprintNodeShell
      nodeId={id}
      label="!"
      headerColor="#60a5fa"
      pinsLeft={[
        { id: 'value', kind: 'data', label: 'value', dataType: 'boolean' },
      ]}
      pinsRight={[
        { id: 'result', kind: 'data', label: 'result', dataType: 'boolean' },
      ]}
      selected={selected}
      className="blueprint-node--compact"
    />
  );
}
