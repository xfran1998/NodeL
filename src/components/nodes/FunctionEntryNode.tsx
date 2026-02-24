import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData, PinDef, DataType } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

const DATA_TYPE_OPTIONS: DataType[] = ['number', 'string', 'boolean', 'array', 'any'];

export default function FunctionEntryNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const fnId = data.functionId as string;
  const functions = useFlowStore((s) => s.functions);
  const addFunctionParam = useFlowStore((s) => s.addFunctionParam);
  const removeFunctionParam = useFlowStore((s) => s.removeFunctionParam);
  const updateFunctionParam = useFlowStore((s) => s.updateFunctionParam);

  const fn = functions[fnId];
  if (!fn) return null;

  // Build dynamic right pins: exec-out + one data pin per param
  const pinsRight: PinDef[] = [
    { id: 'exec-out', kind: 'exec' },
    ...fn.params.map((p) => ({
      id: p.id,
      kind: 'data' as const,
      label: p.name,
      dataType: p.dataType,
    })),
  ];

  return (
    <BlueprintNodeShell
      nodeId={id}
      label={fn.name}
      headerColor={fn.color}
      icon="f(x)"
      pinsLeft={[]}
      pinsRight={pinsRight}
      selected={selected}
      className="blueprint-node--function-entry"
    >
      <div className="fn-params-editor">
        {fn.params.map((p) => (
          <div key={p.id} className="fn-param-row">
            <input
              type="text"
              className="fn-param-name nodrag"
              value={p.name}
              placeholder="name"
              onChange={(e) => updateFunctionParam(fnId, p.id, { name: e.target.value })}
            />
            <select
              className="fn-param-type nodrag"
              value={p.dataType}
              onChange={(e) => updateFunctionParam(fnId, p.id, { dataType: e.target.value as DataType })}
            >
              {DATA_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              className="fn-param-remove nodrag"
              onClick={() => removeFunctionParam(fnId, p.id)}
              title="Remove parameter"
            >
              &times;
            </button>
          </div>
        ))}
        <button
          className="fn-param-add nodrag"
          onClick={() => addFunctionParam(fnId)}
        >
          + Param
        </button>
      </div>
    </BlueprintNodeShell>
  );
}
