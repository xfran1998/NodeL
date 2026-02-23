import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData, PinDef } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

const PINS_LEFT: PinDef[] = [
  { id: 'a', kind: 'data', label: 'A', dataType: 'string', inline: true },
  { id: 'b', kind: 'data', label: 'B', dataType: 'string', inline: true },
];

const PINS_RIGHT: PinDef[] = [
  { id: 'result', kind: 'data', label: 'result', dataType: 'string' },
];

export default function ConcatNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Append"
      headerColor="#f472b6"
      pinsLeft={PINS_LEFT}
      pinsRight={PINS_RIGHT}
      selected={selected}
      className="blueprint-node--compact"
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    />
  );
}
