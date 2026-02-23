import type { NodeProps, Node } from '@xyflow/react';
import type { BlueprintNodeData, PinDef } from '../../types';
import BlueprintNodeShell from './BlueprintNodeShell';
import useFlowStore from '../../hooks/useFlowStore';

const PINS_LEFT: PinDef[] = [
  { id: 'a', kind: 'data', label: 'A', dataType: 'number', inline: true },
  { id: 'b', kind: 'data', label: 'B', dataType: 'number', inline: true },
];

const PINS_RIGHT: PinDef[] = [
  { id: 'result', kind: 'data', label: 'result', dataType: 'number' },
];

interface MathConfig {
  label: string;
  icon: string;
}

const MATH_OPS: Record<string, MathConfig> = {
  add: { label: 'Add', icon: '+' },
  subtract: { label: 'Subtract', icon: '−' },
  multiply: { label: 'Multiply', icon: '×' },
  divide: { label: 'Divide', icon: '÷' },
  modulo: { label: 'Modulo', icon: '%' },
};

function MathOpNodeInner(
  op: string,
  { id, data, selected }: NodeProps<Node<BlueprintNodeData>>,
) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const inlineValues = (data.inlineValues as Record<string, string>) || {};
  const config = MATH_OPS[op] || MATH_OPS.add;

  return (
    <BlueprintNodeShell
      nodeId={id}
      label={config.icon}
      headerColor="#4ade80"
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

export const AddNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  MathOpNodeInner('add', props);
export const SubtractNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  MathOpNodeInner('subtract', props);
export const MultiplyNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  MathOpNodeInner('multiply', props);
export const DivideNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  MathOpNodeInner('divide', props);
export const ModuloNode = (props: NodeProps<Node<BlueprintNodeData>>) =>
  MathOpNodeInner('modulo', props);
