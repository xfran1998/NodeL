import type { Node, Edge } from '@xyflow/react';

/*
 * "Promedio de 3 notas" — ejemplo educativo
 *
 * Layout:
 *   Row y=0   : Exec chain  → Start → Leer×3 → Set → If
 *   Row y=-160: Sí branch   → Append(inline:"Aprobado…", Get(promedio)) → Mostrar
 *   Row y=160 : No branch   → Append(inline:"Reprobado…", Get(promedio)) → Mostrar
 *   Row y=240 : Condition   → Get(promedio) → >=7 → feeds If.condition
 *   Row y=360+: Math        → Get(nota1,2,3) → Add → Add → ÷3 → feeds Set.value
 */

export const initialNodes: Node[] = [
  // ── Exec chain (y=0) ──
  { id: 'start',      type: 'start',  position: { x: 0,    y: 0 },   data: {} },
  { id: 'input1',     type: 'input',  position: { x: 280,  y: 0 },   data: { variable: 'nota1', prompt: 'Ingrese nota 1:' } },
  { id: 'input2',     type: 'input',  position: { x: 560,  y: 0 },   data: { variable: 'nota2', prompt: 'Ingrese nota 2:' } },
  { id: 'input3',     type: 'input',  position: { x: 840,  y: 0 },   data: { variable: 'nota3', prompt: 'Ingrese nota 3:' } },
  { id: 'setProm',    type: 'set',    position: { x: 1200, y: 0 },   data: { variable: 'promedio' } },
  { id: 'ifApproved', type: 'if',     position: { x: 1520, y: 0 },   data: {} },

  // ── Sí branch (y=-160) ──
  { id: 'getPromYes', type: 'get',    position: { x: 1560, y: -120 }, data: { variable: 'promedio' } },
  { id: 'concatYes',  type: 'concat', position: { x: 1820, y: -180 }, data: { inlineValues: { a: 'Aprobado, promedio: ' } } },
  { id: 'outYes',     type: 'output', position: { x: 2080, y: -160 }, data: {} },
  // ── No branch (y=160) ──
  { id: 'getPromNo',  type: 'get',    position: { x: 1560, y: 200 },  data: { variable: 'promedio' } },
  { id: 'concatNo',   type: 'concat', position: { x: 1820, y: 140 },  data: { inlineValues: { a: 'Reprobado, promedio: ' } } },
  { id: 'outNo',      type: 'output', position: { x: 2080, y: 160 },  data: {} },

  // ── Condition: promedio >= 7 (y=240) ──
  { id: 'getProm',    type: 'get',       position: { x: 1060, y: 240 }, data: { variable: 'promedio' } },
  { id: 'cmpGe',      type: 'greaterEq', position: { x: 1340, y: 240 }, data: { inlineValues: { b: '7' } } },

  // ── Math: (nota1 + nota2 + nota3) / 3 ──
  { id: 'get1',       type: 'get',    position: { x: 420, y: 340 },  data: { variable: 'nota1' } },
  { id: 'get2',       type: 'get',    position: { x: 420, y: 460 },  data: { variable: 'nota2' } },
  { id: 'add1',       type: 'add',    position: { x: 700, y: 380 },  data: {} },
  { id: 'get3',       type: 'get',    position: { x: 420, y: 580 },  data: { variable: 'nota3' } },
  { id: 'add2',       type: 'add',    position: { x: 880, y: 440 },  data: {} },
  { id: 'div',        type: 'divide', position: { x: 1040, y: 440 }, data: { inlineValues: { b: '3' } } },
];

export const initialEdges: Edge[] = [
  // ── Exec chain ──
  { id: 'e1', source: 'start', sourceHandle: 'exec-out', target: 'input1', targetHandle: 'exec-in', type: 'exec' },
  { id: 'e2', source: 'input1', sourceHandle: 'exec-out', target: 'input2', targetHandle: 'exec-in', type: 'exec' },
  { id: 'e3', source: 'input2', sourceHandle: 'exec-out', target: 'input3', targetHandle: 'exec-in', type: 'exec' },
  { id: 'e4', source: 'input3', sourceHandle: 'exec-out', target: 'setProm', targetHandle: 'exec-in', type: 'exec' },
  { id: 'e5', source: 'setProm', sourceHandle: 'exec-out', target: 'ifApproved', targetHandle: 'exec-in', type: 'exec' },
  // If → Sí branch
  { id: 'e6', source: 'ifApproved', sourceHandle: 'true', target: 'outYes', targetHandle: 'exec-in', type: 'exec' },
  // If → No branch
  { id: 'e8', source: 'ifApproved', sourceHandle: 'false', target: 'outNo', targetHandle: 'exec-in', type: 'exec' },
  // ── Data: (nota1 + nota2) ──
  { id: 'd1', source: 'get1', sourceHandle: 'value', target: 'add1', targetHandle: 'a', type: 'data', data: { dataType: 'number' } },
  { id: 'd2', source: 'get2', sourceHandle: 'value', target: 'add1', targetHandle: 'b', type: 'data', data: { dataType: 'number' } },
  // ── Data: (nota1+nota2) + nota3 ──
  { id: 'd3', source: 'add1', sourceHandle: 'result', target: 'add2', targetHandle: 'a', type: 'data', data: { dataType: 'number' } },
  { id: 'd4', source: 'get3', sourceHandle: 'value', target: 'add2', targetHandle: 'b', type: 'data', data: { dataType: 'number' } },
  // ── Data: sum / 3 → Set.value ──
  { id: 'd5', source: 'add2', sourceHandle: 'result', target: 'div', targetHandle: 'a', type: 'data', data: { dataType: 'number' } },
  { id: 'd6', source: 'div', sourceHandle: 'result', target: 'setProm', targetHandle: 'value', type: 'data', data: { dataType: 'number' } },
  // ── Data: promedio >= 7 → If.condition ──
  { id: 'd7', source: 'getProm', sourceHandle: 'value', target: 'cmpGe', targetHandle: 'a', type: 'data', data: { dataType: 'number' } },
  { id: 'd8', source: 'cmpGe', sourceHandle: 'result', target: 'ifApproved', targetHandle: 'condition', type: 'data', data: { dataType: 'boolean' } },
  // ── Data: Sí branch → Get(promedio) → Append.b, inline A → Output ──
  { id: 'd9',  source: 'getPromYes', sourceHandle: 'value',  target: 'concatYes', targetHandle: 'b', type: 'data', data: { dataType: 'any' } },
  { id: 'd10', source: 'concatYes',  sourceHandle: 'result', target: 'outYes',    targetHandle: 'value', type: 'data', data: { dataType: 'string' } },
  // ── Data: No branch → Get(promedio) → Append.b, inline A → Output ──
  { id: 'd11', source: 'getPromNo',  sourceHandle: 'value',  target: 'concatNo', targetHandle: 'b', type: 'data', data: { dataType: 'any' } },
  { id: 'd12', source: 'concatNo',   sourceHandle: 'result', target: 'outNo',    targetHandle: 'value', type: 'data', data: { dataType: 'string' } },
];
