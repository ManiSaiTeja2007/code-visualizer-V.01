import { parseJavaScript, parseCpp, parseJava } from './parsers';
import { AnalysisState } from './types';

/* eslint-disable no-restricted-globals */
self.onmessage = async (e: MessageEvent<{ code: string; language: string }>) => {
  const { code, language } = e.data;
  let result: AnalysisState;
  switch (language) {
    case 'javascript':
      result = parseJavaScript(code);
      break;
    case 'cpp':
      result = parseCpp(code);
      break;
    case 'java':
      result = parseJava(code);
      break;
    default:
      result = { structures: [], variableTable: [], nodes: [], edges: [], steps: [] };
  }
  self.postMessage(result);
};
/* eslint-enable no-restricted-globals */

export {};