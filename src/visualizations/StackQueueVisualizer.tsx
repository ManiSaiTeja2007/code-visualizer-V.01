import React, { memo } from "react";
import ReactFlow from "react-flow-renderer";
import { Node, Edge } from "../types";

interface StackQueueVisualizerProps {
  nodes: Node[];
  edges: Edge[];
}

const StackQueueVisualizer: React.FC<StackQueueVisualizerProps> = memo(
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

export default StackQueueVisualizer;
