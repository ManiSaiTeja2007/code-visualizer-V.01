import { AnalysisState, Node, Edge, Step } from '../../types';

export const parseCpp = (code: string): AnalysisState => {
  const structures: string[] = [];
  const variableTable: AnalysisState['variableTable'] = [];
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const steps: Step[] = [];
  let iteration = 0;
  let recursionDepth = 0;
  const variableState: Record<string, string> = {};

  const lines = code.split('\n');
  const functionRegex = /(?:int|void)\s+(\w+)\s*\(([^)]*)\)\s*\{/;
  const functionNames: string[] = [];

  // First pass: collect function names
  lines.forEach((line: string) => {
    const funcMatch = line.match(functionRegex);
    if (funcMatch) {
      functionNames.push(funcMatch[1]);
    }
  });

  // Second pass: analyze code
  lines.forEach((line: string, lineIndex: number) => {
    // Update variable state
    const varDeclMatch = line.match(/(int|float|double)\s+(\w+)\s*=\s*([^;]+)/);
    if (varDeclMatch) {
      variableState[varDeclMatch[2]] = varDeclMatch[3].trim();
    }
    const assignMatch = line.match(/(\w+)\s*=\s*([^;]+)/);
    if (assignMatch) {
      variableState[assignMatch[1]] = assignMatch[2].trim();
    }

    // Detect arrays
    if (line.match(/int\s+\w+\[\d*\]/)) {
      structures.push('Array');
      const arrayMatch = line.match(/\{.*?\}/);
      if (arrayMatch) {
        const elements = arrayMatch[0].slice(1, -1).split(',').map(item => item.trim());
        nodes.push(...elements.map((el: string, idx: number) => ({
          id: `array-${idx}-${lineIndex}`,
          type: 'default',
          data: { label: el || 'empty' },
          position: { x: idx * 100, y: 50 },
        })));
      }
    }

    // Detect node-based structures
    if (line.match(/struct\s+Node/)) {
      const listType = line.includes('prev') ? 'Doubly Linked List' :
                       line.includes('left') || line.includes('right') ? 'Binary Tree' : 'Singly Linked List';
      structures.push(listType);
      if (listType === 'Binary Tree') {
        nodes.push(
          { id: `node-root-${lineIndex}`, type: 'default', data: { label: 'Root' }, position: { x: 200, y: 50 } },
          { id: `node-left-${lineIndex}`, type: 'default', data: { label: 'Left' }, position: { x: 100, y: 150 } },
          { id: `node-right-${lineIndex}`, type: 'default', data: { label: 'Right' }, position: { x: 300, y: 150 } },
        );
        edges.push(
          { id: `edge-root-left-${lineIndex}`, source: `node-root-${lineIndex}`, target: `node-left-${lineIndex}`, type: 'smoothstep', animated: true },
          { id: `edge-root-right-${lineIndex}`, source: `node-root-${lineIndex}`, target: `node-right-${lineIndex}`, type: 'smoothstep', animated: true },
        );
      }
    }

    // Detect loops
    if (line.match(/for\s*\(.*;.*;.*\)/) || line.match(/while\s*\(.*\)/)) {
      iteration++;
      const varMatch = line.match(/(int|float|double)\s+(\w+)\s*=/);
      const step: Step = { iteration, variables: [], activeNode: nodes.length > 0 ? nodes[nodes.length - 1].id : undefined, output: '' };
      if (varMatch) {
        const value = 'Initialized';
        variableTable.push({ variable: varMatch[2], iteration, value });
        step.variables.push({ name: varMatch[2], value });
        variableState[varMatch[2]] = value;
      }
      steps.push(step);
    }

    // Detect assignments
    if (assignMatch && !varDeclMatch) {
      const value = assignMatch[2].trim();
      variableTable.push({ variable: assignMatch[1], iteration, value });
      steps.push({
        iteration: iteration + 1,
        variables: [{ name: assignMatch[1], value }],
        activeNode: nodes.find(n => n.id.includes(assignMatch[1]))?.id,
        output: '',
      });
      iteration++;
    }

    // Detect cout
    const coutMatch = line.match(/cout\s*<<\s*([^;]+);/);
    if (coutMatch) {
      let output = coutMatch[1].trim();
      output = output.split('<<').map(part => {
        part = part.trim();
        if (variableState[part]) {
          return variableState[part];
        } else if (part.match(/"/)) {
          return part.replace(/"/g, '');
        }
        return part;
      }).join(' ');
      steps.push({
        iteration: iteration + 1,
        variables: [],
        activeNode: nodes[nodes.length - 1]?.id,
        output,
      });
      iteration++;
    }

    // Detect recursive function calls
    functionNames.forEach((funcName) => {
      const recursiveCallRegex = new RegExp(`\\b${funcName}\\s*\\([^)]*\\)`, 'g');
      if (line.match(recursiveCallRegex)) {
        recursionDepth++;
        structures.push(`Recursive Call: ${funcName}`);
        const step: Step = {
          iteration: recursionDepth,
          variables: [],
          activeNode: `recurse-${funcName}-${recursionDepth}-${lineIndex}`,
          output: '',
        };
        const paramMatch = line.match(/\(([^)]*)\)/);
        if (paramMatch) {
          const params = paramMatch[1].split(',').map(p => p.trim());
          params.forEach((param, idx) => {
            const value = variableState[param] || param;
            variableTable.push({ variable: `param${idx + 1}_${funcName}`, iteration: recursionDepth, value });
            step.variables.push({ name: `param${idx + 1}_${funcName}`, value });
            variableState[`param${idx + 1}_${funcName}`] = value;
          });
        }
        nodes.push({
          id: step.activeNode!,
          type: 'default',
          data: { label: `${funcName} (Depth: ${recursionDepth})` },
          position: { x: 50, y: 50 + recursionDepth * 100 },
        });
        if (recursionDepth > 1) {
          edges.push({
            id: `recurse-edge-${funcName}-${recursionDepth}-${lineIndex}`,
            source: `recurse-${funcName}-${recursionDepth - 1}-${lineIndex}`,
            target: step.activeNode!,
            type: 'smoothstep',
            animated: true,
          });
          step.activeEdge = edges[edges.length - 1].id;
        }
        steps.push(step);
      }
    });
  });

  return { structures, nodes, edges, variableTable, steps };
};