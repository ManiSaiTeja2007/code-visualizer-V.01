import React, { useState, Suspense, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { setAnalysis } from "../store/analysisSlice";
import { parseJavaScript, parseCpp, parseJava } from "../parsers";

const Visualizer = lazy(() => import("./Visualizer"));
const VariableTable = lazy(() => import("./VariableTable"));

const CodeAnalyzer: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const dispatch = useDispatch<AppDispatch>();
  const { structures, variableTable, nodes, edges, steps } = useSelector(
    (state: RootState) => state.analysis
  );

  const analyzeCode = async () => {
    const worker = new Worker(new URL("../worker.ts", import.meta.url));
    worker.postMessage({ code, language });
    worker.onmessage = (e: MessageEvent) => {
      dispatch(setAnalysis(e.data));
      worker.terminate();
    };
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Advanced Code Visualizer</h1>
      <select
        className="mb-4 p-2 border rounded"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="java">Java</option>
        <option value="cpp">C/C++</option>
      </select>
      <textarea
        className="w-full h-40 p-2 border rounded mb-4"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={`Enter your ${language} code here...`}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={analyzeCode}
      >
        Analyze Code
      </button>

      {structures.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Detected Data Structures:</h2>
          <ul className="list-disc pl-5">
            {structures.map((structure: string, index: number) => (
              <li key={index}>{structure}</li>
            ))}
          </ul>
        </div>
      )}

      {nodes.length > 0 && (
        <Suspense fallback={<div>Loading Visualization...</div>}>
          <Visualizer
            nodes={nodes}
            edges={edges}
            structures={structures}
            steps={steps}
          />
        </Suspense>
      )}

      {variableTable.length > 0 && (
        <Suspense fallback={<div>Loading Table...</div>}>
          <VariableTable variableTable={variableTable} />
        </Suspense>
      )}
    </div>
  );
};

export default CodeAnalyzer;
