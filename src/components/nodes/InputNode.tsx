import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

export default function InputNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';
  const prompt = (data.prompt as string) || '';

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Leer"
      headerColor="#06b6d4"
      icon="📥"
      pinsLeft={[{ id: 'exec-in', kind: 'exec' }]}
      pinsRight={[{ id: 'exec-out', kind: 'exec' }]}
      selected={selected}
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
      <div className="blueprint-field">
        <label>Prompt</label>
        <input
          type="text"
          value={prompt}
          className="nodrag"
          placeholder="mensaje"
          onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}
