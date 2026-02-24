import type { Node, Edge } from '@xyflow/react';

/**
 * Demo layout: all node types arranged by category for visual verification.
 * Each category is on its own row with generous spacing.
 * Function nodes (functionEntry, functionReturn, callFunction) live in
 * function sub-graphs and are not shown here.
 */

const COL = 280; // horizontal spacing between nodes
const ROW = 260; // vertical spacing between category rows

// ── Row 0: FLOW NODES (7) ──
const flowY = 0;
const flowNodes: Node[] = [
  { id: 'd-start', type: 'start', position: { x: 0 * COL, y: flowY }, data: {} },
  { id: 'd-input', type: 'input', position: { x: 2 * COL, y: flowY }, data: { variable: 'age', prompt: 'Enter age:' } },
  { id: 'd-output', type: 'output', position: { x: 3 * COL, y: flowY }, data: {} },
  { id: 'd-set', type: 'set', position: { x: 4 * COL, y: flowY }, data: { variable: 'total' } },
  { id: 'd-if', type: 'if', position: { x: 5 * COL, y: flowY }, data: {} },
  { id: 'd-while', type: 'while', position: { x: 6 * COL, y: flowY }, data: {} },
  { id: 'd-for', type: 'for', position: { x: 7 * COL, y: flowY }, data: { variable: 'i', inlineValues: { from: '0', to: '10', step: '1' } } },
];

// ── Row 1: VARIABLE NODE (1) ──
const varY = ROW;
const varNodes: Node[] = [
  { id: 'd-get', type: 'get', position: { x: 0 * COL, y: varY }, data: { variable: 'counter' } },
];

// ── Row 2: MATH NODES (5) ──
const mathY = 2 * ROW;
const mathNodes: Node[] = [
  { id: 'd-add', type: 'add', position: { x: 0 * COL, y: mathY }, data: { inlineValues: { a: '5', b: '3' } } },
  { id: 'd-sub', type: 'subtract', position: { x: 1 * COL, y: mathY }, data: { inlineValues: { a: '10', b: '4' } } },
  { id: 'd-mul', type: 'multiply', position: { x: 2 * COL, y: mathY }, data: { inlineValues: { a: '6', b: '7' } } },
  { id: 'd-div', type: 'divide', position: { x: 3 * COL, y: mathY }, data: { inlineValues: { a: '20', b: '4' } } },
  { id: 'd-mod', type: 'modulo', position: { x: 4 * COL, y: mathY }, data: { inlineValues: { a: '17', b: '5' } } },
];

// ── Row 3: COMPARE NODES (6) ──
const cmpY = 3 * ROW;
const cmpNodes: Node[] = [
  { id: 'd-gt', type: 'greater', position: { x: 0 * COL, y: cmpY }, data: { inlineValues: { a: '10', b: '5' } } },
  { id: 'd-lt', type: 'less', position: { x: 1 * COL, y: cmpY }, data: { inlineValues: { a: '3', b: '8' } } },
  { id: 'd-eq', type: 'equal', position: { x: 2 * COL, y: cmpY }, data: { inlineValues: { a: '7', b: '7' } } },
  { id: 'd-gte', type: 'greaterEq', position: { x: 3 * COL, y: cmpY }, data: { inlineValues: { a: '5', b: '5' } } },
  { id: 'd-lte', type: 'lessEq', position: { x: 4 * COL, y: cmpY }, data: { inlineValues: { a: '4', b: '9' } } },
  { id: 'd-neq', type: 'notEqual', position: { x: 5 * COL, y: cmpY }, data: { inlineValues: { a: '1', b: '2' } } },
];

// ── Row 4: STRING & SPECIAL NODES (3) ──
const specY = 4 * ROW;
const specNodes: Node[] = [
  { id: 'd-concat', type: 'concat', position: { x: 0 * COL, y: specY }, data: { inlineValues: { a: 'Hello', b: ' World' } } },
  { id: 'd-random', type: 'random', position: { x: 1 * COL, y: specY }, data: { inlineValues: { min: '1', max: '100' } } },
  { id: 'd-not', type: 'not', position: { x: 2 * COL, y: specY }, data: {} },
];

// ── Row 5: ARRAY NODES (6) ──
const arrY = 5 * ROW;
const arrNodes: Node[] = [
  { id: 'd-arrCreate', type: 'arrayCreate', position: { x: 0 * COL, y: arrY }, data: { variable: 'nums' } },
  { id: 'd-arrPush', type: 'arrayPush', position: { x: 1 * COL, y: arrY }, data: { variable: 'nums', inlineValues: { value: '42' } } },
  { id: 'd-arrPop', type: 'arrayPop', position: { x: 2 * COL, y: arrY }, data: { variable: 'nums' } },
  { id: 'd-arrLen', type: 'arrayLength', position: { x: 3 * COL, y: arrY }, data: { variable: 'nums' } },
  { id: 'd-arrGet', type: 'arrayGet', position: { x: 4 * COL, y: arrY }, data: { variable: 'nums', inlineValues: { index: '0' } } },
  { id: 'd-arrSet', type: 'arraySet', position: { x: 5 * COL, y: arrY }, data: { variable: 'nums', inlineValues: { index: '0', value: '99' } } },
];

// ── Row 6: LOOP CONTROL NODES (2) ──
const loopY = 6 * ROW;
const loopNodes: Node[] = [
  { id: 'd-break', type: 'break', position: { x: 0 * COL, y: loopY }, data: {} },
  { id: 'd-continue', type: 'continue', position: { x: 1 * COL, y: loopY }, data: {} },
];

// ── Row 7: LAYOUT NODES (1) ──
const layoutY = 7 * ROW;
const layoutNodes: Node[] = [
  { id: 'd-comment', type: 'comment', position: { x: 0 * COL, y: layoutY }, data: { label: 'This is a comment' }, style: { width: 300, height: 120 } },
];

export const demoNodes: Node[] = [
  ...flowNodes,
  ...varNodes,
  ...mathNodes,
  ...cmpNodes,
  ...specNodes,
  ...arrNodes,
  ...loopNodes,
  ...layoutNodes,
];

// No edges — this is just a visual catalogue
export const demoEdges: Edge[] = [];
