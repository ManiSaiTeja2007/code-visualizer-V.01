import React, { memo } from "react";
import ReactFlow from "react-flow-renderer";
import { AnalysisState } from "../types";

interface ArrayVisualizerProps {
  nodes: AnalysisState["nodes"];
  edges: AnalysisState["edges"];
}

const ArrayVisualizer: React.FC<ArrayVisualizerProps> = memo(
  ({ nodes, edges }) => (
    <div style={{ height: "200px", border: "1px solid #ccc" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        style={{ width: "100%", height: "100%" }}
        nodesDraggable={false}
        nodesConnectable={false}
      />
    </div>
  )
);

export default ArrayVisualizer;
