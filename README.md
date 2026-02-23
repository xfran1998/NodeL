# NodeLL

A visual, node-based programming environment for the browser — inspired by Unreal Engine Blueprints. Build programs by connecting nodes on a canvas and run them instantly in the browser.

## Demo

![NodeLL Canvas](https://github.com/xfran1998/NodeL/raw/main/demo.png)

## Features

- **Visual programming canvas** — drag, connect, and arrange nodes to build logic flows
- **16+ built-in node types** across five categories:
  - **Flow**: Start, End, Input (user prompt), Output (console log)
  - **Variables**: Set, Get
  - **Control flow**: If/Branch, While, For
  - **Math**: Add, Subtract, Multiply, Divide, Modulo
  - **Logic / Comparison**: Greater, Less, Equal, GreaterEq, LessEq, NotEqual, Not, Random, Concat
- **Two connection kinds**:
  - White wires carry **execution flow** (left-to-right control flow)
  - Colored wires carry **data** between node inputs and outputs
- **Live transpiler** — the canvas graph is compiled to JavaScript in real time
- **In-browser execution** — run the generated code directly; supports interactive `input()` prompts
- **Full editor shortcuts**:
  - `Ctrl+C / Ctrl+V` — copy-paste selected nodes
  - `Ctrl+Z / Ctrl+Y` — unlimited undo / redo
  - `Delete` — remove selected nodes and their edges
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
│   ├── nodes/                # All node components + registry
│   └── edges/                # Exec and data edge components
├── hooks/
│   ├── useFlowStore.ts       # Zustand store (nodes, edges, clipboard)
│   └── useTemporalStore.ts   # Undo/redo history
├── lib/
│   ├── transpiler.ts         # Graph → JavaScript compiler
│   └── execution.ts          # Sandboxed in-browser runner
├── flows/
│   ├── initialFlow.ts        # Default example: grade calculator
│   └── demoAllNodes.ts       # Demo showcasing every node type
├── types.ts                  # Shared TypeScript types
└── constants.ts              # Grid size and shared constants
```

## How It Works

1. **Build** a program by placing nodes on the canvas and connecting them with wires.
2. **White exec wires** define the order of execution (Start → … → End).
3. **Colored data wires** pass values between nodes (numbers, strings, booleans).
4. The **transpiler** walks the execution graph starting from the Start node and generates an async JavaScript function.
5. Hit **Run** in the Code panel to execute the generated code in the browser.

## License

MIT
