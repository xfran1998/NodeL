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
import { initialNodes, initialEdges } from '../flows/initialFlow';
import useTemporalStore, { type Snapshot } from './useTemporalStore';

/** Node types that are singletons and cannot be deleted or duplicated */
const SINGLETON_TYPES = new Set(['start', 'end']);

/** Handle IDs that carry exec flow (not data) */
export const EXEC_HANDLES = new Set([
  'exec-in',
  'exec-out',
  'true',
  'false',
  'body',
  'done',
]);

/** Build a typed edge from a connection */
function connectionToEdge(connection: Connection): Edge {
  const srcIsExec = EXEC_HANDLES.has(connection.sourceHandle || '');
  return {
    ...connection,
    id: `e-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
    type: srcIsExec ? 'exec' : 'data',
    data: srcIsExec ? {} : { dataType: 'any' },
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

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  clipboard: Clipboard | null;
  _dragSnapshot: Snapshot | null;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onReconnect: OnReconnect;
  deleteEdge: (edgeId: string) => void;
  deleteSelectedNodes: () => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  addNode: (type: string, position: { x: number; y: number }) => void;
  copySelectedNodes: () => void;
  pasteNodes: (viewportCenter: { x: number; y: number }) => void;
  loadFlow: (nodes: Node[], edges: Edge[]) => void;
  undo: () => void;
  redo: () => void;
  onNodeDragStart: () => void;
  onNodeDragStop: () => void;
}

const useFlowStore = create<FlowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  clipboard: null,
  _dragSnapshot: null,
  onNodesChange: (changes) => {
    // Prevent removal of singleton nodes (start/end) via ReactFlow internals
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
    set({ edges: addEdge(connectionToEdge(connection), get().edges) });
  },
  /** Replace an existing edge with a new connection (drag-reconnect) */
  onReconnect: (oldEdge, newConnection) => {
    const srcIsExec = EXEC_HANDLES.has(newConnection.sourceHandle || '');
    const tgtIsExec = EXEC_HANDLES.has(newConnection.targetHandle || '');
    if (srcIsExec !== tgtIsExec) return;

    saveSnapshot(get);
    const updated = get().edges.filter((e) => e.id !== oldEdge.id);
    set({ edges: addEdge(connectionToEdge(newConnection), updated) });
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
  addNode: (type, position) => {
    // Prevent adding duplicate singleton nodes
    if (SINGLETON_TYPES.has(type) && get().nodes.some((n) => n.type === type)) return;
    saveSnapshot(get);
    const id = `${type}-${Date.now()}`;
    const newNode: Node = { id, type, position, data: {} };
    set({ nodes: [...get().nodes, newNode] });
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
  loadFlow: (nodes, edges) => {
    saveSnapshot(get);
    set({ nodes, edges });
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
}));

export default useFlowStore;
