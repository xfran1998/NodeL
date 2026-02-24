import { useState, useEffect, useRef, useMemo } from 'react';
import type { FunctionDef } from '../types';

interface NodeEntry {
  type: string;
  label: string;
  icon: string;
  color: string;
  /** Extra data to pass when creating this node (e.g. functionId for callFunction) */
  extraData?: Record<string, unknown>;
}

interface Category {
  name: string;
  entries: NodeEntry[];
}

const NODE_CATALOG: Category[] = [
  {
    name: 'Flow',
    entries: [
      { type: 'input', label: 'Read', icon: '\uD83D\uDCE5', color: '#06b6d4' },
      { type: 'output', label: 'Print', icon: '\uD83D\uDCE4', color: '#3b82f6' },
      { type: 'set', label: 'Set', icon: '\u2190', color: '#a855f7' },
      { type: 'if', label: 'If', icon: '\u25C7', color: '#f59e0b' },
      { type: 'while', label: 'While', icon: '\u21BB', color: '#f97316' },
      { type: 'for', label: 'For', icon: '\u27F3', color: '#14b8a6' },
    ],
  },
  {
    name: 'Variable',
    entries: [
      { type: 'get', label: 'Get', icon: '\u2192', color: '#c084fc' },
    ],
  },
  {
    name: 'Math',
    entries: [
      { type: 'add', label: 'Add', icon: '+', color: '#4ade80' },
      { type: 'subtract', label: 'Subtract', icon: '\u2212', color: '#4ade80' },
      { type: 'multiply', label: 'Multiply', icon: '\u00D7', color: '#4ade80' },
      { type: 'divide', label: 'Divide', icon: '\u00F7', color: '#4ade80' },
      { type: 'modulo', label: 'Modulo', icon: '%', color: '#4ade80' },
    ],
  },
  {
    name: 'Compare',
    entries: [
      { type: 'greater', label: 'Greater', icon: '>', color: '#60a5fa' },
      { type: 'less', label: 'Less', icon: '<', color: '#60a5fa' },
      { type: 'equal', label: 'Equal', icon: '==', color: '#60a5fa' },
      { type: 'greaterEq', label: 'Greater Eq', icon: '>=', color: '#60a5fa' },
      { type: 'lessEq', label: 'Less Eq', icon: '<=', color: '#60a5fa' },
      { type: 'notEqual', label: 'Not Equal', icon: '!=', color: '#60a5fa' },
    ],
  },
  {
    name: 'String',
    entries: [
      { type: 'concat', label: 'Append', icon: '🔗', color: '#f472b6' },
    ],
  },
  {
    name: 'Array',
    entries: [
      { type: 'arrayCreate', label: 'Array', icon: '[ ]', color: '#06b6d4' },
      { type: 'arrayPush', label: 'Push', icon: '⊕', color: '#06b6d4' },
      { type: 'arrayPop', label: 'Pop', icon: '⊖', color: '#06b6d4' },
      { type: 'arrayLength', label: 'Length', icon: '#', color: '#06b6d4' },
      { type: 'arrayGet', label: 'Get[i]', icon: '[i]', color: '#06b6d4' },
      { type: 'arraySet', label: 'Set[i]', icon: '[=]', color: '#06b6d4' },
    ],
  },
  {
    name: 'Special',
    entries: [
      { type: 'random', label: 'Random', icon: '\uD83C\uDFB2', color: '#f472b6' },
      { type: 'not', label: 'Not', icon: '!', color: '#60a5fa' },
      { type: 'break', label: 'Break', icon: '⊘', color: '#ef4444' },
      { type: 'continue', label: 'Continue', icon: '↷', color: '#f59e0b' },
    ],
  },
  {
    name: 'Layout',
    entries: [
      { type: 'comment', label: 'Comment', icon: '💬', color: '#6b7280' },
    ],
  },
];

interface ContextMenuProps {
  x: number;
  y: number;
  onSelect: (type: string, extraData?: Record<string, unknown>) => void;
  onClose: () => void;
  /** When provided, only show node types for which this returns true */
  filter?: (type: string, fnDef?: FunctionDef) => boolean;
  /** User-defined functions to show in the Functions category */
  functions?: Record<string, FunctionDef>;
  /** Current scope - when inside a function, show Return node */
  currentScope?: string;
}

export default function ContextMenu({ x, y, onSelect, onClose, filter, functions, currentScope }: ContextMenuProps) {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Build full catalog with dynamic entries
  const fullCatalog = useMemo(() => {
    const catalog = [...NODE_CATALOG];

    // If inside a function scope, add "Return" to the Flow category
    if (currentScope && currentScope !== 'main' && functions?.[currentScope]) {
      const fn = functions[currentScope];
      // Insert Return into a new category at the top
      catalog.splice(1, 0, {
        name: 'Return',
        entries: [
          {
            type: 'functionReturn',
            label: 'Return',
            icon: '↩',
            color: fn.color,
            extraData: { functionId: currentScope },
          },
        ],
      });
    }

    // Add Functions category at the end (if there are functions)
    if (functions && Object.keys(functions).length > 0) {
      const fnEntries: NodeEntry[] = Object.values(functions).map((fn) => ({
        type: 'callFunction',
        label: fn.name,
        icon: 'f(x)',
        color: fn.color,
        extraData: { functionId: fn.id },
      }));
      catalog.push({
        name: 'Functions',
        entries: fnEntries,
      });
    }

    return catalog;
  }, [functions, currentScope]);

  // Flat filtered list for keyboard navigation
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const results: { entry: NodeEntry; category: string }[] = [];
    for (const cat of fullCatalog) {
      for (const entry of cat.entries) {
        // Apply external compatibility filter
        if (filter) {
          const fnDef = entry.type === 'callFunction' && entry.extraData?.functionId
            ? functions?.[(entry.extraData.functionId as string)]
            : undefined;
          if (!filter(entry.type, fnDef)) continue;
        }
        if (
          !q ||
          entry.label.toLowerCase().includes(q) ||
          entry.type.toLowerCase().includes(q) ||
          cat.name.toLowerCase().includes(q)
        ) {
          results.push({ entry, category: cat.name });
        }
      }
    }
    return results;
  }, [search, filter, fullCatalog, functions]);

  // Group filtered results by category for rendering
  const groupedFiltered = useMemo(() => {
    const groups: { name: string; entries: NodeEntry[] }[] = [];
    let currentCat = '';
    for (const item of filtered) {
      if (item.category !== currentCat) {
        currentCat = item.category;
        groups.push({ name: currentCat, entries: [] });
      }
      groups[groups.length - 1].entries.push(item.entry);
    }
    return groups;
  }, [filtered]);

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Auto-focus search input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as HTMLElement)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  // Keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered.length > 0) {
      e.preventDefault();
      const entry = filtered[activeIndex].entry;
      onSelect(entry.type, entry.extraData);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = menuRef.current?.querySelector('.ctx-item--active');
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Clamp menu position to viewport
  const menuWidth = 240;
  const menuMaxHeight = 380;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - menuMaxHeight - 8);

  let flatIndex = -1;

  return (
    <div
      ref={menuRef}
      className="ctx-menu"
      style={{ left, top }}
      onKeyDown={handleKeyDown}
    >
      <div className="ctx-search-wrap">
        <input
          ref={inputRef}
          className="ctx-search"
          type="text"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="ctx-list">
        {groupedFiltered.length === 0 && (
          <div className="ctx-empty">No matches</div>
        )}
        {groupedFiltered.map((group) => (
          <div key={group.name}>
            <div className="ctx-category">{group.name}</div>
            {group.entries.map((entry, entryIdx) => {
              flatIndex++;
              const idx = flatIndex;
              // Use a unique key for function entries (since multiple can have type=callFunction)
              const key = entry.extraData?.functionId
                ? `${entry.type}-${entry.extraData.functionId}`
                : `${entry.type}-${entryIdx}`;
              return (
                <button
                  key={key}
                  className={`ctx-item ${idx === activeIndex ? 'ctx-item--active' : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => onSelect(entry.type, entry.extraData)}
                >
                  <span className="ctx-item-icon" style={{ color: entry.color }}>
                    {entry.icon}
                  </span>
                  <span className="ctx-item-label">{entry.label}</span>
                  <span className="ctx-item-type">{entry.type}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
