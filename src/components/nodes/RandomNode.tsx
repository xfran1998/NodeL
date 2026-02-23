import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

export default function RandomNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Random"
      headerColor="#f472b6"
      icon="🎲"
      pinsLeft={[
        { id: 'min', kind: 'data', label: 'min', dataType: 'number', inline: true },
        { id: 'max', kind: 'data', label: 'max', dataType: 'number', inline: true },
      ]}
      pinsRight={[
        { id: 'value', kind: 'data', label: 'value', dataType: 'number' },
      ]}
      selected={selected}
      className="blueprint-node--compact"
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    />
  );
}
