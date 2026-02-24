export type PinKind = 'exec' | 'data';
export type DataType = 'number' | 'string' | 'boolean' | 'array' | 'any';

export interface PinDef {
  id: string;
  kind: PinKind;
  label?: string;
  dataType?: DataType;
  /** When true, show an inline text field when this data-in pin is not connected */
  inline?: boolean;
}

export interface BlueprintNodeData {
  label: string;
  headerColor: string;
  icon?: string;
  pinsLeft: PinDef[];
  pinsRight: PinDef[];
  [key: string]: unknown;
}

export interface FunctionParam {
  id: string;
  name: string;
  dataType: DataType;
}

export interface FunctionDef {
  id: string;
  name: string;
  color: string;
  params: FunctionParam[];
  returns: FunctionParam[];
  nodes: import('@xyflow/react').Node[];
  edges: import('@xyflow/react').Edge[];
}
