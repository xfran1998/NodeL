import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData, PinDef } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

export default function CallFunctionNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const fnId = data.functionId as string;
  const functions = useFlowStore((s) => s.functions);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const fn = functions[fnId];
  if (!fn) {
    // Function was deleted but node remains — show placeholder
    return (
      <BlueprintNodeShell
        nodeId={id}
        label="??? (deleted)"
        headerColor="#6b7280"
        icon="f(x)"
        pinsLeft={[{ id: 'exec-in', kind: 'exec' }]}
        pinsRight={[{ id: 'exec-out', kind: 'exec' }]}
        selected={selected}
        className="blueprint-node--call-function"
      />
    );
  }

  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  // Build dynamic pins from function definition
  const pinsLeft: PinDef[] = [
    { id: 'exec-in', kind: 'exec' },
    ...fn.params.map((p) => ({
      id: p.id,
      kind: 'data' as const,
      label: p.name,
      dataType: p.dataType,
      inline: true,
    })),
  ];

  const pinsRight: PinDef[] = [
    { id: 'exec-out', kind: 'exec' },
    ...fn.returns.map((r) => ({
      id: r.id,
      kind: 'data' as const,
      label: r.name,
      dataType: r.dataType,
    })),
  ];

  return (
    <BlueprintNodeShell
      nodeId={id}
      label={fn.name}
      headerColor={fn.color}
      icon="f(x)"
      pinsLeft={pinsLeft}
      pinsRight={pinsRight}
      selected={selected}
      className="blueprint-node--call-function"
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    />
  );
}
