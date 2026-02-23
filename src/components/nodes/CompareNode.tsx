import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData, PinDef } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

const PINS_LEFT: PinDef[] = [
  { id: 'a', kind: 'data', label: 'A', dataType: 'number', inline: true },
  { id: 'b', kind: 'data', label: 'B', dataType: 'number', inline: true },
];

const PINS_RIGHT: PinDef[] = [
  { id: 'result', kind: 'data', label: 'result', dataType: 'boolean' },
];

interface CompareConfig {
  label: string;
}

const COMPARE_OPS: Record<string, CompareConfig> = {
  greater: { label: '>' },
  less: { label: '<' },
  equal: { label: '==' },
  greaterEq: { label: '>=' },
  lessEq: { label: '<=' },
  notEqual: { label: '!=' },
};

function CompareNodeInner(
  op: string,
  { id, data, selected }: NodeProps<Node<BlueprintNodeData>>,
) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const inlineValues = (data.inlineValues as Record<string, string>) || {};
  const config = COMPARE_OPS[op] || COMPARE_OPS.greater;

  return (
    <BlueprintNodeShell
      nodeId={id}
      label={config.label}
      headerColor="#60a5fa"
      pinsLeft={PINS_LEFT}
      pinsRight={PINS_RIGHT}
      selected={selected}
      className="blueprint-node--compact"
      inlineValues={inlineValues}
      onInlineChange={(pinId, value) =>
        updateNodeData(id, { inlineValues: { ...inlineValues, [pinId]: value } })
      }
    />
  );
}

export const GreaterNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  CompareNodeInner('greater', props);
export const LessNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  CompareNodeInner('less', props);
export const EqualNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  CompareNodeInner('equal', props);
export const GreaterEqNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  CompareNodeInner('greaterEq', props);
export const LessEqNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  CompareNodeInner('lessEq', props);
export const NotEqualNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  CompareNodeInner('notEqual', props);
