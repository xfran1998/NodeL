import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import useFlowStore from '../hooks/useFlowStore';

export default function ScopeBreadcrumb() {
  const currentScope = useFlowStore((s) => s.currentScope);
  const functions = useFlowStore((s) => s.functions);
  const setScope = useFlowStore((s) => s.setScope);
  const updateFunction = useFlowStore((s) => s.updateFunction);
  const { getViewport, setViewport, fitView } = useReactFlow();

  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const navigateToMain = useCallback(() => {
    const vp = getViewport();
    setScope('main', vp);
    const saved = useFlowStore.getState().viewports['main'];
    if (saved) {
      setTimeout(() => setViewport(saved, { duration: 200 }), 30);
    } else {
      setTimeout(() => fitView({ padding: 0.3, duration: 200 }), 30);
    }
  }, [getViewport, setScope, setViewport, fitView]);

  const fn = currentScope !== 'main' ? functions[currentScope] : null;

  return (
    <div className="scope-breadcrumb">
      <button
        className={`scope-breadcrumb__item${currentScope === 'main' ? ' scope-breadcrumb__item--active' : ''}`}
        onClick={navigateToMain}
      >
        Main
      </button>
      {fn && (
        <>
          <span className="scope-breadcrumb__sep">&rsaquo;</span>
          {editing ? (
            <input
              ref={inputRef}
              className="scope-breadcrumb__input"
              value={fn.name}
              onChange={(e) => updateFunction(currentScope, { name: e.target.value })}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') setEditing(false);
              }}
            />
          ) : (
            <button
              className="scope-breadcrumb__item scope-breadcrumb__item--active"
              style={{ borderColor: fn.color }}
              onDoubleClick={() => setEditing(true)}
              title="Double-click to rename"
            >
              <span
                className="scope-breadcrumb__dot"
                style={{ background: fn.color }}
              />
              {fn.name}
            </button>
          )}
        </>
      )}
    </div>
  );
}
