import type { DataType, FunctionDef } from '../types';

export interface PinInfo {
  id: string;
  kind: 'exec' | 'data';
  dataType?: DataType;
}

export interface NodePins {
  left: PinInfo[];   // target/input handles
  right: PinInfo[];  // source/output handles
}

export const PIN_REGISTRY: Record<string, NodePins> = {
  start: {
    left: [],
    right: [{ id: 'exec-out', kind: 'exec' }],
  },
  input: {
    left: [
      { id: 'exec-in', kind: 'exec' },
      { id: 'prompt', kind: 'data', dataType: 'string' },
    ],
    right: [
      { id: 'exec-out', kind: 'exec' },
      { id: 'out-value', kind: 'data', dataType: 'number' },
    ],
  },
  output: {
    left: [
      { id: 'exec-in', kind: 'exec' },
      { id: 'value', kind: 'data', dataType: 'any' },
    ],
    right: [{ id: 'exec-out', kind: 'exec' }],
  },
  set: {
    left: [
      { id: 'exec-in', kind: 'exec' },
      { id: 'value', kind: 'data', dataType: 'any' },
    ],
    right: [
      { id: 'exec-out', kind: 'exec' },
      { id: 'out-value', kind: 'data', dataType: 'any' },
    ],
  },
  if: {
    left: [
      { id: 'exec-in', kind: 'exec' },
      { id: 'condition', kind: 'data', dataType: 'boolean' },
    ],
    right: [
      { id: 'true', kind: 'exec' },
      { id: 'false', kind: 'exec' },
    ],
  },
  while: {
    left: [
      { id: 'exec-in', kind: 'exec' },
      { id: 'condition', kind: 'data', dataType: 'boolean' },
    ],
    right: [
      { id: 'body', kind: 'exec' },
      { id: 'done', kind: 'exec' },
    ],
  },
  for: {
    left: [
      { id: 'exec-in', kind: 'exec' },
      { id: 'from', kind: 'data', dataType: 'number' },
      { id: 'to', kind: 'data', dataType: 'number' },
      { id: 'step', kind: 'data', dataType: 'number' },
    ],
    right: [
      { id: 'body', kind: 'exec' },
      { id: 'done', kind: 'exec' },
      { id: 'i', kind: 'data', dataType: 'number' },
    ],
  },
  get: {
    left: [],
    right: [{ id: 'value', kind: 'data', dataType: 'any' }],
  },
  add: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'number' }],
  },
  subtract: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'number' }],
  },
  multiply: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'number' }],
  },
  divide: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'number' }],
  },
  modulo: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'number' }],
  },
  greater: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'boolean' }],
  },
  less: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'boolean' }],
  },
  equal: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'boolean' }],
  },
  greaterEq: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'boolean' }],
  },
  lessEq: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'boolean' }],
  },
  notEqual: {
    left: [
      { id: 'a', kind: 'data', dataType: 'number' },
      { id: 'b', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'boolean' }],
  },
  concat: {
    left: [
      { id: 'a', kind: 'data', dataType: 'string' },
      { id: 'b', kind: 'data', dataType: 'string' },
    ],
    right: [{ id: 'result', kind: 'data', dataType: 'string' }],
  },
  random: {
    left: [
      { id: 'min', kind: 'data', dataType: 'number' },
      { id: 'max', kind: 'data', dataType: 'number' },
    ],
    right: [{ id: 'value', kind: 'data', dataType: 'number' }],
  },
  not: {
    left: [{ id: 'value', kind: 'data', dataType: 'boolean' }],
    right: [{ id: 'result', kind: 'data', dataType: 'boolean' }],
  },
  arrayCreate: {
    left: [{ id: 'exec-in', kind: 'exec' }],
    right: [{ id: 'exec-out', kind: 'exec' }],
  },
  arrayPush: {
    left: [
      { id: 'exec-in', kind: 'exec' },
      { id: 'value', kind: 'data', dataType: 'any' },
    ],
    right: [{ id: 'exec-out', kind: 'exec' }],
  },
  arrayPop: {
    left: [{ id: 'exec-in', kind: 'exec' }],
    right: [
      { id: 'exec-out', kind: 'exec' },
      { id: 'value', kind: 'data', dataType: 'any' },
    ],
  },
  arrayLength: {
    left: [],
    right: [{ id: 'value', kind: 'data', dataType: 'number' }],
  },
  arrayGet: {
    left: [{ id: 'index', kind: 'data', dataType: 'number' }],
    right: [{ id: 'value', kind: 'data', dataType: 'any' }],
  },
  arraySet: {
    left: [
      { id: 'exec-in', kind: 'exec' },
      { id: 'index', kind: 'data', dataType: 'number' },
      { id: 'value', kind: 'data', dataType: 'any' },
    ],
    right: [{ id: 'exec-out', kind: 'exec' }],
  },
  break: {
    left: [{ id: 'exec-in', kind: 'exec' }],
    right: [],
  },
  continue: {
    left: [{ id: 'exec-in', kind: 'exec' }],
    right: [],
  },
  // Function nodes have minimal static pins — dynamic pins resolved at runtime
  functionEntry: {
    left: [],
    right: [{ id: 'exec-out', kind: 'exec' }],
  },
  functionReturn: {
    left: [{ id: 'exec-in', kind: 'exec' }],
    right: [],
  },
  comment: {
    left: [],
    right: [],
  },
};

/** Check if two data types are compatible (either matches or one is 'any') */
function typesCompatible(a: DataType, b: DataType): boolean {
  return a === b || a === 'any' || b === 'any';
}

/** Build dynamic pins for a callFunction node based on its function definition */
export function getCallFunctionPins(fn: FunctionDef): NodePins {
  return {
    left: [
      { id: 'exec-in', kind: 'exec' },
      ...fn.params.map((p) => ({ id: p.id, kind: 'data' as const, dataType: p.dataType })),
    ],
    right: [
      { id: 'exec-out', kind: 'exec' },
      ...fn.returns.map((r) => ({ id: r.id, kind: 'data' as const, dataType: r.dataType })),
    ],
  };
}

/** Get pins for a node type, supporting dynamic function nodes */
export function getPinsForNode(nodeType: string, fnDef?: FunctionDef): NodePins | null {
  if (nodeType === 'callFunction' && fnDef) {
    return getCallFunctionPins(fnDef);
  }
  return PIN_REGISTRY[nodeType] || null;
}

/**
 * Find the first compatible pin on a target node type for the pending connection.
 *
 * @param targetNodeType  - The node type we want to check / connect to
 * @param fromHandleType  - 'source' if we dragged from an output, 'target' if from an input
 * @param fromPinKind     - 'exec' or 'data'
 * @param fromDataType    - DataType of the dragged pin (only relevant for data pins)
 * @param fnDef           - For callFunction nodes, the function definition
 * @returns The pin ID to auto-connect to, or null if no compatible pin exists
 */
export function findCompatiblePin(
  targetNodeType: string,
  fromHandleType: 'source' | 'target',
  fromPinKind: 'exec' | 'data',
  fromDataType?: DataType,
  fnDef?: FunctionDef,
): string | null {
  const pins = getPinsForNode(targetNodeType, fnDef);
  if (!pins) return null;

  // If we dragged from a source (output), the new node needs a target (input/left) pin.
  // If we dragged from a target (input), the new node needs a source (output/right) pin.
  const candidates = fromHandleType === 'source' ? pins.left : pins.right;

  for (const pin of candidates) {
    if (pin.kind !== fromPinKind) continue;
    if (fromPinKind === 'exec') return pin.id;
    // Data pin: check type compatibility
    if (typesCompatible(fromDataType || 'any', pin.dataType || 'any')) {
      return pin.id;
    }
  }

  return null;
}

/** Check if a node type has any compatible pin for the pending connection. */
export function hasCompatiblePin(
  nodeType: string,
  fromHandleType: 'source' | 'target',
  fromPinKind: 'exec' | 'data',
  fromDataType?: DataType,
  fnDef?: FunctionDef,
): boolean {
  return findCompatiblePin(nodeType, fromHandleType, fromPinKind, fromDataType, fnDef) !== null;
}
