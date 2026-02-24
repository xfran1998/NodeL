# NodeL

A visual, node-based programming environment for the browser — inspired by Unreal Engine Blueprints. Build programs by connecting nodes on a canvas and run them instantly in the browser.

## Demo

![NodeLL Canvas](https://github.com/xfran1998/NodeL/raw/main/demo.png)

## Features

- **Visual programming canvas** — drag, connect, and arrange nodes to build logic flows
- **34+ built-in node types** across nine categories:
  - **Flow**: Start, Input (user prompt), Output (console log)
  - **Variables**: Set, Get
  - **Control flow**: If/Branch, While, For, Break, Continue
  - **Math**: Add, Subtract, Multiply, Divide, Modulo
  - **Logic / Comparison**: Greater, Less, Equal, GreaterEq, LessEq, NotEqual, Not, Random, Concat
  - **Arrays**: Create, Push, Pop, Length, Get, Set
  - **Functions**: Function Entry, Function Return, Call Function
  - **Layout**: Comment
- **Two connection kinds**:
  - White wires carry **execution flow** (left-to-right control flow)
  - Colored wires carry **data** between node inputs and outputs
- **Live transpiler** — the canvas graph is compiled to JavaScript in real time
- **In-browser execution** — run the generated code directly; supports interactive `input()` prompts
- **User-defined functions** — create reusable functions with parameters and return values, navigate between scopes with a breadcrumb bar
- **Variable inspector** — live view of variable values during execution
- **Execution modes** — Instant, Fast, Normal, Slow, and Step-by-step with optional node-follow camera
- **Persistence** — auto-save to localStorage, JSON file export/import, and URL hash sharing
- **Full editor shortcuts**:
  - `Ctrl+C / Ctrl+V` — copy-paste selected nodes
  - `Ctrl+Z / Ctrl+Y` — unlimited undo / redo
  - `Delete` — remove selected nodes and their edges
  - `C` — wrap selected nodes in a comment
  - `Alt+Click` on a wire — disconnect it
  - Right-click on the canvas — context menu to add any node type
- **Preset flows** — load example programs from the toolbar

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 19 |
| Flow canvas | [@xyflow/react](https://reactflow.dev) 12 |
| State management | [Zustand](https://zustand-demo.pmnd.rs) 5 |
| Language | TypeScript 5 |
| Build tool | Vite 6 |

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/



├── components/
│   ├── BlueprintCanvas.tsx   # Main canvas with ReactFlow
│   ├── CodePanel.tsx         # Code viewer, executor & console
│   ├── ContextMenu.tsx       # Right-click node picker
│   ├── FunctionDropdown.tsx  # Function creation & management UI
│   ├── ScopeBreadcrumb.tsx   # Scope navigation (main → function)
│   ├── VariableInspector.tsx # Live variable viewer during execution
│   ├── nodes/                # All node components + registry
│   └── edges/                # Exec and data edge components
├── hooks/
│   ├── useFlowStore.ts       # Zustand store (nodes, edges, clipboard, functions)
│   ├── useExecutionStore.ts  # Execution state (running, step delay, variables)
│   └── useTemporalStore.ts   # Undo/redo history
├── lib/
│   ├── transpiler.ts         # Graph → JavaScript compiler
│   ├── execution.ts          # Sandboxed in-browser runner
│   ├── persistence.ts        # Save/load (localStorage, file, URL hash)
│   └── pinRegistry.ts        # Pin layout measurement for edge routing
├── flows/
│   ├── initialFlow.ts        # Default example: grade calculator
│   └── demoAllNodes.ts       # Demo showcasing every node type
├── types.ts                  # Shared TypeScript types (pins, nodes, functions)
└── constants.ts              # Grid size, pin dimensions, type colors
```

## How It Works

1. **Build** a program by right-clicking the canvas to add nodes, then connect them with wires.
2. **White exec wires** define the order of execution (Start → …).
3. **Colored data wires** pass values between nodes (numbers, strings, booleans, arrays). Unconnected data pins show an **inline input** where you can type literal values directly.
4. **Create functions** to organize reusable logic — each function has its own sub-graph with a Function Entry and Function Return node, and can be called from the main graph or other functions.
5. The **transpiler** walks the execution graph starting from the Start node (or Function Entry for functions) and generates async JavaScript in real time.
6. Hit **Run** in the Code panel to execute the generated code in the browser — supports interactive `input()` prompts.
7. Use the **execution speed selector** (Instant / Fast / Normal / Slow / Step) to watch node-by-node execution with the variable inspector.

## License

MIT
