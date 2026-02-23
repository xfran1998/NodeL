import { Handle, Position, useEdges } from '@xyflow/react';
import type { PinDef } from '../../types';
import {
  HEADER_HEIGHT,
  PIN_SPACING,
  PIN_GAP,
  TYPE_COLORS,
} from '../../constants';

interface Props {
  nodeId: string;
  label: string;
  headerColor: string;
  icon?: string;
  pinsLeft: PinDef[];
  pinsRight: PinDef[];
  selected?: boolean;
  children?: React.ReactNode;
  /** Current inline values keyed by pin id */
  inlineValues?: Record<string, string>;
  /** Called when an inline field value changes */
  onInlineChange?: (pinId: string, value: string) => void;
  /** Extra CSS class for the node root */
  className?: string;
}

/** Exec handle vertical center — sits on the header bar */
const EXEC_TOP = HEADER_HEIGHT / 2; // 16px

/** First body-pin vertical center — just below the header */
const BODY_FIRST_TOP = HEADER_HEIGHT + PIN_GAP; // 46px

/** Top offset for the i-th body pin */
function bodyPinTop(i: number): number {
  return BODY_FIRST_TOP + i * PIN_SPACING;
}

/**
 * Categorise pins:
 * - "header exec" = exec pins WITHOUT a label → rendered at header height
 * - "body pin" = data pins + exec pins WITH a label → rendered in body rows
 */
function splitPins(pins: PinDef[]) {
  const headerExec: PinDef[] = [];
  const body: PinDef[] = [];
  for (const p of pins) {
    if (p.kind === 'exec' && !p.label) {
      headerExec.push(p);
    } else {
      body.push(p);
    }
  }
  return { headerExec, body };
}

export default function BlueprintNodeShell({
  nodeId,
  label,
  headerColor,
  icon,
  pinsLeft: rawLeft,
  pinsRight: rawRight,
  selected,
  children,
  inlineValues,
  onInlineChange,
  className,
}: Props) {
  const leftSplit = splitPins(rawLeft);
  const rightSplit = splitPins(rawRight);

  const bodyLeft = leftSplit.body;
  const bodyRight = rightSplit.body;
  const maxBodyPins = Math.max(bodyLeft.length, bodyRight.length);

  // Check which left (target) pins are connected
  const edges = useEdges();
  const connectedLeftPins = new Set(
    edges
      .filter((e) => e.target === nodeId)
      .map((e) => e.targetHandle)
      .filter(Boolean),
  );

  // Body height for pin rows (0 if no body pins)
  const bodyHeight =
    maxBodyPins > 0
      ? bodyPinTop(maxBodyPins - 1) - HEADER_HEIGHT + PIN_GAP
      : 0;

  return (
    <div
      className={`blueprint-node${selected ? ' selected' : ''}${className ? ` ${className}` : ''}`}
    >
      {/* ── Header ── */}
      <div
        className="blueprint-node__header"
        style={{ background: headerColor }}
      >
        {icon && <span className="blueprint-node__header-icon">{icon}</span>}
        {label}
      </div>

      {/* ── Body pin rows (data + labeled exec) ── */}
      {maxBodyPins > 0 && (
        <div
          className="blueprint-node__pins"
          style={{ minHeight: bodyHeight }}
        >
          {Array.from({ length: maxBodyPins }).map((_, i) => {
            const leftPin = bodyLeft[i];
            const rightPin = bodyRight[i];

            // Show inline field if data pin has inline=true and is NOT connected
            const showInline =
              leftPin?.kind === 'data' &&
              leftPin.inline &&
              !connectedLeftPins.has(leftPin.id);

            return (
              <div
                key={i}
                className="blueprint-pin-row"
                style={{
                  height: PIN_SPACING,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 16px',
                }}
              >
                {/* Left: inline field or label */}
                {showInline ? (
                  <input
                    type="text"
                    className="pin-inline-field nodrag"
                    value={inlineValues?.[leftPin.id] ?? ''}
                    placeholder={leftPin.label}
                    onChange={(e) =>
                      onInlineChange?.(leftPin.id, e.target.value)
                    }
                    style={{
                      borderColor:
                        TYPE_COLORS[leftPin.dataType || 'any'],
                    }}
                  />
                ) : (
                  <span
                    className={`pin-label${leftPin?.kind === 'exec' ? ' pin-label--exec' : ''}`}
                    style={{
                      visibility: leftPin?.label ? 'visible' : 'hidden',
                    }}
                  >
                    {leftPin?.label || '\u00A0'}
                  </span>
                )}

                {/* Right label */}
                <span
                  className={`pin-label${rightPin?.kind === 'exec' ? ' pin-label--exec' : ''}`}
                  style={{
                    visibility: rightPin?.label ? 'visible' : 'hidden',
                  }}
                >
                  {rightPin?.label || '\u00A0'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Children (form fields) ── */}
      {children && (
        <div className="blueprint-node__children">{children}</div>
      )}

      {/* ── Header-level exec handles (unlabeled exec pins) ── */}
      {leftSplit.headerExec.map((pin) => (
        <Handle
          key={`el-${pin.id}`}
          type="target"
          position={Position.Left}
          id={pin.id}
          className="handle-exec"
          style={{ top: EXEC_TOP, color: '#fff' }}
        />
      ))}
      {rightSplit.headerExec.map((pin) => (
        <Handle
          key={`er-${pin.id}`}
          type="source"
          position={Position.Right}
          id={pin.id}
          className="handle-exec"
          style={{ top: EXEC_TOP, color: '#fff' }}
        />
      ))}

      {/* ── Body-level handles (data + labeled exec) ── */}
      {bodyLeft.map((pin, i) => {
        const top = bodyPinTop(i);
        const isExec = pin.kind === 'exec';
        const color = isExec ? '#fff' : TYPE_COLORS[pin.dataType || 'any'];
        return (
          <Handle
            key={`bl-${pin.id}`}
            type="target"
            position={Position.Left}
            id={pin.id}
            className={isExec ? 'handle-exec' : 'handle-data'}
            style={{ top, color }}
          />
        );
      })}
      {bodyRight.map((pin, i) => {
        const top = bodyPinTop(i);
        const isExec = pin.kind === 'exec';
        const color = isExec ? '#fff' : TYPE_COLORS[pin.dataType || 'any'];
        return (
          <Handle
            key={`br-${pin.id}`}
            type="source"
            position={Position.Right}
            id={pin.id}
            className={isExec ? 'handle-exec' : 'handle-data'}
            style={{ top, color }}
          />
        );
      })}
    </div>
  );
}
