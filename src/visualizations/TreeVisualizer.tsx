import React, { memo } from "react";
import ReactFlow from "react-flow-renderer";
import { Node, Edge } from "../types";

interface TreeVisualizerProps {
  nodes: Node[];
  edges: Edge[];
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = memo(
  ({ nodes, edges }) => (
    <div style={{ height: "300px", border: "1px solid #ccc" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        style={{ width: "100%", height: "100%" }}
        nodesDraggable={true}
        nodesConnectable={false}
      />
    </div>
  )
);

export default TreeVisualizer;
