export interface Node {
  id: string;
  type: string;
  data: { label: string };
  position: { x: number; y: number };
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated?: boolean;
}

export interface VariableEntry {
  variable: string;
  iteration: number;
  value: string;
}

export interface Step {
  iteration: number;
  variables: { name: string; value: string }[];
  activeNode?: string;
  activeEdge?: string;
  output?: string;
  recursionDepth?: number;
}

export interface AnalysisState {
  structures: string[];
  variableTable: VariableEntry[];
  nodes: Node[];
  edges: Edge[];
  steps: Step[];
}