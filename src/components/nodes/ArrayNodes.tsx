import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData, PinDef } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

const ARRAY_COLOR = '#06b6d4';

// ────────────────────────────────────────────
// ArrayCreate — exec node: let arr = [];
// ────────────────────────────────────────────
export function ArrayCreateNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Array"
      headerColor={ARRAY_COLOR}
      icon="[ ]"
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
          placeholder="arr"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}

// ────────────────────────────────────────────
// ArrayPush — exec node: arr.push(value);
// ────────────────────────────────────────────
export function ArrayPushNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Push"
      headerColor={ARRAY_COLOR}
      icon="⊕"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'value', kind: 'data', label: 'value', dataType: 'any', inline: true },
      ]}
      pinsRight={[{ id: 'exec-out', kind: 'exec' }]}
      selected={selected}
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    >
      <div className="blueprint-field">
        <label>Arr</label>
        <input
          type="text"
          value={varName}
          className="nodrag"
          placeholder="arr"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}

// ────────────────────────────────────────────
// ArrayPop — exec node: arr.pop() with value output
// ────────────────────────────────────────────
export function ArrayPopNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Pop"
      headerColor={ARRAY_COLOR}
      icon="⊖"
      pinsLeft={[{ id: 'exec-in', kind: 'exec' }]}
      pinsRight={[
        { id: 'exec-out', kind: 'exec' },
        { id: 'value', kind: 'data', label: 'value', dataType: 'any' },
      ]}
      selected={selected}
    >
      <div className="blueprint-field">
        <label>Arr</label>
        <input
          type="text"
          value={varName}
          className="nodrag"
          placeholder="arr"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}

// ────────────────────────────────────────────
// ArrayLength — pure data node (compact): arr.length
// ────────────────────────────────────────────
const LENGTH_PINS_RIGHT: PinDef[] = [
  { id: 'value', kind: 'data', label: 'length', dataType: 'number' },
];

export function ArrayLengthNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="[#]"
      headerColor={ARRAY_COLOR}
      pinsLeft={[]}
      pinsRight={LENGTH_PINS_RIGHT}
      selected={selected}
      className="blueprint-node--compact"
    >
      <div className="blueprint-field">
        <label>Arr</label>
        <input
          type="text"
          value={varName}
          className="nodrag"
          placeholder="arr"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}

// ────────────────────────────────────────────
// ArrayGet — pure data node (compact): arr[index]
// ────────────────────────────────────────────
const GET_PINS_LEFT: PinDef[] = [
  { id: 'index', kind: 'data', label: 'i', dataType: 'number', inline: true },
];
const GET_PINS_RIGHT: PinDef[] = [
  { id: 'value', kind: 'data', label: 'value', dataType: 'any' },
];

export function ArrayGetNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="[i]"
      headerColor={ARRAY_COLOR}
      pinsLeft={GET_PINS_LEFT}
      pinsRight={GET_PINS_RIGHT}
      selected={selected}
      className="blueprint-node--compact"
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    >
      <div className="blueprint-field">
        <label>Arr</label>
        <input
          type="text"
          value={varName}
          className="nodrag"
          placeholder="arr"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}

// ────────────────────────────────────────────
// ArraySet — exec node: arr[index] = value;
// ────────────────────────────────────────────
export function ArraySetNode({ id, data, selected }: NodeProps<Node<BlueprintNodeData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const varName = (data.variable as string) || '';
  const inlineValues = (data.inlineValues as Record<string, string>) || {};

  return (
    <BlueprintNodeShell
      nodeId={id}
      label="Set[i]"
      headerColor={ARRAY_COLOR}
      icon="[=]"
      pinsLeft={[
        { id: 'exec-in', kind: 'exec' },
        { id: 'index', kind: 'data', label: 'i', dataType: 'number', inline: true },
        { id: 'value', kind: 'data', label: 'value', dataType: 'any', inline: true },
      ]}
      pinsRight={[{ id: 'exec-out', kind: 'exec' }]}
      selected={selected}
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    >
      <div className="blueprint-field">
        <label>Arr</label>
        <input
          type="text"
          value={varName}
          className="nodrag"
          placeholder="arr"
          onChange={(e) => updateNodeData(id, { variable: e.target.value })}
        />
      </div>
    </BlueprintNodeShell>
  );
}
