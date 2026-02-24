import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData, PinDef, DataType } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

const DATA_TYPE_OPTIONS: DataType[] = ['number', 'string', 'boolean', 'array', 'any'];

export default function FunctionReturnNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const fnId = data.functionId as string;
  const functions = useFlowStore((s) => s.functions);
  const addFunctionReturn = useFlowStore((s) => s.addFunctionReturn);
  const removeFunctionReturn = useFlowStore((s) => s.removeFunctionReturn);
  const updateFunctionReturn = useFlowStore((s) => s.updateFunctionReturn);
  const updateNodeData = useFlowStore((s) => s.updateNodeData);

  const fn = functions[fnId];
  if (!fn) return null;

  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  // Build dynamic left pins: exec-in + one data pin per return value
  const pinsLeft: PinDef[] = [
    { id: 'exec-in', kind: 'exec' },
    ...fn.returns.map((r) => ({
      id: r.id,
      kind: 'data' as const,
      label: r.name,
      dataType: r.dataType,
      inline: true,
    })),
  ];

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Return"
      headerColor={fn.color}
      icon="↩"
      pinsLeft={pinsLeft}
      pinsRight={[]}
      selected={selected}
      className="blueprint-node--function-return"
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    >
      <div className="fn-params-editor">
        {fn.returns.map((r) => (
          <div key={r.id} className="fn-param-row">
            <input
              type="text"
              className="fn-param-name nodrag"
              value={r.name}
              placeholder="name"
              onChange={(e) => updateFunctionReturn(fnId, r.id, { name: e.target.value })}
            />
            <select
              className="fn-param-type nodrag"
              value={r.dataType}
              onChange={(e) => updateFunctionReturn(fnId, r.id, { dataType: e.target.value as DataType })}
            >
              {DATA_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              className="fn-param-remove nodrag"
              onClick={() => removeFunctionReturn(fnId, r.id)}
              title="Remove return"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          className="fn-param-add nodrag"
          onClick={() => addFunctionReturn(fnId)}
        >
          + Return
        </button>
      </div>
    </BlueprintNodeShell>
  );
}
