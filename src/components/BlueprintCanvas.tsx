import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  SelectionMode,
  useReactFlow,
  type Connection,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { DataType } from '../types';
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import ContextMenu from './ContextMenu';
import { GRID_SIZE } from '../constants';
import useFlowStore, { EXEC_HANDLES } from '../hooks/useFlowStore';
import useExecutionStore from '../hooks/useExecutionStore';
import { initialNodes, initialEdges } from '../flows/initialFlow';
import { demoNodes, demoEdges } from '../flows/demoAllNodes';
import { exportToFile, importFromFile, encodeFlowToHash } from '../lib/persistence';
import { PIN_REGISTRY, findCompatiblePin, hasCompatiblePin } from '../lib/pinRegistry';

const MINIMAP_COLORS: Record<string, string> = {
  // Flow
  start: '#22c55e',
  input: '#06b6d4',
  output: '#3b82f6',
  set: '#a855f7',
  if: '#f59e0b',
  while: '#f97316',
  for: '#14b8a6',
  // Variable
  get: '#c084fc',
  // Math
  add: '#4ade80',
  subtract: '#4ade80',
  multiply: '#4ade80',
  divide: '#4ade80',
  modulo: '#4ade80',
  // Compare
  greater: '#60a5fa',
  less: '#60a5fa',
  equal: '#60a5fa',
  greaterEq: '#60a5fa',
  lessEq: '#60a5fa',
  notEqual: '#60a5fa',
  // Special
  random: '#f472b6',
  not: '#60a5fa',
  // Array
  arrayCreate: '#06b6d4',
  arrayPush: '#06b6d4',
  arrayPop: '#06b6d4',
  arrayLength: '#06b6d4',
  arrayGet: '#06b6d4',
  arraySet: '#06b6d4',
  // Loop control
  break: '#ef4444',
  continue: '#f59e0b',
  // Layout
  comment: '#6b7280',
};

function FlowToolbar() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const loadFlow = useFlowStore((s) => s.loadFlow);
  const { fitView } = useReactFlow();
  const [shareLabel, setShareLabel] = useState('Share');

  const load = useCallback(
    (n: typeof initialNodes, e: typeof initialEdges) => {
      loadFlow(n, e);
      setTimeout(() => fitView({ padding: 0.3 }), 50);
    },
    [loadFlow, fitView],
  );

  const handleNew = useCallback(() => {
    load(
      [
        { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: {} },
      ],
      [],
    );
  }, [load]);

  const handleExport = useCallback(() => {
    exportToFile(nodes, edges);
  }, [nodes, edges]);

  const handleImport = useCallback(async () => {
    try {
      const data = await importFromFile();
      load(data.nodes, data.edges);
    } catch {
      // User cancelled or invalid file
    }
  }, [load]);

  const handleShare = useCallback(() => {
    const hash = encodeFlowToHash(nodes, edges);
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    navigator.clipboard.writeText(url);
    setShareLabel('Copied!');
    setTimeout(() => setShareLabel('Share'), 2000);
  }, [nodes, edges]);

  return (
    <div className="flow-toolbar">
      <button onClick={handleNew}>New</button>
      <button onClick={handleExport}>Export</button>
      <button onClick={handleImport}>Import</button>
      <button onClick={handleShare}>{shareLabel}</button>
      <div className="flow-toolbar__sep" />
      <button onClick={() => load(initialNodes, initialEdges)}>
        Promedio de Notas
      </button>
      <button onClick={() => load(demoNodes, demoEdges)}>
        Demo: Todos los Nodos
      </button>
    </div>
  );
}

const isValidConnection = (connection: Edge | Connection) => {
  const srcIsExec = EXEC_HANDLES.has(connection.sourceHandle || '');
  const tgtIsExec = EXEC_HANDLES.has(connection.targetHandle || '');
  return srcIsExec === tgtIsExec;
};

/** Info about a connection drag that was dropped on the canvas */
interface PendingConn {
  nodeId: string;
  handleId: string;
  handleType: 'source' | 'target';
  pinKind: 'exec' | 'data';
  dataType?: DataType;
}

interface CtxMenuState {
  x: number;
  y: number;
  flowX: number;
  flowY: number;
  /** Present when the menu was triggered by dropping a connection on the canvas */
  pending?: PendingConn;
}

export default function BlueprintCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onReconnect, deleteEdge, deleteSelectedNodes, addNode, addNodeWithEdge, copySelectedNodes, pasteNodes, undo, redo, onNodeDragStart, onNodeDragStop } =
    useFlowStore();
  const { screenToFlowPosition, getViewport, setCenter } = useReactFlow();

  // ── Follow active node during execution ──
  const executingNodeId = useExecutionStore((s) => s.executingNodeId);
  const followActiveNode = useExecutionStore((s) => s.followActiveNode);
  const stepDelay = useExecutionStore((s) => s.stepDelay);

  useEffect(() => {
    if (!followActiveNode || !executingNodeId || stepDelay === 0) return;
    const node = nodes.find((n) => n.id === executingNodeId);
    if (!node) return;

    // Estimate node center (position is top-left corner)
    const width = (node.measured?.width ?? node.width ?? 160);
    const height = (node.measured?.height ?? node.height ?? 40);
    const cx = node.position.x + width / 2;
    const cy = node.position.y + height / 2;

    setCenter(cx, cy, { duration: 300, zoom: getViewport().zoom });
  }, [executingNodeId, followActiveNode, stepDelay, nodes, setCenter, getViewport]);

  const [ctxMenu, setCtxMenu] = useState<CtxMenuState | null>(null);

  // ── Connection-drop tracking ──
  const pendingConnRef = useRef<PendingConn | null>(null);
  /** Set to true when onConnect fires, so handleConnectEnd knows a connection was made */
  const connectionMadeRef = useRef(false);

  const wrappedOnConnect = useCallback(
    (conn: Connection) => {
      connectionMadeRef.current = true;
      onConnect(conn);
    },
    [onConnect],
  );

  /** Remember which pin the user started dragging from */
  const handleConnectStart = useCallback(
    (_event: MouseEvent | TouchEvent, params: { nodeId: string | null; handleId: string | null; handleType: 'source' | 'target' | null }) => {
      if (!params.nodeId || !params.handleId || !params.handleType) return;

      // Look up data type from pin registry
      const currentNodes = useFlowStore.getState().nodes;
      const node = currentNodes.find((n) => n.id === params.nodeId);
      if (!node) return;

      const pinKind: 'exec' | 'data' = EXEC_HANDLES.has(params.handleId) ? 'exec' : 'data';

      let dataType: DataType | undefined;
      if (pinKind === 'data') {
        const nodePins = PIN_REGISTRY[node.type || ''];
        if (nodePins) {
          const side = params.handleType === 'source' ? nodePins.right : nodePins.left;
          const pin = side.find((p) => p.id === params.handleId);
          dataType = pin?.dataType;
        }
      }

      pendingConnRef.current = {
        nodeId: params.nodeId,
        handleId: params.handleId,
        handleType: params.handleType,
        pinKind,
        dataType,
      };
    },
    [],
  );

  /** If the connection drag was dropped on empty canvas, show filtered context menu */
  const handleConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // If onConnect already fired (proximity snap), skip the modal
      if (connectionMadeRef.current) {
        connectionMadeRef.current = false;
        pendingConnRef.current = null;
        return;
      }

      const target = (event as MouseEvent).target as HTMLElement | null;

      // If dropped on a handle, connection was handled normally
      if (target?.closest('.react-flow__handle')) {
        pendingConnRef.current = null;
        return;
      }

      const pending = pendingConnRef.current;
      if (!pending) return;

      const clientX = 'clientX' in event ? event.clientX : (event as TouchEvent).changedTouches[0]?.clientX || 0;
      const clientY = 'clientY' in event ? event.clientY : (event as TouchEvent).changedTouches[0]?.clientY || 0;
      const flowPos = screenToFlowPosition({ x: clientX, y: clientY });

      setCtxMenu({
        x: clientX,
        y: clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
        pending,
      });
      // Don't clear pendingConnRef — needed when the user picks a node
    },
    [screenToFlowPosition],
  );

  // ── Compatibility filter for the context menu ──
  const ctxFilter = useMemo(() => {
    if (!ctxMenu?.pending) return undefined;
    const { handleType, pinKind, dataType } = ctxMenu.pending;
    return (nodeType: string) =>
      hasCompatiblePin(nodeType, handleType, pinKind, dataType);
  }, [ctxMenu]);

  /** Alt+Click on a wire to disconnect it (like UE Blueprints) */
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (_event.altKey) {
        deleteEdge(edge.id);
      }
    },
    [deleteEdge],
  );

  /** If a reconnect drag is dropped into empty space, remove the edge */
  const handleReconnectEnd = useCallback(
    (_event: MouseEvent | TouchEvent, edge: Edge) => {
      const target = (_event as MouseEvent).target as HTMLElement | null;
      if (!target?.closest('.react-flow__handle')) {
        deleteEdge(edge.id);
      }
    },
    [deleteEdge],
  );

  /** Right-click on empty canvas → show context menu (no filter) */
  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      pendingConnRef.current = null; // clear any stale pending
      const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      setCtxMenu({
        x: event.clientX,
        y: event.clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
      });
    },
    [screenToFlowPosition],
  );

  const handleCtxSelect = useCallback(
    (type: string) => {
      if (!ctxMenu) return;

      const snappedX = Math.round(ctxMenu.flowX / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(ctxMenu.flowY / GRID_SIZE) * GRID_SIZE;

      if (ctxMenu.pending) {
        // Auto-connect mode: create node + wire in one shot
        const { pending } = ctxMenu;
        const newNodeHandle = findCompatiblePin(
          type,
          pending.handleType,
          pending.pinKind,
          pending.dataType,
        );

        if (newNodeHandle) {
          addNodeWithEdge(type, { x: snappedX, y: snappedY }, {
            existingNodeId: pending.nodeId,
            existingHandle: pending.handleId,
            newNodeHandle,
            existingIsSource: pending.handleType === 'source',
          });
        } else {
          addNode(type, { x: snappedX, y: snappedY });
        }
      } else {
        addNode(type, { x: snappedX, y: snappedY });
      }

      pendingConnRef.current = null;
      setCtxMenu(null);
    },
    [ctxMenu, addNode, addNodeWithEdge],
  );

  const handleCtxClose = useCallback(() => {
    pendingConnRef.current = null;
    setCtxMenu(null);
  }, []);

  /** Close context menu on pane click */
  const handlePaneClick = useCallback(() => {
    if (ctxMenu) {
      pendingConnRef.current = null;
      setCtxMenu(null);
    }
  }, [ctxMenu]);

  /** Keyboard shortcuts */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S — prevent browser save; auto-save is always active
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        return;
      }

      // Ignore other shortcuts when typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copySelectedNodes();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        // Paste at viewport center
        const vp = getViewport();
        const centerX = (-vp.x + window.innerWidth / 2) / vp.zoom;
        const centerY = (-vp.y + window.innerHeight / 2) / vp.zoom;
        pasteNodes({ x: centerX, y: centerY });
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedNodes, pasteNodes, getViewport, deleteSelectedNodes, undo, redo]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={wrappedOnConnect}
        onReconnect={onReconnect}
        onReconnectEnd={handleReconnectEnd}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        onEdgeClick={handleEdgeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onPaneContextMenu={handlePaneContextMenu}
        onPaneClick={handlePaneClick}
        connectionRadius={40}
        reconnectRadius={40}
        isValidConnection={isValidConnection}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{ type: 'exec' }}
        proOptions={{ hideAttribution: true }}
        colorMode="dark"
        selectionOnDrag
        panOnDrag={[1]}
        selectionMode={SelectionMode.Partial}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={GRID_SIZE}
          size={1}
          color="#374151"
        />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(node) =>
            MINIMAP_COLORS[node.type || ''] || '#6b7280'
          }
        />
        <FlowToolbar />
      </ReactFlow>
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onSelect={handleCtxSelect}
          onClose={handleCtxClose}
          filter={ctxFilter}
        />
      )}
    </div>
  );
}
