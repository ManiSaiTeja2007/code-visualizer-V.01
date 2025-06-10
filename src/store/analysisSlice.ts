import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AnalysisState } from '../types';

export interface Step {
  iteration: number;
  variables: { name: string; value: string }[];
  activeNode?: string; // ID of active node (e.g., array index, tree node)
  activeEdge?: string; // ID of active edge (e.g., control flow)
}

interface ExtendedAnalysisState extends AnalysisState {
  steps: Step[];
}

const initialState: ExtendedAnalysisState = {
  structures: [],
  variableTable: [],
  nodes: [],
  edges: [],
  steps: [],
};

const analysisSlice = createSlice({
  name: 'analysis',
  initialState,
  reducers: {
    setAnalysis(state, action: PayloadAction<ExtendedAnalysisState>) {
      state.structures = action.payload.structures;
      state.variableTable = action.payload.variableTable;
      state.nodes = action.payload.nodes;
      state.edges = action.payload.edges;
      state.steps = action.payload.steps;
    },
  },
});

export const { setAnalysis } = analysisSlice.actions;
export default analysisSlice.reducer;