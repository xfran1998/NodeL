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
      label="For"
      headerColor="#14b8a6"
      icon="⟳"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'from', kind: 'data', label: 'from', dataType: 'number', inline: true },
        { id: 'to', kind: 'data', label: 'to', dataType: 'number', inline: true },
        { id: 'step', kind: 'data', label: 'step', dataType: 'number', inline: true },
      ]}
      pinsRight={[
        { id: 'done', kind: 'exec', label: 'Done' },
        { id: 'body', kind: 'exec', label: 'Body' },
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
