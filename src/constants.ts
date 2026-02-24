// Layout constants for pixel-perfect handle alignment
export const HEADER_HEIGHT = 32;
export const PIN_GAP = 24; // gap: header→first pin center, last pin center→bottom
export const PIN_SPACING = 40; // center-to-center distance between consecutive pins (2× GRID_SIZE)
export const FIRST_PIN_TOP = HEADER_HEIGHT + PIN_GAP; // 56px — center of first pin from node top
export const GRID_SIZE = 20;
export const NODE_WIDTH = 220;

// Pin handle dimensions
export const EXEC_HANDLE_SIZE = 14;
export const DATA_HANDLE_SIZE = 12;

// Data type colors
export const TYPE_COLORS: Record<string, string> = {
  number: '#22c55e',
  string: '#ec4899',
  boolean: '#ef4444',
  array: '#06b6d4',
  any: '#a3a3a3',
};

// Default color for user-defined functions
export const DEFAULT_FUNCTION_COLOR = '#8b5cf6';
