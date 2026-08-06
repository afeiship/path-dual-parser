import { match as ptrMatch, compile as ptrCompile } from 'path-to-regexp';

export type MatchResult = { path: string; params: Record<string, string> } | false;

interface NormalizedTemplate {
  path: string;
  isBraceStyle: boolean;
  paramNames: string[];
}

const BRACE_RE = /\{(\w+)\}/g;

function normalize(template: string): NormalizedTemplate {
  if (!template) {
    throw new TypeError('Template must not be empty');
  }
  const isBraceStyle = BRACE_RE.test(template);
  BRACE_RE.lastIndex = 0;
  const paramNames: string[] = [];
  const path = template.replace(BRACE_RE, (_match, name: string) => {
    paramNames.push(name);
    return ':' + name;
  });
  // 如果是冒号风格,也提取参数名
  if (!isBraceStyle) {
    const colonRe = /:(\w+)/g;
    let m: RegExpExecArray | null;
    while ((m = colonRe.exec(path)) !== null) {
      paramNames.push(m[1]);
    }
  }
  return { path, isBraceStyle, paramNames };
}
