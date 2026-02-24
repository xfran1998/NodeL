import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

export default function InputNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Leer"
      headerColor="#06b6d4"
      icon="📥"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'prompt', kind: 'data', label: 'prompt', dataType: 'string', inline: true },
      ]}
      pinsRight={[
        { id: 'exec-out', kind: 'exec' },
        { id: 'out-value', kind: 'data', label: varName || 'value', dataType: 'number' },
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
          placeholder="variable"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}
