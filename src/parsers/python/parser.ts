import { AnalysisState } from '../../types';

export const parsePython = async (pyodide: any, code: string): Promise<AnalysisState> => {
  if (!pyodide) return { structures: [], variableTable: [], nodes: [], edges: [], steps: [] };
  try {
    const pythonCode = `
      import ast
      def parse_code(code):
          tree = ast.parse(code)
          structures = []
          variable_changes = []
          nodes = []
          edges = []
          iteration = 0

          for node in ast.walk(tree):
              if isinstance(node, ast.List):
                  structures.append('List')
                  elements = [n.s if isinstance(n, ast.Str) else n.n if hasattr(n, 'n') else 'empty' for n in node.elts]
                  nodes.extend([{'id': f'list-{i}', 'type': 'default', 'data': {'label': el}, 'position': {'x': i * 100, 'y': 50}} for i, el in enumerate(elements)])
              if isinstance(node, ast.Dict):
                  structures.append('Dictionary (Tree/Graph)')
                  nodes.extend([
                      {'id': 'root', 'type': 'default', 'data': {'label': 'Root'}, 'position': {'x': 250, 'y': 50}},
                      {'id': 'child1', 'type': 'default', 'data': {'label': 'Child 1'}, 'position': {'x': 200, 'y': 150}},
                      {'id': 'child2', 'type': 'default', 'data': {'label': 'Child 2'}, 'position': {'x': 300, 'y': 150}},
                  ])
                  edges.extend([
                      {'id': 'e1', 'source': 'root', 'target': 'child1', 'animated': True},
                      {'id': 'e2', 'source': 'root', 'target': 'child2', 'animated': True},
                  ])
              if isinstance(node, ast.ClassDef) and 'Node' in node.name:
                  list_type = 'Doubly Linked List' if 'prev' in code else 'Binary Tree' if 'left' in code or 'right' in code else 'Singly Linked List'
                  structures.append(list_type)
                  nodes.extend([
                      {'id': 'node1', 'type': 'default', 'data': {'label': 'Node 1'}, 'position': {'x': 50, 'y': 50}},
                      {'id': 'node2', 'type': 'default', 'data': {'label': 'Node 2'}, 'position': {'x': 150, 'y': 50}},
                  ])
                  edges.append({'id': 'e1', 'source': 'node1', 'target': 'node2', 'type': 'smoothstep', 'animated': True})
                  if list_type == 'Doubly Linked List':
                      edges.append({'id': 'e2', 'source': 'node2', 'target': 'node1', 'type': 'smoothstep', 'animated': True})
              if isinstance(node, (ast.For, ast.While)):
                  iteration += 1
                  if hasattr(node, 'target'):
                      variable_changes.append({
                          'variable': node.target.id if isinstance(node.target, ast.Name) else 'unknown',
                          'iteration': iteration,
                          'value': 'Initialized'
                      })
              if isinstance(node, ast.Assign):
                  for target in node.targets:
                      if isinstance(target, ast.Name):
                          variable_changes.append({
                              'variable': target.id,
                              'iteration': iteration,
                              'value': str(node.value.value) if hasattr(node.value, 'value') else 'complex'
                          })

          return {'structures': structures, 'variable_changes': variable_changes, 'nodes': nodes, 'edges': edges}
      `;
    await pyodide.runPythonAsync(pythonCode);
    const result = await pyodide.runPythonAsync(`parse_code(${JSON.stringify(code)})`);
    const { structures, variable_changes, nodes, edges } = result.toJs({ dict_converter: Object.fromEntries });
    return { structures, variableTable: variable_changes, nodes, edges, steps: [] };
  } catch (e) {
    console.error('Python Parse Error:', e);
    return { structures: [], variableTable: [], nodes: [], edges: [], steps: [] };
  }
};