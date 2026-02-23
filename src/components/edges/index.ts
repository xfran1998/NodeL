import type { EdgeTypes } from '@xyflow/react';
import ExecEdge from './ExecEdge';
import DataEdge from './DataEdge';

export const edgeTypes: EdgeTypes = {
  exec: ExecEdge,
  data: DataEdge,
};
