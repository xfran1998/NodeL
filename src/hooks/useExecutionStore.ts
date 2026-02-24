import { create } from 'zustand';

interface ExecutionState {
  /** Node ID currently executing, or null when idle */
  executingNodeId: string | null;
  /** Whether execution is currently running */
  isRunning: boolean;
  /** Execution speed delay in ms */
  stepDelay: number;
  /** Live variable values during execution */
  variables: Record<string, string>;
  /** Whether the camera should follow the active node during execution */
  followActiveNode: boolean;

  setExecutingNode: (nodeId: string | null) => void;
  setIsRunning: (running: boolean) => void;
  setStepDelay: (delay: number) => void;
  setVariable: (name: string, value: string) => void;
  toggleFollowActiveNode: () => void;
  reset: () => void;
}

function loadStepDelay(): number {
  try {
    const v = localStorage.getItem('canvascoder-stepDelay');
    if (v !== null) return Number(v);
  } catch { /* ignore */ }
  return 0;
}

const useExecutionStore = create<ExecutionState>((set) => ({
  executingNodeId: null,
  isRunning: false,
  stepDelay: loadStepDelay(),
  variables: {},
  followActiveNode: false,

  setExecutingNode: (nodeId) => set({ executingNodeId: nodeId }),
  setIsRunning: (running) => set({ isRunning: running }),
  setStepDelay: (delay) => {
    try { localStorage.setItem('canvascoder-stepDelay', String(delay)); } catch { /* ignore */ }
    set({ stepDelay: delay });
  },
  setVariable: (name, value) =>
    set((s) => ({ variables: { ...s.variables, [name]: value } })),
  toggleFollowActiveNode: () => set((s) => ({ followActiveNode: !s.followActiveNode })),
  reset: () => set({ executingNodeId: null, isRunning: false, variables: {} }),
}));

export default useExecutionStore;
