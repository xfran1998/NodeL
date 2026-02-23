import { create } from 'zustand';
import type { Node, Edge } from '@xyflow/react';

export interface Snapshot {
  nodes: Node[];
  edges: Edge[];
}

const MAX_HISTORY = 50;

interface TemporalState {
  past: Snapshot[];
  future: Snapshot[];
  pushSnapshot: (snapshot: Snapshot) => void;
  undo: (current: Snapshot) => Snapshot | null;
  redo: (current: Snapshot) => Snapshot | null;
  clear: () => void;
}

const useTemporalStore = create<TemporalState>((set, get) => ({
  past: [],
  future: [],

  pushSnapshot: (snapshot) => {
    set((s) => ({
      past: [...s.past.slice(-(MAX_HISTORY - 1)), snapshot],
      future: [],
    }));
  },

  undo: (current) => {
    const { past } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    set({ past: past.slice(0, -1), future: [current, ...get().future] });
    return previous;
  },

  redo: (current) => {
    const { future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    set({ past: [...get().past, current], future: future.slice(1) });
    return next;
  },

  clear: () => set({ past: [], future: [] }),
}));

export default useTemporalStore;
