import React, { useState, useEffect, memo, lazy, Suspense } from "react";
import { AnalysisState, Step } from "../types";

const ArrayVisualizer = lazy(() => import("../visualizations/ArrayVisualizer"));
const LinkedListVisualizer = lazy(
  () => import("../visualizations/LinkedListVisualizer")
);
const StackQueueVisualizer = lazy(
  () => import("../visualizations/StackQueueVisualizer")
);
const TreeVisualizer = lazy(() => import("../visualizations/TreeVisualizer"));

interface VisualizerProps {
  nodes: AnalysisState["nodes"];
  edges: AnalysisState["edges"];
  structures: string[];
  steps: Step[];
}

const Visualizer: React.FC<VisualizerProps> = memo(
  ({ nodes, edges, structures, steps }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(1000);

    useEffect(() => {
      let interval: NodeJS.Timeout;
      if (isPlaying && currentStep < steps.length - 1) {
        interval = setInterval(() => {
          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }, speed);
      }
      return () => clearInterval(interval);
    }, [isPlaying, currentStep, steps.length, speed]);

    const getVisualizer = () => {
      const step = steps[currentStep] || {
        variables: [],
        activeNode: "",
        activeEdge: "",
        output: "",
      };
      const enhancedNodes = nodes.map((node) => ({
        ...node,
        style: node.id === step.activeNode ? { border: "2px solid red" } : {},
        data: {
          ...node.data,
          label: `${node.data.label} (${
            step.variables.find((v) => node.id.includes(v.name))?.value ||
            node.data.label
          })`,
        },
      }));
      const enhancedEdges = edges.map((edge) => ({
        ...edge,
        style:
          edge.id === step.activeEdge ? { stroke: "red", strokeWidth: 2 } : {},
      }));

      if (
        structures.includes("Array") ||
        structures.includes("Array/List") ||
        structures.includes("List")
      ) {
        return <ArrayVisualizer nodes={enhancedNodes} edges={enhancedEdges} />;
      }
      if (structures.some((s) => s.includes("Linked List"))) {
        return (
          <LinkedListVisualizer nodes={enhancedNodes} edges={enhancedEdges} />
        );
      }
      if (
        structures.includes("Stack") ||
        structures.includes("Queue") ||
        structures.includes("Circular Queue")
      ) {
        return (
          <StackQueueVisualizer nodes={enhancedNodes} edges={enhancedEdges} />
        );
      }
      if (
        structures.includes("Tree/Graph") ||
        structures.includes("Binary Tree") ||
        structures.includes("Heap") ||
        structures.some((s) => s.includes("Recursive Call"))
      ) {
        return <TreeVisualizer nodes={enhancedNodes} edges={enhancedEdges} />;
      }
      return null;
    };

    return (
      <Suspense fallback={<div>Loading Visualization...</div>}>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">
            Data Structure Visualization
          </h2>
          <div className="flex items-center space-x-4 mb-4">
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={() => setCurrentStep((prev) => Math.max(prev - 0, 1))}
              disabled={currentStep === 0}
            >
              Previous
            </button>
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded bg-blue-600 hover:"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={() =>
                setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
              }
              disabled={currentStep === steps.length - 1}
            >
              Next
            </button>
            <select
              className="p-1 border rounded"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value="500">Fast</option>
              <option value="1000">Normal</option>
              <option value="2000">Slow</option>
            </select>
            <span>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          {getVisualizer()}
          {steps[currentStep]?.variables.length > 0 && (
            <div className="mt-2">
              <h3 className="text-lg">Variables:</h3>
              <ul className="list-disc pl-5">
                {steps[currentStep].variables.map((v, idx) => (
                  <li key={idx}>
                    {v.name}: {v.value}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {steps[currentStep]?.output && (
            <div className="mt-2">
              <h3 className="text-lg">Output:</h3>
              <p className="p-2 bg-gray-100 rounded">
                {steps[currentStep].output}
              </p>
            </div>
          )}
        </div>
      </Suspense>
    );
  }
);

export default Visualizer;
