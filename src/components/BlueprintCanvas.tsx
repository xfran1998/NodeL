import { useCallback, useEffect, useState } from 'react';
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

import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import ContextMenu from './ContextMenu';
import { GRID_SIZE } from '../constants';
import useFlowStore, { EXEC_HANDLES } from '../hooks/useFlowStore';
import { initialNodes, initialEdges } from '../flows/initialFlow';
import { demoNodes, demoEdges } from '../flows/demoAllNodes';

const MINIMAP_COLORS: Record<string, string> = {
  // Flow
  start: '#22c55e',
  end: '#ef4444',
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
};

function FlowToolbar() {
  const loadFlow = useFlowStore((s) => s.loadFlow);
  const { fitView } = useReactFlow();

  const load = useCallback(
    (nodes: typeof initialNodes, edges: typeof initialEdges) => {
      loadFlow(nodes, edges);
      // Wait for React to render new nodes before fitting
      setTimeout(() => fitView({ padding: 0.3 }), 50);
    },
    [loadFlow, fitView],
  );

  return (
    <div className="flow-toolbar">
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

export default function BlueprintCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onReconnect, deleteEdge, deleteSelectedNodes, addNode, copySelectedNodes, pasteNodes, undo, redo, onNodeDragStart, onNodeDragStop } =
    useFlowStore();
  const { screenToFlowPosition, getViewport } = useReactFlow();

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; flowX: number; flowY: number } | null>(null);

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

  /** Right-click on empty canvas → show context menu */
  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
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
      if (ctxMenu) {
        // Snap to grid
        const snappedX = Math.round(ctxMenu.flowX / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(ctxMenu.flowY / GRID_SIZE) * GRID_SIZE;
        addNode(type, { x: snappedX, y: snappedY });
      }
      setCtxMenu(null);
    },
    [ctxMenu, addNode],
  );

  const handleCtxClose = useCallback(() => setCtxMenu(null), []);

  /** Close context menu on pane click */
  const handlePaneClick = useCallback(() => {
    if (ctxMenu) setCtxMenu(null);
  }, [ctxMenu]);

  /** Ctrl+C / Ctrl+V for copy-paste nodes */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in an input/textarea
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
        onConnect={onConnect}
        onReconnect={onReconnect}
        onReconnectEnd={handleReconnectEnd}
        onEdgeClick={handleEdgeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onPaneContextMenu={handlePaneContextMenu}
        onPaneClick={handlePaneClick}
        reconnectRadius={20}
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
        />
      )}
    </div>
  );
}
