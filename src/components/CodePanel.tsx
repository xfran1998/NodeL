import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import useFlowStore from '../hooks/useFlowStore';
import useExecutionStore from '../hooks/useExecutionStore';
import { transpile } from '../lib/transpiler';
import { executeCode, stopExecution, stepForward } from '../lib/execution';
import VariableInspector from './VariableInspector';

interface ConsoleEntry {
  type: 'log' | 'error' | 'prompt' | 'input';
  text: string;
}

function highlightCode(code: string): string {
  // Escape HTML first
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  html = html.replace(/(\/\/.*)/g, '<span class="hl-comment">$1</span>');
  // Strings (double-quoted)
  html = html.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="hl-string">$1</span>');
  // Keywords
  html = html.replace(
    /\b(let|const|var|if|else|while|for|function|return|await|async|new|typeof|instanceof)\b/g,
    '<span class="hl-keyword">$1</span>',
  );
  // Numbers (standalone or after operators, not inside already-tagged spans)
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="hl-number">$1</span>');

  return html;
}

/** Get the full state for transpilation (main nodes/edges + all functions synced) */
function getTranspileState() {
  const state = useFlowStore.getState();
  const functions = { ...state.functions };

  // If currently viewing a function, sync its nodes/edges
  if (state.currentScope !== 'main' && functions[state.currentScope]) {
    functions[state.currentScope] = {
      ...functions[state.currentScope],
      nodes: state.nodes,
      edges: state.edges,
    };
  }

  const mainNodes = state.currentScope === 'main' ? state.nodes : state.mainNodes;
  const mainEdges = state.currentScope === 'main' ? state.edges : state.mainEdges;

  return { mainNodes, mainEdges, functions };
}

export default function CodePanel() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const functions = useFlowStore((s) => s.functions);
  const currentScope = useFlowStore((s) => s.currentScope);
  const mainNodes = useFlowStore((s) => s.mainNodes);
  const mainEdges = useFlowStore((s) => s.mainEdges);
  const [isOpen, setIsOpen] = useState(true);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [promptState, setPromptState] = useState<{
    message: string;
    resolve: (value: string) => void;
  } | null>(null);
  const [promptInput, setPromptInput] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);
  const promptRef = useRef<HTMLInputElement>(null);

  // Compute full state for transpilation
  const { code, errors } = useMemo(() => {
    const ts = getTranspileState();
    return transpile(ts.mainNodes, ts.mainEdges, undefined, ts.functions);
  }, [nodes, edges, functions, currentScope, mainNodes, mainEdges]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleEntries]);

  // Auto-focus prompt input
  useEffect(() => {
    if (promptState && promptRef.current) {
      promptRef.current.focus();
    }
  }, [promptState]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;
    setConsoleEntries([]);
    setIsRunning(true);

    const execStore = useExecutionStore.getState();
    execStore.reset();
    execStore.setIsRunning(true);

    const stepDelay = useExecutionStore.getState().stepDelay;
    // Only instrument when not in instant mode — instant skips all animation
    const ts = getTranspileState();
    const { code: instrumentedCode } = transpile(ts.mainNodes, ts.mainEdges, { instrument: stepDelay !== 0 }, ts.functions);

    await executeCode(instrumentedCode, {
      onLog: (text) => setConsoleEntries((prev) => [...prev, { type: 'log', text }]),
      onPrompt: (message) => {
        return new Promise<string>((resolve) => {
          setConsoleEntries((prev) => [...prev, { type: 'prompt', text: message }]);
          setPromptInput('');
          setPromptState({ message, resolve });
        });
      },
      onError: (text) => setConsoleEntries((prev) => [...prev, { type: 'error', text }]),
      onComplete: () => {
        setIsRunning(false);
        setPromptState(null);
        useExecutionStore.getState().setExecutingNode(null);
        useExecutionStore.getState().setIsRunning(false);
      },
      onNodeEnter: (nodeId) => {
        useExecutionStore.getState().setExecutingNode(nodeId);
      },
      onVarUpdate: (name, value) => {
        useExecutionStore.getState().setVariable(name, value);
      },
    }, { stepDelay });
  }, [code, isRunning, nodes, edges]);

  const handleStop = useCallback(() => {
    stopExecution();
    setIsRunning(false);
    setPromptState(null);
    setConsoleEntries((prev) => [...prev, { type: 'error', text: 'Execution stopped.' }]);
    useExecutionStore.getState().reset();
  }, []);

  const handleStep = useCallback(() => {
    stepForward();
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
  }, [code]);

  const handleClear = useCallback(() => {
    setConsoleEntries([]);
  }, []);

  const handlePromptSubmit = useCallback(() => {
    if (!promptState) return;
    setConsoleEntries((prev) => [...prev, { type: 'input', text: promptInput }]);
    promptState.resolve(promptInput);
    setPromptState(null);
    setPromptInput('');
  }, [promptState, promptInput]);

  const stepDelay = useExecutionStore((s) => s.stepDelay);
  const followActiveNode = useExecutionStore((s) => s.followActiveNode);
  const isStepMode = stepDelay < 0;

  const panelClass = `code-panel${isOpen ? '' : ' code-panel--collapsed'}`;

  return (
    <div className={panelClass}>
      <div className="code-panel__header">
        <span className="code-panel__title">Code</span>
        <button
          className="code-panel__toggle"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Collapse' : 'Expand'}
        >
          {isOpen ? '▶' : '◀'}
        </button>
      </div>
      <div className="code-panel__body">
        <div
          className="code-panel__code"
          dangerouslySetInnerHTML={{
            __html: code
              ? highlightCode(code)
              : '<span class="hl-comment">// No executable code</span>',
          }}
        />
        {errors.length > 0 && (
          <div style={{ padding: '4px 10px', color: '#f87171', fontSize: 11 }}>
            {errors.map((err, i) => (
              <div key={i}>{err}</div>
            ))}
          </div>
        )}
        <div className="code-panel__actions">
          {!isRunning ? (
            <button className="code-panel__btn code-panel__btn--run" onClick={handleRun} disabled={!code}>
              Run
            </button>
          ) : (
            <>
              <button className="code-panel__btn code-panel__btn--stop" onClick={handleStop}>
                Stop
              </button>
              {isStepMode && (
                <button className="code-panel__btn code-panel__btn--step" onClick={handleStep}>
                  Next
                </button>
              )}
            </>
          )}
          <select
            className="code-panel__btn"
            value={stepDelay}
            onChange={(e) => useExecutionStore.getState().setStepDelay(Number(e.target.value))}
          >
            <option value={0}>Instant</option>
            <option value={100}>Fast</option>
            <option value={500}>Normal</option>
            <option value={1000}>Slow</option>
            <option value={-1}>Step</option>
          </select>
          {stepDelay !== 0 && (
            <button
              className={`code-panel__btn code-panel__btn--follow${followActiveNode ? ' active' : ''}`}
              onClick={() => useExecutionStore.getState().toggleFollowActiveNode()}
              title={followActiveNode ? 'Stop following active node' : 'Follow active node'}
            >
              {followActiveNode ? '⊚' : '◎'}
            </button>
          )}
          <button className="code-panel__btn" onClick={handleCopy}>
            Copy
          </button>
          <button className="code-panel__btn" onClick={handleClear}>
            Clear
          </button>
        </div>
        <div className="code-panel__console" ref={consoleRef}>
          {consoleEntries.map((entry, i) => (
            <div key={i} className={`console-${entry.type}`}>
              {entry.type === 'prompt' ? `> ${entry.text}` : entry.text}
            </div>
          ))}
        </div>
        <VariableInspector />
        {promptState && (
          <div className="code-prompt">
            <span className="code-prompt-label">Input:</span>
            <input
              ref={promptRef}
              className="code-prompt-input"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePromptSubmit();
              }}
              placeholder="Type and press Enter..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
