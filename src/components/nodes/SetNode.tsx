import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

export default function SetNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Set"
      headerColor="#a855f7"
      icon="←"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'value', kind: 'data', label: 'value', dataType: 'any', inline: true },
      ]}
      pinsRight={[
        { id: 'exec-out', kind: 'exec' },
        { id: 'out-value', kind: 'data', label: 'value', dataType: 'any' },
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
          placeholder="nombre"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}
