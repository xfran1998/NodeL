import { useState, useEffect, useRef, useMemo } from 'react';

interface NodeEntry {
  type: string;
  label: string;
  icon: string;
  color: string;
}

interface Category {
  name: string;
  entries: NodeEntry[];
}

const NODE_CATALOG: Category[] = [
  {
    name: 'Flow',
    entries: [
      { type: 'input', label: 'Leer', icon: '\uD83D\uDCE5', color: '#06b6d4' },
      { type: 'output', label: 'Mostrar', icon: '\uD83D\uDCE4', color: '#3b82f6' },
      { type: 'set', label: 'Set', icon: '\u2190', color: '#a855f7' },
      { type: 'if', label: 'If', icon: '\u25C7', color: '#f59e0b' },
      { type: 'while', label: 'Mientras', icon: '\u21BB', color: '#f97316' },
      { type: 'for', label: 'Para', icon: '\u27F3', color: '#14b8a6' },
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
    name: 'Special',
    entries: [
      { type: 'random', label: 'Random', icon: '\uD83C\uDFB2', color: '#f472b6' },
      { type: 'not', label: 'Not', icon: '!', color: '#60a5fa' },
    ],
  },
];

interface ContextMenuProps {
  x: number;
  y: number;
  onSelect: (type: string) => void;
  onClose: () => void;
}

export default function ContextMenu({ x, y, onSelect, onClose }: ContextMenuProps) {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Flat filtered list for keyboard navigation
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const results: { entry: NodeEntry; category: string }[] = [];
    for (const cat of NODE_CATALOG) {
      for (const entry of cat.entries) {
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
  }, [search]);

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
      onSelect(filtered[activeIndex].entry.type);
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
            {group.entries.map((entry) => {
              flatIndex++;
              const idx = flatIndex;
              return (
                <button
                  key={entry.type}
                  className={`ctx-item ${idx === activeIndex ? 'ctx-item--active' : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => onSelect(entry.type)}
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
