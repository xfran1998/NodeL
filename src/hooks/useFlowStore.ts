import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type Connection,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnReconnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import type { DataType, FunctionDef, FunctionParam } from '../types';
import { GRID_SIZE, NODE_WIDTH, DEFAULT_FUNCTION_COLOR } from '../constants';
import { initialNodes, initialEdges } from '../flows/initialFlow';
import useTemporalStore, { type Snapshot } from './useTemporalStore';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  decodeFlowFromHash,
} from '../lib/persistence';

/** Resolve initial flow: URL hash → localStorage → built-in demo */
function getInitialFlow(): { nodes: Node[]; edges: Edge[]; functions?: Record<string, FunctionDef> } {
  const hash = window.location.hash.slice(1);
  if (hash) {
    const fromHash = decodeFlowFromHash(hash);
    if (fromHash) {
      // Clear hash so it doesn't reload on refresh
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return fromHash;
    }
  }
  const fromStorage = loadFromLocalStorage();
  if (fromStorage) return fromStorage;
  return { nodes: initialNodes, edges: initialEdges };
}

const _initial = getInitialFlow();

/** Node types that are singletons and cannot be deleted or duplicated */
const SINGLETON_TYPES = new Set(['start', 'functionEntry']);

/** Handle IDs that carry exec flow (not data) */
export const EXEC_HANDLES = new Set([
  'exec-in',
  'exec-out',
  'true',
  'false',
  'body',
  'done',
]);

/** Source pin data types: nodeType → handleId → DataType */
const SOURCE_PIN_TYPES: Record<string, Record<string, DataType>> = {
  get: { value: 'any' },
  set: { 'out-value': 'any' },
  for: { i: 'number' },
  add: { result: 'number' },
  subtract: { result: 'number' },
  multiply: { result: 'number' },
  divide: { result: 'number' },
  modulo: { result: 'number' },
  greater: { result: 'boolean' },
  less: { result: 'boolean' },
  equal: { result: 'boolean' },
  greaterEq: { result: 'boolean' },
  lessEq: { result: 'boolean' },
  notEqual: { result: 'boolean' },
  concat: { result: 'string' },
  random: { value: 'number' },
  not: { result: 'boolean' },
  arrayPop: { value: 'any' },
  arrayLength: { value: 'number' },
  arrayGet: { value: 'any' },
};

function getSourcePinDataType(nodeType: string, handleId: string, node?: Node): DataType {
  // Dynamic type for SET node — reads user-selected valueType
  if (nodeType === 'set' && handleId === 'out-value' && node) {
    const vt = (node.data as Record<string, unknown>).valueType as DataType | undefined;
    return vt || 'any';
  }

  // Static pin types for known node types
  const staticType = SOURCE_PIN_TYPES[nodeType]?.[handleId];
  if (staticType) return staticType;

  // Dynamic pin types for function nodes
  if (nodeType === 'functionEntry' || nodeType === 'callFunction') {
    // The handle ID encodes the param/return ID; data type stored in node data
    const fnId = (node?.data as Record<string, unknown>)?.functionId as string | undefined;
    if (fnId) {
      const functions = useFlowStore.getState().functions;
      const fn = functions[fnId];
      if (fn) {
        if (nodeType === 'functionEntry') {
          // Output pins correspond to function params
          const param = fn.params.find((p) => p.id === handleId);
          if (param) return param.dataType;
        } else {
          // callFunction: output pins correspond to function returns
          const ret = fn.returns.find((r) => r.id === handleId);
          if (ret) return ret.dataType;
        }
      }
    }
  }

  return 'any';
}

/** Build a typed edge from a connection */
function connectionToEdge(connection: Connection, nodes: Node[]): Edge {
  const srcIsExec = EXEC_HANDLES.has(connection.sourceHandle || '');
  let dataType: DataType = 'any';
  if (!srcIsExec) {
    const srcNode = nodes.find((n) => n.id === connection.source);
    if (srcNode) {
      dataType = getSourcePinDataType(srcNode.type || '', connection.sourceHandle || '', srcNode);
    }
  }
  return {
    ...connection,
    id: `e-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
    type: srcIsExec ? 'exec' : 'data',
    data: srcIsExec ? {} : { dataType },
  };
}

/** Capture current nodes/edges as a snapshot */
function saveSnapshot(get: () => FlowState) {
  const { nodes, edges } = get();
  useTemporalStore.getState().pushSnapshot({ nodes, edges });
}

interface Clipboard {
  nodes: Node[];
  edges: Edge[];
}

/** Debounce timer for updateNodeData */
let dataDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let dataDebounceSnapshotSaved = false;
const DATA_DEBOUNCE_MS = 300;

/** Counter for auto-naming functions */
let _fnCounter = 1;

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  clipboard: Clipboard | null;
  _dragSnapshot: Snapshot | null;

  // ── Function system ──
  functions: Record<string, FunctionDef>;
  currentScope: string; // 'main' or a function ID
  mainNodes: Node[];
  mainEdges: Edge[];
  viewports: Record<string, { x: number; y: number; zoom: number }>;

  // ── ReactFlow callbacks ──
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onReconnect: OnReconnect;

  // ── Actions ──
  deleteEdge: (edgeId: string) => void;
  deleteSelectedNodes: () => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  addNode: (type: string, position: { x: number; y: number }, extraData?: Record<string, unknown>) => void;
  addNodeWithEdge: (
    type: string,
    position: { x: number; y: number },
    conn: {
      existingNodeId: string;
      existingHandle: string;
      newNodeHandle: string;
      existingIsSource: boolean;
    },
    extraData?: Record<string, unknown>,
  ) => void;
  wrapSelectedNodesInComment: () => void;
  copySelectedNodes: () => void;
  pasteNodes: (viewportCenter: { x: number; y: number }) => void;
  loadFlow: (nodes: Node[], edges: Edge[], functions?: Record<string, FunctionDef>) => void;
  undo: () => void;
  redo: () => void;
  onNodeDragStart: () => void;
  onNodeDragStop: () => void;

  // ── Function CRUD ──
  createFunction: () => string;
  deleteFunction: (fnId: string) => void;
  updateFunction: (fnId: string, updates: Partial<Pick<FunctionDef, 'name' | 'color'>>) => void;
  addFunctionParam: (fnId: string) => void;
  removeFunctionParam: (fnId: string, paramId: string) => void;
  updateFunctionParam: (fnId: string, paramId: string, updates: Partial<FunctionParam>) => void;
  addFunctionReturn: (fnId: string) => void;
  removeFunctionReturn: (fnId: string, retId: string) => void;
  updateFunctionReturn: (fnId: string, retId: string, updates: Partial<FunctionParam>) => void;
  setScope: (scope: string, currentViewport?: { x: number; y: number; zoom: number }) => void;

  /** Update dataType on all outgoing edges from a specific pin */
  updateOutgoingEdgeTypes: (nodeId: string, handleId: string, dataType: DataType) => void;

  /** Get the current scope's nodes/edges (for read access that respects scope swapping) */
  getScopeNodesEdges: (scope: string) => { nodes: Node[]; edges: Edge[] };
}

const useFlowStore = create<FlowState>((set, get) => ({
  nodes: _initial.nodes,
  edges: _initial.edges,
  clipboard: null,
  _dragSnapshot: null,

  // ── Function system ──
  functions: _initial.functions || {},
  currentScope: 'main',
  mainNodes: _initial.nodes,
  mainEdges: _initial.edges,
  viewports: {},

  onNodesChange: (changes) => {
    // Prevent removal of singleton nodes (start, functionEntry) via ReactFlow internals
    const safeChanges = changes.filter((c) => {
      if (c.type === 'remove') {
        const node = get().nodes.find((n) => n.id === c.id);
        if (node && SINGLETON_TYPES.has(node.type!)) return false;
      }
      return true;
    });
    // Save snapshot if any node removals are happening
    const hasRemovals = safeChanges.some((c) => c.type === 'remove');
    if (hasRemovals) saveSnapshot(get);
    set({ nodes: applyNodeChanges(safeChanges, get().nodes) });
  },
  onEdgesChange: (changes) => {
    const hasRemovals = changes.some((c) => c.type === 'remove');
    if (hasRemovals) saveSnapshot(get);
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    const srcIsExec = EXEC_HANDLES.has(connection.sourceHandle || '');
    const tgtIsExec = EXEC_HANDLES.has(connection.targetHandle || '');

    // Block cross-kind connections (exec ↔ data)
    if (srcIsExec !== tgtIsExec) return;

    saveSnapshot(get);
    set({ edges: addEdge(connectionToEdge(connection, get().nodes), get().edges) });
  },
  /** Replace an existing edge with a new connection (drag-reconnect) */
  onReconnect: (oldEdge, newConnection) => {
    const srcIsExec = EXEC_HANDLES.has(newConnection.sourceHandle || '');
    const tgtIsExec = EXEC_HANDLES.has(newConnection.targetHandle || '');
    if (srcIsExec !== tgtIsExec) return;

    saveSnapshot(get);
    const updated = get().edges.filter((e) => e.id !== oldEdge.id);
    set({ edges: addEdge(connectionToEdge(newConnection, get().nodes), updated) });
  },
  /** Remove a single edge by id (Alt+click) */
  deleteEdge: (edgeId) => {
    saveSnapshot(get);
    set({ edges: get().edges.filter((e) => e.id !== edgeId) });
  },
  /** Remove all selected nodes and their connected edges (except singletons) */
  deleteSelectedNodes: () => {
    const { nodes, edges } = get();
    const selectedIds = new Set(
      nodes
        .filter((n) => n.selected && !SINGLETON_TYPES.has(n.type!))
        .map((n) => n.id),
    );
    if (selectedIds.size === 0) return;
    saveSnapshot(get);
    set({
      nodes: nodes.filter((n) => !selectedIds.has(n.id)),
      edges: edges.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)),
    });
  },
  updateNodeData: (nodeId, data) => {
    // Debounced snapshot: save on first change in a burst, skip subsequent within 300ms
    if (!dataDebounceSnapshotSaved) {
      saveSnapshot(get);
      dataDebounceSnapshotSaved = true;
    }
    if (dataDebounceTimer) clearTimeout(dataDebounceTimer);
    dataDebounceTimer = setTimeout(() => {
      dataDebounceSnapshotSaved = false;
      dataDebounceTimer = null;
    }, DATA_DEBOUNCE_MS);

    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    });
  },
  addNode: (type, position, extraData) => {
    // Prevent adding duplicate singleton nodes
    if (SINGLETON_TYPES.has(type) && get().nodes.some((n) => n.type === type)) return;
    saveSnapshot(get);
    const id = `${type}-${Date.now()}`;
    const newNode: Node = {
      id,
      type,
      position,
      data: extraData || {},
      ...(type === 'comment' ? { style: { width: 300, height: 200 } } : {}),
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  addNodeWithEdge: (type, position, conn, extraData) => {
    if (SINGLETON_TYPES.has(type) && get().nodes.some((n) => n.type === type)) return;
    saveSnapshot(get);
    const id = `${type}-${Date.now()}`;
    const newNode: Node = { id, type, position, data: extraData || {} };
    const allNodes = [...get().nodes, newNode];

    // Build connection: existing node ↔ new node
    const source = conn.existingIsSource ? conn.existingNodeId : id;
    const sourceHandle = conn.existingIsSource ? conn.existingHandle : conn.newNodeHandle;
    const target = conn.existingIsSource ? id : conn.existingNodeId;
    const targetHandle = conn.existingIsSource ? conn.newNodeHandle : conn.existingHandle;

    const connection: Connection = { source, sourceHandle, target, targetHandle };
    const newEdge = connectionToEdge(connection, allNodes);

    set({
      nodes: allNodes,
      edges: addEdge(newEdge, get().edges),
    });
  },
  wrapSelectedNodesInComment: () => {
    const { nodes } = get();
    const selected = nodes.filter((n) => n.selected && n.type !== 'comment');
    if (selected.length === 0) return;

    saveSnapshot(get);

    const PADDING = 40;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of selected) {
      const w = node.measured?.width ?? (node.width as number) ?? NODE_WIDTH;
      const h = node.measured?.height ?? (node.height as number) ?? 40;
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + w);
      maxY = Math.max(maxY, node.position.y + h);
    }

    const commentX = Math.floor((minX - PADDING) / GRID_SIZE) * GRID_SIZE;
    const commentY = Math.floor((minY - PADDING) / GRID_SIZE) * GRID_SIZE;
    const commentW = Math.ceil((maxX + PADDING - commentX) / GRID_SIZE) * GRID_SIZE;
    const commentH = Math.ceil((maxY + PADDING - commentY) / GRID_SIZE) * GRID_SIZE;

    const id = `comment-${Date.now()}`;
    const commentNode: Node = {
      id,
      type: 'comment',
      position: { x: commentX, y: commentY },
      data: {},
      style: { width: commentW, height: commentH },
      selected: false,
    };

    set({
      nodes: [commentNode, ...nodes.map((n) => ({ ...n, selected: false }))],
    });
  },
  copySelectedNodes: () => {
    const { nodes, edges } = get();
    // Exclude singleton nodes from copy
    const selected = nodes.filter((n) => n.selected && !SINGLETON_TYPES.has(n.type!));
    if (selected.length === 0) return;

    const selectedIds = new Set(selected.map((n) => n.id));
    // Keep only edges where both endpoints are in the selection
    const internalEdges = edges.filter(
      (e) => selectedIds.has(e.source) && selectedIds.has(e.target),
    );

    set({
      clipboard: {
        nodes: selected.map((n) => ({ ...n, data: { ...n.data } })),
        edges: internalEdges.map((e) => ({ ...e })),
      },
    });
  },
  pasteNodes: (viewportCenter) => {
    const { clipboard, nodes, edges } = get();
    if (!clipboard || clipboard.nodes.length === 0) return;

    saveSnapshot(get);

    // Compute centroid of copied nodes
    const cx =
      clipboard.nodes.reduce((sum, n) => sum + n.position.x, 0) /
      clipboard.nodes.length;
    const cy =
      clipboard.nodes.reduce((sum, n) => sum + n.position.y, 0) /
      clipboard.nodes.length;

    // Map old IDs to new IDs
    const ts = Date.now();
    const idMap = new Map<string, string>();
    clipboard.nodes.forEach((n, i) => {
      idMap.set(n.id, `${n.type}-paste-${ts}-${i}`);
    });

    // Create new nodes offset to viewport center
    const newNodes: Node[] = clipboard.nodes.map((n) => ({
      ...n,
      id: idMap.get(n.id)!,
      position: {
        x: n.position.x - cx + viewportCenter.x,
        y: n.position.y - cy + viewportCenter.y,
      },
      data: { ...n.data },
      selected: true,
    }));

    // Re-create internal edges with remapped IDs
    const newEdges: Edge[] = clipboard.edges.map((e) => {
      const newSource = idMap.get(e.source)!;
      const newTarget = idMap.get(e.target)!;
      return {
        ...e,
        id: `e-${newSource}-${e.sourceHandle}-${newTarget}-${e.targetHandle}`,
        source: newSource,
        target: newTarget,
      };
    });

    // Deselect existing nodes
    const deselected = nodes.map((n) => ({ ...n, selected: false }));

    set({
      nodes: [...deselected, ...newNodes],
      edges: [...edges, ...newEdges],
    });
  },
  loadFlow: (nodes, edges, functions) => {
    saveSnapshot(get);
    set({
      nodes,
      edges,
      mainNodes: nodes,
      mainEdges: edges,
      currentScope: 'main',
      ...(functions !== undefined ? { functions } : {}),
    });
  },
  undo: () => {
    const { nodes, edges } = get();
    const snapshot = useTemporalStore.getState().undo({ nodes, edges });
    if (snapshot) set({ nodes: snapshot.nodes, edges: snapshot.edges });
  },
  redo: () => {
    const { nodes, edges } = get();
    const snapshot = useTemporalStore.getState().redo({ nodes, edges });
    if (snapshot) set({ nodes: snapshot.nodes, edges: snapshot.edges });
  },
  onNodeDragStart: () => {
    const { nodes, edges } = get();
    set({ _dragSnapshot: { nodes, edges } });
  },
  onNodeDragStop: () => {
    const { _dragSnapshot } = get();
    if (_dragSnapshot) {
      useTemporalStore.getState().pushSnapshot(_dragSnapshot);
      set({ _dragSnapshot: null });
    }
  },

  // ── Function CRUD ──

  createFunction: () => {
    const fnId = `fn-${Date.now()}`;
    const name = `Function ${_fnCounter++}`;
    const entryNode: Node = {
      id: `functionEntry-${Date.now()}`,
      type: 'functionEntry',
      position: { x: 0, y: 0 },
      data: { functionId: fnId },
    };
    const fn: FunctionDef = {
      id: fnId,
      name,
      color: DEFAULT_FUNCTION_COLOR,
      params: [],
      returns: [],
      nodes: [entryNode],
      edges: [],
    };
    set({ functions: { ...get().functions, [fnId]: fn } });
    return fnId;
  },

  deleteFunction: (fnId) => {
    const { functions, nodes, edges, currentScope } = get();
    if (!functions[fnId]) return;

    // If we're inside the function being deleted, switch back to main first
    if (currentScope === fnId) {
      get().setScope('main');
    }

    // Remove callFunction nodes that reference this function (in current scope)
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    const orphanIds = new Set(
      currentNodes
        .filter((n) => n.type === 'callFunction' && (n.data as Record<string, unknown>).functionId === fnId)
        .map((n) => n.id),
    );

    const newFunctions = { ...get().functions };
    delete newFunctions[fnId];

    // Also clean callFunction nodes from main if we're not already in main
    const mainNodes = get().currentScope === 'main' ? currentNodes : get().mainNodes;
    const mainEdges = get().currentScope === 'main' ? currentEdges : get().mainEdges;

    const cleanedMainNodes = mainNodes.filter((n) => !orphanIds.has(n.id) &&
      !(n.type === 'callFunction' && (n.data as Record<string, unknown>).functionId === fnId));
    const cleanedMainEdges = mainEdges.filter(
      (e) => !orphanIds.has(e.source) && !orphanIds.has(e.target) &&
        cleanedMainNodes.some((n) => n.id === e.source) && cleanedMainNodes.some((n) => n.id === e.target),
    );

    // Also clean callFunction nodes referencing this function inside other functions
    const cleanedFunctions = { ...newFunctions };
    for (const [fid, fdef] of Object.entries(cleanedFunctions)) {
      const hasOrphans = fdef.nodes.some(
        (n) => n.type === 'callFunction' && (n.data as Record<string, unknown>).functionId === fnId,
      );
      if (hasOrphans) {
        const cleanNodes = fdef.nodes.filter(
          (n) => !(n.type === 'callFunction' && (n.data as Record<string, unknown>).functionId === fnId),
        );
        const cleanNodeIds = new Set(cleanNodes.map((n) => n.id));
        const cleanEdges = fdef.edges.filter(
          (e) => cleanNodeIds.has(e.source) && cleanNodeIds.has(e.target),
        );
        cleanedFunctions[fid] = { ...fdef, nodes: cleanNodes, edges: cleanEdges };
      }
    }

    if (get().currentScope === 'main') {
      set({
        functions: cleanedFunctions,
        nodes: cleanedMainNodes,
        edges: cleanedMainEdges,
        mainNodes: cleanedMainNodes,
        mainEdges: cleanedMainEdges,
      });
    } else {
      // We're in another function scope - clean current scope's nodes too
      const curNodes = currentNodes.filter(
        (n) => !(n.type === 'callFunction' && (n.data as Record<string, unknown>).functionId === fnId),
      );
      const curNodeIds = new Set(curNodes.map((n) => n.id));
      const curEdges = currentEdges.filter(
        (e) => curNodeIds.has(e.source) && curNodeIds.has(e.target),
      );
      set({
        functions: cleanedFunctions,
        nodes: curNodes,
        edges: curEdges,
        mainNodes: cleanedMainNodes,
        mainEdges: cleanedMainEdges,
      });
    }
  },

  updateFunction: (fnId, updates) => {
    const { functions } = get();
    const fn = functions[fnId];
    if (!fn) return;
    set({
      functions: { ...functions, [fnId]: { ...fn, ...updates } },
    });
  },

  addFunctionParam: (fnId) => {
    const { functions } = get();
    const fn = functions[fnId];
    if (!fn) return;
    const param: FunctionParam = {
      id: `p-${Date.now()}`,
      name: `param${fn.params.length + 1}`,
      dataType: 'number',
    };
    set({
      functions: {
        ...functions,
        [fnId]: { ...fn, params: [...fn.params, param] },
      },
    });
  },

  removeFunctionParam: (fnId, paramId) => {
    const { functions } = get();
    const fn = functions[fnId];
    if (!fn) return;
    set({
      functions: {
        ...functions,
        [fnId]: { ...fn, params: fn.params.filter((p) => p.id !== paramId) },
      },
    });
  },

  updateFunctionParam: (fnId, paramId, updates) => {
    const { functions } = get();
    const fn = functions[fnId];
    if (!fn) return;
    set({
      functions: {
        ...functions,
        [fnId]: {
          ...fn,
          params: fn.params.map((p) => (p.id === paramId ? { ...p, ...updates } : p)),
        },
      },
    });
  },

  addFunctionReturn: (fnId) => {
    const { functions } = get();
    const fn = functions[fnId];
    if (!fn) return;
    const ret: FunctionParam = {
      id: `r-${Date.now()}`,
      name: `result${fn.returns.length + 1}`,
      dataType: 'number',
    };
    set({
      functions: {
        ...functions,
        [fnId]: { ...fn, returns: [...fn.returns, ret] },
      },
    });
  },

  removeFunctionReturn: (fnId, retId) => {
    const { functions } = get();
    const fn = functions[fnId];
    if (!fn) return;
    set({
      functions: {
        ...functions,
        [fnId]: { ...fn, returns: fn.returns.filter((r) => r.id !== retId) },
      },
    });
  },

  updateFunctionReturn: (fnId, retId, updates) => {
    const { functions } = get();
    const fn = functions[fnId];
    if (!fn) return;
    set({
      functions: {
        ...functions,
        [fnId]: {
          ...fn,
          returns: fn.returns.map((r) => (r.id === retId ? { ...r, ...updates } : r)),
        },
      },
    });
  },

  setScope: (scope, currentViewport) => {
    const { currentScope, nodes, edges, functions, viewports } = get();
    if (scope === currentScope) return;

    // Save current viewport
    const updatedViewports = currentViewport
      ? { ...viewports, [currentScope]: currentViewport }
      : viewports;

    // Save current scope's nodes/edges
    if (currentScope === 'main') {
      set({ mainNodes: nodes, mainEdges: edges });
    } else if (functions[currentScope]) {
      set({
        functions: {
          ...functions,
          [currentScope]: { ...functions[currentScope], nodes, edges },
        },
      });
    }

    // Load target scope's nodes/edges
    const updatedFunctions = get().functions;
    if (scope === 'main') {
      set({
        currentScope: 'main',
        nodes: get().mainNodes,
        edges: get().mainEdges,
        viewports: updatedViewports,
      });
    } else if (updatedFunctions[scope]) {
      set({
        currentScope: scope,
        nodes: updatedFunctions[scope].nodes,
        edges: updatedFunctions[scope].edges,
        viewports: updatedViewports,
      });
    }

    // Clear undo/redo history for the new scope
    useTemporalStore.getState().clear();
  },

  updateOutgoingEdgeTypes: (nodeId, handleId, dataType) => {
    set({
      edges: get().edges.map((e) =>
        e.source === nodeId && e.sourceHandle === handleId
          ? { ...e, data: { ...e.data, dataType } }
          : e,
      ),
    });
  },

  getScopeNodesEdges: (scope) => {
    const { currentScope, nodes, edges, mainNodes, mainEdges, functions } = get();
    if (scope === currentScope) return { nodes, edges };
    if (scope === 'main') return { nodes: mainNodes, edges: mainEdges };
    const fn = functions[scope];
    if (fn) return { nodes: fn.nodes, edges: fn.edges };
    return { nodes: [], edges: [] };
  },
}));

/** Sync current scope back to storage before auto-save */
function getFullState(): { nodes: Node[]; edges: Edge[]; functions: Record<string, FunctionDef> } {
  const state = useFlowStore.getState();
  const functions = { ...state.functions };

  // If currently viewing a function, sync its nodes/edges from the active canvas
  if (state.currentScope !== 'main' && functions[state.currentScope]) {
    functions[state.currentScope] = {
      ...functions[state.currentScope],
      nodes: state.nodes,
      edges: state.edges,
    };
  }

  const mainNodes = state.currentScope === 'main' ? state.nodes : state.mainNodes;
  const mainEdges = state.currentScope === 'main' ? state.edges : state.mainEdges;

  return { nodes: mainNodes, edges: mainEdges, functions };
}

/** Auto-save to localStorage (debounced 500ms) */
let _saveTimer: ReturnType<typeof setTimeout> | null = null;
useFlowStore.subscribe(() => {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => {
    const full = getFullState();
    saveToLocalStorage(full.nodes, full.edges, full.functions);
  }, 500);
});

export default useFlowStore;
