import type { Node, Edge } from '@xyflow/react';

const STORAGE_KEY = 'canvascoder-flow';

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

/* ── localStorage ─────────────────────────────────────── */

export function saveToLocalStorage(nodes: Node[], edges: Edge[]): void {
  try {
    const data: FlowData = { nodes: stripNodes(nodes), edges: stripEdges(edges) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export function loadFromLocalStorage(): FlowData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as FlowData;
    if (Array.isArray(data.nodes) && Array.isArray(data.edges)) return data;
  } catch {
    // Corrupted data
  }
  return null;
}

/* ── JSON file export / import ────────────────────────── */

export function exportToFile(nodes: Node[], edges: Edge[]): void {
  const data: FlowData = { nodes: stripNodes(nodes), edges: stripEdges(edges) };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'canvascoder-flow.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromFile(): Promise<FlowData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as FlowData;
          if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
            throw new Error('Invalid flow file');
          }
          resolve(data);
        } catch (e) {
          reject(e);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

/* ── URL hash sharing ─────────────────────────────────── */

export function encodeFlowToHash(nodes: Node[], edges: Edge[]): string {
  const data: FlowData = { nodes: stripNodes(nodes), edges: stripEdges(edges) };
  const json = JSON.stringify(data);
  // btoa-safe unicode encoding
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeFlowFromHash(hash: string): FlowData | null {
  try {
    const json = decodeURIComponent(escape(atob(hash)));
    const data = JSON.parse(json) as FlowData;
    if (Array.isArray(data.nodes) && Array.isArray(data.edges)) return data;
  } catch {
    // Invalid or corrupted hash
  }
  return null;
}

/* ── Helpers ──────────────────────────────────────────── */

/** Strip transient ReactFlow properties before persisting */
function stripNodes(nodes: Node[]): Node[] {
  return nodes.map(({ selected: _, dragging: _d, measured: _m, ...rest }) => rest);
}

function stripEdges(edges: Edge[]): Edge[] {
  return edges.map(({ selected: _, ...rest }) => rest);
}
