import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

export default function ForNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || 'i';
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Para"
      headerColor="#14b8a6"
      icon="⟳"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'desde', kind: 'data', label: 'desde', dataType: 'number', inline: true },
        { id: 'hasta', kind: 'data', label: 'hasta', dataType: 'number', inline: true },
        { id: 'paso', kind: 'data', label: 'paso', dataType: 'number', inline: true },
      ]}
      pinsRight={[
        { id: 'done', kind: 'exec', label: 'Fin' },
        { id: 'body', kind: 'exec', label: 'Cuerpo' },
        { id: 'i', kind: 'data', label: 'i', dataType: 'number' },
      ]}
      selected={selected}
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    >
      <div className="blueprint-field">
        <label>Var</label>
        <input
          type="text"
          value={varName}
          className="nodrag"
          placeholder="i"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}
