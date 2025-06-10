import { AnalysisState, Node, Edge, Step } from '../../types';

export const parseJava = (code: string): AnalysisState => {
  const structures: string[] = [];
  const variableTable: AnalysisState['variableTable'] = [];
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const steps: Step[] = [];
  let iteration = 0;
  let recursionDepth = 0;
  const variableState: Record<string, string> = {};

  const lines = code.split('\n');
  const methodRegex = /public\s+(?:static\s+)?(?:\w+\s+)?(\w+)\s*\(([^)]*)\)\s*\{/;
  const methodNames: string[] = [];

  // First pass: collect method names
  lines.forEach((line: string) => {
    const methodMatch = line.match(methodRegex);
    if (methodMatch) {
      methodNames.push(methodMatch[1]);
    }
  });

  // Second pass: analyze code
  lines.forEach((line: string, lineIndex: number) => {
    // Update variable state
    const varDeclMatch = line.match(/(int|float|double|String)\s+(\w+)\s*=\s*([^;]+)/);
    if (varDeclMatch) {
      variableState[varDeclMatch[2]] = varDeclMatch[3].trim();
    }
    const assignMatch = line.match(/(\w+)\s*=\s*([^;]+)/);
    if (assignMatch) {
      variableState[assignMatch[1]] = assignMatch[2].trim();
    }

    // Detect arrays or lists
    if (line.match(/int\[\]|String\[\]|List</)) {
      structures.push('Array/List');
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
    if (line.match(/class.*Node/)) {
      const listType = line.includes('prev') ? 'Doubly Linked List' :
                       line.includes('left') || line.includes('right') ? 'Binary Tree' :
                       line.includes('next') && code.includes('head.next') ? 'Circular Linked List' : 'Singly Linked List';
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
      const varMatch = line.match(/(int|float|double|String)\s+(\w+)\s*=/);
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

    // Detect System.out.println
    const printMatch = line.match(/System\.out\.println\(([^)]+)\)/);
    if (printMatch) {
      let output = printMatch[1].trim();
      if (variableState[output]) {
        output = variableState[output];
      } else if (output.match(/"/)) {
        output = output.replace(/"/g, '');
      }
      steps.push({
        iteration: iteration + 1,
        variables: [],
        activeNode: nodes[nodes.length - 1]?.id,
        output,
      });
      iteration++;
    }

    // Detect recursive method calls
    methodNames.forEach((methodName) => {
      const recursiveCallRegex = new RegExp(`\\b${methodName}\\s*\\([^)]*\\)`, 'g');
      if (line.match(recursiveCallRegex)) {
        recursionDepth++;
        structures.push(`Recursive Call: ${methodName}`);
        const step: Step = {
          iteration: recursionDepth,
          variables: [],
          activeNode: `recurse-${methodName}-${recursionDepth}-${lineIndex}`,
          output: '',
        };
        const paramMatch = line.match(/\(([^)]*)\)/);
        if (paramMatch) {
          const params = paramMatch[1].split(',').map(p => p.trim());
          params.forEach((param, idx) => {
            const value = variableState[param] || param;
            variableTable.push({ variable: `param${idx + 1}_${methodName}`, iteration: recursionDepth, value });
            step.variables.push({ name: `param${idx + 1}_${methodName}`, value });
            variableState[`param${idx + 1}_${methodName}`] = value;
          });
        }
        nodes.push({
          id: step.activeNode!,
          type: 'default',
          data: { label: `${methodName} (Depth: ${recursionDepth})` },
          position: { x: 50, y: 50 + recursionDepth * 100 },
        });
        if (recursionDepth > 1) {
          edges.push({
            id: `recurse-edge-${methodName}-${recursionDepth}-${lineIndex}`,
            source: `recurse-${methodName}-${recursionDepth - 1}-${lineIndex}`,
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

  return { structures, variableTable, nodes, edges, steps };
};