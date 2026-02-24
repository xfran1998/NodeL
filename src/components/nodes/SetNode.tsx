import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData, DataType } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

const DATA_TYPE_OPTIONS: DataType[] = ['number', 'string', 'boolean', 'array', 'any'];

export default function SetNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const updateOutgoingEdgeTypes = useFlowStore((s) => s.updateOutgoingEdgeTypes);
  const varName = (data.variable as string) || '';
  const valueType = (data.valueType as DataType) || 'any';
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Set"
      headerColor="#a855f7"
      icon="←"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'value', kind: 'data', label: 'value', dataType: valueType, inline: true },
      ]}
      pinsRight={[
        { id: 'exec-out', kind: 'exec' },
        { id: 'out-value', kind: 'data', label: 'value', dataType: valueType },
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
      <div className="blueprint-field">
        <label>Type</label>
        <select
          className="fn-param-type nodrag"
          value={valueType}
          onChange={(e) => {
            const newType = e.target.value as DataType;
            updateNodeData(id, { valueType: newType });
            updateOutgoingEdgeTypes(id, 'out-value', newType);
            if (newType === 'boolean' && inlineValues['value'] !== 'true' && inlineValues['value'] !== 'false') {
              updateNodeData(id, { inlineValues: { ...inlineValues, value: 'false' } });
            }
          }}
        >
          {DATA_TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </BlueprintNodeShell>
  );
}
