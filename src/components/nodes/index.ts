import type { NodeTypes } from '@xyflow/react';

// Flow nodes (with exec pins)
import StartNode from './StartNode';
import EndNode from './EndNode';
import InputNode from './InputNode';
import OutputNode from './OutputNode';
import SetNode from './SetNode';
import IfNode from './IfNode';
import WhileNode from './WhileNode';
import ForNode from './ForNode';

// Variable nodes
import GetNode from './GetNode';

// Math operation nodes
import {
  AddNode,
  SubtractNode,
  MultiplyNode,
  DivideNode,
  ModuloNode,
} from './MathOpNode';

// Comparison nodes
import {
  GreaterNode,
  LessNode,
  EqualNode,
  GreaterEqNode,
  LessEqNode,
  NotEqualNode,
} from './CompareNode';

// String nodes
import ConcatNode from './ConcatNode';

// Special nodes
import RandomNode from './RandomNode';
import NotNode from './NotNode';

export const nodeTypes: NodeTypes = {
  // Flow (8)
  start: StartNode,
  end: EndNode,
  input: InputNode,
  output: OutputNode,
  set: SetNode,
  if: IfNode,
  while: WhileNode,
  for: ForNode,
  // Variable (1)
  get: GetNode,
  // Math (5)
  add: AddNode,
  subtract: SubtractNode,
  multiply: MultiplyNode,
  divide: DivideNode,
  modulo: ModuloNode,
  // Compare (6)
  greater: GreaterNode,
  less: LessNode,
  equal: EqualNode,
  greaterEq: GreaterEqNode,
  lessEq: LessEqNode,
  notEqual: NotEqualNode,
  // String (1)
  concat: ConcatNode,
  // Special (2)
  random: RandomNode,
  not: NotNode,
};
