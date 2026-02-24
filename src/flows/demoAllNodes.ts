import type { Node, Edge } from '@xyflow/react';

/**
 * Demo layout: all 22 node types arranged by category for visual verification.
 * Each category is on its own row with generous spacing.
 */

const COL = 280; // horizontal spacing between nodes
const ROW = 260; // vertical spacing between category rows

// ── Row 0: FLOW NODES (7) ──
const flowY = 0;
const flowNodes: Node[] = [
  { id: 'd-start', type: 'start', position: { x: 0 * COL, y: flowY }, data: {} },
  { id: 'd-input', type: 'input', position: { x: 2 * COL, y: flowY }, data: { variable: 'edad', prompt: 'Ingrese edad:' } },
  { id: 'd-output', type: 'output', position: { x: 3 * COL, y: flowY }, data: {} },
  { id: 'd-set', type: 'set', position: { x: 4 * COL, y: flowY }, data: { variable: 'total' } },
  { id: 'd-if', type: 'if', position: { x: 5 * COL, y: flowY }, data: {} },
  { id: 'd-while', type: 'while', position: { x: 6 * COL, y: flowY }, data: {} },
  { id: 'd-for', type: 'for', position: { x: 7 * COL, y: flowY }, data: { variable: 'i', inlineValues: { desde: '0', hasta: '10', paso: '1' } } },
];

// ── Row 1: VARIABLE NODE (1) ──
const varY = ROW;
const varNodes: Node[] = [
  { id: 'd-get', type: 'get', position: { x: 0 * COL, y: varY }, data: { variable: 'contador' } },
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

// ── Row 4: SPECIAL NODES (2) ──
const specY = 4 * ROW;
const specNodes: Node[] = [
  { id: 'd-random', type: 'random', position: { x: 0 * COL, y: specY }, data: { inlineValues: { min: '1', max: '100' } } },
  { id: 'd-not', type: 'not', position: { x: 1 * COL, y: specY }, data: {} },
];

export const demoNodes: Node[] = [
  ...flowNodes,
  ...varNodes,
  ...mathNodes,
  ...cmpNodes,
  ...specNodes,
];

// No edges — this is just a visual catalogue
export const demoEdges: Edge[] = [];
