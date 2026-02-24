import type { Node, Edge } from '@xyflow/react';

export interface TranspileResult {
  code: string;
  errors: string[];
}

export interface TranspileOptions {
  /** When true, inject __onNode/__onVar calls for execution visualization */
  instrument?: boolean;
}

const EXEC_HANDLES = new Set([
  'exec-in', 'exec-out', 'true', 'false', 'body', 'done',
]);

const MATH_OPS: Record<string, string> = {
  add: '+',
  subtract: '-',
  multiply: '*',
  divide: '/',
  modulo: '%',
};

const COMPARE_OPS: Record<string, string> = {
  greater: '>',
  less: '<',
  equal: '===',
  greaterEq: '>=',
  lessEq: '<=',
  notEqual: '!==',
};

export function transpile(nodes: Node[], edges: Edge[], options?: TranspileOptions): TranspileResult {
  const errors: string[] = [];

  // ── Phase A: Build O(1) lookup indexes ──
  const nodeMap = new Map<string, Node>();
  for (const n of nodes) nodeMap.set(n.id, n);

  // execEdges: sourceId → sourceHandle → targetId
  const execEdges = new Map<string, Map<string, string>>();
  // dataEdgesTo: targetId → targetHandle → { sourceId, sourceHandle }
  const dataEdgesTo = new Map<string, Map<string, { sourceId: string; sourceHandle: string }>>();

  for (const e of edges) {
    const sh = e.sourceHandle || '';
    const th = e.targetHandle || '';

    if (EXEC_HANDLES.has(sh)) {
      let m = execEdges.get(e.source);
      if (!m) { m = new Map(); execEdges.set(e.source, m); }
      m.set(sh, e.target);
    } else {
      let m = dataEdgesTo.get(e.target);
      if (!m) { m = new Map(); dataEdgesTo.set(e.target, m); }
      m.set(th, { sourceId: e.source, sourceHandle: sh });
    }
  }

  // Temp var tracking for arrayPop results
  let popCounter = 0;
  const popTempVars = new Map<string, string>();

  // ── Phase B: Resolve data expressions ──
  function resolveExpr(nodeId: string, handleOut: string, visited: Set<string>): string {
    const key = `${nodeId}:${handleOut}`;
    if (visited.has(key)) return '/* circular */';
    visited.add(key);

    const node = nodeMap.get(nodeId);
    if (!node) return '0';

    const type = node.type || '';
    const data = node.data as Record<string, unknown>;
    const inlineValues = (data.inlineValues as Record<string, string>) || {};

    function inputExpr(pinId: string, fallback?: string): string {
      const incoming = dataEdgesTo.get(nodeId);
      const conn = incoming?.get(pinId);
      if (conn) return resolveExpr(conn.sourceId, conn.sourceHandle, visited);
      const inl = inlineValues[pinId];
      if (inl !== undefined && inl !== '') return inl;
      return fallback ?? '0';
    }

    // Variable read
    if (type === 'get') {
      const varName = (data.variable as string) || '_var';
      return varName;
    }

    // Concat (string concatenation)
    if (type === 'concat') {
      // For concat, inline values should be quoted as strings, not raw numbers
      function concatInputExpr(pinId: string): string {
        const incoming = dataEdgesTo.get(nodeId);
        const conn = incoming?.get(pinId);
        if (conn) return resolveExpr(conn.sourceId, conn.sourceHandle, visited);
        const inl = inlineValues[pinId];
        if (inl !== undefined && inl !== '') {
          const escaped = inl.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          return `"${escaped}"`;
        }
        return '""';
      }
      const a = concatInputExpr('a');
      const b = concatInputExpr('b');
      return `(${a} + ${b})`;
    }

    // Math operations
    if (type in MATH_OPS) {
      const a = inputExpr('a');
      const b = inputExpr('b');
      return `(${a} ${MATH_OPS[type]} ${b})`;
    }

    // Comparisons
    if (type in COMPARE_OPS) {
      const a = inputExpr('a');
      const b = inputExpr('b');
      return `(${a} ${COMPARE_OPS[type]} ${b})`;
    }

    // Random
    if (type === 'random') {
      const min = inputExpr('min', '0');
      const max = inputExpr('max', '100');
      return `(Math.floor(Math.random() * (${max} - ${min} + 1)) + ${min})`;
    }

    // Not
    if (type === 'not') {
      const val = inputExpr('value', 'false');
      return `(!${val})`;
    }

    // Set node out-value pin — returns the variable name
    if (type === 'set' && handleOut === 'out-value') {
      const varName = (data.variable as string) || '_var';
      return varName;
    }

    // For node i pin — returns the loop variable name
    if (type === 'for' && handleOut === 'i') {
      const varName = (data.variable as string) || 'i';
      return varName;
    }

    // ── Array data expressions ──

    // ArrayPop value output — returns the temp var set during walkExec
    if (type === 'arrayPop' && handleOut === 'value') {
      const tempVar = popTempVars.get(nodeId);
      if (tempVar) return tempVar;
      // Fallback if pop hasn't been walked yet
      const varName = (data.variable as string) || '_arr';
      return `${varName}.pop()`;
    }

    // ArrayLength — pure data node
    if (type === 'arrayLength') {
      const varName = (data.variable as string) || '_arr';
      return `${varName}.length`;
    }

    // ArrayGet — pure data node
    if (type === 'arrayGet') {
      const varName = (data.variable as string) || '_arr';
      const index = inputExpr('index', '0');
      return `${varName}[${index}]`;
    }

    return '0';
  }

  // Helper to get a data expression feeding into a node's input pin
  function getInputExpr(nodeId: string, pinId: string, fallback?: string): string {
    const incoming = dataEdgesTo.get(nodeId);
    const conn = incoming?.get(pinId);
    if (conn) return resolveExpr(conn.sourceId, conn.sourceHandle, new Set());
    // Check inline values on the node itself
    const node = nodeMap.get(nodeId);
    if (node) {
      const inl = (node.data as Record<string, unknown>).inlineValues as Record<string, string> | undefined;
      if (inl && inl[pinId] !== undefined && inl[pinId] !== '') return inl[pinId];
    }
    return fallback ?? '0';
  }

  // ── Phase C: Walk exec chain ──
  const declaredVars = new Set<string>();
  const lines: string[] = [];

  function emitLine(line: string, indent: number) {
    lines.push('  '.repeat(indent) + line);
  }

  function walkExec(nodeId: string, indent: number, visited: Set<string>) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) return;

    const type = node.type || '';
    const data = node.data as Record<string, unknown>;

    // Inject execution instrumentation for all nodes except start
    if (options?.instrument && type !== 'start') {
      emitLine(`await __onNode("${nodeId}");`, indent);
    }

    switch (type) {
      case 'start': {
        // Just follow exec-out
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }

      case 'input': {
        const varName = (data.variable as string) || '_input';
        // Resolve prompt from data pin (connected or inline)
        const incoming = dataEdgesTo.get(nodeId);
        const promptConn = incoming?.get('prompt');
        let promptExpr: string;
        if (promptConn) {
          // Connected to another node — use expression directly
          promptExpr = resolveExpr(promptConn.sourceId, promptConn.sourceHandle, new Set());
        } else {
          // Inline value or empty
          const inl = (data.inlineValues as Record<string, string> | undefined);
          const raw = inl?.['prompt'] ?? '';
          const escaped = raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          promptExpr = `"${escaped}"`;
        }
        const keyword = declaredVars.has(varName) ? '' : 'let ';
        declaredVars.add(varName);
        emitLine(`${keyword}${varName} = parseFloat(await prompt(${promptExpr}));`, indent);
        if (options?.instrument) {
          emitLine(`await __onVar("${varName}", JSON.stringify(${varName}));`, indent);
        }
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }

      case 'output': {
        const expr = getInputExpr(nodeId, 'value');
        emitLine(`console.log(${expr});`, indent);
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }

      case 'set': {
        const varName = (data.variable as string) || '_var';
        const expr = getInputExpr(nodeId, 'value');
        const keyword = declaredVars.has(varName) ? '' : 'let ';
        declaredVars.add(varName);
        emitLine(`${keyword}${varName} = ${expr};`, indent);
        if (options?.instrument) {
          emitLine(`await __onVar("${varName}", JSON.stringify(${varName}));`, indent);
        }
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }

      case 'if': {
        const cond = getInputExpr(nodeId, 'condition', 'false');
        emitLine(`if (${cond}) {`, indent);
        const trueBranch = execEdges.get(nodeId)?.get('true');
        if (trueBranch) walkExec(trueBranch, indent + 1, new Set(visited));
        emitLine(`} else {`, indent);
        const falseBranch = execEdges.get(nodeId)?.get('false');
        if (falseBranch) walkExec(falseBranch, indent + 1, new Set(visited));
        emitLine(`}`, indent);
        break;
      }

      case 'while': {
        const cond = getInputExpr(nodeId, 'condition', 'false');
        emitLine(`while (${cond}) {`, indent);
        if (options?.instrument) {
          emitLine(`await __onNode("${nodeId}");`, indent + 1);
        }
        const bodyTarget = execEdges.get(nodeId)?.get('body');
        if (bodyTarget) walkExec(bodyTarget, indent + 1, new Set(visited));
        emitLine(`}`, indent);
        const doneTarget = execEdges.get(nodeId)?.get('done');
        if (doneTarget) walkExec(doneTarget, indent, visited);
        break;
      }

      case 'for': {
        const varName = (data.variable as string) || 'i';
        const desde = getInputExpr(nodeId, 'desde', '0');
        const hasta = getInputExpr(nodeId, 'hasta', '10');
        const paso = getInputExpr(nodeId, 'paso', '1');
        declaredVars.add(varName);
        emitLine(`for (let ${varName} = ${desde}; ${varName} < ${hasta}; ${varName} += ${paso}) {`, indent);
        if (options?.instrument) {
          emitLine(`await __onNode("${nodeId}");`, indent + 1);
          emitLine(`await __onVar("${varName}", JSON.stringify(${varName}));`, indent + 1);
        }
        const bodyTarget = execEdges.get(nodeId)?.get('body');
        if (bodyTarget) walkExec(bodyTarget, indent + 1, new Set(visited));
        emitLine(`}`, indent);
        const doneTarget = execEdges.get(nodeId)?.get('done');
        if (doneTarget) walkExec(doneTarget, indent, visited);
        break;
      }

      // ── Array exec nodes ──

      case 'arrayCreate': {
        const varName = (data.variable as string) || '_arr';
        const keyword = declaredVars.has(varName) ? '' : 'let ';
        declaredVars.add(varName);
        emitLine(`${keyword}${varName} = [];`, indent);
        if (options?.instrument) {
          emitLine(`await __onVar("${varName}", JSON.stringify(${varName}));`, indent);
        }
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }

      case 'arrayPush': {
        const varName = (data.variable as string) || '_arr';
        const value = getInputExpr(nodeId, 'value');
        emitLine(`${varName}.push(${value});`, indent);
        if (options?.instrument) {
          emitLine(`await __onVar("${varName}", JSON.stringify(${varName}));`, indent);
        }
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }

      case 'arrayPop': {
        const varName = (data.variable as string) || '_arr';
        const tempVar = `__pop${popCounter++}`;
        popTempVars.set(nodeId, tempVar);
        emitLine(`let ${tempVar} = ${varName}.pop();`, indent);
        if (options?.instrument) {
          emitLine(`await __onVar("${varName}", JSON.stringify(${varName}));`, indent);
        }
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }

      case 'arraySet': {
        const varName = (data.variable as string) || '_arr';
        const index = getInputExpr(nodeId, 'index', '0');
        const value = getInputExpr(nodeId, 'value');
        emitLine(`${varName}[${index}] = ${value};`, indent);
        if (options?.instrument) {
          emitLine(`await __onVar("${varName}", JSON.stringify(${varName}));`, indent);
        }
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }

      // ── Loop control ──

      case 'break': {
        emitLine('break;', indent);
        // No exec-out — break terminates the flow
        break;
      }

      case 'continue': {
        emitLine('continue;', indent);
        // No exec-out — continue jumps to loop condition
        break;
      }

      default: {
        // Unknown exec node — try to follow exec-out
        const next = execEdges.get(nodeId)?.get('exec-out');
        if (next) walkExec(next, indent, visited);
        break;
      }
    }
  }

  // Find start node
  const startNode = nodes.find((n) => n.type === 'start');
  if (!startNode) {
    errors.push('No start node found');
    return { code: '// Error: No start node found', errors };
  }

  walkExec(startNode.id, 0, new Set());

  return { code: lines.join('\n'), errors };
}
