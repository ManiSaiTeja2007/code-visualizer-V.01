import React, { memo } from "react";
import ReactFlow from "react-flow-renderer";
import { Node, Edge } from "../types";

interface LinkedListVisualizerProps {
  nodes: Node[];
  edges: Edge[];
}

const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = memo(
  ({ nodes, edges }) => (
    <div style={{ height: "200px", border: "1px solid #ccc" }}>
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

export default LinkedListVisualizer;
