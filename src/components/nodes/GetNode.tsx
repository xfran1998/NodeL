import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

export default function GetNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Get"
      headerColor="#c084fc"
      icon="→"
      pinsLeft={[]}
      pinsRight={[{ id: 'value', kind: 'data', label: 'value', dataType: 'any' }]}
      selected={selected}
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
