import { type NodeProps, type Node, NodeResizer } from '@xyflow/react';
import useFlowStore from '../../hooks/useFlowStore';

interface CommentData {
  label?: string;
  [key: string]: unknown;
}

export default function CommentNode({ id, data, selected }: NodeProps<Node<CommentData>>) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const label = (data.label as string) || '';

  return (
    <>
      <NodeResizer
        minWidth={160}
        minHeight={100}
        isVisible={!!selected}
        lineClassName="comment-resizer-line"
        handleClassName="comment-resizer-handle"
      />
      <div className={`comment-node${selected ? ' comment-node--selected' : ''}`}>
        <input
          className="comment-node__title nodrag"
          type="text"
          value={label}
          placeholder="Comment..."
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
        />
      </div>
    </>
  );
}
