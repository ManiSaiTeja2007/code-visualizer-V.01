import esprima from 'esprima';
import { AnalysisState, Node, Edge, Step } from '../../types';

export const parseJavaScript = (code: string): AnalysisState => {
  const structures: string[] = [];
  const variableTable: AnalysisState['variableTable'] = [];
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const steps: Step[] = [];
  let iteration = 0;
  let recursionDepth = 0;
  const variableState: Record<string, string> = {}; // Track variable values

  try {
    const ast = esprima.parseScript(code, { loc: true });
    const functionNames: string[] = [];

    // First pass: collect function names
    ast.body.forEach((node: any) => {
      if (node.type === 'FunctionDeclaration') {
        functionNames.push(node.id.name);
      }
    });

    // Second pass: analyze AST
    const traverse = (node: any, parentIteration: number) => {
      // Update variable state
      if (node.type === 'VariableDeclaration' && node.declarations) {
        node.declarations.forEach((decl: any) => {
          if (decl.init) {
            variableState[decl.id.name] = decl.init.value?.toString() || 'Initialized';
          }
        });
      }
      if (node.type === 'AssignmentExpression') {
        variableState[node.left.name] = node.right.value?.toString() || 'Assigned';
      }

      if (node.type === 'ArrayExpression') {
        structures.push('Array');
        nodes.push(...node.elements.map((el: any, idx: number) => ({
          id: `array-${idx}-${node.loc.start.line}`,
          type: 'default',
          data: { label: el.value?.toString() || 'empty' },
          position: { x: idx * 100, y: 50 },
        })));
      }

      if (node.type === 'ForStatement' || node.type === 'WhileStatement') {
        iteration++;
        const step: Step = {
          iteration,
          variables: [],
          activeNode: nodes.length > 0 ? nodes[nodes.length - 1].id : undefined,
          output: '',
        };
        steps.push(step);

        if (node.init?.declarations) {
          node.init.declarations.forEach((decl: any) => {
            const value = decl.init?.value?.toString() || 'Initialized';
            variableTable.push({ variable: decl.id.name, iteration, value });
            step.variables.push({ name: decl.id.name, value });
            variableState[decl.id.name] = value;
          });
        }
      }

      if (node.type === 'AssignmentExpression') {
        const value = node.right.value?.toString() || 'Assigned';
        variableTable.push({ variable: node.left.name, iteration, value });
        steps.push({
          iteration: iteration + 1,
          variables: [{ name: node.left.name, value }],
          activeNode: nodes.find(n => n.id.includes(node.left.name))?.id,
          output: '',
        });
        variableState[node.left.name] = value;
        iteration++;
      }

      // Detect console.log
      if (node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression' && node.expression.callee.property?.name === 'log') {
        let output = '';
        node.expression.arguments.forEach((arg: any) => {
          if (arg.type === 'Literal') {
            output += arg.value + ' ';
          } else if (arg.type === 'Identifier' && variableState[arg.name]) {
            output += variableState[arg.name] + ' ';
          }
        });
        steps.push({
          iteration: iteration + 1,
          variables: [],
          activeNode: nodes[nodes.length - 1]?.id,
          output: output.trim(),
        });
        iteration++;
      }

      if (node.type === 'CallExpression' && node.callee.name && functionNames.includes(node.callee.name)) {
        recursionDepth++;
        structures.push(`Recursive Call: ${node.callee.name}`);
        const step: Step = {
          iteration: recursionDepth,
          variables: node.arguments.map((arg: any, idx: number) => {
            const value = arg.value?.toString() || arg.name;
            variableState[`param${idx + 1}_${node.callee.name}`] = value;
            return { name: `param${idx + 1}_${node.callee.name}`, value };
          }),
          activeNode: `recurse-${node.callee.name}-${recursionDepth}-${node.loc.start.line}`,
          output: '',
        };
        nodes.push({
          id: step.activeNode!,
          type: 'default',
          data: { label: `${node.callee.name} (Depth: ${recursionDepth})` },
          position: { x: 50, y: 50 + recursionDepth * 100 },
        });
        if (recursionDepth > 1) {
          edges.push({
            id: `recurse-edge-${node.callee.name}-${recursionDepth}-${node.loc.start.line}`,
            source: `recurse-${node.callee.name}-${recursionDepth - 1}-${node.loc.start.line}`,
            target: step.activeNode!,
            type: 'smoothstep',
            animated: true,
          });
          step.activeEdge = edges[edges.length - 1].id;
        }
        steps.push(step);
        variableTable.push(...step.variables.map(v => ({
          variable: v.name,
          iteration: recursionDepth,
          value: v.value,
        })));
      }

      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          traverse(node[key], iteration);
        }
      }
    };

    ast.body.forEach((node: any) => traverse(node, iteration));
  } catch (error) {
    console.error('JavaScript parsing error:', error);
  }

  return { structures, variableTable, nodes, edges, steps };
};