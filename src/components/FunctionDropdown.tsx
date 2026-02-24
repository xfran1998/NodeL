import { useState, useRef, useEffect, useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import useFlowStore from '../hooks/useFlowStore';

interface FunctionDropdownProps {
  onNavigate?: () => void;
}

export default function FunctionDropdown({ onNavigate }: FunctionDropdownProps) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const functions = useFlowStore((s) => s.functions);
  const viewports = useFlowStore((s) => s.viewports);
  const createFunction = useFlowStore((s) => s.createFunction);
  const deleteFunction = useFlowStore((s) => s.deleteFunction);
  const updateFunction = useFlowStore((s) => s.updateFunction);
  const setScope = useFlowStore((s) => s.setScope);
  const { getViewport, setViewport, fitView } = useReactFlow();

  const navigateToScope = useCallback((scope: string) => {
    const vp = getViewport();
    setScope(scope, vp);
    const saved = useFlowStore.getState().viewports[scope];
    if (saved) {
      setTimeout(() => setViewport(saved, { duration: 200 }), 30);
    } else {
      setTimeout(() => fitView({ padding: 0.3, duration: 200 }), 30);
    }
    onNavigate?.();
  }, [getViewport, setScope, setViewport, fitView, onNavigate]);

  const fnList = Object.values(functions);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setOpen(false);
        setEditingId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Focus input when editing
  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const handleCreate = () => {
    const fnId = createFunction();
    navigateToScope(fnId);
    setOpen(false);
  };

  const handleEnter = (fnId: string) => {
    navigateToScope(fnId);
    setOpen(false);
    setEditingId(null);
  };

  const handleDelete = (fnId: string, fnName: string) => {
    if (confirm(`Eliminar la funcion "${fnName}"? Se eliminaran todos los nodos que la llamen.`)) {
      deleteFunction(fnId);
    }
  };

  return (
    <div className="fn-dropdown" ref={dropdownRef}>
      <button
        className="fn-dropdown__trigger"
        onClick={() => setOpen(!open)}
      >
        f(x) Functions
        <span className={`fn-dropdown__arrow${open ? ' fn-dropdown__arrow--open' : ''}`}>
          &#9662;
        </span>
      </button>

      {open && (
        <div className="fn-dropdown__menu">
          {fnList.length === 0 && (
            <div className="fn-dropdown__empty">No hay funciones</div>
          )}
          {fnList.map((fn) => (
            <div key={fn.id} className="fn-dropdown__item">
              <span
                className="fn-dropdown__color"
                style={{ background: fn.color }}
              />
              {editingId === fn.id ? (
                <input
                  ref={inputRef}
                  className="fn-dropdown__name-input"
                  value={fn.name}
                  onChange={(e) => updateFunction(fn.id, { name: e.target.value })}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setEditingId(null);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
              ) : (
                <span
                  className="fn-dropdown__name"
                  onDoubleClick={() => setEditingId(fn.id)}
                  title="Doble-click para renombrar"
                >
                  {fn.name}
                </span>
              )}
              <button
                className="fn-dropdown__btn fn-dropdown__btn--enter"
                onClick={() => handleEnter(fn.id)}
                title="Entrar en la funcion"
              >
                &#8594;
              </button>
              <button
                className="fn-dropdown__btn fn-dropdown__btn--delete"
                onClick={() => handleDelete(fn.id, fn.name)}
                title="Eliminar funcion"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            className="fn-dropdown__add"
            onClick={handleCreate}
          >
            + Nueva Funcion
          </button>
        </div>
      )}
    </div>
  );
}
