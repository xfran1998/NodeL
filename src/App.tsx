import { ReactFlowProvider } from '@xyflow/react';
import BlueprintCanvas from './components/BlueprintCanvas';
import CodePanel from './components/CodePanel';

export default function App() {
  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <BlueprintCanvas />
        </div>
        <CodePanel />
      </div>
    </ReactFlowProvider>
  );
}
