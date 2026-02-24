import type { Node, Edge } from '@xyflow/react';
import type { FunctionDef } from '../types';

/*
 * "Números Primos" — Demo flow
 *
 * Finds all prime numbers up to max_primo using nested loops,
 * stores them in an array, and displays them via a user-defined function.
 */

export const initialNodes: Node[] = [
  { id: 'start', type: 'start', position: { x: -460, y: 0 }, data: {} },
  { id: 'set-1771957019083', type: 'set', position: { x: -220, y: 0 }, data: { inlineValues: { value: '100' }, variable: 'max_primo', valueType: 'number' } },
  { id: 'for-1771957050056', type: 'for', position: { x: 320, y: 0 }, data: { inlineValues: { desde: '2', paso: '1' } } },
  { id: 'for-1771957106494', type: 'for', position: { x: 1260, y: 80 }, data: { inlineValues: { desde: '2', paso: '1' }, variable: 'j' } },
  { id: 'divide-1771957117609', type: 'divide', position: { x: 580, y: 140 }, data: { inlineValues: { b: '2' } } },
  { id: 'set-1771957164106', type: 'set', position: { x: 1000, y: 80 }, data: { inlineValues: { value: 'false' }, variable: 'divisible', valueType: 'boolean' } },
  { id: 'if-1771957411145', type: 'if', position: { x: 1580, y: 160 }, data: {} },
  { id: 'modulo-1771957419802', type: 'modulo', position: { x: 1340, y: 300 }, data: {} },
  { id: 'equal-1771957480375', type: 'equal', position: { x: 1560, y: 300 }, data: { inlineValues: { b: '0' } } },
  { id: 'break-1771957494458', type: 'break', position: { x: 2120, y: 200 }, data: {} },
  { id: 'set-paste-1771957636448-0', type: 'set', position: { x: 1840, y: 200 }, data: { inlineValues: { value: 'true' }, variable: 'divisible', valueType: 'boolean' } },
  { id: 'if-1771957682423', type: 'if', position: { x: 2560, y: 120 }, data: {} },
  { id: 'get-1771957687860', type: 'get', position: { x: 2140, y: 300 }, data: { variable: 'divisible' } },
  { id: 'not-1771957708583', type: 'not', position: { x: 2400, y: 200 }, data: {} },
  { id: 'arrayPush-1771957737224', type: 'arrayPush', position: { x: 2900, y: 160 }, data: { variable: 'primos' } },
  { id: 'arrayCreate-1771957786871', type: 'arrayCreate', position: { x: 60, y: 0 }, data: { variable: 'primos' } },
  { id: 'set-paste-1771957852046-0', type: 'set', position: { x: 740, y: 80 }, data: { inlineValues: { value: 'false' }, variable: 'posible_primo', valueType: 'number' } },
  { id: 'get-1771958065557', type: 'get', position: { x: 2640, y: 280 }, data: { variable: 'posible_primo' } },
  { id: 'callFunction-1771958192360', type: 'callFunction', position: { x: 620, y: -20 }, data: { functionId: 'fn-1771958139364', inlineValues: { 'p-1771958140718': 'primos' } } },
];

export const initialEdges: Edge[] = [
  { id: 'e-start-exec-out-set-1771957019083-exec-in', source: 'start', sourceHandle: 'exec-out', target: 'set-1771957019083', targetHandle: 'exec-in', type: 'exec', data: {} },
  { id: 'e-set-1771957019083-out-value-for-1771957050056-hasta', type: 'data', source: 'set-1771957019083', sourceHandle: 'out-value', target: 'for-1771957050056', targetHandle: 'hasta', data: { dataType: 'any' } },
  { id: 'e-for-1771957050056-i-divide-1771957117609-a', source: 'for-1771957050056', sourceHandle: 'i', target: 'divide-1771957117609', targetHandle: 'a', type: 'data', data: { dataType: 'number' } },
  { id: 'e-divide-1771957117609-result-for-1771957106494-hasta', type: 'data', source: 'divide-1771957117609', sourceHandle: 'result', target: 'for-1771957106494', targetHandle: 'hasta', data: { dataType: 'number' } },
  { id: 'e-set-1771957164106-exec-out-for-1771957106494-exec-in', type: 'exec', source: 'set-1771957164106', sourceHandle: 'exec-out', target: 'for-1771957106494', targetHandle: 'exec-in', data: {} },
  { id: 'e-for-1771957106494-body-if-1771957411145-exec-in', source: 'for-1771957106494', sourceHandle: 'body', target: 'if-1771957411145', targetHandle: 'exec-in', type: 'exec', data: {} },
  { id: 'e-for-1771957050056-i-modulo-1771957419802-a', type: 'data', source: 'for-1771957050056', sourceHandle: 'i', target: 'modulo-1771957419802', targetHandle: 'a', data: { dataType: 'number' } },
  { id: 'e-for-1771957106494-i-modulo-1771957419802-b', type: 'data', source: 'for-1771957106494', sourceHandle: 'i', target: 'modulo-1771957419802', targetHandle: 'b', data: { dataType: 'number' } },
  { id: 'e-modulo-1771957419802-result-equal-1771957480375-a', source: 'modulo-1771957419802', sourceHandle: 'result', target: 'equal-1771957480375', targetHandle: 'a', type: 'data', data: { dataType: 'number' } },
  { id: 'e-equal-1771957480375-result-if-1771957411145-condition', type: 'data', source: 'equal-1771957480375', sourceHandle: 'result', target: 'if-1771957411145', targetHandle: 'condition', data: { dataType: 'boolean' } },
  { id: 'e-if-1771957411145-true-set-paste-1771957636448-0-exec-in', type: 'exec', source: 'if-1771957411145', sourceHandle: 'true', target: 'set-paste-1771957636448-0', targetHandle: 'exec-in', data: {} },
  { id: 'e-set-paste-1771957636448-0-exec-out-break-1771957494458-exec-in', type: 'exec', source: 'set-paste-1771957636448-0', sourceHandle: 'exec-out', target: 'break-1771957494458', targetHandle: 'exec-in', data: {} },
  { id: 'e-for-1771957106494-done-if-1771957682423-exec-in', source: 'for-1771957106494', sourceHandle: 'done', target: 'if-1771957682423', targetHandle: 'exec-in', type: 'exec', data: {} },
  { id: 'e-get-1771957687860-value-not-1771957708583-value', source: 'get-1771957687860', sourceHandle: 'value', target: 'not-1771957708583', targetHandle: 'value', type: 'data', data: { dataType: 'any' } },
  { id: 'e-not-1771957708583-result-if-1771957682423-condition', type: 'data', source: 'not-1771957708583', sourceHandle: 'result', target: 'if-1771957682423', targetHandle: 'condition', data: { dataType: 'boolean' } },
  { id: 'e-if-1771957682423-true-arrayPush-1771957737224-exec-in', source: 'if-1771957682423', sourceHandle: 'true', target: 'arrayPush-1771957737224', targetHandle: 'exec-in', type: 'exec', data: {} },
  { id: 'e-set-1771957019083-exec-out-arrayCreate-1771957786871-exec-in', type: 'exec', source: 'set-1771957019083', sourceHandle: 'exec-out', target: 'arrayCreate-1771957786871', targetHandle: 'exec-in', data: {} },
  { id: 'e-arrayCreate-1771957786871-exec-out-for-1771957050056-exec-in', type: 'exec', source: 'arrayCreate-1771957786871', sourceHandle: 'exec-out', target: 'for-1771957050056', targetHandle: 'exec-in', data: {} },
  { id: 'e-for-1771957050056-body-set-paste-1771957852046-0-exec-in', type: 'exec', source: 'for-1771957050056', sourceHandle: 'body', target: 'set-paste-1771957852046-0', targetHandle: 'exec-in', data: {} },
  { id: 'e-set-paste-1771957852046-0-exec-out-set-1771957164106-exec-in', type: 'exec', source: 'set-paste-1771957852046-0', sourceHandle: 'exec-out', target: 'set-1771957164106', targetHandle: 'exec-in', data: {} },
  { id: 'e-for-1771957050056-i-set-paste-1771957852046-0-value', type: 'data', source: 'for-1771957050056', sourceHandle: 'i', target: 'set-paste-1771957852046-0', targetHandle: 'value', data: { dataType: 'number' } },
  { id: 'e-get-1771958065557-value-arrayPush-1771957737224-value', type: 'data', source: 'get-1771958065557', sourceHandle: 'value', target: 'arrayPush-1771957737224', targetHandle: 'value', data: { dataType: 'any' } },
  { id: 'e-for-1771957050056-done-callFunction-1771958192360-exec-in', type: 'exec', source: 'for-1771957050056', sourceHandle: 'done', target: 'callFunction-1771958192360', targetHandle: 'exec-in', data: {} },
];

export const initialFunctions: Record<string, FunctionDef> = {
  'fn-1771958139364': {
    id: 'fn-1771958139364',
    name: 'MostrarPrimos',
    color: '#8b5cf6',
    params: [{ id: 'p-1771958140718', name: 'primos', dataType: 'array' }],
    returns: [],
    nodes: [
      { id: 'functionEntry-1771958139364', type: 'functionEntry', position: { x: -380, y: 100 }, data: { functionId: 'fn-1771958139364' } },
      { id: 'output-paste-1771958154715-0', type: 'output', position: { x: 900, y: 180 }, data: { inlineValues: { value: 'primos' } } },
      { id: 'arrayLength-paste-1771958154715-1', type: 'arrayLength', position: { x: 0, y: 180 }, data: { variable: 'primos' } },
      { id: 'for-paste-1771958154715-2', type: 'for', position: { x: 320, y: 100 }, data: { inlineValues: { desde: '0', paso: '1' } } },
      { id: 'arrayGet-paste-1771958154715-3', type: 'arrayGet', position: { x: 620, y: 220 }, data: { variable: 'primos' } },
    ],
    edges: [
      { id: 'e-for-paste-1771958154715-2-body-output-paste-1771958154715-0-exec-in', type: 'exec', source: 'for-paste-1771958154715-2', sourceHandle: 'body', target: 'output-paste-1771958154715-0', targetHandle: 'exec-in', data: {} },
      { id: 'e-for-paste-1771958154715-2-i-arrayGet-paste-1771958154715-3-index', source: 'for-paste-1771958154715-2', sourceHandle: 'i', target: 'arrayGet-paste-1771958154715-3', targetHandle: 'index', type: 'data', data: { dataType: 'number' } },
      { id: 'e-arrayGet-paste-1771958154715-3-value-output-paste-1771958154715-0-value', type: 'data', source: 'arrayGet-paste-1771958154715-3', sourceHandle: 'value', target: 'output-paste-1771958154715-0', targetHandle: 'value', data: { dataType: 'any' } },
      { id: 'e-arrayLength-paste-1771958154715-1-value-for-paste-1771958154715-2-hasta', type: 'data', source: 'arrayLength-paste-1771958154715-1', sourceHandle: 'value', target: 'for-paste-1771958154715-2', targetHandle: 'hasta', data: { dataType: 'number' } },
      { id: 'e-functionEntry-1771958139364-exec-out-for-paste-1771958154715-2-exec-in', type: 'exec', source: 'functionEntry-1771958139364', sourceHandle: 'exec-out', target: 'for-paste-1771958154715-2', targetHandle: 'exec-in', data: {} },
    ],
  },
};
